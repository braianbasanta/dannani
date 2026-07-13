import type { MetadataRoute } from "next";
import { locations, hrefFor, cartaHrefFor } from "@/data/locations";
import { menuByLocationSlug } from "@/data/menu";

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

  // Sin lastModified: generarlo en cada build le miente a Google (parecería
  // que todo cambia en cada deploy) y devalúa la señal.
  return [...staticRoutes, ...locationRoutes, ...cartaRoutes].map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/restaurantes" ? 0.9 : 0.7,
  }));
}
