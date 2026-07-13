import type { Metadata } from "next";
import { routing, type Locale } from "@/i18n/routing";

/** Imagen OG por defecto del sitio (1200×630, generada de la foto de la
 * pizza frente a la Catedral). */
export const OG_DEFAULT_IMAGE = "/images/og/home.jpg";

/** Locale de Open Graph por idioma del sitio. */
export const OG_LOCALES: Record<Locale, string> = {
  es: "es_ES",
  en: "en_GB",
  it: "it_IT",
  ca: "ca_ES",
};

/** Tag BCP 47 por locale, para Intl.NumberFormat y similares. */
export const BCP47: Record<Locale, string> = {
  es: "es-ES",
  en: "en-GB",
  it: "it-IT",
  ca: "ca-ES",
};

/** Ruta pública con prefijo de locale; es (default) va sin prefijo. */
export function localePath(locale: Locale, path: string) {
  const clean = path === "" ? "/" : path;
  if (locale === routing.defaultLocale) return clean;
  return clean === "/" ? `/${locale}` : `/${locale}${clean}`;
}

/** Mapa hreflang de `path` para todas las variantes de idioma + x-default. */
export function languageAlternates(path: string) {
  return {
    ...Object.fromEntries(
      routing.locales.map((locale) => [locale, localePath(locale, path)])
    ),
    "x-default": localePath(routing.defaultLocale, path),
  };
}

/**
 * Metadata de página con canonical, hreflang y Open Graph consistentes.
 * `path` es la ruta pública sin locale (p.ej. "/restaurantes/born");
 * las URLs relativas se resuelven contra `metadataBase` (layout raíz).
 */
export function pageMetadata({
  title,
  description,
  path,
  image,
  locale = routing.defaultLocale,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  locale?: Locale;
}): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: localePath(locale, path),
      languages: languageAlternates(path),
    },
    openGraph: {
      title,
      description,
      url: localePath(locale, path),
      type: "website",
      siteName: "Da Nanni",
      locale: OG_LOCALES[locale],
      images: [{ url: image ?? OG_DEFAULT_IMAGE }],
    },
  };
}
