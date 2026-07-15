"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, isAdminAuthed } from "@/lib/admin-auth";
import { getSupabaseAdmin, RESERVATIONS_TABLE } from "@/lib/supabase";
import {
  getReservableLocation,
  type ReservationRow,
} from "@/lib/reservations";
import { notifyCustomer } from "@/lib/email";

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

/** Cierra la sesión del panel. */
export async function logoutAdmin() {
  (await cookies()).delete(ADMIN_COOKIE);
  redirect("/admin/reservas");
}
