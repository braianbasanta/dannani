import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente de Supabase con la service_role key: SOLO para uso en el servidor
 * (route handlers, server components). Nunca importar desde un componente
 * "use client". La tabla dananni_reservations tiene RLS activado sin policies,
 * así que solo la service_role puede leer/escribir (mismo patrón que
 * mellys_subscribers en este proyecto compartido).
 */
let cached: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Supabase no configurado: define NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en el entorno."
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
