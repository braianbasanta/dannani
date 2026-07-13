import type { Location } from "@/data/locations";
import { heroImageSrc } from "@/data/locations";
import { menuByLocationSlug } from "@/data/menu";
import { routing, type Locale } from "@/i18n/routing";
import { localePath } from "@/lib/seo";

const SITE_URL = "https://www.dananni.es";

/* La descripción de la Organization se sirve en el idioma de la página.
   Los textos EN/IT/CA salen de la pasada de traducción (DeepL + revisión). */
const ORG_DESCRIPTION: Record<Locale, string> = {
  es: "Pizzeria Trattoria Napoletana en Barcelona. Proyecto familiar napolitano desde 2018.",
  en: "Pizzeria Trattoria Napoletana in Barcelona. A Neapolitan family project since 2018.",
  it: "Pizzeria Trattoria Napoletana a Barcellona. Progetto familiare napoletano dal 2018.",
  ca: "Pizzeria Trattoria Napoletana a Barcelona. Projecte familiar napolità des del 2018.",
};
const ALL_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export function organizationSchema(locale: Locale = routing.defaultLocale) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "Da Nanni",
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo/logo-nero.png`,
    foundingDate: "2018",
    description: ORG_DESCRIPTION[locale],
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
function orderAction(url: string, locale: Locale) {
  return {
    "@type": "OrderAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: url,
      inLanguage: locale,
      actionPlatform: [
        "http://schema.org/DesktopWebPlatform",
        "http://schema.org/MobileWebPlatform",
      ],
    },
    deliveryMethod: ["http://purl.org/goodrelations/v1#DeliveryModeOwnFleet"],
  };
}

export function restaurantSchema(
  location: Location,
  path: string,
  locale: Locale = routing.defaultLocale
) {
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
    // @id estable en la ruta es (canónica) para que Google funda las
    // versiones de idioma en una sola entidad; url sí es la localizada.
    "@id": `${SITE_URL}${path}#restaurant`,
    name: location.name,
    url: `${SITE_URL}${localePath(locale, path)}`,
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
      ? `${SITE_URL}${localePath(locale, `/restaurantes/${location.urlSlug}/carta`)}`
      : undefined,
    potentialAction: orderUrls.length
      ? orderUrls.map((url) => orderAction(url, locale))
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

export function breadcrumbSchema(
  items: { name: string; path: string }[],
  locale: Locale = routing.defaultLocale
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${localePath(locale, item.path)}`,
    })),
  };
}
