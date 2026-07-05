import type { Location } from "@/data/locations";
import { heroImageSrc } from "@/data/locations";
import { menuByLocationSlug } from "@/data/menu";

const SITE_URL = "https://www.dananni.es";
const ALL_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "Da Nanni",
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo/logo.png`,
    foundingDate: "2017",
    description:
      "Pizzeria Trattoria Napoletana en Barcelona. Proyecto familiar napolitano desde 2017.",
    sameAs: [
      "https://www.instagram.com/danannibcn/",
      "https://www.facebook.com/profile.php?id=61557151444831",
    ],
  };
}

export function restaurantSchema(location: Location, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": `${SITE_URL}${path}#restaurant`,
    name: location.name,
    url: `${SITE_URL}${path}`,
    image: `${SITE_URL}${heroImageSrc(location)}`,
    telephone: location.phone,
    servesCuisine: ["Italian", "Neapolitan Pizza"],
    address: {
      "@type": "PostalAddress",
      streetAddress: location.address,
      addressLocality: "Barcelona",
      addressCountry: "ES",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: location.coords.lat,
      longitude: location.coords.lng,
    },
    hasMap: location.gmapsUrl,
    openingHoursSpecification: location.openingHours.map((spec) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ALL_DAYS,
      opens: spec.opens,
      closes: spec.closes,
    })),
    acceptsReservations: false,
    hasMenu: menuByLocationSlug[location.slug]
      ? `${SITE_URL}/carta/${location.slug}`
      : undefined,
    parentOrganization: { "@id": `${SITE_URL}/#organization` },
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}
