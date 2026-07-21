import { use } from "react";
import { useTranslations, useLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import {
  takeAwayLocations,
  heroImageSrc,
  hoursParts,
  hrefFor,
  cartaHrefFor,
  getLocationBySlug,
  toMapLocation,
} from "@/data/locations";
import { localizeLocation } from "@/data/translations";
import { HubHero } from "@/components/HubHero";
import { ComoLlegar } from "@/components/ComoLlegar";
import { LocationsMapLazy } from "@/components/LocationsMapLazy";
import { SchemaOrg } from "@/components/SchemaOrg";
import { FaqSection } from "@/components/FaqSection";
import { breadcrumbSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "paraLlevar" });
  return pageMetadata({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/pizza-para-llevar",
    image: heroImageSrc(takeAwayLocations[0]),
    locale: locale as Locale,
  });
}

const gotic = getLocationBySlug("gotic")!;
const ravalTakeAway = getLocationBySlug("raval-take-away")!;

export default function ParaLlevarPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  // Habilita el prerender estático (next-intl): sin esto la página se
  // renderiza dinámica en cada request y no cachea en el CDN.
  const { locale: requestLocale } = use(params);
  setRequestLocale(requestLocale);
  const t = useTranslations("paraLlevar");
  const tNav = useTranslations("nav");
  const locale = useLocale() as Locale;

  return (
    <>
      <SchemaOrg
        data={breadcrumbSchema(
          [
            { name: tNav("home"), path: "/" },
            { name: tNav("paraLlevar"), path: "/pizza-para-llevar" },
          ],
          locale
        )}
      />

      <HubHero
        locations={takeAwayLocations}
        eyebrow="Barcelona"
        h1={t("title")}
        sub={t("subtitle")}
      />

      {/* Promo del formato pequeño: solo existe hasta las 16:00h (misma
          regla que la nota de la carta en menu.ts — si cambia allí, cambiar aquí) */}
      <div className="mx-auto max-w-6xl px-4 pt-12 sm:pt-16">
        <aside className="flex flex-col items-start justify-between gap-4 rounded-[1.75rem] bg-mustard/15 p-6 ring-1 ring-mustard/30 sm:flex-row sm:items-center sm:p-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mustard">
              {t("promoBadge")}
            </p>
            <p className="mt-1.5 font-display text-xl tracking-tight text-cream sm:text-2xl">
              {t("promoTitle")}
            </p>
            <p className="mt-1 text-sm text-cream/75">{t("promoText")}</p>
          </div>
          <Link
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            href={cartaHrefFor(gotic) as any}
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-mustard px-6 py-3 font-sans text-sm font-semibold text-night transition-colors duration-500 ease-fluid hover:bg-mustard-dark active:scale-[0.98]"
          >
            {t("promoCta")}
          </Link>
        </aside>
      </div>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
        <h2 className="font-display text-3xl tracking-tight text-cream sm:text-4xl">
          {t("infoTitle")}
        </h2>
        <p className="mt-3 max-w-[55ch] text-cream/70">
          {t("intro")} {t("domicilioHint")}{" "}
          <Link
            href="/a-domicilio"
            className="font-medium underline underline-offset-2 hover:text-electric"
          >
            {t("domicilioLink")}
          </Link>
          .
        </p>

        <div className="mt-8 rounded-[1.75rem] bg-cream/5 p-2 ring-1 ring-cream/10">
          <LocationsMapLazy locations={takeAwayLocations.map(toMapLocation)} />
        </div>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {takeAwayLocations.map((l) => localizeLocation(l, locale)).map((location) => (
            <li
              key={location.slug}
              className="flex flex-col justify-between gap-4 rounded-[1.75rem] bg-night-soft p-6 shadow-card ring-1 ring-cream/10 sm:p-7"
            >
              <div>
                <p className="font-display text-xl tracking-tight text-cream">
                  {location.name}
                </p>
                <p className="mt-1.5 text-sm text-cream/70">
                  {location.address}
                </p>
                <p className="text-sm text-cream/70">
                  {hoursParts(location).days}
                  <br />
                  {hoursParts(location).times}
                </p>
                <a
                  href={location.phoneHref}
                  className="mt-1 inline-block text-sm font-medium text-cream transition-colors duration-200 hover:text-electric"
                >
                  {location.phone}
                </a>
              </div>
              <div>
                <ComoLlegar location={location} />
              </div>
            </li>
          ))}
        </ul>
      </section>

      <article className="mx-auto max-w-3xl px-4 pb-16 font-sans text-cream sm:pb-24">
        <h2 className="font-display text-3xl tracking-tight sm:text-4xl">
          {t("articleTitle")}
        </h2>
        <div className="mt-5 space-y-5 leading-relaxed text-cream/80">
          <p>
            {t.rich("articleP1", {
              strong: (chunks) => <strong>{chunks}</strong>,
            })}
          </p>
          <p>
            {t.rich("articleP2", {
              goticLink: (chunks) => (
                <Link
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  href={hrefFor(gotic) as any}
                  className="font-medium underline underline-offset-2 hover:text-electric"
                >
                  {chunks}
                </Link>
              ),
              ravalLink: (chunks) => (
                <Link
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  href={hrefFor(ravalTakeAway) as any}
                  className="font-medium underline underline-offset-2 hover:text-electric"
                >
                  {chunks}
                </Link>
              ),
            })}
          </p>
          <p>
            {t.rich("articleP3", {
              goticCartaLink: (chunks) => (
                <Link
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  href={cartaHrefFor(gotic) as any}
                  className="font-medium underline underline-offset-2 hover:text-electric"
                >
                  {chunks}
                </Link>
              ),
              ravalCartaLink: (chunks) => (
                <Link
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  href={cartaHrefFor(ravalTakeAway) as any}
                  className="font-medium underline underline-offset-2 hover:text-electric"
                >
                  {chunks}
                </Link>
              ),
            })}
          </p>
        </div>
      </article>

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
