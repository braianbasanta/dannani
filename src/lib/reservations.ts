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
/** Máximo del desplegable de comensales; por encima se pide el nº exacto (grupo grande). */
export const PARTY_MAX = 15;
/** Tope absoluto de comensales aceptado por la API (grupos/eventos van como pendientes). */
export const PARTY_MAX_TOTAL = 40;
export const CHILDREN_MAX = 15;
/** Más de este nº de comensales requiere confirmación manual de la manager. */
export const APPROVAL_PARTY_THRESHOLD = 8;

/** true si la reserva necesita aprobación de la manager (grupo de 9 a 15). */
export function needsManagerApproval(partySize: number): boolean {
  return partySize > APPROVAL_PARTY_THRESHOLD;
}

/** Franjas cada 30 min; última reserva 30 min antes del cierre y nunca más tarde de las 23:00. */
export const SLOT_INTERVAL_MIN = 30;
export const LAST_BOOKING_BEFORE_CLOSE_MIN = 30;
/** Tope duro: no se acepta ninguna reserva después de esta hora. */
export const LAST_BOOKING_TIME = "23:00";

/** Aforo de sala por local (pax por turno), para decidir bloqueos. */
export const LOCATION_CAPACITY: Record<string, number> = {
  raval: 35, // Tallers 69
};

/**
 * Franjas retiradas permanentemente por local. Tallers 69 (35 pax) trabaja la
 * cena en dos turnos fijos — 20:00 y 21:30 — y de 22:00 en adelante vuelve el
 * horario normal cada 30 min.
 */
const REMOVED_SLOTS: Record<string, string[]> = {
  raval: ["20:30", "21:00"],
};

/**
 * Bloqueos puntuales por fecha (local → YYYY-MM-DD → horas cerradas), para
 * cerrar franjas cuando la sala ya está comprometida (grupos grandes, eventos).
 */
export const BLOCKED_DATE_SLOTS: Record<string, Record<string, string[]>> = {
  raval: {
    // 17/07: grupo de 17 pax a las 20:00 — cena cerrada hasta las 22:00.
    "2026-07-17": ["20:00", "20:30", "21:00", "21:30"],
  },
};

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
 * Excluye las franjas retiradas del local y, si se pasa `date`, también los
 * bloqueos puntuales de esa fecha.
 */
export function getSlotsForLocation(location: Location, date?: string): string[] {
  const capMin = toMinutes(LAST_BOOKING_TIME);
  const removed = REMOVED_SLOTS[location.slug] ?? [];
  const blocked = (date && BLOCKED_DATE_SLOTS[location.slug]?.[date]) || [];
  const slots: string[] = [];
  for (const { opens, closes } of location.openingHours) {
    const start = toMinutes(opens);
    let end = toMinutes(closes);
    if (end <= start) end += 1440; // cierre pasada medianoche (00:00)
    const last = Math.min(end - LAST_BOOKING_BEFORE_CLOSE_MIN, capMin);
    for (let t = start; t <= last; t += SLOT_INTERVAL_MIN) {
      const hhmm = toHHMM(t);
      if (removed.includes(hhmm) || blocked.includes(hhmm)) continue;
      slots.push(hhmm);
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

/**
 * Atribución de marketing de una reserva (de dónde vino el cliente). Se captura
 * en el navegador al aterrizar (first-touch de la sesión) y viaja con el POST
 * para guardarse junto a la reserva. Sirve para medir qué ficha de GBP / campaña
 * trae reservas SIN depender de que el usuario acepte cookies (a diferencia de GA).
 */
export interface Attribution {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  gclid?: string;
  fbclid?: string;
  msclkid?: string;
  referrer?: string;
  landing?: string; // pathname de aterrizaje
  ts?: string; // ISO de captura (first-touch)
}

/** Claves aceptadas en el objeto de atribución (whitelist anti-inyección de basura). */
export const ATTRIBUTION_KEYS: (keyof Attribution)[] = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "fbclid",
  "msclkid",
  "referrer",
  "landing",
  "ts",
];

/**
 * Sanea el objeto de atribución que llega del cliente: solo claves conocidas,
 * strings recortados. Devuelve null si no queda nada útil (así el insert guarda NULL).
 */
export function sanitizeAttribution(raw: unknown): Attribution | null {
  if (!raw || typeof raw !== "object") return null;
  const src = raw as Record<string, unknown>;
  const out: Attribution = {};
  for (const key of ATTRIBUTION_KEYS) {
    const v = src[key];
    if (typeof v === "string") {
      const trimmed = v.trim().slice(0, 300);
      if (trimmed) out[key] = trimmed;
    }
  }
  return Object.keys(out).length ? out : null;
}

/**
 * Etiqueta corta y legible del origen de una reserva para el panel admin
 * (campaña > fuente > dominio del referrer > "directo").
 */
export function attributionLabel(a: Attribution | null | undefined): string | null {
  if (!a) return null;
  if (a.utm_campaign) return a.utm_campaign;
  if (a.utm_source) return a.utm_source;
  if (a.referrer) {
    try {
      return new URL(a.referrer).hostname.replace(/^www\./, "");
    } catch {
      return a.referrer;
    }
  }
  return "directo";
}

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
  attribution?: Attribution | null;
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
  if (!getSlotsForLocation(location, date).includes(time))
    return { ok: false, error: "Esa hora no está disponible en este local." };

  const partySize = Number(body.partySize);
  if (
    !Number.isInteger(partySize) ||
    partySize < PARTY_MIN ||
    partySize > PARTY_MAX_TOTAL
  )
    return {
      ok: false,
      error: `El número de comensales debe estar entre ${PARTY_MIN} y ${PARTY_MAX_TOTAL}.`,
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
      attribution: sanitizeAttribution(body.attribution),
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
  attribution: Attribution | null;
  status: "pending" | "confirmed" | "cancelled" | "rejected";
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
