"use client";

import { useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import type { Map as LeafletMap } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Location, Coords } from "@/data/locations";
import { hrefFor, mapsUrl } from "@/data/locations";

const pinIcon = L.divIcon({
  className: "",
  html: `<svg width="34" height="44" viewBox="0 0 34 44" xmlns="http://www.w3.org/2000/svg"><path d="M17 1C8.2 1 1 8.2 1 17c0 11.6 16 26 16 26s16-14.4 16-26C33 8.2 25.8 1 17 1Z" fill="#1f3b40" stroke="#fdfbf6" stroke-width="2"/><circle cx="17" cy="17" r="6" fill="#d98e2b"/></svg>`,
  iconSize: [34, 44],
  iconAnchor: [17, 42],
  popupAnchor: [0, -40],
});

const userIcon = L.divIcon({
  className: "",
  html: `<span style="display:block;width:16px;height:16px;border-radius:9999px;background:#3e7e8c;border:3px solid #fdfbf6;box-shadow:0 0 0 6px rgba(62,126,140,.25)"></span>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

function haversineKm(a: Coords, b: Coords) {
  const rad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

const kmFormat = new Intl.NumberFormat("es-ES", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function LocationsMap({ locations }: { locations: Location[] }) {
  const t = useTranslations("mapa");
  const tCta = useTranslations("cta");
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
    <div className="overflow-hidden rounded-[calc(1.75rem-0.5rem)] bg-white">
      <div className="relative z-0 h-[380px] sm:h-[460px]">
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
                <Link
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  href={hrefFor(location) as any}
                  className="mt-1.5 inline-block font-semibold underline"
                >
                  {tCta("verLocal")}
                </Link>
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

      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-teal-dark/10 px-4 py-4 sm:px-5">
        <button
          type="button"
          onClick={locate}
          disabled={status === "locating"}
          className="inline-flex items-center gap-2 rounded-full bg-mustard px-5 py-2.5 font-sans text-sm font-semibold text-cream transition-colors duration-300 hover:bg-mustard-dark active:scale-[0.98] disabled:opacity-60"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" strokeLinecap="round" />
            <circle cx="12" cy="12" r="8" />
          </svg>
          {status === "locating" ? t("localizando") : t("cercaDeMi")}
        </button>

        {status === "error" && (
          <p className="text-sm text-teal-dark/70">{t("error")}</p>
        )}

        {nearest && (
          <p className="text-sm text-teal-dark">
            {t("masCercano")}{" "}
            <span className="font-semibold">{nearest.location.name}</span> ·{" "}
            {t("aDistancia", { km: kmFormat.format(nearest.km) })} ·{" "}
            <a
              href={mapsUrl(nearest.location)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline hover:text-mustard"
            >
              {tCta("comoLlegar")}
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
