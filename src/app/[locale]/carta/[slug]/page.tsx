import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  locations,
  getLocationBySlug,
  hrefFor,
  heroImageSrc,
} from "@/data/locations";
import { menuByLocationSlug } from "@/data/menu";
import { MenuSections } from "@/components/MenuSections";
import { ReservaCTA } from "@/components/ReservaCTA";
import { DeliveryCTA } from "@/components/DeliveryCTA";
import { ComoLlegar } from "@/components/ComoLlegar";
import { SchemaOrg } from "@/components/SchemaOrg";
import { breadcrumbSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return Object.keys(menuByLocationSlug).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const location = getLocationBySlug(slug);
  if (!location || !menuByLocationSlug[slug]) return {};

  const isTakeAway = location.type === "take-away";

  return pageMetadata({
    title: `Carta Da Nanni ${location.neighborhood} – Precios y Menú`,
    description: `Carta y precios de Da Nanni ${location.neighborhood}, en ${location.address}. ${
      isTakeAway
        ? "Pizza napolitana al corte en 24 y 33 cm."
        : "Pizza napolitana, antipasti y carta de vinos italianos."
    }`,
    path: `/carta/${slug}`,
    image: heroImageSrc(location),
  });
}

export default async function CartaLocalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const location = getLocationBySlug(slug);
  const menu = menuByLocationSlug[slug];
  const t = await getTranslations("cartaPage");

  if (!location || !menu) {
    notFound();
  }

  return (
    <>
      <SchemaOrg
        data={breadcrumbSchema([
          { name: "Inicio", path: "/" },
          { name: "Carta", path: "/carta" },
          { name: location.name, path: `/carta/${slug}` },
        ])}
      />

      <section className="mx-auto max-w-4xl px-4 py-16 font-sans text-teal-dark sm:py-20">
        <p className="eyebrow">{t("title")}</p>
        <h1 className="mt-3 font-display text-4xl tracking-tight sm:text-6xl">
          {location.name}
        </h1>
        <p className="mt-3 max-w-2xl text-teal-dark/70">
          {location.address} · {location.hoursLabel}
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <ReservaCTA location={location} />
          <DeliveryCTA location={location} />
          <ComoLlegar location={location} />
          <Link
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            href={hrefFor(location) as any}
            className="inline-flex items-center justify-center rounded-full border border-teal-dark/20 px-6 py-3 font-sans text-sm font-semibold text-teal-dark transition hover:bg-teal-dark/5"
          >
            {t("verLocal")}
          </Link>
        </div>

        <div className="mt-12">
          <MenuSections menu={menu} />
        </div>

        <div className="mt-16 border-t border-teal-dark/10 pt-8">
          <p className="text-sm font-medium text-teal-dark/70">
            {t("otrosLocales")}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {locations
              .filter((l) => menuByLocationSlug[l.slug] && l.slug !== slug)
              .map((l) => (
                <Link
                  key={l.slug}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  href={`/carta/${l.slug}` as any}
                  className="rounded-full bg-white px-4 py-2 text-sm font-medium text-teal-dark ring-1 ring-teal-dark/10 transition hover:bg-teal-dark/10"
                >
                  {l.neighborhood}
                  {l.type === "take-away" && ` ${t("sufijoParaLlevar")}`}
                </Link>
              ))}
          </div>
        </div>
      </section>
    </>
  );
}
