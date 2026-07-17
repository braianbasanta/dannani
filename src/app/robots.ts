import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    // Las páginas legales llevan noindex en su propio metadata; no se
    // bloquean aquí para que Google pueda ver esa directiva. El admin y las
    // páginas de gestión de reserva (token) sí se bloquean: no aportan nada
    // al índice y ahorran rastreo.
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/reserva/"],
    },
    sitemap: "https://dananni.es/sitemap.xml",
  };
}
