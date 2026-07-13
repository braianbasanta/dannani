"use client";

import { useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import type { Map as LeafletMap } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useLocale, useTranslations } from "next-intl";
import type { Location, Coords } from "@/data/locations";
import { DeliveryButtons } from "./DeliveryCTA";
import { pinIcon, userIcon } from "./mapIcons";
import { haversineKm, kmFormat } from "@/lib/geo";
import { BCP47 } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

/**
 * Mapa de los locales con delivery: localiza al usuario, señala cuál le
 * queda más cerca de casa y le da los botones de Glovo/Just Eat de ese
 * local para pedir directamente.
 */
export function DeliveryMap({ locations }: { locations: Location[] }) {
  const t = useTranslations("mapa");
  const locale = useLocale() as Locale;
  const mapRef = useRef<LeafletMap | null>(null);
  const [userPos, setUserPos] = useState<Coords | null>(null);
  const [status, setStatus] = useState<"idle" | "locating" | "error">("idle");

  const bounds = useMemo(
    () =>
      L.latLngBounds(
        locations.map((l) => [l.coords.lat, l.coords.lng] as [number, number])
      ).pad(0.3),
    [locations]
  );

  const nearest = useMemo(() => {
    if (!userPos) return null;
    let best: { location: Location; km: number } | null = null;
    for (const location of locations) {
      const km = haversineKm(userPos, location.coords);
      if (!best || km < best.km) best = { location, km };
    }
    return best;
  }, [userPos, locations]);

  const locate = () => {
    if (!("geolocation" in navigator)) {
      setStatus("error");
      return;
    }
    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserPos(p);
        setStatus("idle");
        let bestL: Location | null = null;
        let bestKm = Infinity;
        for (const location of locations) {
          const km = haversineKm(p, location.coords);
          if (km < bestKm) {
            bestKm = km;
            bestL = location;
          }
        }
        if (bestL && mapRef.current) {
          mapRef.current.fitBounds(
            L.latLngBounds(
              [p.lat, p.lng],
              [bestL.coords.lat, bestL.coords.lng]
            ).pad(0.35)
          );
        }
      },
      () => setStatus("error"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="overflow-hidden rounded-[1.75rem] bg-night-soft ring-1 ring-cream/10">
      <div className="relative z-0 h-[340px] sm:h-[420px]">
        <MapContainer
          ref={mapRef}
          bounds={bounds}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {locations.map((location) => (
            <Marker
              key={location.slug}
              position={[location.coords.lat, location.coords.lng]}
              icon={pinIcon}
            >
              <Popup>
                <span className="block font-semibold">{location.name}</span>
                <span className="mt-0.5 block">{location.address}</span>
              </Popup>
            </Marker>
          ))}
          {userPos && (
            <Marker position={[userPos.lat, userPos.lng]} icon={userIcon}>
              <Popup>{t("tuUbicacion")}</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-cream/10 px-4 py-4 sm:px-5">
        <button
          type="button"
          onClick={locate}
          disabled={status === "locating"}
          className="inline-flex items-center gap-2 rounded-full bg-electric px-5 py-2.5 font-sans text-sm font-semibold text-night transition-colors duration-300 hover:bg-electric-dark active:scale-[0.98] disabled:opacity-60"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" strokeLinecap="round" />
            <circle cx="12" cy="12" r="8" />
          </svg>
          {status === "locating" ? t("localizando") : t("cercaDeMi")}
        </button>

        {status === "error" && (
          <p className="text-sm text-cream/70">{t("error")}</p>
        )}

        {nearest && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
            <p className="text-sm text-cream">
              {t("masCercano")}{" "}
              <span className="font-semibold">{nearest.location.name}</span> ·{" "}
              {t("aDistancia", { km: kmFormat(BCP47[locale]).format(nearest.km) })}
            </p>
            <div className="flex flex-wrap gap-2">
              <DeliveryButtons location={nearest.location} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
