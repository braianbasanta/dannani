"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, isAdminAuthed } from "@/lib/admin-auth";
import { getSupabaseAdmin, RESERVATIONS_TABLE } from "@/lib/supabase";
import {
  getReservableLocation,
  getSlotsForLocation,
  normalizeTime,
  todayInMadrid,
  PARTY_MIN,
  PARTY_MAX_TOTAL,
  type ReservationRow,
} from "@/lib/reservations";
import { remainingCapacity, capacityError } from "@/lib/capacity";
import { notifyCustomer, notifyManager, notifyReservation } from "@/lib/email";

/** Cambia el estado de una reserva desde el panel y avisa al cliente por email. */
export async function setReservationStatus(formData: FormData) {
  if (!(await isAdminAuthed())) {
    throw new Error("No autorizado");
  }
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !["confirmed", "cancelled"].includes(status)) return;

  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from(RESERVATIONS_TABLE)
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  const row = data as ReservationRow | null;
  if (row) {
    const location = getReservableLocation(row.location_slug);
    if (location) {
      // Cancelar → aviso de cancelación al cliente; restaurar → confirmación.
      await notifyCustomer(
        row,
        location,
        status === "cancelled" ? "cancelled" : "created"
      ).catch((e) => console.error("[admin] notify error:", e));
    }
  }

  revalidatePath("/admin/reservas");
}

export interface ManualReservationState {
  error?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Crea una reserva desde el panel admin (reservas tomadas por teléfono).
 * Siempre entra como `confirmed` — la crea el propio restaurante — aunque el
 * grupo supere el umbral de aprobación. El email del cliente es opcional: si
 * no lo hay se guarda el buzón de reservas y solo se avisa a la manager.
 */
export async function createManualReservation(
  _prev: ManualReservationState,
  formData: FormData
): Promise<ManualReservationState> {
  if (!(await isAdminAuthed())) return { error: "No autorizado." };

  const locationSlug = String(formData.get("locationSlug") ?? "");
  const location = getReservableLocation(locationSlug);
  if (!location) return { error: "Elige un restaurante." };

  const date = String(formData.get("date") ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < todayInMadrid())
    return { error: "Elige una fecha válida (hoy o posterior)." };

  const time = normalizeTime(String(formData.get("time") ?? ""));
  if (!getSlotsForLocation(location, date).includes(time))
    return { error: "Esa hora no está disponible en este local." };

  const partySize = Number(formData.get("partySize"));
  if (
    !Number.isInteger(partySize) ||
    partySize < PARTY_MIN ||
    partySize > PARTY_MAX_TOTAL
  )
    return {
      error: `Los comensales deben estar entre ${PARTY_MIN} y ${PARTY_MAX_TOTAL}.`,
    };

  const firstName = String(formData.get("firstName") ?? "").trim().slice(0, 80);
  if (!firstName) return { error: "Indica el nombre del cliente." };
  const lastName = String(formData.get("lastName") ?? "").trim().slice(0, 80);

  const phone = String(formData.get("phone") ?? "").trim().slice(0, 40);
  if (phone.replace(/[^\d]/g, "").length < 6)
    return { error: "Indica un teléfono válido." };

  const email = String(formData.get("email") ?? "").trim();
  const hasEmail = EMAIL_RE.test(email);
  if (email && !hasEmail)
    return { error: "El email no es válido (déjalo vacío si no lo tienes)." };

  const notes = String(formData.get("notes") ?? "").trim().slice(0, 1000);

  // Aforo también para el alta manual: evita sobrevender la sala por descuido.
  const left = await remainingCapacity(locationSlug, date, time);
  if (left !== null && partySize > left) {
    return {
      error: `${capacityError(left)} (aforo del local a esa hora superado)`,
    };
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(RESERVATIONS_TABLE)
    .insert({
      location_slug: locationSlug,
      first_name: firstName,
      last_name: lastName,
      phone,
      email: hasEmail ? email : "reservas@dananni.es",
      reservation_date: date,
      reservation_time: time,
      party_size: partySize,
      notes: notes || null,
      marketing_opt_in: false,
      locale: "es",
      attribution: { utm_source: "teléfono", utm_medium: "manual" },
      status: "confirmed",
      manage_token: randomBytes(20).toString("base64url"),
    })
    .select()
    .single();

  if (error || !data) {
    console.error("[admin] insert manual error:", error);
    return { error: "No se pudo guardar la reserva. Inténtalo de nuevo." };
  }

  const row = data as ReservationRow;
  // Con email real: confirmación al cliente + aviso a manager (email/Telegram).
  // Sin email: solo el aviso a la manager.
  const notify = hasEmail
    ? notifyReservation(row, location, "created")
    : notifyManager(row, location, "created");
  await notify.catch((e) => console.error("[admin] notify error:", e));

  revalidatePath("/admin/reservas");
  redirect(`/admin/reservas?date=${date}&loc=${locationSlug}`);
}

/** Cierra la sesión del panel. */
export async function logoutAdmin() {
  (await cookies()).delete(ADMIN_COOKIE);
  redirect("/admin/reservas");
}
