import { useTranslations } from "next-intl";
import type { Metadata } from "next";
import { dineInLocations } from "@/data/locations";
import { HubHero } from "@/components/HubHero";
import { ComoLlegar } from "@/components/ComoLlegar";
import { LocationsMapLazy } from "@/components/LocationsMapLazy";
import { SchemaOrg } from "@/components/SchemaOrg";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Restaurantes Italianos en Barcelona – Trattoria Napolitana",
  description:
    "Cuatro restaurantes italianos Da Nanni en Barcelona: trattoria y pizza napolitana de horno de leña en Born, Raval, Gràcia y Poblenou. Reserva tu mesa.",
};

export default function RestaurantesPage() {
  const t = useTranslations("restaurantes");

  return (
    <>
      <SchemaOrg
        data={breadcrumbSchema([
          { name: "Inicio", path: "/" },
          { name: "Restaurantes", path: "/restaurantes" },
        ])}
      />

      <HubHero
        locations={dineInLocations}
        eyebrow="Barcelona"
        h1={t("title")}
        sub={t("subtitle")}
      />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
        <h2 className="font-display text-3xl tracking-tight text-teal-dark sm:text-4xl">
          {t("infoTitle")}
        </h2>
        <p className="mt-3 max-w-[55ch] text-teal-dark/70">{t("intro")}</p>

        <div className="mt-8 rounded-[1.75rem] bg-teal-dark/5 p-2 ring-1 ring-teal-dark/10">
          <LocationsMapLazy locations={dineInLocations} />
        </div>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {dineInLocations.map((location) => (
            <li
              key={location.slug}
              className="flex flex-col justify-between gap-4 rounded-[1.75rem] bg-white p-6 shadow-card ring-1 ring-teal-dark/10 sm:p-7"
            >
              <div>
                <p className="font-display text-xl tracking-tight text-teal-dark">
                  {location.name}
                </p>
                <p className="mt-1.5 text-sm text-teal-dark/70">
                  {location.address}
                </p>
                <p className="text-sm text-teal-dark/70">
                  {location.hoursLabel}
                </p>
                <a
                  href={location.phoneHref}
                  className="mt-1 inline-block text-sm font-medium text-teal-dark transition-colors duration-200 hover:text-mustard"
                >
                  {location.phone}
                </a>
              </div>
              <div>
                <ComoLlegar location={location} />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
