"use client";

import { useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import type { Map as LeafletMap } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useTranslations } from "next-intl";
import type { MapLocation, Coords } from "@/data/locations";
import { mapsUrl } from "@/data/locations";
import { pinIcon, userIcon } from "./mapIcons";

/**
 * Mapa de un solo local: pin del negocio, botón para mostrar tu ubicación
 * (encuadra tu posición y el local) y enlace a la ficha de Google Maps.
 */
export function LocationMap({ location }: { location: MapLocation }) {
  const t = useTranslations("mapa");
  const tCta = useTranslations("cta");
  const mapRef = useRef<LeafletMap | null>(null);
  const [userPos, setUserPos] = useState<Coords | null>(null);
  const [status, setStatus] = useState<"idle" | "locating" | "error">("idle");

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
        mapRef.current?.fitBounds(
          L.latLngBounds(
            [p.lat, p.lng],
            [location.coords.lat, location.coords.lng]
          ).pad(0.35)
        );
      },
      () => setStatus("error"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="overflow-hidden rounded-[1.75rem] bg-night-soft ring-1 ring-cream/10">
      <div className="relative z-0 h-[320px] sm:h-[400px]">
        <MapContainer
          ref={mapRef}
          center={[location.coords.lat, location.coords.lng]}
          zoom={16}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker
            position={[location.coords.lat, location.coords.lng]}
            icon={pinIcon}
          >
            <Popup>
              <span className="block font-semibold">{location.name}</span>
              <span className="mt-0.5 block">{location.address}</span>
            </Popup>
          </Marker>
          {userPos && (
            <Marker position={[userPos.lat, userPos.lng]} icon={userIcon}>
              <Popup>{t("tuUbicacion")}</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-3 border-t border-cream/10 px-4 py-4 sm:px-5">
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
          {status === "locating" ? t("localizando") : t("verMiUbicacion")}
        </button>

        <a
          href={mapsUrl(location)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-cream/25 px-5 py-2.5 font-sans text-sm font-semibold text-cream transition hover:bg-cream/5"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11Z" />
            <circle cx="12" cy="10" r="2.5" />
          </svg>
          {tCta("comoLlegar")}
        </a>

        {status === "error" && (
          <p className="text-sm text-cream/70">{t("error")}</p>
        )}
      </div>
    </div>
  );
}
