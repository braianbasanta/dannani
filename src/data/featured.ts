import { menuByLocationSlug, type MenuSection } from "./menu";
import type { MediaEntry } from "@/components/DishMediaViewer";

/**
 * Platos destacados del carrusel de la home, curados a mano.
 * Se referencian por nombre exacto contra la carta dine-in (`born`), que es
 * la que tiene video para todos ellos. Editar la curación = editar esta lista.
 *
 * Si un nombre deja de existir en menu.ts (p. ej. un rename de carta), el
 * resolver lanza en tiempo de build: preferimos un fallo ruidoso a que un
 * plato desaparezca de la home en silencio.
 */
const FEATURED_DISH_NAMES = [
  "Margherita",
  "La carbonara",
  "Pizza fritta",
  "La mortadella",
  "Burrata",
  "Gnocchi alla Sorrentina",
  "Lasagna Napoletana",
  "Tagliata di Manzo",
  "Tiramisù",
];

const FEATURED_MENU_SLUG = "born";

/**
 * Platos destacados de cada página de local (5-10 por local), curados a
 * mano como los de la home. Se referencian por nombre exacto contra la
 * carta del propio local, así el precio y la descripción mostrados son
 * los de ese local. Cada local muestra una selección distinta aunque
 * comparta carta con otro, para que las páginas no se repitan.
 */
const FEATURED_BY_LOCATION: Record<string, string[]> = {
  born: FEATURED_DISH_NAMES,
  raval: [
    "Margherita",
    "Diavola",
    "Carrettiera",
    "Spaghetti alla carbonara",
    "Mezzanelli alla Genovese",
    "Polpette al ragù",
    "Arancino di riso (1 ud)",
    "Formaggiosa",
    "Babà",
  ],
  // Poblenou es el local de playa: selección con más mar.
  poblenou: [
    "Margherita",
    "Tropea",
    "Sorrento",
    "Ziti Mare e Sole",
    "Spaghetti al lo scoglio",
    "Frittura mista di pescado",
    "Gnocchetti Mediterranei",
    "Baccalà in Cassuola",
    "Cheesecake",
  ],
  gotic: [
    "Margherita",
    "Diavola",
    "Bufalina",
    "Mortadella",
    "Carbonara",
    "4 Quesos",
    "Salsiccia e Friarielli",
    "Tartufata",
    "Nutella",
  ],
  "raval-take-away": [
    "Margherita",
    "Marinara",
    "Cosacca Partenopea",
    "Jamón Dulce",
    "Verace Estiva",
    "Provola y Cabra",
    "Primavera",
    "Calzone Classico",
    "Sofia Loren",
  ],
  gracia: [
    "Margherita",
    "La carbonara",
    "La mortadella",
    "Diavola",
    "Napoletana",
    "Prosciutto e funghi",
    "Parmigiana di melanzane",
    "Burrata e Parma",
    "Marinara",
  ],
};

/**
 * La carta de Gràcia no tiene videos propios: el video se toma prestado
 * del plato equivalente de la carta dine-in (mismo plato grabado en
 * cocina), manteniendo precio y descripción de la carta de Gràcia.
 * `alias` mapea nombres que difieren entre ambas cartas.
 */
const VIDEO_FALLBACK: Record<
  string,
  { menuSlug: string; alias?: Record<string, string> }
> = {
  gracia: {
    menuSlug: "born",
    alias: { "Burrata e Parma": "Burrata" },
  },
};

function findInMenu(menuSlug: string, name: string) {
  for (const section of menuByLocationSlug[menuSlug]) {
    const item = section.items.find(
      (i) => i.name.toLowerCase() === name.toLowerCase()
    );
    if (item) return { item, sectionTitle: section.title };
  }
  return null;
}

/**
 * Aplica el préstamo de VIDEO_FALLBACK a una carta completa (para la página
 * de carta de Gràcia): los items sin media toman el video del plato homónimo
 * de la carta origen; los que no matchean quedan como están (lista de texto).
 * A diferencia del resolver de destacados, aquí no se lanza error: el
 * préstamo es oportunista.
 */
export function menuWithBorrowedVideos(
  slug: string,
  menu: MenuSection[]
): MenuSection[] {
  const fallback = VIDEO_FALLBACK[slug];
  if (!fallback) return menu;
  return menu.map((section) => ({
    ...section,
    items: section.items.map((item) => {
      if (item.video || item.photo) return item;
      const sourceName = fallback.alias?.[item.name] ?? item.name;
      const source = findInMenu(fallback.menuSlug, sourceName);
      if (!source?.item.video) return item;
      return { ...item, video: source.item.video, poster: source.item.poster };
    }),
  }));
}

export function featuredDishesForLocation(slug: string): MediaEntry[] {
  const names = FEATURED_BY_LOCATION[slug];
  if (!names) return [];
  return names.map((name) => {
    const found = findInMenu(slug, name);
    if (!found) {
      throw new Error(
        `Plato destacado no encontrado en la carta "${slug}": ${name}`
      );
    }
    let item = found.item;
    if (!item.video) {
      const fallback = VIDEO_FALLBACK[slug];
      const sourceName = fallback?.alias?.[name] ?? name;
      const source = fallback ? findInMenu(fallback.menuSlug, sourceName) : null;
      if (!source?.item.video) {
        throw new Error(`Plato destacado sin video en "${slug}": ${name}`);
      }
      item = { ...item, video: source.item.video, poster: source.item.poster };
    }
    return { item, sectionTitle: found.sectionTitle };
  });
}

export const featuredDishEntries: MediaEntry[] =
  featuredDishesForLocation(FEATURED_MENU_SLUG);
