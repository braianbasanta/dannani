import { useLocale, useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { dineInLocations, heroImageSrc, hoursParts } from "@/data/locations";
import { localizeLocation } from "@/data/translations";
import { HubHero } from "@/components/HubHero";
import { ComoLlegar } from "@/components/ComoLlegar";
import { LocationsMapLazy } from "@/components/LocationsMapLazy";
import { SchemaOrg } from "@/components/SchemaOrg";
import { breadcrumbSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "restaurantes" });

  return pageMetadata({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/restaurantes",
    image: heroImageSrc(dineInLocations[0]),
    locale: locale as Locale,
  });
}

export default function RestaurantesPage() {
  const t = useTranslations("restaurantes");
  const tNav = useTranslations("nav");
  const locale = useLocale() as Locale;

  return (
    <>
      <SchemaOrg
        data={breadcrumbSchema(
          [
            { name: tNav("home"), path: "/" },
            { name: tNav("restaurantes"), path: "/restaurantes" },
          ],
          locale
        )}
      />

      <HubHero
        locations={dineInLocations}
        eyebrow="Barcelona"
        h1={t("title")}
        sub={t("subtitle")}
      />

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
          <LocationsMapLazy locations={dineInLocations} />
        </div>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {dineInLocations.map((l) => localizeLocation(l, locale)).map((location) => (
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
    </>
  );
}
