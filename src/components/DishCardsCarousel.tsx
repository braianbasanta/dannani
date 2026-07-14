"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AutoplayVideo } from "./AutoplayVideo";
import { priceLabel, type MediaEntry } from "./DishMediaViewer";

/**
 * Carrusel horizontal de tarjetas de plato: video vertical (o foto) que se
 * reproduce al entrar en viewport. Es el patrón de "Nuestros platos" de la
 * home, extraído para reutilizarlo también por sección en las cartas.
 * El visor fullscreen lo gestiona el padre vía `onOpen`. Debajo, una barra
 * de progreso indica que hay más platos deslizando a la derecha.
 */
export function DishCardsCarousel({
  entries,
  onOpen,
  trackClassName,
}: {
  entries: MediaEntry[];
  onOpen: (index: number) => void;
  /** Padding extra del track (p. ej. `px-4 scroll-px-4` cuando va full-bleed). */
  trackClassName?: string;
}) {
  const t = useTranslations("menuVideo");

  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0); // 0..1 del scroll horizontal
  const [visibleRatio, setVisibleRatio] = useState(1); // viewport/contenido

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      setVisibleRatio(el.clientWidth / el.scrollWidth);
      setProgress(max > 0 ? el.scrollLeft / max : 0);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <>
      <div
        ref={trackRef}
        className={
          "flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3 [scrollbar-width:none] sm:gap-4 [&::-webkit-scrollbar]:hidden" +
          (trackClassName ? ` ${trackClassName}` : "")
        }
      >
        {entries.map((entry, i) => (
          <button
            key={entry.item.name}
            type="button"
            onClick={() => onOpen(i)}
            aria-label={t("verVideo", { plato: entry.item.name })}
            className="group relative aspect-[9/16] w-[200px] shrink-0 snap-start overflow-hidden rounded-2xl bg-night-soft text-left shadow-card transition-shadow duration-500 ease-fluid hover:shadow-card-hover sm:w-[240px]"
          >
            {entry.item.video ? (
              <AutoplayVideo
                src={entry.item.video}
                poster={entry.item.poster!}
                className="h-full w-full object-cover transition-transform duration-700 ease-fluid group-hover:scale-[1.04]"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={entry.item.photo}
                alt={entry.item.name}
                loading="lazy"
                draggable={false}
                className="h-full w-full object-cover transition-transform duration-700 ease-fluid group-hover:scale-[1.04]"
              />
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night/85 via-night/10 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4 text-cream sm:p-5">
              <p className="font-display text-lg leading-tight tracking-tight sm:text-xl">
                {entry.item.name}
              </p>
              <p className="mt-1 font-sans text-sm font-semibold text-mustard">
                {priceLabel(entry.item)}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Afordancia de scroll: barra de progreso + pista, solo si hay overflow */}
      {visibleRatio < 1 && (
        <div className="mt-5 flex items-center justify-center gap-3 px-4">
          <div
            className="relative h-1 w-28 overflow-hidden rounded-full bg-cream/15"
            aria-hidden
          >
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-electric"
              style={{
                width: `${visibleRatio * 100}%`,
                transform: `translateX(${progress * (1 / visibleRatio - 1) * 100}%)`,
              }}
            />
          </div>
          <p className="font-sans text-xs font-medium text-cream/50">
            {t("desliza")}
          </p>
        </div>
      )}
    </>
  );
}
