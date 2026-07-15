import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente de Supabase con la service_role key: SOLO para uso en el servidor
 * (route handlers, server components). Nunca importar desde un componente
 * "use client". La tabla dananni_reservations tiene RLS activado sin policies,
 * así que solo la service_role puede leer/escribir (mismo patrón que
 * mellys_subscribers en este proyecto compartido).
 */
let cached: SupabaseClient | null = null;

// La URL del proyecto NO es secreta (es la que iría en NEXT_PUBLIC). La fijamos
// por defecto para no depender de que la env esté puesta en cada entorno; solo
// la service_role (secreta) tiene que venir sí o sí del entorno.
const SUPABASE_URL_DEFAULT = "https://ipxkhcyzycoktfassukz.supabase.co";

export function getSupabaseAdmin(): SupabaseClient {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    SUPABASE_URL_DEFAULT;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceKey) {
    throw new Error(
      "Falta SUPABASE_SERVICE_ROLE_KEY en el entorno (Supabase → Settings → API → service_role)."
    );
  }

  if (!cached) {
    cached = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cached;
}

/** Nombre de la tabla de reservas (prefijo por convención del proyecto compartido). */
export const RESERVATIONS_TABLE = "dananni_reservations";
