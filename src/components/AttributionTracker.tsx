"use client";

import { useEffect } from "react";
import { captureAttribution } from "@/lib/attribution";

/**
 * Captura la atribución de marketing (utm_*, referrer, landing) al aterrizar,
 * una sola vez por sesión. Montado en el layout para que funcione aterrice
 * donde aterrice el usuario (ficha de restaurante, /reservar, home…) antes de
 * llegar al formulario. No renderiza nada ni usa cookies.
 */
export function AttributionTracker() {
  useEffect(() => {
    captureAttribution();
  }, []);
  return null;
}
