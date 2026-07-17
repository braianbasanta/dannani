import { use } from "react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { locations, getLocationBySlug, hrefFor } from "@/data/locations";
import { reviewsByLocationSlug } from "@/data/reviews";
import { SchemaOrg } from "@/components/SchemaOrg";
import { breadcrumbSchema } from "@/lib/schema";
import { FaqSection } from "@/components/FaqSection";
import { pageMetadata, BCP47 } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

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
const byRating = [...ratedLocations].sort(
  (a, b) => (b.googleRating ?? 0) - (a.googleRating ?? 0)
);
const topRated = byRating[0];

/** Citas literales de Google curadas por autor; si una reseña desaparece de
 * reviews.ts, el build falla a propósito (mismo criterio que featured.ts). */
const QUOTE_PICKS = [
  { slug: "gotic", author: "Juan Manuel Cotolio" },
  { slug: "born", author: "Noel Perez Fernandez" },
  { slug: "raval", author: "Adriana Rubio Romero" },
  { slug: "raval", author: "Manel Rossy" },
];
const quotes = QUOTE_PICKS.map(({ slug, author }) => {
  const review = reviewsByLocationSlug[slug]?.find((r) => r.author === author);
  const location = getLocationBySlug(slug);
  if (!review || !location) {
    throw new Error(
      `mejor-pizzeria-barcelona: no existe la reseña de "${author}" en "${slug}"`
    );
  }
  return { ...review, location };
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "mejorPizzeria" });
  const reviewsFormat = new Intl.NumberFormat(BCP47[locale as Locale]);
  const ratingFormat = new Intl.NumberFormat(BCP47[locale as Locale], {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  return pageMetadata({
    title: t("metaTitle", { count: reviewsFormat.format(totalReviewCount) }),
    description: t("metaDescription", {
      count: reviewsFormat.format(totalReviewCount),
      rating: ratingFormat.format(aggregateRating),
    }),
    path: "/mejor-pizzeria-barcelona",
    locale: locale as Locale,
  });
}

/** Los 6 locales, en el orden fijo en el que se muestran en la sección
 * "La mejor según lo que busques". Título y texto salen de las traducciones
 * (mejorPizzeria.occasions.t1..t6 / x1..x6). */
const OCCASIONS = [
  { slug: "raval" },
  { slug: "gotic" },
  { slug: "born" },
  { slug: "poblenou" },
  { slug: "gracia" },
  { slug: "raval-take-away" },
] as const;

export default function MejorPizzeriaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  // Habilita el prerender estático (next-intl): sin esto la página se
  // renderiza dinámica en cada request y no cachea en el CDN.
  const { locale: requestLocale } = use(params);
  setRequestLocale(requestLocale);
  const locale = useLocale();
  const t = useTranslations("mejorPizzeria");
  const tNav = useTranslations("nav");

  const ratingFormat = new Intl.NumberFormat(BCP47[locale as Locale], {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  const reviewsFormat = new Intl.NumberFormat(BCP47[locale as Locale]);

  const faqItems = [
    {
      q: t("faq.q1"),
      a: t("faq.a1", {
        name: topRated.name,
        topRating: ratingFormat.format(topRated.googleRating ?? 0),
        count: reviewsFormat.format(totalReviewCount),
        avgRating: ratingFormat.format(aggregateRating),
      }),
    },
    { q: t("faq.q2"), a: t("faq.a2") },
    { q: t("faq.q3"), a: t("faq.a3") },
    { q: t("faq.q4"), a: t("faq.a4") },
  ];

  return (
    <>
      <SchemaOrg
        data={breadcrumbSchema(
          [
            { name: tNav("home"), path: "/" },
            {
              name: t("breadcrumbLabel"),
              path: "/mejor-pizzeria-barcelona",
            },
          ],
          locale as Locale
        )}
      />

      <header className="mx-auto w-full max-w-5xl px-4 pt-12 text-center text-cream sm:pt-16">
        <p className="eyebrow">{t("eyebrow")}</p>
        <h1 className="mx-auto mt-3 max-w-4xl font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
          {t("h1")}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-cream/85">{t("intro")}</p>
        <p className="mt-5 text-sm text-cream/70">
          {t.rich("ratingLine", {
            b: (chunks) => (
              <span className="font-semibold text-mustard">{chunks}</span>
            ),
            rating: ratingFormat.format(aggregateRating),
            count: reviewsFormat.format(totalReviewCount),
          })}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/restaurantes"
            className="inline-flex items-center justify-center rounded-full bg-electric px-7 py-3 font-sans text-sm font-semibold text-night transition-colors duration-500 ease-fluid hover:bg-electric-dark active:scale-[0.98]"
          >
            {t("ctaReservar")}
          </Link>
          <Link
            href="/restaurantes/cartas"
            className="inline-flex items-center justify-center rounded-full bg-cream/10 px-7 py-3 font-sans text-sm font-semibold text-cream ring-1 ring-cream/20 transition-colors duration-500 ease-fluid hover:bg-cream/15 active:scale-[0.98]"
          >
            {t("ctaVerCartas")}
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <h2 className="font-display text-3xl tracking-tight text-cream sm:text-4xl">
          {t("numerosTitle")}
        </h2>
        <p className="mt-3 max-w-[60ch] leading-relaxed text-cream/75">
          {t("numerosText")}
        </p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {byRating.map((location) => (
            <li key={location.slug}>
              <Link
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                href={hrefFor(location) as any}
                className="group block rounded-[1.5rem] bg-cream/5 p-6 ring-1 ring-cream/10 transition-all duration-500 ease-fluid hover:-translate-y-1 hover:ring-cream/25"
              >
                <p className="font-display text-3xl text-mustard">
                  {t("ratingStars", {
                    rating: ratingFormat.format(location.googleRating ?? 0),
                  })}
                </p>
                <p className="mt-1 text-xs text-cream/60">
                  {t("reviewsLabel", {
                    count: reviewsFormat.format(
                      location.googleReviewCount ?? 0
                    ),
                  })}
                </p>
                <p className="mt-3 font-display text-lg text-cream group-hover:text-electric">
                  {location.name}
                </p>
                <p className="mt-1 text-sm text-cream/70">{location.address}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:pb-20">
        <h2 className="font-display text-3xl tracking-tight text-cream sm:text-4xl">
          {t("quotesTitle")}
        </h2>
        <p className="mt-3 max-w-[60ch] leading-relaxed text-cream/75">
          {t("quotesText")}
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {quotes.map((quote) => (
            <figure
              key={quote.author}
              className="rounded-[1.5rem] bg-night-soft p-6 shadow-card ring-1 ring-cream/10 sm:p-7"
            >
              <blockquote className="text-sm leading-relaxed text-cream/85">
                {t("quoteWrapper", { text: quote.text })}
              </blockquote>
              <figcaption className="mt-4 text-xs text-cream/60">
                <span className="font-semibold text-cream/80">
                  {quote.author}
                </span>{" "}
                {t("quoteAttribution", { location: quote.location.name })}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:pb-20">
        <h2 className="font-display text-3xl tracking-tight text-cream sm:text-4xl">
          {t("occasionsTitle")}
        </h2>
        <p className="mt-3 max-w-[60ch] leading-relaxed text-cream/75">
          {t("occasionsIntro")}
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {OCCASIONS.map((occasion, index) => {
            const location = getLocationBySlug(occasion.slug);
            if (!location) {
              throw new Error(
                `mejor-pizzeria-barcelona: slug desconocido "${occasion.slug}"`
              );
            }
            const n = index + 1;
            return (
              <Link
                key={occasion.slug}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                href={hrefFor(location) as any}
                className="group rounded-[1.75rem] bg-night-soft p-6 shadow-card ring-1 ring-cream/10 transition-all duration-500 ease-fluid hover:-translate-y-1 sm:p-7"
              >
                <p className="font-script text-2xl text-electric">
                  {t(`occasions.t${n}` as "occasions.t1")}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-cream/80">
                  {t(`occasions.x${n}` as "occasions.x1")}
                </p>
              </Link>
            );
          })}
        </div>
        <p className="mt-8 leading-relaxed text-cream/75">
          {t.rich("occasionsOutro", {
            napolitana: (chunks) => (
              <Link
                href="/pizzeria-napolitana-barcelona"
                className="font-medium underline underline-offset-2 hover:text-electric"
              >
                {chunks}
              </Link>
            ),
            cartas: (chunks) => (
              <Link
                href="/restaurantes/cartas"
                className="font-medium underline underline-offset-2 hover:text-electric"
              >
                {chunks}
              </Link>
            ),
          })}
        </p>
      </section>

      <FaqSection items={faqItems} />
    </>
  );
}
