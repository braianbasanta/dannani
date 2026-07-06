"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AutoplayVideo } from "./AutoplayVideo";
import { DishMediaViewer, type MediaEntry } from "./DishMediaViewer";

/**
 * Carrusel horizontal de platos destacados de la home: tarjetas de video
 * vertical que se reproducen al entrar en viewport y abren el visor
 * fullscreen (DishMediaViewer) al tocarlas. La curación vive en
 * src/data/featured.ts.
 */
export function FeaturedDishesCarousel({ entries }: { entries: MediaEntry[] }) {
  const t = useTranslations("home");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 scroll-px-4 pb-3 [scrollbar-width:none] sm:gap-4 [&::-webkit-scrollbar]:hidden">
        {entries.map((entry, i) => (
          <button
            key={entry.item.name}
            type="button"
            onClick={() => setOpenIndex(i)}
            aria-label={t("platosVerVideo", { plato: entry.item.name })}
            className="group relative aspect-[9/16] w-[200px] shrink-0 snap-start overflow-hidden rounded-2xl bg-teal-dark text-left shadow-card transition-shadow duration-500 ease-fluid hover:shadow-card-hover sm:w-[240px]"
          >
            <AutoplayVideo
              src={entry.item.video!}
              poster={entry.item.poster!}
              className="h-full w-full object-cover transition-transform duration-700 ease-fluid group-hover:scale-[1.04]"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-teal-dark/85 via-teal-dark/10 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4 text-cream sm:p-5">
              <p className="font-display text-lg leading-tight tracking-tight sm:text-xl">
                {entry.item.name}
              </p>
              <p className="mt-1 font-sans text-sm font-semibold text-mustard">
                {entry.item.price}
              </p>
            </div>
          </button>
        ))}
      </div>

      {openIndex !== null && (
        <DishMediaViewer
          entries={entries}
          startIndex={openIndex}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </>
  );
}
