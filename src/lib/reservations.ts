import {
  dineInLocations,
  getLocationBySlug,
  type Location,
} from "@/data/locations";
import type { Locale } from "@/i18n/routing";
import { BCP47 } from "@/lib/seo";

/**
 * Lógica de reservas de mesa (puente hasta Cover Manager). Helpers puros
 * (sin dependencias de Node) para poder compartirlos entre el formulario
 * cliente y la validación en el servidor.
 */

/** Solo los locales dine-in aceptan reserva de mesa; los take away piden por su CTA. */
export const reservableLocations: Location[] = dineInLocations;

export function getReservableLocation(slug: string): Location | undefined {
  const location = getLocationBySlug(slug);
  return location && location.type === "dine-in" ? location : undefined;
}

export const PARTY_MIN = 1;
export const PARTY_MAX = 20;
export const CHILDREN_MAX = 20;

/** Franjas cada 30 min; última reserva 30 min antes del cierre y nunca más tarde de las 23:00. */
export const SLOT_INTERVAL_MIN = 30;
export const LAST_BOOKING_BEFORE_CLOSE_MIN = 30;
/** Tope duro: no se acepta ninguna reserva después de esta hora. */
export const LAST_BOOKING_TIME = "23:00";

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function toHHMM(min: number): string {
  const norm = ((min % 1440) + 1440) % 1440;
  const h = Math.floor(norm / 60);
  const mm = norm % 60;
  return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

/**
 * Genera las franjas horarias reservables de un local a partir de su
 * openingHours. Los cierres a medianoche ("00:00") se tratan como fin de día.
 */
export function getSlotsForLocation(location: Location): string[] {
  const capMin = toMinutes(LAST_BOOKING_TIME);
  const slots: string[] = [];
  for (const { opens, closes } of location.openingHours) {
    const start = toMinutes(opens);
    let end = toMinutes(closes);
    if (end <= start) end += 1440; // cierre pasada medianoche (00:00)
    const last = Math.min(end - LAST_BOOKING_BEFORE_CLOSE_MIN, capMin);
    for (let t = start; t <= last; t += SLOT_INTERVAL_MIN) {
      slots.push(toHHMM(t));
    }
  }
  return slots;
}

/** Devuelve "HH:MM" a partir de un time de Postgres ("20:00:00") o "HH:MM". */
export function normalizeTime(time: string): string {
  const [h, m] = time.split(":");
  return `${h.padStart(2, "0")}:${(m ?? "00").padStart(2, "0")}`;
}

/** Fecha de hoy (YYYY-MM-DD) en la zona horaria de Barcelona. */
export function todayInMadrid(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
  }).format(new Date());
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export interface ReservationInput {
  locationSlug: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  partySize: number;
  notes?: string;
  occasion?: string;
  childrenCount?: number;
  needsHighChair?: boolean;
  dietary?: string;
  marketingOptIn?: boolean;
  locale: string;
}

export type ValidationResult =
  | { ok: true; value: ReservationInput; location: Location }
  | { ok: false; error: string };

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

/**
 * Valida y normaliza el payload de una reserva nueva o reprogramada.
 * Devuelve el input saneado + el local, o un mensaje de error.
 */
export function validateReservationInput(raw: unknown): ValidationResult {
  const body = (raw ?? {}) as Record<string, unknown>;

  const locationSlug = str(body.locationSlug);
  const location = getReservableLocation(locationSlug);
  if (!location) return { ok: false, error: "Local no válido para reservas." };

  const firstName = str(body.firstName);
  const lastName = str(body.lastName);
  if (firstName.length < 1 || firstName.length > 80)
    return { ok: false, error: "Indica tu nombre." };
  if (lastName.length < 1 || lastName.length > 80)
    return { ok: false, error: "Indica tus apellidos." };

  const phone = str(body.phone);
  if (phone.replace(/[^\d]/g, "").length < 6)
    return { ok: false, error: "Indica un teléfono válido." };

  const email = str(body.email);
  if (!EMAIL_RE.test(email))
    return { ok: false, error: "Indica un email válido." };

  const date = str(body.date);
  if (!DATE_RE.test(date))
    return { ok: false, error: "Elige una fecha válida." };
  if (date < todayInMadrid())
    return { ok: false, error: "La fecha ya ha pasado." };

  const time = normalizeTime(str(body.time));
  if (!getSlotsForLocation(location).includes(time))
    return { ok: false, error: "Esa hora no está disponible en este local." };

  const partySize = Number(body.partySize);
  if (
    !Number.isInteger(partySize) ||
    partySize < PARTY_MIN ||
    partySize > PARTY_MAX
  )
    return {
      ok: false,
      error: `El número de comensales debe estar entre ${PARTY_MIN} y ${PARTY_MAX}.`,
    };

  const childrenRaw = Number(body.childrenCount ?? 0);
  const childrenCount =
    Number.isInteger(childrenRaw) && childrenRaw >= 0 && childrenRaw <= CHILDREN_MAX
      ? childrenRaw
      : 0;

  const locale = str(body.locale) || "es";

  return {
    ok: true,
    location,
    value: {
      locationSlug,
      firstName,
      lastName,
      phone,
      email,
      date,
      time,
      partySize,
      notes: str(body.notes).slice(0, 1000) || undefined,
      occasion: str(body.occasion).slice(0, 120) || undefined,
      childrenCount,
      needsHighChair: body.needsHighChair === true || body.needsHighChair === "true",
      dietary: str(body.dietary).slice(0, 400) || undefined,
      marketingOptIn:
        body.marketingOptIn === true || body.marketingOptIn === "true",
      locale,
    },
  };
}

/** Fila tal cual se guarda/lee en Supabase (snake_case). */
export interface ReservationRow {
  id: string;
  location_slug: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  reservation_date: string; // YYYY-MM-DD
  reservation_time: string; // HH:MM:SS
  party_size: number;
  notes: string | null;
  occasion: string | null;
  children_count: number;
  needs_high_chair: boolean;
  dietary: string | null;
  marketing_opt_in: boolean;
  locale: string;
  status: "confirmed" | "cancelled";
  manage_token: string;
  created_at: string;
  updated_at: string;
}

/** Fecha larga y legible ("sábado, 19 de julio de 2026") en el idioma dado. */
export function formatReservationDate(dateStr: string, locale: Locale): string {
  // Fijamos hora a mediodía UTC para evitar saltos de día por zona horaria.
  const d = new Date(`${dateStr}T12:00:00Z`);
  return new Intl.DateTimeFormat(BCP47[locale] ?? "es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Madrid",
  }).format(d);
}
