"use client";

import dynamic from "next/dynamic";
import type { MapLocation } from "@/data/locations";

/**
 * Carga diferida del mapa (Leaflet no soporta SSR). El mapa es mejora
 * progresiva: toda la información de los locales ya está en el HTML.
 */
const LocationsMap = dynamic(
  () => import("./LocationsMap").then((m) => m.LocationsMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[440px] animate-pulse rounded-[calc(1.75rem-0.5rem)] bg-cream/10 sm:h-[520px]" />
    ),
  }
);

export function LocationsMapLazy({ locations }: { locations: MapLocation[] }) {
  return <LocationsMap locations={locations} />;
}
