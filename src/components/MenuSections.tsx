"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import type { MenuSection } from "@/data/menu";
import { translateData } from "@/data/translations";
import { DishCardsCarousel } from "./DishCardsCarousel";
import { DishMediaViewer, type MediaEntry } from "./DishMediaViewer";

type Category = "comida" | "bebidas";

/**
 * Carta de un local con el patrón visual de la home: cada sección (Pizze,
 * Insalate…) muestra su título y un carrusel de tarjetas de video/foto que
 * abren el visor fullscreen. Los items sin media quedan en lista de texto
 * bajo el carrusel para que ningún plato desaparezca de la carta.
 */
export function MenuSections({ menu }: { menu: MenuSection[] }) {
  const t = useTranslations("menu");
  const locale = useLocale() as Locale;
  const [category, setCategory] = useState<Category>("comida");
  const [vegetarianOnly, setVegetarianOnly] = useState(false);

  // Títulos de sección, notas y descripciones de plato pasan por el
  // diccionario de datos; los nombres de plato (italiano de carta) no.
  const localizedMenu = useMemo(
    () =>
      locale === "es"
        ? menu
        : menu.map((section) => ({
            ...section,
            title: translateData(section.title, locale),
            note: section.note ? translateData(section.note, locale) : section.note,
            items: section.items.map((item) =>
              item.description
                ? { ...item, description: translateData(item.description, locale) }
                : item
            ),
          })),
    [menu, locale]
  );

  const hasComida = menu.some((section) => section.category === "comida");
  const hasBebidas = menu.some((section) => section.category === "bebidas");

  const visibleSections = useMemo(
    () =>
      localizedMenu
        .filter((section) => section.category === category)
        .map((section) => ({
          ...section,
          items:
            category === "comida" && vegetarianOnly
              ? section.items.filter((item) => item.vegetarian)
              : section.items,
        }))
        .filter((section) => section.items.length > 0)
        .map((section) => ({
          ...section,
          media: section.items
            .filter((item) => item.video || item.photo)
            .map<MediaEntry>((item) => ({ item, sectionTitle: section.title })),
          textItems: section.items.filter((item) => !item.video && !item.photo),
        })),
    [localizedMenu, category, vegetarianOnly]
  );

  // El visor navega por todos los videos de la categoría visible, en el
  // mismo orden en que aparecen los carruseles; cada sección abre con su
  // offset dentro de esa lista global.
  const mediaEntries = useMemo(
    () => visibleSections.flatMap((section) => section.media),
    [visibleSections]
  );
  const sectionOffsets = useMemo(() => {
    const offsets: Record<string, number> = {};
    let acc = 0;
    for (const section of visibleSections) {
      offsets[section.id] = acc;
      acc += section.media.length;
    }
    return offsets;
  }, [visibleSections]);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const tab = (value: Category, label: string) => (
    <button
      type="button"
      onClick={() => setCategory(value)}
      className={
        "rounded-full px-4 py-2 text-sm font-medium transition " +
        (category === value
          ? "bg-electric text-night"
          : "bg-cream/10 text-cream hover:bg-cream/20")
      }
    >
      {label}
    </button>
  );

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {hasComida && tab("comida", t("comida"))}
        {hasBebidas && tab("bebidas", t("bebidas"))}

        {category === "comida" && (
          <button
            type="button"
            onClick={() => setVegetarianOnly((v) => !v)}
            aria-pressed={vegetarianOnly}
            className={
              "ml-auto rounded-full px-4 py-2 text-sm font-medium transition " +
              (vegetarianOnly
                ? "bg-mustard text-night"
                : "bg-cream/10 text-cream ring-1 ring-cream/20 hover:bg-cream/20")
            }
          >
            {t("soloVegetariano")}
          </button>
        )}
      </div>

      {visibleSections.length === 0 ? (
        <p className="mt-8 text-sm text-cream/60">{t("sinResultados")}</p>
      ) : (
        <div className="mt-10 space-y-14">
          {visibleSections.map((section) => (
            <section key={section.id}>
              <h3 className="font-display text-2xl tracking-tight text-cream sm:text-3xl">
                {section.title}
              </h3>
              {section.note && (
                <p className="mt-2 text-sm italic text-cream/60">
                  {section.note}
                </p>
              )}

              {section.media.length > 0 && (
                <div className="mt-5">
                  <DishCardsCarousel
                    entries={section.media}
                    onOpen={(i) =>
                      setActiveIndex(sectionOffsets[section.id] + i)
                    }
                  />
                </div>
              )}

              {section.textItems.length > 0 && (
                <ul
                  className={
                    "divide-y divide-cream/10" +
                    (section.media.length > 0 ? " mt-4" : " mt-4 max-w-2xl")
                  }
                >
                  {section.textItems.map((item) => (
                    <li
                      key={item.name}
                      className="flex justify-between gap-4 py-2"
                    >
                      <span>
                        {item.name}
                        {item.description && (
                          <span className="block text-xs text-cream/60">
                            {item.description}
                          </span>
                        )}
                      </span>
                      {item.price33 ? (
                        <span className="flex shrink-0 flex-col items-end whitespace-nowrap text-sm font-medium tabular-nums">
                          <span>24cm {item.price}</span>
                          <span>33cm {item.price33}</span>
                        </span>
                      ) : (
                        <span className="whitespace-nowrap font-medium tabular-nums">
                          {item.price}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      )}

      {activeIndex !== null && (
        <DishMediaViewer
          entries={mediaEntries}
          startIndex={activeIndex}
          onClose={() => setActiveIndex(null)}
        />
      )}
    </>
  );
}
