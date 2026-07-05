import { defineRouting } from "next-intl/routing";

/**
 * Único locale activo por ahora: es. Para lanzar en/it/fr más adelante:
 * añadir el código aquí + su messages/<locale>.json — sin tocar rutas ni componentes.
 */
export const routing = defineRouting({
  locales: ["es"],
  defaultLocale: "es",
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];
