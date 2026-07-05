import { useTranslations } from "next-intl";
import type { Metadata } from "next";
import { takeAwayLocations } from "@/data/locations";
import { HubHero } from "@/components/HubHero";
import { ComoLlegar } from "@/components/ComoLlegar";
import { LocationsMapLazy } from "@/components/LocationsMapLazy";
import { SchemaOrg } from "@/components/SchemaOrg";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Pizza para Llevar en Barcelona – Napolitana al Corte",
  description:
    'Pizza napolitana "de bolsillo" en formato 24 y 33 cm, lista para llevar. Da Nanni en el Barrio Gótico y el Raval, todos los días de 12:00 a 22:30h.',
};

export default function ParaLlevarPage() {
  const t = useTranslations("paraLlevar");

  return (
    <>
      <SchemaOrg
        data={breadcrumbSchema([
          { name: "Inicio", path: "/" },
          { name: "Para Llevar", path: "/para-llevar" },
        ])}
      />

      <HubHero
        locations={takeAwayLocations}
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
          <LocationsMapLazy locations={takeAwayLocations} />
        </div>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {takeAwayLocations.map((location) => (
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
