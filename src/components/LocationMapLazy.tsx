"use client";

import dynamic from "next/dynamic";
import type { Location } from "@/data/locations";

/**
 * Carga diferida del mapa de un local (Leaflet no soporta SSR). Mejora
 * progresiva: dirección y enlaces del local ya están en el HTML.
 */
const LocationMap = dynamic(
  () => import("./LocationMap").then((m) => m.LocationMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[380px] animate-pulse rounded-[1.75rem] bg-cream/10 sm:h-[460px]" />
    ),
  }
);

export function LocationMapLazy({ location }: { location: Location }) {
  return <LocationMap location={location} />;
}
