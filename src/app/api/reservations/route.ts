import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getSupabaseAdmin, RESERVATIONS_TABLE } from "@/lib/supabase";
import {
  validateReservationInput,
  needsManagerApproval,
  type ReservationRow,
} from "@/lib/reservations";
import { notifyReservation } from "@/lib/email";

export const runtime = "nodejs";

/** POST /api/reservations — crea una reserva nueva y dispara los emails. */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Petición inválida." }, { status: 400 });
  }

  const result = validateReservationInput(body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  const { value, location } = result;

  const token = randomBytes(20).toString("base64url");
  const supabase = getSupabaseAdmin();

  // Grupos de 9 a 15 requieren confirmación manual de la manager (>15 se deriva
  // a contacto y no llega a la API).
  const pending = needsManagerApproval(value.partySize);

  const { data, error } = await supabase
    .from(RESERVATIONS_TABLE)
    .insert({
      location_slug: value.locationSlug,
      first_name: value.firstName,
      last_name: value.lastName,
      phone: value.phone,
      email: value.email,
      reservation_date: value.date,
      reservation_time: value.time,
      party_size: value.partySize,
      notes: value.notes ?? null,
      occasion: value.occasion ?? null,
      children_count: value.childrenCount ?? 0,
      needs_high_chair: value.needsHighChair ?? false,
      dietary: value.dietary ?? null,
      marketing_opt_in: value.marketingOptIn ?? false,
      locale: value.locale,
      status: pending ? "pending" : "confirmed",
      manage_token: token,
    })
    .select()
    .single();

  if (error || !data) {
    console.error("[reservations] insert error:", error);
    return NextResponse.json(
      { error: "No pudimos guardar la reserva. Inténtalo de nuevo." },
      { status: 500 }
    );
  }

  const row = data as ReservationRow;
  await notifyReservation(row, location, pending ? "requested" : "created").catch(
    (e) => console.error("[reservations] notify error:", e)
  );

  return NextResponse.json({ ok: true, token: row.manage_token, pending });
}
