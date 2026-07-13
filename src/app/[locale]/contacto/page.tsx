import type { Metadata } from "next";
import { useLocale, useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { locations, hoursParts } from "@/data/locations";
import { localizeLocation } from "@/data/translations";
import { ReservaCTA } from "@/components/ReservaCTA";
import { DeliveryCTA } from "@/components/DeliveryCTA";
import { ComoLlegar } from "@/components/ComoLlegar";
import { SchemaOrg } from "@/components/SchemaOrg";
import { breadcrumbSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contacto" });

  return pageMetadata({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/contacto",
    locale: locale as Locale,
  });
}

export default function ContactoPage() {
  const t = useTranslations("contacto");
  const tNav = useTranslations("nav");
  const locale = useLocale() as Locale;

  return (
    <>
      <SchemaOrg
        data={breadcrumbSchema(
          [
            { name: tNav("home"), path: "/" },
            { name: tNav("contacto"), path: "/contacto" },
          ],
          locale
        )}
      />

      <section className="mx-auto max-w-4xl px-4 py-16 font-sans text-cream sm:py-20">
        <p className="eyebrow">{t("eyebrow")}</p>
        <h1 className="mt-3 max-w-2xl font-display text-4xl leading-[1.05] tracking-tight sm:text-6xl">
          {t("title")}
        </h1>
        <p className="mt-3 max-w-2xl text-cream/70">{t("intro")}</p>

        <ul className="mt-10 space-y-4">
          {locations.map((l) => localizeLocation(l, locale)).map((location) => (
            <li
              key={location.slug}
              className="flex flex-col gap-4 rounded-[1.75rem] bg-night-soft p-6 shadow-card ring-1 ring-cream/10 sm:flex-row sm:items-center sm:justify-between sm:p-7"
            >
              <div>
                <p className="font-display text-xl">{location.name}</p>
                <p className="text-sm text-cream/70">{location.address}</p>
                <p className="text-sm text-cream/70">
                  {hoursParts(location).days}
                  <br />
                  {hoursParts(location).times}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <ComoLlegar location={location} />
                <DeliveryCTA location={location} />
                <ReservaCTA location={location} />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
