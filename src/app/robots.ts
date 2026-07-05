import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    // Las páginas legales llevan noindex en su propio metadata; no se
    // bloquean aquí para que Google pueda ver esa directiva.
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://www.dananni.es/sitemap.xml",
  };
}
