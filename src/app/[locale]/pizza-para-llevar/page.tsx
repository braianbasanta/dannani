import { useTranslations } from "next-intl";
import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import {
  takeAwayLocations,
  heroImageSrc,
  hoursParts,
  hrefFor,
  cartaHrefFor,
  getLocationBySlug,
} from "@/data/locations";
import { HubHero } from "@/components/HubHero";
import { ComoLlegar } from "@/components/ComoLlegar";
import { LocationsMapLazy } from "@/components/LocationsMapLazy";
import { SchemaOrg } from "@/components/SchemaOrg";
import { breadcrumbSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Pizza para Llevar en Barcelona – Napolitana al Corte",
  description:
    'Pizza napolitana "de bolsillo" en formato 24 y 33 cm, lista para llevar. Da Nanni en el Barrio Gótico y el Raval, todos los días de 12:00 a 22:30h.',
  path: "/pizza-para-llevar",
  image: heroImageSrc(takeAwayLocations[0]),
});

const gotic = getLocationBySlug("gotic")!;
const ravalTakeAway = getLocationBySlug("raval-take-away")!;

export default function ParaLlevarPage() {
  const t = useTranslations("paraLlevar");

  return (
    <>
      <SchemaOrg
        data={breadcrumbSchema([
          { name: "Inicio", path: "/" },
          { name: "Pizza Para Llevar", path: "/pizza-para-llevar" },
        ])}
      />

      <HubHero
        locations={takeAwayLocations}
        eyebrow="Barcelona"
        h1={t("title")}
        sub={t("subtitle")}
      />

      {/* Promo del formato pequeño: solo existe hasta las 16:00h (misma
          regla que la nota de la carta en menu.ts — si cambia allí, cambiar aquí) */}
      <div className="mx-auto max-w-6xl px-4 pt-12 sm:pt-16">
        <aside className="flex flex-col items-start justify-between gap-4 rounded-[1.75rem] bg-mustard/15 p-6 ring-1 ring-mustard/30 sm:flex-row sm:items-center sm:p-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mustard">
              Solo hasta las 16:00h
            </p>
            <p className="mt-1.5 font-display text-xl tracking-tight text-cream sm:text-2xl">
              Pizza de bolsillo de 24 cm — Margherita por 3,50 €
            </p>
            <p className="mt-1 text-sm text-cream/75">
              Por la tarde seguimos con el formato grande de 33 cm hasta las
              22:30h.
            </p>
          </div>
          <Link
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            href={cartaHrefFor(gotic) as any}
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-mustard px-6 py-3 font-sans text-sm font-semibold text-night transition-colors duration-500 ease-fluid hover:bg-mustard-dark active:scale-[0.98]"
          >
            Ver la carta
          </Link>
        </aside>
      </div>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
        <h2 className="font-display text-3xl tracking-tight text-cream sm:text-4xl">
          {t("infoTitle")}
        </h2>
        <p className="mt-3 max-w-[55ch] text-cream/70">
          {t("intro")} {t("domicilioHint")}{" "}
          <Link
            href="/a-domicilio"
            className="font-medium underline underline-offset-2 hover:text-electric"
          >
            {t("domicilioLink")}
          </Link>
          .
        </p>

        <div className="mt-8 rounded-[1.75rem] bg-cream/5 p-2 ring-1 ring-cream/10">
          <LocationsMapLazy locations={takeAwayLocations} />
        </div>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {takeAwayLocations.map((location) => (
            <li
              key={location.slug}
              className="flex flex-col justify-between gap-4 rounded-[1.75rem] bg-night-soft p-6 shadow-card ring-1 ring-cream/10 sm:p-7"
            >
              <div>
                <p className="font-display text-xl tracking-tight text-cream">
                  {location.name}
                </p>
                <p className="mt-1.5 text-sm text-cream/70">
                  {location.address}
                </p>
                <p className="text-sm text-cream/70">
                  {hoursParts(location).days}
                  <br />
                  {hoursParts(location).times}
                </p>
                <a
                  href={location.phoneHref}
                  className="mt-1 inline-block text-sm font-medium text-cream transition-colors duration-200 hover:text-electric"
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

      <article className="mx-auto max-w-3xl px-4 pb-16 font-sans text-cream sm:pb-24">
        <h2 className="font-display text-3xl tracking-tight sm:text-4xl">
          Pizza al corte, al estilo de Nápoles
        </h2>
        <div className="mt-5 space-y-5 leading-relaxed text-cream/80">
          <p>
            En Nápoles la pizza también se come por la calle, doblada en
            cuatro. Esa es la idea de nuestros dos locales para llevar:{" "}
            <strong>pizza napolitana al corte</strong> en dos formatos,{" "}
            <strong>24 cm</strong> (la &quot;pizza de bolsillo&quot;,
            disponible hasta las 16:00h) y <strong>33 cm</strong>, recién
            salida del horno y lista en minutos, con{" "}
            <strong>horario corrido de 12:00 a 22:30h todos los días</strong>
            .
          </p>
          <p>
            El local de{" "}
            <Link
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              href={hrefFor(gotic) as any}
              className="font-medium underline underline-offset-2 hover:text-electric"
            >
              el Barrio Gótico
            </Link>{" "}
            está en Carrer de la Llibreteria, 10, a un paso de la Catedral de
            Barcelona: fue el primer Da Nanni y sigue siendo la parada
            perfecta entre callejuelas. El de{" "}
            <Link
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              href={hrefFor(ravalTakeAway) as any}
              className="font-medium underline underline-offset-2 hover:text-electric"
            >
              el Raval
            </Link>{" "}
            (Carrer dels Tallers, 72, a pasos del MACBA) suma barra y una
            pequeña terraza para comerla allí mismo.
          </p>
          <p>
            Los dos comparten la misma carta: 24 pizzas napolitanas, de la
            Margherita clásica a la Tartufata, con opciones vegetarianas y
            veganas. Puedes verla con foto y video de cada pizza en la{" "}
            <Link
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              href={cartaHrefFor(gotic) as any}
              className="font-medium underline underline-offset-2 hover:text-electric"
            >
              carta del Gòtic
            </Link>{" "}
            o la{" "}
            <Link
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              href={cartaHrefFor(ravalTakeAway) as any}
              className="font-medium underline underline-offset-2 hover:text-electric"
            >
              carta del Raval
            </Link>
            .
          </p>
        </div>
      </article>
    </>
  );
}
