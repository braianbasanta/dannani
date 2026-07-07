"use client";

import dynamic from "next/dynamic";
import type { Location } from "@/data/locations";

/**
 * Carga diferida del mapa de delivery (Leaflet no soporta SSR). Mejora
 * progresiva: las tarjetas de locales con sus enlaces ya están en el HTML.
 */
const DeliveryMap = dynamic(
  () => import("./DeliveryMap").then((m) => m.DeliveryMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] animate-pulse rounded-[1.75rem] bg-cream/10 sm:h-[480px]" />
    ),
  }
);

export function DeliveryMapLazy({ locations }: { locations: Location[] }) {
  return <DeliveryMap locations={locations} />;
}
