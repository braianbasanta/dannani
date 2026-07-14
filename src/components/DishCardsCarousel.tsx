"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { AutoplayVideo } from "./AutoplayVideo";
import { priceLabel, type MediaEntry } from "./DishMediaViewer";

/**
 * Estado compartido de los carruseles snap: mide el overflow del track para
 * la barra de progreso y para centrar la fila cuando no llena el ancho.
 * `visibleRatio` arranca en 0 (= "desborda") para que el SSR pinte la fila
 * alineada a la izquierda: centrar una fila que desborda cortaría las
 * primeras tarjetas hasta hidratar. Se mide antes del primer paint.
 */
export function useCarouselOverflow() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0); // 0..1 del scroll horizontal
  const [visibleRatio, setVisibleRatio] = useState(0); // viewport/contenido

  useLayoutEffect(() => {
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

  return { trackRef, progress, visibleRatio };
}

/** Afordancia de scroll: barra de progreso + pista, solo si hay overflow. */
export function CarouselScrollHint({
  progress,
  visibleRatio,
}: {
  progress: number;
  visibleRatio: number;
}) {
  const t = useTranslations("menuVideo");
  if (visibleRatio >= 1) return null;
  return (
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
  );
}

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
  const { trackRef, progress, visibleRatio } = useCarouselOverflow();

  return (
    <>
      <div
        ref={trackRef}
        className={
          "flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3 [scrollbar-width:none] sm:gap-4 [&::-webkit-scrollbar]:hidden" +
          // Si las tarjetas no llenan el ancho, se centran (no usamos
          // `safe center` de CSS porque iOS Safari no lo soporta y al
          // desbordar cortaría el lado izquierdo).
          (visibleRatio >= 1 ? " justify-center" : "") +
          (trackClassName ? ` ${trackClassName}` : "")
        }
      >
        {entries.map((entry, i) => (
          <button
            key={entry.item.name}
            type="button"
            onClick={() => onOpen(i)}
            aria-label={t("verVideo", { plato: entry.item.name })}
            className="group relative aspect-[9/16] w-[230px] shrink-0 snap-start overflow-hidden rounded-2xl bg-night-soft text-left shadow-card transition-shadow duration-500 ease-fluid hover:shadow-card-hover sm:w-[300px]"
          >
            {/* Póster/foto por next/image (lazy + redimensionado + WebP);
                el video va encima sin atributo poster — queda transparente
                y deja ver la imagen hasta que arranca en viewport. */}
            <div className="absolute inset-0 transition-transform duration-700 ease-fluid group-hover:scale-[1.04]">
              {(entry.item.poster ?? entry.item.photo) && (
                <Image
                  src={(entry.item.poster ?? entry.item.photo)!}
                  alt={entry.item.name}
                  fill
                  sizes="(min-width: 640px) 300px, 230px"
                  className="object-cover"
                />
              )}
              {entry.item.video && (
                <AutoplayVideo
                  src={entry.item.video}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
            </div>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night/85 via-night/10 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4 text-cream sm:p-5">
              <p className="font-display text-xl leading-tight tracking-tight sm:text-2xl">
                {entry.item.name}
              </p>
              <p className="mt-1 font-sans text-sm font-semibold text-mustard sm:text-base">
                {priceLabel(entry.item)}
              </p>
            </div>
          </button>
        ))}
      </div>

      <CarouselScrollHint progress={progress} visibleRatio={visibleRatio} />
    </>
  );
}
