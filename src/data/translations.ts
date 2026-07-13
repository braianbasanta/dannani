import type { Locale } from "@/i18n/routing";
import type { Location } from "@/data/locations";
import { en } from "./translations.en";
import { it } from "./translations.it";
import { ca } from "./translations.ca";

/**
 * Diccionario de traducción del contenido data-driven (locations, menú,
 * clips de experiencia), keyed por el texto español EXACTO tal como vive
 * en src/data/*.ts. El español es la fuente de verdad: si una clave falta
 * en un idioma, se muestra el original (así los nombres de plato en
 * italiano y los datos duros pasan intactos sin listarlos).
 *
 * Los archivos translations.{en,it,ca}.ts los genera scripts/translate-content.mjs
 * (DeepL) y después se revisan a mano. Si cambias un texto en src/data,
 * vuelve a correr el script para regenerar sus tres traducciones.
 */
const dataTranslations: Partial<Record<Locale, Record<string, string>>> = {
  en,
  it,
  ca,
};

export function translateData(text: string, locale: Locale): string {
  return dataTranslations[locale]?.[text] ?? text;
}

/** Campos de texto visible de un Location, resueltos en `locale`. */
export function localizeLocation(location: Location, locale: Locale): Location {
  if (locale === "es") return location;
  return {
    ...location,
    hoursLabel: translateData(location.hoursLabel, locale),
    description: translateData(location.description, locale),
    metaTitle: translateData(location.metaTitle, locale),
    metaDescription: translateData(location.metaDescription, locale),
    h1: translateData(location.h1, locale),
  };
}
