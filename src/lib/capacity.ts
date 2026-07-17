import { getSupabaseAdmin, RESERVATIONS_TABLE } from "@/lib/supabase";
import { LOCATION_CAPACITY, normalizeTime } from "@/lib/reservations";

/**
 * Control de aforo por franja (server-only, consulta Supabase). Un local con
 * aforo en LOCATION_CAPACITY no acepta más comensales de los que caben: cada
 * reserva ocupa la mesa SEATING_MINUTES, y para una hora dada se suman los
 * comensales de todas las reservas activas (confirmadas + pendientes) cuya
 * estancia se solapa. Locales sin aforo definido → sin límite (null).
 */

/** Duración estimada de la estancia; coincide con los turnos de cena (20:00/21:30). */
export const SEATING_MINUTES = 90;

function toMin(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

interface ActiveRow {
  id: string;
  reservation_time: string;
  party_size: number;
}

/** Reservas activas de un local/día. Null si falla la consulta (fail-open). */
async function activeReservations(
  locationSlug: string,
  date: string
): Promise<ActiveRow[] | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(RESERVATIONS_TABLE)
    .select("id, reservation_time, party_size")
    .eq("location_slug", locationSlug)
    .eq("reservation_date", date)
    .in("status", ["confirmed", "pending"]);
  if (error || !data) {
    console.error("[capacity] consulta falló:", error);
    return null;
  }
  return data as ActiveRow[];
}

function occupiedAt(rows: ActiveRow[], time: string, excludeId?: string): number {
  const t = toMin(normalizeTime(time));
  return rows
    .filter(
      (r) =>
        (!excludeId || r.id !== excludeId) &&
        Math.abs(toMin(normalizeTime(r.reservation_time)) - t) < SEATING_MINUTES
    )
    .reduce((sum, r) => sum + r.party_size, 0);
}

/**
 * Sitios libres para una franja concreta. Null = sin límite (local sin aforo
 * definido, o error de consulta). `excludeId` descuenta la propia reserva al
 * reprogramar/modificar.
 */
export async function remainingCapacity(
  locationSlug: string,
  date: string,
  time: string,
  excludeId?: string
): Promise<number | null> {
  const cap = LOCATION_CAPACITY[locationSlug];
  if (!cap) return null;
  const rows = await activeReservations(locationSlug, date);
  if (!rows) return null;
  return cap - occupiedAt(rows, time, excludeId);
}

/** Sitios libres por franja (para pintar disponibilidad). Null = sin límite. */
export async function remainingBySlot(
  locationSlug: string,
  date: string,
  slots: string[]
): Promise<Record<string, number> | null> {
  const cap = LOCATION_CAPACITY[locationSlug];
  if (!cap) return null;
  const rows = await activeReservations(locationSlug, date);
  if (!rows) return null;
  return Object.fromEntries(slots.map((s) => [s, cap - occupiedAt(rows, s)]));
}

/** Mensaje estándar cuando el grupo no cabe. */
export function capacityError(left: number): string {
  return left > 0
    ? `A esa hora solo quedan ${left} sitios libres. Prueba otra hora, por favor.`
    : "A esa hora el local ya está completo. Prueba otra hora, por favor.";
}
