import type { MetadataRoute } from "next";
import { dineInLocations, takeAwayLocations, hrefFor } from "@/data/locations";
import { menuByLocationSlug } from "@/data/menu";

const SITE_URL = "https://www.dananni.es";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/nuestra-historia",
    "/restaurantes",
    "/para-llevar",
    "/a-domicilio",
    "/carta",
    "/contacto",
  ];

  const locationRoutes = [...dineInLocations, ...takeAwayLocations].map(
    (location) => hrefFor(location)
  );

  const cartaRoutes = Object.keys(menuByLocationSlug).map(
    (slug) => `/carta/${slug}`
  );

  const lastModified = new Date();

  return [...staticRoutes, ...locationRoutes, ...cartaRoutes].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/restaurantes" ? 0.9 : 0.7,
  }));
}
