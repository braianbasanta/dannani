import { menuByLocationSlug } from "./menu";
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

function resolveFeatured(name: string): MediaEntry {
  for (const section of menuByLocationSlug[FEATURED_MENU_SLUG]) {
    const item = section.items.find((i) => i.name === name);
    if (item) {
      if (!item.video) {
        throw new Error(
          `Plato destacado sin video en la carta "${FEATURED_MENU_SLUG}": ${name}`
        );
      }
      return { item, sectionTitle: section.title };
    }
  }
  throw new Error(
    `Plato destacado no encontrado en la carta "${FEATURED_MENU_SLUG}": ${name}`
  );
}

export const featuredDishEntries: MediaEntry[] =
  FEATURED_DISH_NAMES.map(resolveFeatured);
