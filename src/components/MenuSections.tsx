"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import type { MenuSection } from "@/data/menu";
import { translateData } from "@/data/translations";
import { DishMediaViewer, type MediaEntry } from "./DishMediaViewer";

type Category = "comida" | "bebidas";

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
        .filter((section) => section.items.length > 0),
    [localizedMenu, category, vegetarianOnly]
  );

  const mediaEntries = useMemo<MediaEntry[]>(
    () =>
      visibleSections.flatMap((section) =>
        section.items
          .filter((item) => item.video || item.photo)
          .map((item) => ({ item, sectionTitle: section.title }))
      ),
    [visibleSections]
  );

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
        <div className="mt-8 grid gap-x-10 gap-y-8 sm:grid-cols-2">
          {visibleSections.map((section) => {
            const isLong = section.items.length >= 15;
            return (
              <div key={section.id} className={isLong ? "sm:col-span-2" : undefined}>
                <h3 className="font-display text-lg text-mustard">
                  {section.title}
                </h3>
                {section.note && (
                  <p className="mt-1 text-xs italic text-cream/60">
                    {section.note}
                  </p>
                )}
                <ul
                  className={
                    "mt-2" +
                    (isLong
                      ? " sm:columns-2 sm:gap-x-10"
                      : " divide-y divide-cream/10")
                  }
                >
                  {section.items.map((item) => (
                    <li
                      key={item.name}
                      className={
                        "flex justify-between gap-4 py-2" +
                        (isLong
                          ? " break-inside-avoid border-b border-cream/10 last:border-b-0"
                          : "")
                      }
                    >
                      <span>
                        {item.video || item.photo ? (
                          <button
                            type="button"
                            onClick={() =>
                              setActiveIndex(
                                mediaEntries.findIndex((v) => v.item === item)
                              )
                            }
                            className="text-left font-medium text-electric underline decoration-electric/40 underline-offset-2 transition hover:text-electric-dark hover:decoration-electric-dark"
                          >
                            {item.name}
                          </button>
                        ) : (
                          item.name
                        )}
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
              </div>
            );
          })}
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
