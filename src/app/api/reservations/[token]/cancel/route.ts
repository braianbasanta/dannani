import { NextResponse } from "next/server";
import { getSupabaseAdmin, RESERVATIONS_TABLE } from "@/lib/supabase";
import {
  getReservableLocation,
  type ReservationRow,
} from "@/lib/reservations";
import { notifyReservation } from "@/lib/email";

export const runtime = "nodejs";

/** POST /api/reservations/[token]/cancel — cancela la reserva. */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

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
    return NextResponse.json({ ok: true, alreadyCancelled: true });
  }

  const { data: updated, error } = await supabase
    .from(RESERVATIONS_TABLE)
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("manage_token", token)
    .select()
    .single();

  if (error || !updated) {
    console.error("[reservations] cancel error:", error);
    return NextResponse.json(
      { error: "No pudimos cancelar la reserva." },
      { status: 500 }
    );
  }

  const location = getReservableLocation(row.location_slug);
  if (location) {
    await notifyReservation(updated as ReservationRow, location, "cancelled").catch(
      (e) => console.error("[reservations] notify error:", e)
    );
  }

  return NextResponse.json({ ok: true });
}
