import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 90],
    // Pósters de los videos de platos (Vercel Blob): se sirven vía
    // next/image para que lleguen redimensionados y en WebP/AVIF en vez
    // del JPEG original de ~40-90 KB cada uno.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "obmqnxm4jz6jfagp.public.blob.vercel-storage.com",
      },
    ],
  },
  // 301 de la estructura de URLs antigua (jul-2026): las fichas take away
  // vivían en /para-llevar/<slug> y las cartas en /carta/<slug interno>.
  // Ahora todo cuelga de /restaurantes. OJO: /restaurantes/raval cambió de
  // dueño (antes el dine-in de Tallers, hoy el take away de Raval), por eso
  // no se puede redirigir.
  // Las URLs del WP viejo indexadas CON barra final ("/rambla-del-poblenou/")
  // atraviesan dos 308 (normalización de slash → redirect custom): la
  // normalización de Next corre ANTES que estos redirects (verificado en dev,
  // jul-2026), así que no se puede dejar en un salto desde aquí. Tolerable.
  async redirects() {
    return [
      {
        source: "/para-llevar/gotic",
        destination: "/restaurantes/gotic",
        permanent: true,
      },
      {
        source: "/para-llevar/raval",
        destination: "/restaurantes/raval",
        permanent: true,
      },
      // La landing de servicio ganó la keyword en la URL
      {
        source: "/para-llevar",
        destination: "/pizza-para-llevar",
        permanent: true,
      },
      {
        source: "/carta",
        destination: "/restaurantes/cartas",
        permanent: true,
      },
      {
        source: "/menu",
        destination: "/restaurantes/cartas",
        permanent: true,
      },
      // Slugs internos que no coinciden con el urlSlug público nuevo
      {
        source: "/carta/raval-take-away",
        destination: "/restaurantes/raval/carta",
        permanent: true,
      },
      {
        source: "/carta/raval",
        destination: "/restaurantes/tallers/carta",
        permanent: true,
      },
      // El resto de slugs de carta coinciden 1:1 (gotic, born, poblenou, gracia)
      {
        source: "/carta/:slug",
        destination: "/restaurantes/:slug/carta",
        permanent: true,
      },

      // ── 301 del WordPress viejo (mapa sacado de GSC, export 2026-07-13) ──
      // Cubre todas las URLs con clics/impresiones del sitio anterior para no
      // perder el equity el día del switch de dominio. Las de Manso (local
      // cerrado) van al listado de restaurantes / índice de cartas.

      // Fichas de local
      {
        source: "/carrer-de-la-llibreteria-10-ciutat-vella-08002-barcelona",
        destination: "/restaurantes/gotic",
        permanent: true,
      },
      {
        source: "/c-dels-tallers-69",
        destination: "/restaurantes/tallers",
        permanent: true,
      },
      {
        source: "/c-dels-tallers-72",
        destination: "/restaurantes/raval",
        permanent: true,
      },
      {
        source: "/c-de-verdi",
        destination: "/restaurantes/gracia",
        permanent: true,
      },
      {
        source: "/c-del-rec",
        destination: "/restaurantes/born",
        permanent: true,
      },
      {
        source: "/rambla-del-poblenou",
        destination: "/restaurantes/poblenou",
        permanent: true,
      },
      {
        source: "/carrer-de-manso",
        destination: "/restaurantes",
        permanent: true,
      },
      {
        source: "/locations",
        destination: "/restaurantes",
        permanent: true,
      },

      // Cartas por local
      {
        source: "/menu-carrer-de-la-llibreteri",
        destination: "/restaurantes/gotic/carta",
        permanent: true,
      },
      {
        source: "/menu-c-dels-tallers-69",
        destination: "/restaurantes/tallers/carta",
        permanent: true,
      },
      {
        source: "/menu-c-dels-tallers-72",
        destination: "/restaurantes/raval/carta",
        permanent: true,
      },
      {
        source: "/menu-c-de-verdi",
        destination: "/restaurantes/gracia/carta",
        permanent: true,
      },
      {
        source: "/menu-c-del-rec",
        destination: "/restaurantes/born/carta",
        permanent: true,
      },
      {
        source: "/menu-rambla-del-poblenou",
        destination: "/restaurantes/poblenou/carta",
        permanent: true,
      },
      {
        source: "/menu-carrer-de-manso",
        destination: "/restaurantes/cartas",
        permanent: true,
      },

      // PDFs de cartas indexados (wp-content). El resto de wp-content
      // (imágenes, etc.) se deja en 404 a propósito: no son páginas.
      {
        source:
          "/wp-content/uploads/2025/05/Carta-DaNanni-Gracia-ESPANOL_STAMPA_FINE-part-1.pdf",
        destination: "/restaurantes/gracia/carta",
        permanent: true,
      },
      {
        source:
          "/wp-content/uploads/2025/05/Carta-DaNanni-Gracia-ESPANOL_STAMPA_FINE-part-2.pdf",
        destination: "/restaurantes/gracia/carta",
        permanent: true,
      },
      {
        source:
          "/wp-content/uploads/2025/05/Carta-DaNanni-Gracia-ESPANOL_STAMPA_FINE-part-2-1.pdf",
        destination: "/restaurantes/gracia/carta",
        permanent: true,
      },
      {
        source:
          "/wp-content/uploads/2025/04/Carta-DaNanni-Manso-ESPANOL-STAMPA-FINE-1-part-2.pdf",
        destination: "/restaurantes/cartas",
        permanent: true,
      },
      {
        source: "/wp-content/uploads/2025/04/vini-manso.pdf",
        destination: "/restaurantes/cartas",
        permanent: true,
      },

      // Páginas sueltas del WP
      {
        source: "/our-story",
        destination: "/nuestra-historia",
        permanent: true,
      },
      {
        source: "/tradizione",
        destination: "/nuestra-historia",
        permanent: true,
      },
      {
        source: "/contact-new",
        destination: "/contacto",
        permanent: true,
      },
      {
        source: "/contact-2",
        destination: "/contacto",
        permanent: true,
      },
      {
        source: "/privacy-policy",
        destination: "/privacidad",
        permanent: true,
      },

      // Cruft de WordPress (blog, autores) → home
      {
        source: "/category/:path*",
        destination: "/",
        permanent: true,
      },
      {
        source: "/author/:path*",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
