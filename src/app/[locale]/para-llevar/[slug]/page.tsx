import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  takeAwayLocations,
  getLocationByUrlSlug,
  heroImageSrc,
} from "@/data/locations";
import { LocationDetail } from "@/components/LocationDetail";
import { pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return takeAwayLocations.map((l) => ({ slug: l.urlSlug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const location = getLocationByUrlSlug("take-away", slug);
  if (!location) return {};

  return pageMetadata({
    title: location.metaTitle,
    description: location.metaDescription,
    path: `/para-llevar/${slug}`,
    image: heroImageSrc(location),
  });
}

export default async function ParaLlevarLocalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const location = getLocationByUrlSlug("take-away", slug);

  if (!location) {
    notFound();
  }

  return (
    <LocationDetail
      location={location}
      hubName="Para Llevar"
      hubPath="/para-llevar"
      path={`/para-llevar/${slug}`}
    />
  );
}
