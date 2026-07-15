import { NextResponse } from "next/server";
import { getSupabaseAdmin, RESERVATIONS_TABLE } from "@/lib/supabase";
import {
  getReservableLocation,
  getSlotsForLocation,
  normalizeTime,
  todayInMadrid,
  PARTY_MIN,
  PARTY_MAX,
  type ReservationRow,
} from "@/lib/reservations";
import { notifyReservation } from "@/lib/email";

export const runtime = "nodejs";

/** POST /api/reservations/[token]/reschedule — cambia fecha, hora y comensales. */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Petición inválida." }, { status: 400 });
  }
  const b = (body ?? {}) as Record<string, unknown>;

  const supabase = getSupabaseAdmin();
  const { data: existing } = await supabase
    .from(RESERVATIONS_TABLE)
    .select("*")
    .eq("manage_token", token)
    .single();

  const row = existing as ReservationRow | null;
  if (!row) {
    return NextResponse.json({ error: "Reserva no encontrada." }, { status: 404 });
  }
  if (row.status === "cancelled") {
    return NextResponse.json(
      { error: "Esta reserva está cancelada y no se puede modificar." },
      { status: 409 }
    );
  }

  const location = getReservableLocation(row.location_slug);
  if (!location) {
    return NextResponse.json({ error: "Local no válido." }, { status: 400 });
  }

  const date = typeof b.date === "string" ? b.date.trim() : "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < todayInMadrid()) {
    return NextResponse.json({ error: "Elige una fecha válida." }, { status: 400 });
  }

  const time = normalizeTime(typeof b.time === "string" ? b.time : "");
  if (!getSlotsForLocation(location).includes(time)) {
    return NextResponse.json(
      { error: "Esa hora no está disponible en este local." },
      { status: 400 }
    );
  }

  const partySize = Number(b.partySize);
  if (!Number.isInteger(partySize) || partySize < PARTY_MIN || partySize > PARTY_MAX) {
    return NextResponse.json(
      { error: `Los comensales deben estar entre ${PARTY_MIN} y ${PARTY_MAX}.` },
      { status: 400 }
    );
  }

  const { data: updated, error } = await supabase
    .from(RESERVATIONS_TABLE)
    .update({
      reservation_date: date,
      reservation_time: time,
      party_size: partySize,
      updated_at: new Date().toISOString(),
    })
    .eq("manage_token", token)
    .select()
    .single();

  if (error || !updated) {
    console.error("[reservations] reschedule error:", error);
    return NextResponse.json(
      { error: "No pudimos actualizar la reserva." },
      { status: 500 }
    );
  }

  await notifyReservation(updated as ReservationRow, location, "rescheduled").catch(
    (e) => console.error("[reservations] notify error:", e)
  );

  return NextResponse.json({ ok: true });
}
