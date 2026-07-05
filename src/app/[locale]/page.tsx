import Image from "next/image";
import { useTranslations } from "next-intl";
import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { SchemaOrg } from "@/components/SchemaOrg";
import { organizationSchema } from "@/lib/schema";
import { locations, hrefFor, heroImageSrc } from "@/data/locations";
import { reviewsByLocationSlug } from "@/data/reviews";
import { ReviewsMarquee } from "@/components/ReviewsMarquee";

const ratingFormat = new Intl.NumberFormat("es-ES", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const countFormat = new Intl.NumberFormat("es-ES", { useGrouping: "always" });

const ratedLocations = locations.filter(
  (l) => l.googleRating !== undefined && l.googleReviewCount !== undefined
);
const totalReviewCount = ratedLocations.reduce(
  (sum, l) => sum + (l.googleReviewCount ?? 0),
  0
);
const aggregateRating =
  ratedLocations.reduce(
    (sum, l) => sum + (l.googleRating ?? 0) * (l.googleReviewCount ?? 0),
    0
  ) / totalReviewCount;
// Redondeado hacia abajo a la decena de 50 más cercana: cifra estable que no
// hay que actualizar cada vez que se suma alguna reseña nueva en Google.
const roundedReviewCount = Math.floor(totalReviewCount / 50) * 50;

// Todas las reseñas reales (src/data/reviews.ts) de los 6 locales, con el
// rating real de cada local (locations.ts) para las estrellas de su tarjeta.
const marqueeReviews = Object.entries(reviewsByLocationSlug).flatMap(
  ([slug, reviews]) => {
    const location = locations.find((l) => l.slug === slug);
    if (!location) return [];
    return reviews.map((review) => ({
      author: review.author,
      text: review.text,
      neighborhood: location.neighborhood,
      rating: Math.round(location.googleRating ?? 5),
    }));
  }
);

export const metadata: Metadata = {
  title: {
    absolute:
      "Da Nanni – Pizzería Napolitana y Restaurante Italiano en Barcelona",
  },
  description:
    "Pizza napolitana de masa de larga fermentación en 6 locales de Barcelona: trattorias con horno de leña en Born, Raval, Gràcia y Poblenou, y pizza para llevar en el Gòtic y el Raval.",
};

function SplitPanel({
  href,
  image,
  alt,
  barrios,
  title,
  text,
  cta,
}: {
  href: "/restaurantes" | "/para-llevar";
  image: string;
  alt: string;
  barrios: string;
  title: string;
  text: string;
  cta: string;
}) {
  return (
    <Link
      href={href}
      className="group relative flex items-end overflow-hidden"
    >
      <Image
        src={image}
        alt={alt}
        fill
        preload
        sizes="(min-width: 768px) 50vw, 100vw"
        className="object-cover transition-transform duration-700 ease-fluid group-hover:scale-[1.04]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-teal-dark/90 via-teal-dark/25 to-transparent transition-opacity duration-500 group-hover:opacity-85" />
      <div className="relative w-full p-6 pb-8 text-cream drop-shadow-[0_1px_6px_rgba(31,59,64,0.45)] sm:p-10 md:pb-12">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cream/75">
          {barrios}
        </p>
        <h2 className="mt-2 font-display text-4xl tracking-tight sm:text-5xl lg:text-6xl">
          {title}
        </h2>
        <p className="mt-3 hidden max-w-md text-sm text-cream/85 sm:text-base md:block">
          {text}
        </p>
        <span className="mt-6 inline-flex items-center gap-3 rounded-full bg-mustard py-1.5 pl-6 pr-1.5 font-sans text-sm font-semibold text-cream transition-colors duration-500 ease-fluid group-hover:bg-mustard-dark group-active:scale-[0.98]">
          {cta}
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cream/15 transition-transform duration-500 ease-fluid group-hover:translate-x-0.5 group-hover:scale-105">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              aria-hidden
            >
              <path
                d="M5 12h14M13 6l6 6-6 6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </span>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const t = useTranslations("home");
  const tBadges = useTranslations("badges");

  return (
    <>
      <SchemaOrg data={organizationSchema()} />

      {/* Split-screen unificado: las imágenes llegan hasta el nav y el H1
          se superpone sobre ellas. Ambas opciones visibles sin scroll. */}
      <section className="relative -mt-16 flex h-[100dvh] min-h-[600px] flex-col md:min-h-[680px]">
        <div className="grid flex-1 grid-rows-2 md:grid-cols-2 md:grid-rows-1">
          <SplitPanel
            href="/restaurantes"
            image="/images/home/mesa-restaurante.jpg"
            alt="Mesa servida con vino y antipasti en un restaurante Da Nanni"
            barrios={t("panelRestaurantesBarrios")}
            title={t("panelRestaurantesTitle")}
            text={t("panelRestaurantesText")}
            cta={t("panelRestaurantesCta")}
          />
          <SplitPanel
            href="/para-llevar"
            image="/images/home/pizza-para-llevar-catedral.jpg"
            alt="Pizza napolitana Da Nanni para llevar frente a la Catedral de Barcelona"
            barrios={t("panelLlevarBarrios")}
            title={t("panelLlevarTitle")}
            text={t("panelLlevarText")}
            cta={t("panelLlevarCta")}
          />
        </div>

        {/* Scrim superior: legibilidad del H1 sobre las fotos */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-teal-dark/80 via-teal-dark/40 to-transparent" />

        <header className="pointer-events-none absolute inset-x-0 top-0 mx-auto w-full max-w-5xl px-4 pt-24 text-center text-cream drop-shadow-[0_1px_6px_rgba(31,59,64,0.45)] sm:pt-28">
          <p className="eyebrow hidden animate-fade-up sm:block">
            {t("eyebrow")}
          </p>
          <h1 className="mx-auto max-w-4xl animate-fade-up font-display text-3xl leading-[1.05] tracking-tight [animation-delay:100ms] sm:mt-3 sm:text-5xl lg:text-6xl">
            {t("h1")}
          </h1>
          <p className="mx-auto mt-4 hidden max-w-xl animate-fade-up text-cream/85 [animation-delay:200ms] sm:block">
            {t("sub")}
          </p>
        </header>
      </section>

      {/* Los 6 locales */}
      <section className="mx-auto max-w-6xl px-4 py-24 sm:py-32">
        <h2 className="font-display text-4xl tracking-tight text-teal-dark sm:text-5xl">
          {t("localesTitle")}
        </h2>
        <p className="mt-4 max-w-[55ch] text-lg text-teal-dark/70">
          {t("localesSubtitle")}
        </p>

        <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {locations.map((location) => (
            <Link
              key={location.slug}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              href={hrefFor(location) as any}
              className="group relative aspect-[4/3] overflow-hidden rounded-2xl"
            >
              <Image
                src={heroImageSrc(location)}
                alt={location.name}
                fill
                sizes="(min-width: 1024px) 33vw, 50vw"
                loading="lazy"
                className="object-cover transition-transform duration-700 ease-fluid group-hover:scale-[1.05]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-teal-dark/85 via-teal-dark/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-cream sm:p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cream/75">
                  {location.type === "take-away"
                    ? tBadges("takeAway")
                    : tBadges("dineIn")}
                </p>
                <p className="font-display text-xl tracking-tight sm:text-2xl">
                  {location.neighborhood}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Prueba social: reseñas reales de Google agregadas de los 6 locales */}
      <section className="border-t border-teal-dark/10 bg-teal-dark/[0.03] py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <h2 className="font-display text-4xl tracking-tight text-teal-dark sm:text-5xl">
                {t("resenasTitle")}
              </h2>
              <p className="mt-4 max-w-[55ch] text-lg text-teal-dark/70">
                {t("resenasSubtitle", {
                  rating: ratingFormat.format(aggregateRating),
                  count: `${countFormat.format(roundedReviewCount)}+`,
                })}
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 shadow-card ring-1 ring-teal-dark/10">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#d98e2b" aria-hidden>
                <path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.2l-6.1 3.4 1.4-6.8L2.2 9.1l6.9-.8L12 2z" />
              </svg>
              <span className="font-display text-2xl tracking-tight text-teal-dark">
                {ratingFormat.format(aggregateRating)}
              </span>
              <span className="text-sm text-teal-dark/60">
                / 5 {t("resenasBadgeSufijo")}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <ReviewsMarquee reviews={marqueeReviews} />
        </div>
      </section>

      {/* Teaser historia */}
      <section className="border-t border-teal-dark/10">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-24 sm:py-32 md:grid-cols-2">
          <div className="rounded-[1.75rem] bg-teal-dark/5 p-2 ring-1 ring-teal-dark/10">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[calc(1.75rem-0.5rem)]">
              <Image
                src="/images/home/mapa-napoles-barcelona.jpg"
                alt="Mapa ilustrado del recorrido de Nápoles a Barcelona"
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                loading="lazy"
                className="object-cover"
              />
            </div>
          </div>
          <div>
            <h2 className="font-display text-4xl tracking-tight text-teal-dark sm:text-5xl">
              {t("historiaTitle")}
            </h2>
            <p className="mt-5 max-w-md leading-relaxed text-teal-dark/80">
              {t("historiaTeaser")}
            </p>
            <p className="mt-3 max-w-md leading-relaxed text-teal-dark/80">
              {t("historiaTeaser2")}
            </p>
            <Link
              href="/nuestra-historia"
              className="group mt-8 inline-flex items-center gap-3 rounded-full bg-teal py-1.5 pl-6 pr-1.5 font-sans text-sm font-semibold text-cream transition-colors duration-500 ease-fluid hover:bg-teal-dark active:scale-[0.98]"
            >
              {t("historiaCta")}
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cream/15 transition-transform duration-500 ease-fluid group-hover:translate-x-0.5">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  aria-hidden
                >
                  <path
                    d="M5 12h14M13 6l6 6-6 6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
