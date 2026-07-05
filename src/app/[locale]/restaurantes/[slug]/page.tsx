import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  dineInLocations,
  getLocationByUrlSlug,
  heroImageSrc,
} from "@/data/locations";
import { LocationDetail } from "@/components/LocationDetail";
import { pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return dineInLocations.map((l) => ({ slug: l.urlSlug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const location = getLocationByUrlSlug("dine-in", slug);
  if (!location) return {};

  return pageMetadata({
    title: location.metaTitle,
    description: location.metaDescription,
    path: `/restaurantes/${slug}`,
    image: heroImageSrc(location),
  });
}

export default async function RestauranteLocalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const location = getLocationByUrlSlug("dine-in", slug);

  if (!location) {
    notFound();
  }

  return (
    <LocationDetail
      location={location}
      hubName="Restaurantes"
      hubPath="/restaurantes"
      path={`/restaurantes/${slug}`}
    />
  );
}
