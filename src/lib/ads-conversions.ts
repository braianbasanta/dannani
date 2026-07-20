/**
 * Conversiones de Google Ads.
 *
 * Cada local tiene su propia cuenta de Google Ads (una por sociedad, ver el
 * proyecto `dannani-ads-automation`), así que hay una acción de conversión
 * "Reserva web" por cuenta. La web dispara el evento a las cuatro a la vez:
 * solo registra la conversión aquella cuenta cuya campaña originó el clic,
 * las demás lo ignoran. No se usa una conversión compartida a nivel de MCC
 * porque eso obligaría a mover también las conversiones automáticas del
 * perfil de negocio (clics de llamada y "cómo llegar") al manager.
 *
 * OJO: gtag solo existe si el usuario aceptó cookies (ver CookieConsent).
 * Las reservas de quien las rechaza se recuperan por importación offline,
 * cruzando el `gclid` que guarda `attribution.ts` en cada reserva.
 */

/** IDs de conversión (AW-xxxx) de cada cuenta, para `gtag("config", ...)`. */
export const ADS_CONVERSION_IDS = [
  "AW-18307981284", // Tallers 69
  "AW-18307969591", // Born
  "AW-18299293008", // Poblenou
  "AW-18307984174", // Gràcia
] as const;

/** Etiquetas completas (AW-xxxx/label) de la acción "Reserva web". */
const RESERVATION_SEND_TO = [
  "AW-18307981284/Mo24CPHNzNMcEOS_9plE", // Tallers 69
  "AW-18307969591/nCqrCPTNzNMcELfk9ZlE", // Born
  "AW-18299293008/K9fkCOHPzNMcENCa5JVE", // Poblenou
  "AW-18307984174/l96oCPTc0NMcEK7W9plE", // Gràcia
] as const;

type GtagWindow = Window & { gtag?: (...args: unknown[]) => void };

/**
 * Notifica a Google Ads que se ha creado una reserva. Silencioso si no hay
 * consentimiento (gtag no existe) — no rompe el flujo del formulario.
 */
export function trackReservationConversion() {
  if (typeof window === "undefined") return;
  const gtag = (window as GtagWindow).gtag;
  if (!gtag) return;
  for (const sendTo of RESERVATION_SEND_TO) {
    gtag("event", "conversion", { send_to: sendTo });
  }
}
