import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 90],
  },
  // 301 de la estructura de URLs antigua (jul-2026): las fichas take away
  // vivían en /para-llevar/<slug> y las cartas en /carta/<slug interno>.
  // Ahora todo cuelga de /restaurantes. OJO: /restaurantes/raval cambió de
  // dueño (antes el dine-in de Tallers, hoy el take away de Raval), por eso
  // no se puede redirigir.
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
      {
        source: "/carta",
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
    ];
  },
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
