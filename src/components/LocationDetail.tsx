import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Location } from "@/data/locations";
import { locations, hrefFor, heroImageSrc } from "@/data/locations";
import { menuByLocationSlug } from "@/data/menu";
import { reviewsByLocationSlug } from "@/data/reviews";
import { mapsUrl } from "@/data/locations";
import { ReservaCTA } from "@/components/ReservaCTA";
import { ComoLlegar } from "@/components/ComoLlegar";
import { GoogleRating } from "@/components/GoogleRating";
import { ReviewsMarquee } from "@/components/ReviewsMarquee";
import { SchemaOrg } from "@/components/SchemaOrg";
import { MenuSections } from "@/components/MenuSections";
import { restaurantSchema, breadcrumbSchema } from "@/lib/schema";

export function LocationDetail({
  location,
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
  const menu = menuByLocationSlug[location.slug];
  const reviews = reviewsByLocationSlug[location.slug];
  const gallery = Array.from({ length: location.imageCount }, (_, i) =>
    String(i + 1).padStart(2, "0")
  );
  const otros = locations.filter((l) => l.slug !== location.slug).slice(0, 3);

  return (
    <>
      <SchemaOrg
        data={[
          restaurantSchema(location, path),
          breadcrumbSchema([
            { name: "Inicio", path: "/" },
            { name: hubName, path: hubPath },
            { name: location.name, path },
          ]),
        ]}
      />

      <section className="relative -mt-16 flex min-h-[70vh] items-end overflow-hidden">
        <Image
          src={heroImageSrc(location)}
          alt={location.name}
          fill
          preload
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-teal-dark/95 via-teal-dark/40 to-teal-dark/10" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-teal-dark/60 to-transparent" />
        <div className="relative mx-auto w-full max-w-4xl animate-fade-up px-4 pb-14 pt-28 text-cream drop-shadow-[0_1px_6px_rgba(31,59,64,0.45)]">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-cream/95 px-3 py-1 text-xs font-semibold text-teal-dark">
              {location.type === "take-away" ? tBadges("takeAway") : tBadges("dineIn")}
            </span>
            {location.nearBeach && (
              <span className="rounded-full bg-mustard px-3 py-1 text-xs font-semibold text-cream">
                {tBadges("cercaPlaya")}
              </span>
            )}
          </div>
          <p className="mt-5 text-sm font-semibold uppercase tracking-[0.2em] text-mustard">
            {location.name} · {t("desde")} {location.openedYear}
          </p>
          <h1 className="mt-3 max-w-2xl font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl">
            {location.h1}
          </h1>
          <p className="mt-3 text-cream/90">{location.hoursLabel}</p>
          <div className="mt-2">
            <GoogleRating location={location} />
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            <ReservaCTA location={location} />
            <ComoLlegar location={location} variant="onDark" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-14 font-sans text-teal-dark sm:py-16">
        <p className="max-w-[65ch] text-lg leading-relaxed">
          {location.description}
        </p>

        <div className="mt-10 grid gap-6 rounded-[1.75rem] bg-teal-dark/5 p-6 ring-1 ring-teal-dark/10 sm:grid-cols-3 sm:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-dark/60">
              {t("direccion")}
            </p>
            <p className="mt-1">{location.address}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-dark/60">
              {t("horario")}
            </p>
            <p className="mt-1">{location.hoursLabel}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-dark/60">
              {t("telefono")}
            </p>
            <a href={location.phoneHref} className="mt-1 block hover:text-mustard">
              {location.phone}
            </a>
          </div>
        </div>

        <div className="mt-20 flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="font-display text-3xl tracking-tight sm:text-4xl">
            {t("cartaTitle")}
          </h2>
          {menu && (
            <Link
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              href={`/carta/${location.slug}` as any}
              className="text-sm font-medium underline hover:text-mustard"
            >
              {tCta("verCartaCompleta")}
            </Link>
          )}
        </div>
        {menu ? (
          <div className="mt-6">
            <MenuSections menu={menu} />
          </div>
        ) : (
          <p className="mt-4 text-teal-dark/70">
            {t("cartaNoDisponible")}{" "}
            <Link href="/carta" className="underline hover:text-mustard">
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
              className="mt-5 inline-block text-sm font-medium underline underline-offset-2 transition-colors duration-200 hover:text-mustard"
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

        <div className="mt-20 flex flex-col items-start gap-4 rounded-[1.75rem] bg-teal-dark px-6 py-8 text-cream sm:flex-row sm:items-center sm:justify-between sm:px-10 sm:py-12">
          <div>
            <p className="font-display text-2xl">{location.name}</p>
            <p className="mt-1 text-cream/80">{location.hoursLabel}</p>
          </div>
          <ReservaCTA location={location} />
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
                <div className="absolute inset-0 bg-gradient-to-t from-teal-dark/85 via-teal-dark/25 to-transparent" />
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
    </>
  );
}
