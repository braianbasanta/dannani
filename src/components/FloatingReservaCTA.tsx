"use client";

import { useEffect, useState } from "react";
import type { Location } from "@/data/locations";
import { ReservaCTA } from "./ReservaCTA";

/**
 * CTA de reserva flotante (abajo a la derecha) que aparece al scrollear
 * más allá del hero del local (identificado por `heroId`). Las clases
 * fixed/transition van sobre el propio botón — no sobre un wrapper con
 * transform/filter, que convertiría al wrapper en containing block y
 * rompería el `fixed` del CtaModal que renderiza ReservaCTA.
 */
export function FloatingReservaCTA({
  location,
  heroId,
}: {
  location: Location;
  heroId: string;
}) {
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    const hero = document.getElementById(heroId);
    if (!hero) return;
    const observer = new IntersectionObserver(([entry]) =>
      setPastHero(!entry.isIntersecting)
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, [heroId]);

  return (
    <ReservaCTA
      location={location}
      className={`fixed bottom-5 right-5 z-40 shadow-card-hover transition-all duration-300 ${
        pastHero
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0"
      }`}
    />
  );
}
