import { use } from "react";
import type { Metadata } from "next";
import { useLocale, useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { CoverManagerWidget } from "@/components/CoverManagerWidget";
import { SchemaOrg } from "@/components/SchemaOrg";
import { breadcrumbSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "reservar" });

  return pageMetadata({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/reservar",
    locale: locale as Locale,
  });
}

export default function ReservarPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  // Habilita el prerender estático (next-intl): sin esto la página se
  // renderiza dinámica en cada request y no cachea en el CDN.
  const { locale: requestLocale } = use(params);
  setRequestLocale(requestLocale);
  const t = useTranslations("reservar");
  const tNav = useTranslations("nav");
  const locale = useLocale();

  return (
    <>
      <SchemaOrg
        data={breadcrumbSchema(
          [
            { name: tNav("home"), path: "/" },
            { name: t("navLabel"), path: "/reservar" },
          ],
          locale as Locale
        )}
      />

      <section className="mx-auto max-w-2xl px-4 py-16 font-sans text-cream sm:py-20">
        <div className="text-center">
          <p className="eyebrow">{t("eyebrow")}</p>
          <h1 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-cream/70">{t("subtitle")}</p>
        </div>

        <div className="mt-10 rounded-[1.75rem] bg-night-soft p-4 shadow-card ring-1 ring-cream/10 sm:p-6">
          <CoverManagerWidget />
        </div>
      </section>
    </>
  );
}
