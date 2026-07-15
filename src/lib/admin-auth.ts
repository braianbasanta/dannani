import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

/**
 * Autenticación mínima del panel admin: una única clave compartida
 * (ADMIN_PASSWORD). La cookie NO guarda la contraseña, sino un token
 * derivado por HMAC; verificar = recomputar y comparar en tiempo constante.
 */
export const ADMIN_COOKIE = "dananni_admin";
export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 días

/** Token determinista derivado de la contraseña; null si no está configurada. */
export function adminToken(): string | null {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return null;
  return createHmac("sha256", pw).update("dananni-admin-v1").digest("hex");
}

export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

/** Comprueba la cookie de sesión del admin en la request actual. */
export async function isAdminAuthed(): Promise<boolean> {
  const expected = adminToken();
  if (!expected) return false;
  const store = await cookies();
  const value = store.get(ADMIN_COOKIE)?.value;
  if (!value) return false;
  const a = Buffer.from(value);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
