"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  useCarouselOverflow,
  CarouselScrollHint,
} from "./DishCardsCarousel";

export type OtherCartaItem = {
  slug: string;
  /** Ruta a la carta del local (cartaHrefFor). */
  href: string;
  /** Foto hero del local (heroImageSrc). */
  image: string;
  name: string;
  neighborhood: string;
  takeAway: boolean;
};

/**
 * "Carta de otros locales": mismo patrón de carrusel snap lateral que las
 * secciones de platos, con tarjetas verticales 9:16 de la foto de cada
 * local enlazando a su carta.
 */
export function OtherCartasCarousel({ items }: { items: OtherCartaItem[] }) {
  const t = useTranslations("cartaPage");
  const { trackRef, progress, visibleRatio } = useCarouselOverflow();

  return (
    <>
      <div
        ref={trackRef}
        className={
          "flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 scroll-px-4 pb-3 [scrollbar-width:none] sm:gap-4 [&::-webkit-scrollbar]:hidden" +
          // Si las tarjetas no llenan el ancho, se centran (no usamos
          // `safe center` de CSS porque iOS Safari no lo soporta y al
          // desbordar cortaría el lado izquierdo).
          (visibleRatio >= 1 ? " justify-center" : "")
        }
      >
        {items.map((item) => (
          <Link
            key={item.slug}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            href={item.href as any}
            className="group relative block aspect-[9/16] w-[230px] shrink-0 snap-start overflow-hidden rounded-2xl bg-night-soft shadow-card ring-1 ring-cream/10 transition duration-500 ease-fluid hover:-translate-y-1 hover:shadow-card-hover hover:ring-electric/40 sm:w-[300px]"
          >
            <Image
              src={item.image}
              alt={item.name}
              fill
              sizes="(min-width: 640px) 300px, 230px"
              className="object-cover transition-transform duration-700 ease-fluid group-hover:scale-[1.05]"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night/85 via-night/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4">
              <div>
                <p className="font-display text-xl leading-tight tracking-tight text-cream sm:text-2xl">
                  {item.neighborhood}
                </p>
                {item.takeAway && (
                  <p className="mt-0.5 text-xs font-medium text-mustard">
                    {t("sufijoParaLlevar")}
                  </p>
                )}
              </div>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cream/10 transition group-hover:bg-electric group-hover:text-night">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                  <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </div>
          </Link>
        ))}
      </div>

      <CarouselScrollHint progress={progress} visibleRatio={visibleRatio} />
    </>
  );
}
