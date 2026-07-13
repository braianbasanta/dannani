import { defineRouting } from "next-intl/routing";

/**
 * es es el default (sin prefijo, localePrefix "as-needed"); en/it/ca
 * cuelgan de /en, /it y /ca con las mismas rutas en español.
 * Para añadir otro idioma: código aquí + su messages/<locale>.json.
 */
export const routing = defineRouting({
  locales: ["es", "en", "it", "ca"],
  defaultLocale: "es",
  localePrefix: "as-needed",
  // Sin redirecciones según Accept-Language/cookie: el idioma lo decide solo
  // la URL (SEO: Googlebot y usuarios siempre ven la versión canónica).
  localeDetection: false,
  localeCookie: false,
});

export type Locale = (typeof routing.locales)[number];
