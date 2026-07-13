import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { localizeLocation } from "@/data/translations";
import type { Location } from "@/data/locations";
import {
  locations,
  hrefFor,
  cartaHrefFor,
  heroImageSrc,
  hoursParts,
} from "@/data/locations";
import { menuByLocationSlug } from "@/data/menu";
import { reviewsByLocationSlug } from "@/data/reviews";
import { mapsUrl } from "@/data/locations";
import { featuredDishesForLocation } from "@/data/featured";
import { ReservaCTA } from "@/components/ReservaCTA";
import { FloatingReservaCTA } from "@/components/FloatingReservaCTA";
import { DeliveryCTA } from "@/components/DeliveryCTA";
import { ComoLlegar } from "@/components/ComoLlegar";
import { GoogleRating } from "@/components/GoogleRating";
import { ReviewsMarquee } from "@/components/ReviewsMarquee";
import { SchemaOrg } from "@/components/SchemaOrg";
import { FeaturedDishesCarousel } from "@/components/FeaturedDishesCarousel";
import { LocationMapLazy } from "@/components/LocationMapLazy";
import { restaurantSchema, breadcrumbSchema } from "@/lib/schema";
import { RichText } from "@/components/RichText";

export function LocationDetail({
  location: locationProp,
  hubName,
  hubPath,
  path,
}: {
  location: Location;
  hubName: string;
  hubPath: string;
  path: string;
}) {
  const t = useTranslations("local");
  const tBadges = useTranslations("badges");
  const tCta = useTranslations("cta");
  const tNav = useTranslations("nav");
  const locale = useLocale() as Locale;
  const location = localizeLocation(locationProp, locale);
  const menu = menuByLocationSlug[location.slug];
  const dishes = featuredDishesForLocation(location.slug);
  const reviews = reviewsByLocationSlug[location.slug];
  const gallery = Array.from({ length: location.imageCount }, (_, i) =>
    String(i + 1).padStart(2, "0")
  );
  const otros = locations.filter((l) => l.slug !== location.slug).slice(0, 3);
  const hasDeliveryCta = !!location.delivery && location.type !== "take-away";

  return (
    <>
      <SchemaOrg
        data={[
          restaurantSchema(location, path, locale),
          breadcrumbSchema(
            [
              { name: tNav("home"), path: "/" },
              { name: hubName, path: hubPath },
              { name: location.name, path },
            ],
            locale
          ),
        ]}
      />

      <section
        id="local-hero"
        className="relative -mt-16 flex min-h-[100svh] items-end overflow-hidden sm:min-h-[70vh]"
      >
        <Image
          src={heroImageSrc(location)}
          alt={location.name}
          fill
          preload
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-night/95 via-night/40 to-night/10" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-night/60 to-transparent" />
        <div className="relative mx-auto w-full max-w-4xl animate-fade-up px-4 pb-14 pt-28 text-cream drop-shadow-[0_1px_6px_rgba(0,0,0,0.55)]">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-electric">
            {location.name} · {t("desde")} {location.openedYear}
          </p>
          <h1 className="mt-3 max-w-2xl font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl">
            {location.h1}
          </h1>
          <div className="mt-4">
            <GoogleRating location={location} />
          </div>
          {hasDeliveryCta ? (
            /* 3 CTAs: Reservar a ancho completo arriba; los dos secundarios
               a mitad cada uno debajo */
            <div className="mt-7 grid w-full max-w-md grid-cols-2 gap-3">
              <ReservaCTA
                location={location}
                className="col-span-2 h-14 w-full"
              />
              <DeliveryCTA location={location} className="w-full" />
              <ComoLlegar location={location} className="w-full" />
            </div>
          ) : (
            /* 2 CTAs: en línea con su tamaño natural */
            <div className="mt-7 flex flex-wrap gap-3">
              <ReservaCTA location={location} />
              <ComoLlegar location={location} />
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-14 font-sans text-cream sm:py-16">
        <div className="grid gap-6 rounded-[1.75rem] bg-cream/5 p-6 ring-1 ring-cream/10 sm:grid-cols-3 sm:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-cream/60">
              {t("direccion")}
            </p>
            <p className="mt-1">{location.address}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-cream/60">
              {t("horario")}
            </p>
            <p className="mt-1">
              {hoursParts(location).days}
              <br />
              {hoursParts(location).times}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-cream/60">
              {t("telefono")}
            </p>
            <a
              href={location.phoneHref}
              className="mt-1 inline-flex items-center gap-2 underline decoration-cream/40 underline-offset-4 transition-colors hover:text-electric"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {location.phone}
            </a>
          </div>
        </div>

        <p className="mt-10 max-w-[65ch] text-lg leading-relaxed text-cream/85">
          <RichText text={location.description} />
        </p>

        <h2 className="mt-20 font-display text-3xl tracking-tight sm:text-4xl">
          {t("platosTitle")}
        </h2>
        {dishes.length > 0 && (
          <div className="-mx-4 mt-6">
            <FeaturedDishesCarousel entries={dishes} />
          </div>
        )}
        {menu ? (
          <div className="mt-8 flex justify-center">
            <Link
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              href={cartaHrefFor(location) as any}
              className="inline-flex items-center gap-2 rounded-full border border-cream/25 px-7 py-3 font-sans text-sm font-semibold text-cream transition hover:bg-cream/5 hover:text-electric"
            >
              {tCta("verCartaCompleta")}
            </Link>
          </div>
        ) : (
          <p className="mt-4 text-cream/70">
            {t("cartaNoDisponible")}{" "}
            <Link
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              href={"/restaurantes/cartas" as any}
              className="underline hover:text-electric"
            >
              {tCta("verCarta")}
            </Link>
          </p>
        )}

        {reviews && reviews.length > 0 && (
          <>
            <h2 className="mt-20 font-display text-3xl tracking-tight sm:text-4xl">
              {t("resenasTitle")}
            </h2>
            <div className="mt-6">
              <ReviewsMarquee
                reviews={reviews.map((review) => ({
                  author: review.author,
                  text: review.text,
                  neighborhood: location.neighborhood,
                  rating: Math.round(location.googleRating ?? 5),
                }))}
              />
            </div>
            <a
              href={mapsUrl(location)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-block text-sm font-medium underline underline-offset-2 transition-colors duration-200 hover:text-electric"
            >
              {t("verTodasResenas")}
            </a>
          </>
        )}

        <h2 className="mt-20 font-display text-3xl tracking-tight sm:text-4xl">
          {t("galeria")}
        </h2>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {gallery.map((n) => (
            <div
              key={n}
              className="group relative aspect-square overflow-hidden rounded-xl"
            >
              <Image
                src={`/images/${location.imageFolder}/${n}.jpg`}
                alt={`${location.name} – foto ${n}`}
                fill
                sizes="(min-width: 640px) 33vw, 50vw"
                loading="lazy"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
              />
            </div>
          ))}
        </div>

        <h2 className="mt-20 font-display text-3xl tracking-tight sm:text-4xl">
          {t("dondeEstamos")}
        </h2>
        <div className="mt-6">
          <LocationMapLazy location={location} />
        </div>

        <h2 className="mt-20 font-display text-3xl tracking-tight sm:text-4xl">
          {t("otrosLocales")}
        </h2>
        <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {otros.map((l) => (
            <li key={l.slug}>
              <Link
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                href={hrefFor(l) as any}
                className="group relative block aspect-[4/3] overflow-hidden rounded-2xl"
              >
                <Image
                  src={heroImageSrc(l)}
                  alt={l.name}
                  fill
                  sizes="(min-width: 640px) 33vw, 100vw"
                  loading="lazy"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-night/85 via-night/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-cream">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cream/75">
                    {l.type === "take-away" ? tBadges("takeAway") : tBadges("dineIn")}
                  </p>
                  <p className="font-display text-xl">{l.neighborhood}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <FloatingReservaCTA location={location} heroId="local-hero" />
    </>
  );
}
