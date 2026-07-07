import type { MetadataRoute } from "next";
import { locations, hrefFor, cartaHrefFor } from "@/data/locations";
import { menuByLocationSlug } from "@/data/menu";

const SITE_URL = "https://www.dananni.es";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/nuestra-historia",
    "/restaurantes",
    "/pizza-para-llevar",
    "/a-domicilio",
    "/restaurantes/cartas",
    "/contacto",
  ];

  const locationRoutes = locations.map((location) => hrefFor(location));

  const cartaRoutes = locations
    .filter((location) => menuByLocationSlug[location.slug])
    .map((location) => cartaHrefFor(location));

  const lastModified = new Date();

  return [...staticRoutes, ...locationRoutes, ...cartaRoutes].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/restaurantes" ? 0.9 : 0.7,
  }));
}
