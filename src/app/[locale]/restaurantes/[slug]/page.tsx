import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { dineInLocations, getLocationByUrlSlug } from "@/data/locations";
import { LocationDetail } from "@/components/LocationDetail";

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

  return {
    title: location.metaTitle,
    description: location.metaDescription,
  };
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
