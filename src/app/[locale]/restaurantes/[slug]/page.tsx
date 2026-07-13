import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import {
  locations,
  getLocationByUrlSlug,
  heroImageSrc,
} from "@/data/locations";
import { LocationDetail } from "@/components/LocationDetail";
import { localizeLocation } from "@/data/translations";
import { pageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

// Todos los locales (dine-in y take away) viven bajo /restaurantes/<urlSlug>
export function generateStaticParams() {
  return locations.map((l) => ({ slug: l.urlSlug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const found = getLocationByUrlSlug(slug);
  if (!found) return {};
  const location = localizeLocation(found, locale as Locale);

  return pageMetadata({
    title: location.metaTitle,
    description: location.metaDescription,
    path: `/restaurantes/${slug}`,
    image: heroImageSrc(location),
    locale: locale as Locale,
  });
}

export default async function RestauranteLocalPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const location = getLocationByUrlSlug(slug);

  if (!location) {
    notFound();
  }

  const tNav = await getTranslations({ locale, namespace: "nav" });

  return (
    <LocationDetail
      location={location}
      hubName={tNav("restaurantes")}
      hubPath="/restaurantes"
      path={`/restaurantes/${slug}`}
    />
  );
}
