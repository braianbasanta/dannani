import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import {
  locations,
  getLocationByUrlSlug,
  hrefFor,
  cartaHrefFor,
  heroImageSrc,
  hoursParts,
} from "@/data/locations";
import { menuByLocationSlug } from "@/data/menu";
import { localizeLocation } from "@/data/translations";
import { MenuSections } from "@/components/MenuSections";
import { ReservaCTA } from "@/components/ReservaCTA";
import { DeliveryCTA } from "@/components/DeliveryCTA";
import { ComoLlegar } from "@/components/ComoLlegar";
import { SchemaOrg } from "@/components/SchemaOrg";
import { breadcrumbSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return locations
    .filter((l) => menuByLocationSlug[l.slug])
    .map((l) => ({ slug: l.urlSlug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const location = getLocationByUrlSlug(slug);
  if (!location || !menuByLocationSlug[location.slug]) return {};

  const isTakeAway = location.type === "take-away";
  const tMeta = await getTranslations({ locale, namespace: "cartaPage" });

  return pageMetadata({
    title: tMeta(isTakeAway ? "metaTitleTakeAway" : "metaTitleDineIn", {
      name: location.neighborhood,
    }),
    description: tMeta(
      isTakeAway ? "metaDescriptionTakeAway" : "metaDescriptionDineIn",
      { name: location.neighborhood, address: location.address }
    ),
    path: cartaHrefFor(location),
    image: heroImageSrc(location),
    locale: locale as Locale,
  });
}

export default async function CartaLocalPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const found = getLocationByUrlSlug(slug);
  const menu = found ? menuByLocationSlug[found.slug] : undefined;
  const t = await getTranslations({ locale, namespace: "cartaPage" });
  const tNav = await getTranslations({ locale, namespace: "nav" });

  if (!found || !menu) {
    notFound();
  }

  const location = localizeLocation(found, locale as Locale);

  return (
    <>
      <SchemaOrg
        data={breadcrumbSchema(
          [
            { name: tNav("home"), path: "/" },
            { name: tNav("carta"), path: "/restaurantes/cartas" },
            { name: location.name, path: cartaHrefFor(location) },
          ],
          locale as Locale
        )}
      />

      <section className="mx-auto max-w-4xl px-4 py-16 font-sans text-cream sm:py-20">
        <p className="eyebrow">{t("title")}</p>
        <h1 className="mt-3 font-display text-4xl tracking-tight sm:text-6xl">
          {location.name}
        </h1>
        <p className="mt-3 max-w-2xl text-cream/70">
          {location.address}
          <br />
          {hoursParts(location).days}
          <br />
          {hoursParts(location).times}
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <ReservaCTA location={location} />
          <DeliveryCTA location={location} />
          <ComoLlegar location={location} />
          <Link
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            href={hrefFor(location) as any}
            className="inline-flex items-center justify-center rounded-full border border-cream/25 px-6 py-3 font-sans text-sm font-semibold text-cream transition hover:bg-cream/5"
          >
            {t("verLocal")}
          </Link>
        </div>

        <div className="mt-12">
          <MenuSections menu={menu} />
        </div>

        <div className="mt-16 border-t border-cream/10 pt-8">
          <p className="text-sm font-medium text-cream/70">
            {t("otrosLocales")}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {locations
              .filter(
                (l) => menuByLocationSlug[l.slug] && l.slug !== location.slug
              )
              .map((l) => (
                <Link
                  key={l.slug}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  href={cartaHrefFor(l) as any}
                  className="rounded-full bg-cream/10 px-4 py-2 text-sm font-medium text-cream ring-1 ring-cream/10 transition hover:bg-cream/20"
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
