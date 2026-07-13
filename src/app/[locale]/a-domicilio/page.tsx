import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import {
  deliveryLocations,
  hrefFor,
  heroImageSrc,
} from "@/data/locations";
import { DeliveryButtons } from "@/components/DeliveryCTA";
import { DeliveryMapLazy } from "@/components/DeliveryMapLazy";
import { SchemaOrg } from "@/components/SchemaOrg";
import { breadcrumbSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "domicilio" });
  return pageMetadata({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/a-domicilio",
    locale: locale as Locale,
  });
}

export default function ADomicilioPage() {
  const t = useTranslations("domicilio");
  const tBadges = useTranslations("badges");
  const tCta = useTranslations("cta");
  const tNav = useTranslations("nav");
  const locale = useLocale() as Locale;

  return (
    <>
      <SchemaOrg
        data={breadcrumbSchema(
          [
            { name: tNav("home"), path: "/" },
            { name: tNav("aDomicilio"), path: "/a-domicilio" },
          ],
          locale
        )}
      />

      <section className="relative -mt-16 flex min-h-[70svh] items-end overflow-hidden sm:min-h-[60vh]">
        <Image
          src="/images/llibreteria/05.jpg"
          alt={t("heroAlt")}
          fill
          preload
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-night/95 via-night/40 to-night/10" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-night/60 to-transparent" />
        <div className="relative mx-auto w-full max-w-6xl animate-fade-up px-4 pb-14 pt-28 font-sans text-cream drop-shadow-[0_1px_6px_rgba(0,0,0,0.55)]">
          <p className="eyebrow">{t("eyebrow")}</p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl leading-[1.05] tracking-tight sm:text-6xl">
            {t("title")}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-cream/90">
            {t("subtitle")}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 font-sans text-cream sm:py-16">
        <h2 className="font-display text-3xl tracking-tight sm:text-4xl">
          {t("infoTitle")}
        </h2>
        <p className="mt-3 max-w-[55ch] text-cream/70">{t("intro")}</p>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {deliveryLocations.map((location) => (
            <li
              key={location.slug}
              className="flex flex-col gap-5 rounded-[1.75rem] bg-night-soft p-6 shadow-card ring-1 ring-cream/10 sm:p-7"
            >
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl">
                  <Image
                    src={heroImageSrc(location)}
                    alt={location.name}
                    fill
                    sizes="64px"
                    loading="lazy"
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cream/50">
                    {location.type === "take-away"
                      ? tBadges("takeAway")
                      : tBadges("dineIn")}
                  </p>
                  <p className="font-display text-xl tracking-tight">
                    {location.name}
                  </p>
                  <p className="text-sm text-cream/70">
                    {location.address}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <DeliveryButtons location={location} />
                <Link
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  href={hrefFor(location) as any}
                  className="inline-flex items-center justify-center rounded-full border border-cream/25 px-5 py-3 text-sm font-semibold text-cream transition hover:bg-cream/5"
                >
                  {tCta("verLocal")}
                </Link>
              </div>
            </li>
          ))}
        </ul>

        <h2 className="mt-16 font-display text-3xl tracking-tight sm:text-4xl">
          {t("mapaTitle")}
        </h2>
        <p className="mt-3 max-w-[55ch] text-cream/70">{t("mapaText")}</p>
        <div className="mt-8">
          <DeliveryMapLazy locations={deliveryLocations} />
        </div>

        <div className="mt-16 rounded-[1.75rem] bg-cream/5 p-6 ring-1 ring-cream/10 sm:p-8">
          <h2 className="font-display text-2xl tracking-tight sm:text-3xl">
            {t("recogidaTitle")}
          </h2>
          <p className="mt-2 max-w-[65ch] text-cream/70">
            {t("recogidaText")}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/pizza-para-llevar"
              className="inline-flex items-center justify-center rounded-full bg-electric px-6 py-3 text-sm font-semibold text-night transition hover:bg-electric-dark"
            >
              {t("verParaLlevar")}
            </Link>
            <Link
              href="/restaurantes"
              className="inline-flex items-center justify-center rounded-full border border-cream/25 px-6 py-3 text-sm font-semibold text-cream transition hover:bg-cream/5"
            >
              {t("verRestaurantes")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
