import { use } from "react";
import type { Metadata } from "next";
import { useLocale, useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
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

export default function ContactoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  // Habilita el prerender estático (next-intl): sin esto la página se
  // renderiza dinámica en cada request y no cachea en el CDN.
  const { locale: requestLocale } = use(params);
  setRequestLocale(requestLocale);
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
        <p className="mt-2 max-w-2xl text-cream/70">
          {t("emailNote")}{" "}
          <a
            href="mailto:danannipoblenou@gmail.com"
            className="font-semibold text-electric underline decoration-electric/40 underline-offset-4 transition-colors hover:text-cream"
          >
            danannipoblenou@gmail.com
          </a>
        </p>

        <ul className="mt-10 space-y-4">
          {locations.map((l) => localizeLocation(l, locale)).map((location) => (
            <li
              key={location.slug}
              className="flex flex-col gap-5 rounded-[1.75rem] bg-night-soft p-6 shadow-card ring-1 ring-cream/10 sm:p-7"
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
                <a
                  href={location.phoneHref}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-cream/10 px-4 py-3 font-sans text-xs font-bold uppercase tracking-[0.14em] text-cream ring-1 ring-cream/25 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_10px_30px_-12px_rgba(0,0,0,0.5)] transition-all duration-300 ease-fluid hover:-translate-y-0.5 hover:bg-[linear-gradient(160deg,#7bafbc_0%,#5599aa_52%,#3d7e8f_100%)] hover:text-night hover:ring-black/20 active:scale-[0.98]"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {location.phone}
                </a>
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
