import { NextResponse } from "next/server";
import { getSupabaseAdmin, RESERVATIONS_TABLE } from "@/lib/supabase";
import {
  getReservableLocation,
  type ReservationRow,
} from "@/lib/reservations";
import { notifyCustomer } from "@/lib/email";

export const runtime = "nodejs";

/**
 * POST /api/reservations/[token]/approve — la manager confirma o rechaza una
 * reserva pendiente (grupo grande). Body: { decision: "confirm" | "reject" }.
 */
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
  const decision = (body as { decision?: string }).decision;
  if (decision !== "confirm" && decision !== "reject") {
    return NextResponse.json({ error: "Decisión no válida." }, { status: 400 });
  }

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
  if (row.status !== "pending") {
    // Idempotente: ya estaba decidida.
    return NextResponse.json({ ok: true, status: row.status, already: true });
  }

  const newStatus = decision === "confirm" ? "confirmed" : "rejected";
  const { data: updated, error } = await supabase
    .from(RESERVATIONS_TABLE)
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("manage_token", token)
    .select()
    .single();

  if (error || !updated) {
    console.error("[reservations] approve error:", error);
    return NextResponse.json(
      { error: "No pudimos actualizar la reserva." },
      { status: 500 }
    );
  }

  const location = getReservableLocation(row.location_slug);
  if (location) {
    // Al confirmar, el cliente recibe la confirmación normal (con gestionar);
    // al rechazar, un aviso de que no se pudo confirmar.
    await notifyCustomer(
      updated as ReservationRow,
      location,
      decision === "confirm" ? "created" : "rejected"
    ).catch((e) => console.error("[reservations] notify error:", e));
  }

  return NextResponse.json({ ok: true, status: newStatus });
}
