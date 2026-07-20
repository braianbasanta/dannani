import type { Attribution } from "@/lib/reservations";
import { ATTRIBUTION_KEYS } from "@/lib/reservations";

/**
 * Captura de atribución en el navegador (first-touch de la sesión). Guarda de
 * dónde llegó el usuario la PRIMERA vez que aterriza en la web, para poder
 * asociarlo a la reserva sin depender de cookies ni de GA. Vive en
 * sessionStorage: se pierde al cerrar la pestaña (una sesión = una visita).
 */
const STORAGE_KEY = "dananni-attribution";

/** Parámetros de URL que copiamos tal cual al objeto de atribución. */
const URL_PARAMS: (keyof Attribution)[] = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "fbclid",
  "msclkid",
];

function readStore(): Attribution | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Attribution) : null;
  } catch {
    return null;
  }
}

/**
 * Si aún no hay atribución en esta sesión, la construye desde la URL actual +
 * el referrer + el path de aterrizaje y la persiste (first-touch). Idempotente:
 * las llamadas siguientes NO pisan la primera. Pensada para correr en cada
 * pageview (montada en el layout).
 */
export function captureAttribution(): void {
  if (typeof window === "undefined") return;
  if (readStore()) return; // ya capturada esta sesión → respetar el first-touch

  const params = new URLSearchParams(window.location.search);
  const attr: Attribution = {};

  for (const key of URL_PARAMS) {
    const v = params.get(key);
    if (v) attr[key] = v.slice(0, 300);
  }

  const ref = document.referrer;
  // Ignoramos el referrer interno (navegación dentro de la propia web).
  if (ref && !ref.startsWith(window.location.origin)) {
    attr.referrer = ref.slice(0, 300);
  }

  attr.landing = window.location.pathname.slice(0, 300);
  attr.ts = new Date().toISOString();

  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attr));
  } catch {
    // sessionStorage bloqueado (modo privado estricto): sin atribución, no rompe.
  }
}

/**
 * Devuelve la atribución capturada en esta sesión (o null), saneada a claves
 * conocidas, más la decisión del banner de cookies en este momento (`consent`).
 * El consentimiento se lee al vuelo — no en la captura first-touch — porque el
 * usuario puede aceptar el banner después de aterrizar y antes de reservar.
 */
export function readAttribution(): Attribution | null {
  if (typeof window === "undefined") return null;
  const stored = readStore();
  const out: Attribution = {};
  for (const key of ATTRIBUTION_KEYS) {
    const v = stored?.[key];
    if (typeof v === "string" && v) out[key] = v;
  }
  try {
    out.consent = window.localStorage.getItem("dananni-cookie-consent") ?? "unset";
  } catch {
    out.consent = "unset";
  }
  return Object.keys(out).length ? out : null;
}
