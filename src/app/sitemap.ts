import type { MetadataRoute } from "next";
import { locations, hrefFor, cartaHrefFor } from "@/data/locations";
import { menuByLocationSlug } from "@/data/menu";
import { routing } from "@/i18n/routing";
import { localePath, languageAlternates } from "@/lib/seo";

const SITE_URL = "https://www.dananni.es";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/nuestra-historia",
    "/restaurantes",
    "/pizzeria-napolitana-barcelona",
    "/mejor-pizzeria-barcelona",
    "/pizza-para-llevar",
    "/a-domicilio",
    "/restaurantes/cartas",
    "/contacto",
  ];

  const locationRoutes = locations.map((location) => hrefFor(location));

  const cartaRoutes = locations
    .filter((location) => menuByLocationSlug[location.slug])
    .map((location) => cartaHrefFor(location));

  const paths = [...staticRoutes, ...locationRoutes, ...cartaRoutes];

  // Sin lastModified: generarlo en cada build le miente a Google (parecería
  // que todo cambia en cada deploy) y devalúa la señal.
  // Una entrada por variante de idioma, todas con el mismo mapa hreflang.
  return paths.flatMap((path) => {
    const languages = Object.fromEntries(
      Object.entries(languageAlternates(path)).map(([lang, p]) => [
        lang,
        `${SITE_URL}${p}`,
      ])
    );
    return routing.locales.map((locale) => ({
      url: `${SITE_URL}${localePath(locale, path)}`,
      changeFrequency: (path === "" ? "weekly" : "monthly") as
        | "weekly"
        | "monthly",
      priority: path === "" ? 1 : path === "/restaurantes" ? 0.9 : 0.7,
      alternates: { languages },
    }));
  });
}
