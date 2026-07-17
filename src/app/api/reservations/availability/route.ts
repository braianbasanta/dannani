import { NextResponse } from "next/server";
import {
  getReservableLocation,
  getSlotsForLocation,
  todayInMadrid,
} from "@/lib/reservations";
import { remainingBySlot } from "@/lib/capacity";

export const runtime = "nodejs";

/**
 * GET /api/reservations/availability?location=<slug>&date=YYYY-MM-DD
 * Devuelve los sitios libres por franja para pintar disponibilidad en el
 * formulario. `remaining: null` cuando el local no tiene aforo definido.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const slug = url.searchParams.get("location") ?? "";
  const date = url.searchParams.get("date") ?? "";

  const location = getReservableLocation(slug);
  if (!location || !/^\d{4}-\d{2}-\d{2}$/.test(date) || date < todayInMadrid()) {
    return NextResponse.json({ error: "Parámetros no válidos." }, { status: 400 });
  }

  const slots = getSlotsForLocation(location, date);
  const remaining = await remainingBySlot(slug, date, slots);
  return NextResponse.json({ remaining });
}
