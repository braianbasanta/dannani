import { use } from "react";
import type { Metadata } from "next";
import { useTranslations, useLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { locations } from "@/data/locations";
import { LocationCard } from "@/components/LocationCard";
import { SchemaOrg } from "@/components/SchemaOrg";
import { FaqSection } from "@/components/FaqSection";
import { breadcrumbSchema } from "@/lib/schema";
import { pageMetadata, BCP47 } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pizzeriaNapolitana" });
  return pageMetadata({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/pizzeria-napolitana-barcelona",
    locale: locale as Locale,
  });
}

export default function PizzeriaNapolitanaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  // Habilita el prerender estático (next-intl): sin esto la página se
  // renderiza dinámica en cada request y no cachea en el CDN.
  const { locale: requestLocale } = use(params);
  setRequestLocale(requestLocale);
  const t = useTranslations("pizzeriaNapolitana");
  const tNav = useTranslations("nav");
  const locale = useLocale() as Locale;

  const ratingFormat = new Intl.NumberFormat(BCP47[locale], {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  const reviewsFormat = new Intl.NumberFormat(BCP47[locale]);

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

  return (
    <>
      <SchemaOrg
        data={breadcrumbSchema(
          [
            { name: tNav("home"), path: "/" },
            {
              name: t("breadcrumbLabel"),
              path: "/pizzeria-napolitana-barcelona",
            },
          ],
          locale
        )}
      />

      <header className="mx-auto w-full max-w-5xl px-4 pt-12 text-center text-cream sm:pt-16">
        <p className="eyebrow">{t("eyebrow")}</p>
        <h1 className="mx-auto mt-3 max-w-4xl font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
          {t("title")}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-cream/85">{t("intro")}</p>
        <p className="mt-5 text-sm text-cream/70">
          {t.rich("ratingLine", {
            rating: ratingFormat.format(aggregateRating),
            count: reviewsFormat.format(totalReviewCount),
            star: (chunks) => (
              <span className="font-semibold text-mustard">{chunks}</span>
            ),
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
            href="/pizza-para-llevar"
            className="inline-flex items-center justify-center rounded-full bg-cream/10 px-7 py-3 font-sans text-sm font-semibold text-cream ring-1 ring-cream/20 transition-colors duration-500 ease-fluid hover:bg-cream/15 active:scale-[0.98]"
          >
            {t("ctaParaLlevar")}
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <h2 className="font-display text-3xl tracking-tight text-cream sm:text-4xl">
          {t("section1Title")}
        </h2>
        <p className="mt-3 max-w-[60ch] leading-relaxed text-cream/75">
          {t("section1Intro")}
        </p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-3">
          <li className="rounded-[1.25rem] bg-cream/5 p-5 ring-1 ring-cream/10">
            <p className="font-display text-xl tracking-tight text-electric">
              {t("card1Title")}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-cream/80">
              {t("card1Text")}
            </p>
          </li>
          <li className="rounded-[1.25rem] bg-cream/5 p-5 ring-1 ring-cream/10">
            <p className="font-display text-xl tracking-tight text-electric">
              {t("card2Title")}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-cream/80">
              {t("card2Text")}
            </p>
          </li>
          <li className="rounded-[1.25rem] bg-cream/5 p-5 ring-1 ring-cream/10">
            <p className="font-display text-xl tracking-tight text-electric">
              {t("card3Title")}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-cream/80">
              {t("card3Text")}
            </p>
          </li>
        </ul>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:pb-20">
        <h2 className="font-display text-3xl tracking-tight text-cream sm:text-4xl">
          {t("section2Title")}
        </h2>
        <p className="mt-3 max-w-[60ch] leading-relaxed text-cream/75">
          {t("section2Intro")}
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {locations.map((location) => (
            <LocationCard key={location.slug} location={location} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:pb-24">
        <h2 className="font-display text-3xl tracking-tight text-cream sm:text-4xl">
          {t("section3Title")}
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Link
            href="/restaurantes"
            className="group rounded-[1.75rem] bg-night-soft p-6 shadow-card ring-1 ring-cream/10 transition-all duration-500 ease-fluid hover:-translate-y-1 sm:p-7"
          >
            <p className="font-display text-xl text-cream group-hover:text-electric">
              {t("howMesaTitle")}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-cream/75">
              {t("howMesaText")}
            </p>
          </Link>
          <Link
            href="/pizza-para-llevar"
            className="group rounded-[1.75rem] bg-night-soft p-6 shadow-card ring-1 ring-cream/10 transition-all duration-500 ease-fluid hover:-translate-y-1 sm:p-7"
          >
            <p className="font-display text-xl text-cream group-hover:text-electric">
              {t("howLlevarTitle")}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-cream/75">
              {t("howLlevarText")}
            </p>
          </Link>
          <Link
            href="/a-domicilio"
            className="group rounded-[1.75rem] bg-night-soft p-6 shadow-card ring-1 ring-cream/10 transition-all duration-500 ease-fluid hover:-translate-y-1 sm:p-7"
          >
            <p className="font-display text-xl text-cream group-hover:text-electric">
              {t("howDomicilioTitle")}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-cream/75">
              {t("howDomicilioText")}
            </p>
          </Link>
        </div>
        <p className="mt-8 leading-relaxed text-cream/75">
          {t.rich("exploreText", {
            carta: (chunks) => (
              <Link
                href="/restaurantes/cartas"
                className="font-medium underline underline-offset-2 hover:text-electric"
              >
                {chunks}
              </Link>
            ),
            historia: (chunks) => (
              <Link
                href="/nuestra-historia"
                className="font-medium underline underline-offset-2 hover:text-electric"
              >
                {chunks}
              </Link>
            ),
            resenas: (chunks) => (
              <Link
                href="/mejor-pizzeria-barcelona"
                className="font-medium underline underline-offset-2 hover:text-electric"
              >
                {chunks}
              </Link>
            ),
          })}
        </p>
      </section>

      <FaqSection
        items={[
          { q: t("faq.q1"), a: t("faq.a1") },
          { q: t("faq.q2"), a: t("faq.a2") },
          { q: t("faq.q3"), a: t("faq.a3") },
          { q: t("faq.q4"), a: t("faq.a4") },
        ]}
      />
    </>
  );
}
