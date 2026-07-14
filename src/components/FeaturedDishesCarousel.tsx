"use client";

import { useState } from "react";
import { DishCardsCarousel } from "./DishCardsCarousel";
import { DishMediaViewer, type MediaEntry } from "./DishMediaViewer";

/**
 * Carrusel de platos destacados de la home: las tarjetas de video abren el
 * visor fullscreen (DishMediaViewer) al tocarlas. La curación vive en
 * src/data/featured.ts; el patrón visual está en DishCardsCarousel.
 */
export function FeaturedDishesCarousel({ entries }: { entries: MediaEntry[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <DishCardsCarousel
        entries={entries}
        onOpen={setOpenIndex}
        trackClassName="px-4 scroll-px-4"
      />

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
