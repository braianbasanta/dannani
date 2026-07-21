export type LocationType = "dine-in" | "take-away";

export interface OpeningHoursSpec {
  opens: string;
  closes: string;
}

export interface Coords {
  lat: number;
  lng: number;
}

/** Tiendas del local en plataformas de delivery. URLs limpias de UTMs de
 * Google (venían de los botones "Pedir" de Maps) y con los nuestros para
 * poder atribuir en Glovo/Just Eat los pedidos que llegan desde la web. */
export interface DeliveryLinks {
  glovo?: string;
  justEat?: string;
}

const WEB_UTM = "utm_source=dananni-web&utm_medium=referral";

export interface Location {
  slug: string;
  /** slug usado en la URL pública (puede diferir de `slug` para evitar colisiones de datos, p.ej. Raval dine-in vs take-away). */
  urlSlug: string;
  name: string;
  neighborhood: string;
  type: LocationType;
  address: string;
  /** Coordenadas del local (geocodificadas vía OSM/Nominatim). */
  coords: Coords;
  /** Enlace oficial "Compartir" de la ficha de Google Business del local. */
  gmapsUrl?: string;
  /** Valoración media en Google Business (snapshot jul. 2026). */
  googleRating?: number;
  /** Nº de reseñas en Google Business (snapshot jul. 2026). */
  googleReviewCount?: number;
  phone: string;
  phoneHref: string;
  /** Plataformas de delivery del local. Ausente = sin reparto a domicilio
   * (solo recogida/mesa). Raval (Tallers 69 y 72) no tiene delivery hoy. */
  delivery?: DeliveryLinks;
  /** Slug del restaurante en Cover Manager (campo "Slug" en Ajustes del
   * establecimiento → Integraciones). Solo dine-in; ausente = módulo de grupo. */
  coverManagerSlug?: string;
  hoursLabel: string;
  /** Todos los locales activos abren los 7 días con el mismo horario. */
  openingHours: OpeningHoursSpec[];
  description: string;
  imageCount: number;
  imageFolder: string;
  /** Número de archivo (sin extensión) usado como imagen de hero/card. Por defecto "01". */
  heroImage?: string;
  hasMenu: boolean;
  nearBeach?: boolean;
  openedYear: number;
  /** Title SEO de la página de detalle, sin marca (el template del layout añade "| Da Nanni"). Usa el patrón de búsqueda de mayor volumen del barrio. */
  metaTitle: string;
  metaDescription: string;
  /** H1 visible de la página de detalle, alineado con metaTitle. */
  h1: string;
}

export const locations: Location[] = [
  {
    slug: "gotic",
    urlSlug: "gotic",
    name: "Da Nanni Gòtic Take Away",
    neighborhood: "Gòtic",
    type: "take-away",
    address: "Carrer de la Llibreteria, 10, 08002 Barcelona",
    coords: { lat: 41.383163, lng: 2.177386 },
    gmapsUrl: "https://maps.google.com/?cid=2134218690125517522",
    googleRating: 4.5,
    googleReviewCount: 4238,
    phone: "936 63 85 60",
    phoneHref: "tel:+34936638560",
    delivery: {
      // OJO: verificar que la tienda "pizerria-da-nanni-barcelona" (con el
      // typo) es la de Llibreteria y no la de Tallers 72 — Glovo no expone
      // la dirección y existe otra tienda "pizzeria-da-nanni-barcelona".
      glovo: `https://glovoapp.com/es/es/barcelona/stores/pizerria-da-nanni-barcelona?${WEB_UTM}`,
      justEat: `https://www.just-eat.es/restaurants-pizzeria-da-nanni-llibreria-barcelona/menu?${WEB_UTM}`,
    },
    hoursLabel: "Todos los días, 12:00–22:30h",
    openingHours: [{ opens: "12:00", closes: "22:30" }],
    description:
      "En pleno Barrio Gótico, a un paso de la **Catedral de Barcelona** y de la Plaça Sant Jaume, este fue **el primer Da Nanni**: abrió en 2018 con una idea sencilla, la **pizza napolitana \"de bolsillo\"**, lista para llevarte por las callejuelas históricas de la Llibreteria. **Pizza al corte en formato 24 y 33 cm**, para comer paseando entre piedra medieval y el bullicio del centro de Barcelona.",
    imageCount: 9,
    imageFolder: "llibreteria",
    heroImage: "02",
    hasMenu: true,
    openedYear: 2018,
    metaTitle: "Pizza para Llevar en el Barrio Gótico, Barcelona",
    metaDescription:
      "Pizzería napolitana para llevar junto a la Catedral de Barcelona. Pizza al corte en 24 y 33 cm en Carrer de la Llibreteria, 10. Todos los días de 12:00 a 22:30h.",
    h1: "Pizza napolitana para llevar en el Barrio Gótico",
  },
  {
    slug: "raval-take-away",
    urlSlug: "raval",
    name: "Da Nanni Raval Take Away",
    neighborhood: "Tallers 72",
    type: "take-away",
    address: "Carrer dels Tallers, 72, 08001 Barcelona",
    coords: { lat: 41.38505, lng: 2.166076 },
    gmapsUrl: "https://maps.google.com/?cid=9417165372352837853",
    googleRating: 4.4,
    googleReviewCount: 1074,
    phone: "931 43 14 69",
    phoneHref: "tel:+34931431469",
    hoursLabel: "Todos los días, 12:00–22:30h",
    openingHours: [{ opens: "12:00", closes: "22:30" }],
    description:
      "A pasos del **MACBA**, en el corazón multicultural del Raval, este segundo local nació en 2021 con el mismo espíritu take away que el de la Llibreteria: **pizza napolitana de bolsillo en formato 24 y 33 cm**, con la posibilidad de tomarla en la **barra o en la pequeña terraza** (sin servicio de mesa). Ideal para una **parada rápida** entre museos y galerías de arte del barrio.",
    imageCount: 9,
    imageFolder: "tallers72",
    heroImage: "05",
    hasMenu: true,
    openedYear: 2021,
    metaTitle: "Pizza para Llevar en el Raval, Barcelona",
    metaDescription:
      "Pizzería napolitana para llevar a pasos del MACBA. Pizza al corte en 24 y 33 cm en Carrer dels Tallers, 72, con barra y pequeña terraza. Todos los días de 12:00 a 22:30h.",
    h1: "Pizza napolitana para llevar en el Raval",
  },
  {
    slug: "born",
    urlSlug: "born",
    name: "Da Nanni Born",
    neighborhood: "Born",
    type: "dine-in",
    address: "Carrer del Rec, 30, 08003 Barcelona",
    coords: { lat: 41.385295, lng: 2.182703 },
    gmapsUrl: "https://maps.google.com/?cid=6373700541294561102",
    googleRating: 4.0,
    googleReviewCount: 2816,
    phone: "933 19 79 73",
    phoneHref: "tel:+34933197973",
    delivery: {
      justEat: `https://www.just-eat.es/restaurants-pizzeria-da-nanni-barcelona-08003/menu?${WEB_UTM}`,
    },
    coverManagerSlug: "restaurante-da-nanni-el-born",
    hoursLabel: "Todos los días, 13:00–16:00h y 20:00–00:00h",
    openingHours: [
      { opens: "13:00", closes: "16:00" },
      { opens: "20:00", closes: "00:00" },
    ],
    description:
      "A pocos pasos de la **Basílica de Santa Maria del Mar**, en una de las calles con más carácter del Born, esta **trattoria y pizzería napolitana** abrió sus puertas en 2022. **Techos altos, mesas cercanas y el aroma del horno de leña** se mezclan con el ambiente histórico del barrio, uno de los rincones más visitados de Barcelona.",
    imageCount: 10,
    imageFolder: "rec",
    heroImage: "02",
    hasMenu: true,
    openedYear: 2022,
    metaTitle: "Restaurante Italiano y Pizzería Napolitana en el Born",
    metaDescription:
      "Trattoria y pizzería napolitana junto a Santa Maria del Mar. Horno de leña, pasta fresca y vinos italianos en Carrer del Rec, 30. Reserva llamando al 933 19 79 73.",
    h1: "Restaurante italiano y pizzería napolitana en el Born",
  },
  {
    slug: "raval",
    urlSlug: "tallers",
    name: "Da Nanni Tallers",
    neighborhood: "Tallers",
    type: "dine-in",
    address: "Carrer dels Tallers, 69, 08001 Barcelona",
    coords: { lat: 41.384865, lng: 2.167054 },
    gmapsUrl: "https://maps.google.com/?cid=10069641379312775045",
    googleRating: 4.7,
    googleReviewCount: 988,
    phone: "930 08 26 79",
    phoneHref: "tel:+34930082679",
    coverManagerSlug: "restaurante-da-nanni-tallers-69",
    hoursLabel: "Todos los días, 13:00–16:00h y 20:00–00:00h",
    openingHours: [
      { opens: "13:00", closes: "16:00" },
      { opens: "20:00", closes: "00:00" },
    ],
    description:
      "Justo enfrente de nuestro local take away de Tallers 72, esta **trattoria napolitana con mesa y servicio completo** abrió en 2023 para quienes prefieren **sentarse a disfrutar con calma**. Mismo barrio, mismo carácter napolitano, **dos formas distintas de vivir Da Nanni** en el Raval.",
    imageCount: 9,
    imageFolder: "tallers69",
    heroImage: "05",
    hasMenu: true,
    openedYear: 2023,
    metaTitle: "Pizzería Napolitana en el Raval, Barcelona",
    metaDescription:
      "Trattoria napolitana con servicio de mesa en Carrer dels Tallers, 69, en pleno Raval. Pizza de masa de larga fermentación y cocina italiana. Reserva al 930 08 26 79.",
    h1: "Restaurante y pizzería napolitana en el Raval",
  },
  {
    slug: "poblenou",
    urlSlug: "poblenou",
    name: "Da Nanni Poblenou",
    neighborhood: "Poblenou",
    type: "dine-in",
    address: "Rambla del Poblenou, 20, 08005 Barcelona",
    coords: { lat: 41.398484, lng: 2.20482 },
    gmapsUrl: "https://maps.google.com/?cid=1575337994830865936",
    googleRating: 4.4,
    googleReviewCount: 1862,
    phone: "930 11 71 66",
    phoneHref: "tel:+34930117166",
    delivery: {
      glovo: `https://glovoapp.com/es/es/barcelona/stores/pizzeria-da-nanni-rambla-del-poblenou-barcelona?${WEB_UTM}`,
    },
    coverManagerSlug: "restaurante-nanni-poblenou",
    hoursLabel: "Todos los días, 13:00–00:00h (horario corrido)",
    openingHours: [{ opens: "13:00", closes: "00:00" }],
    description:
      "En la Rambla del Poblenou, a un corto paseo de las **playas de Bogatell y Nova Icària**, este es el **Da Nanni más cercano al mar**. **Horario corrido de mediodía a medianoche**, terraza con el ambiente relajado y marinero típico del Poblenou, perfecto para una **pizza napolitana después de un día de playa**.",
    imageCount: 10,
    imageFolder: "poblenou",
    heroImage: "08",
    hasMenu: true,
    nearBeach: true,
    openedYear: 2021,
    metaTitle: "Pizzería Napolitana en Poblenou, Barcelona",
    metaDescription:
      "Trattoria napolitana en la Rambla del Poblenou, 20, a un paseo de la playa. Terraza, horario corrido de 13:00 a 00:00h y pizzas veganas. Reserva al 930 11 71 66.",
    h1: "Restaurante y pizzería napolitana en Poblenou",
  },
  {
    slug: "gracia",
    urlSlug: "gracia",
    name: "Da Nanni Gràcia",
    neighborhood: "Gràcia",
    type: "dine-in",
    address: "Carrer de Verdi, 35, 08012 Barcelona",
    coords: { lat: 41.403928, lng: 2.156695 },
    gmapsUrl: "https://maps.google.com/?cid=2456074022802591361",
    googleRating: 4.5,
    googleReviewCount: 853,
    phone: "936 59 50 75",
    phoneHref: "tel:+34936595075",
    delivery: {
      glovo: `https://glovoapp.com/es/es/barcelona/stores/da-nanni-gracia-barcelona?${WEB_UTM}`,
      justEat: `https://www.just-eat.es/restaurants-da-nanni-pizzeria-and-trattoria-08012/menu?${WEB_UTM}`,
    },
    coverManagerSlug: "restaurante-da-nanni-gracia",
    hoursLabel: "Todos los días, 13:00–16:00h y 20:00–00:00h",
    openingHours: [
      { opens: "13:00", closes: "16:00" },
      { opens: "20:00", closes: "00:00" },
    ],
    description:
      "En la emblemática **Carrer de Verdi**, epicentro cultural de Gràcia y a un paso de la Plaça del Sol, esta trattoria napolitana abrió en 2023. Ambiente de barrio, vecinos de toda la vida y visitantes se mezclan en las mesas de nuestro local con **la carta más completa del grupo**: **pizza, antipasti y una selecta carta de vinos italianos**.",
    imageCount: 10,
    imageFolder: "verdi",
    heroImage: "01",
    hasMenu: true,
    openedYear: 2023,
    metaTitle: "Pizzería Napolitana en Gràcia, Barcelona",
    metaDescription:
      "Trattoria napolitana en Carrer de Verdi, 35, junto a la Plaça del Sol. La carta más completa del grupo: pizza, antipasti y vinos italianos. Reserva al 936 59 50 75.",
    h1: "Restaurante y pizzería napolitana en Gràcia",
  },
];

export const getLocationBySlug = (slug: string) =>
  locations.find((location) => location.slug === slug);

// Los urlSlug son únicos entre los 6 locales (el dine-in de Tallers usa
// "tallers" para no chocar con el take away de Raval), así que la búsqueda
// ya no necesita el type. `slug` sigue siendo la clave interna (menús, etc.).
export const getLocationByUrlSlug = (urlSlug: string) =>
  locations.find((l) => l.urlSlug === urlSlug);

export const dineInLocations = locations.filter((l) => l.type === "dine-in");
export const deliveryLocations = locations.filter((l) => l.delivery);
export const takeAwayLocations = locations.filter(
  (l) => l.type === "take-away"
);

/** Divide hoursLabel en dos líneas — días ("Todos los días") y franjas
 * horarias — porque juntos forman una línea demasiado larga que corta mal
 * en móvil. Usar siempre este helper al mostrar horarios en la UI. */
export const hoursParts = (location: Location) => {
  const [days, ...rest] = location.hoursLabel.split(", ");
  return { days, times: rest.join(", ") };
};

export const heroImageSrc = (location: Location) =>
  `/images/${location.imageFolder}/${location.heroImage ?? "01"}.jpg`;

/** Todos los locales viven bajo /restaurantes/<urlSlug> (los take away
 * incluidos: para Google son restaurantes; "Para Llevar" es solo el nombre
 * del botón). La carta de cada local cuelga en /restaurantes/<urlSlug>/carta. */
export const hrefFor = (location: Pick<Location, "urlSlug">) =>
  `/restaurantes/${location.urlSlug}`;

export const cartaHrefFor = (location: Pick<Location, "urlSlug">) =>
  `/restaurantes/${location.urlSlug}/carta`;

/** Subconjunto de Location que necesitan los mapas (client components):
 * pasar solo esto evita serializar el resto de la ficha (horarios, metas,
 * descripciones…) en el payload RSC de cada página con mapa. */
export type MapLocation = Pick<
  Location,
  "slug" | "urlSlug" | "name" | "neighborhood" | "address" | "coords" | "gmapsUrl"
>;

export const toMapLocation = (location: Location): MapLocation => ({
  slug: location.slug,
  urlSlug: location.urlSlug,
  name: location.name,
  neighborhood: location.neighborhood,
  address: location.address,
  coords: location.coords,
  gmapsUrl: location.gmapsUrl,
});

/** Abre la ficha del negocio en Google Maps (no la ruta directa): ahí el
 * cliente ve fotos, reseñas y horario, y decide si pulsa "Cómo llegar".
 * Usa el enlace oficial de la ficha (gmapsUrl) y, si faltara, cae a una
 * búsqueda por nombre + dirección. */
export const mapsUrl = (
  location: Pick<Location, "gmapsUrl" | "neighborhood" | "address">
) =>
  location.gmapsUrl ??
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `Da Nanni ${location.neighborhood}, ${location.address}`
  )}`;
