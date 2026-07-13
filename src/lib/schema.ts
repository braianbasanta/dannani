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
    logo: `${SITE_URL}/images/logo/logo-nero.png`,
    foundingDate: "2018",
    description:
      "Pizzeria Trattoria Napoletana en Barcelona. Proyecto familiar napolitano desde 2018.",
    sameAs: [
      "https://www.instagram.com/danannibcn/",
      "https://www.facebook.com/profile.php?id=61557151444831",
    ],
  };
}

/** Separa "Carrer X, N, 080xx Barcelona" en streetAddress + postalCode. */
function postalAddress(location: Location) {
  const match = location.address.match(/^(.+?),\s*(08\d{3})\s+Barcelona$/);
  return {
    "@type": "PostalAddress",
    streetAddress: match ? match[1] : location.address,
    postalCode: match ? match[2] : undefined,
    addressLocality: "Barcelona",
    addressRegion: "Barcelona",
    addressCountry: "ES",
  };
}

/** Acción "Pedir online" que Google puede asociar al botón de pedidos. */
function orderAction(url: string) {
  return {
    "@type": "OrderAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: url,
      inLanguage: "es",
      actionPlatform: [
        "http://schema.org/DesktopWebPlatform",
        "http://schema.org/MobileWebPlatform",
      ],
    },
    deliveryMethod: ["http://purl.org/goodrelations/v1#DeliveryModeOwnFleet"],
  };
}

export function restaurantSchema(location: Location, path: string) {
  const gallery = ["01", "02", "03"].map(
    (n) => `${SITE_URL}/images/${location.imageFolder}/${n}.jpg`
  );
  const images = [
    `${SITE_URL}${heroImageSrc(location)}`,
    ...gallery.filter((src) => src !== `${SITE_URL}${heroImageSrc(location)}`),
  ].slice(0, 3);

  const orderUrls = [
    location.delivery?.glovo,
    location.delivery?.justEat,
  ].filter((url): url is string => Boolean(url));

  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": `${SITE_URL}${path}#restaurant`,
    name: location.name,
    url: `${SITE_URL}${path}`,
    image: images,
    telephone: location.phoneHref.replace("tel:", ""),
    servesCuisine: ["Italian", "Neapolitan Pizza"],
    priceRange: location.type === "take-away" ? "€" : "€€",
    address: postalAddress(location),
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
    // Las trattorias reservan por teléfono; los take away no aceptan reserva.
    acceptsReservations: location.type === "dine-in",
    hasMenu: menuByLocationSlug[location.slug]
      ? `${SITE_URL}/restaurantes/${location.urlSlug}/carta`
      : undefined,
    potentialAction: orderUrls.length
      ? orderUrls.map(orderAction)
      : undefined,
    parentOrganization: { "@id": `${SITE_URL}/#organization` },
  };
}

export function faqSchema(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
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
