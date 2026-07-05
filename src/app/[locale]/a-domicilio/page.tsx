import Image from "next/image";
import { useTranslations } from "next-intl";
import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import {
  deliveryLocations,
  hrefFor,
  heroImageSrc,
} from "@/data/locations";
import { DeliveryButtons } from "@/components/DeliveryCTA";
import { SchemaOrg } from "@/components/SchemaOrg";
import { breadcrumbSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Pizza a Domicilio en Barcelona – Pide en Glovo o Just Eat",
  description:
    "Pizza napolitana de horno de leña a domicilio en Barcelona. Pide en Glovo o Just Eat desde nuestros locales del Gòtic, Born, Poblenou y Gràcia.",
  path: "/a-domicilio",
});

export default function ADomicilioPage() {
  const t = useTranslations("domicilio");
  const tBadges = useTranslations("badges");
  const tCta = useTranslations("cta");

  return (
    <>
      <SchemaOrg
        data={breadcrumbSchema([
          { name: "Inicio", path: "/" },
          { name: "A Domicilio", path: "/a-domicilio" },
        ])}
      />

      <section className="mx-auto max-w-6xl px-4 py-16 font-sans text-teal-dark sm:py-20">
        <p className="eyebrow">{t("eyebrow")}</p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl leading-[1.05] tracking-tight sm:text-6xl">
          {t("title")}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-teal-dark/70">
          {t("subtitle")}
        </p>

        <h2 className="mt-14 font-display text-3xl tracking-tight sm:text-4xl">
          {t("infoTitle")}
        </h2>
        <p className="mt-3 max-w-[55ch] text-teal-dark/70">{t("intro")}</p>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {deliveryLocations.map((location) => (
            <li
              key={location.slug}
              className="flex flex-col gap-5 rounded-[1.75rem] bg-white p-6 shadow-card ring-1 ring-teal-dark/10 sm:p-7"
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
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-dark/50">
                    {location.type === "take-away"
                      ? tBadges("takeAway")
                      : tBadges("dineIn")}
                  </p>
                  <p className="font-display text-xl tracking-tight">
                    {location.name}
                  </p>
                  <p className="text-sm text-teal-dark/70">
                    {location.address}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <DeliveryButtons location={location} />
                <Link
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  href={hrefFor(location) as any}
                  className="inline-flex items-center justify-center rounded-full border border-teal-dark/20 px-5 py-3 text-sm font-semibold text-teal-dark transition hover:bg-teal-dark/5"
                >
                  {tCta("verLocal")}
                </Link>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-16 rounded-[1.75rem] bg-teal-dark/5 p-6 ring-1 ring-teal-dark/10 sm:p-8">
          <h2 className="font-display text-2xl tracking-tight sm:text-3xl">
            {t("recogidaTitle")}
          </h2>
          <p className="mt-2 max-w-[65ch] text-teal-dark/70">
            {t("recogidaText")}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/para-llevar"
              className="inline-flex items-center justify-center rounded-full bg-mustard px-6 py-3 text-sm font-semibold text-cream transition hover:bg-mustard-dark"
            >
              {t("verParaLlevar")}
            </Link>
            <Link
              href="/restaurantes"
              className="inline-flex items-center justify-center rounded-full border border-teal-dark/20 px-6 py-3 text-sm font-semibold text-teal-dark transition hover:bg-teal-dark/5"
            >
              {t("verRestaurantes")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
