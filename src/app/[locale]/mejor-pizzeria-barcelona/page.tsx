import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { locations, getLocationBySlug, hrefFor } from "@/data/locations";
import { reviewsByLocationSlug } from "@/data/reviews";
import { SchemaOrg } from "@/components/SchemaOrg";
import { breadcrumbSchema } from "@/lib/schema";
import { FaqSection } from "@/components/FaqSection";
import { pageMetadata } from "@/lib/seo";

const ratingFormat = new Intl.NumberFormat("es-ES", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const reviewsFormat = new Intl.NumberFormat("es-ES");

const ratedLocations = locations.filter(
  (l) => l.googleRating !== undefined && l.googleReviewCount !== undefined
);
const totalReviewCount = ratedLocations.reduce(
  (sum, l) => sum + (l.googleReviewCount ?? 0),
  0
);
const aggregateRating =
  ratedLocations.reduce(
    (sum, l) => sum + (l.googleRating ?? 0) * (l.googleReviewCount ?? 0),
    0
  ) / totalReviewCount;
const byRating = [...ratedLocations].sort(
  (a, b) => (b.googleRating ?? 0) - (a.googleRating ?? 0)
);
const topRated = byRating[0];

/** Citas literales de Google curadas por autor; si una reseña desaparece de
 * reviews.ts, el build falla a propósito (mismo criterio que featured.ts). */
const QUOTE_PICKS = [
  { slug: "gotic", author: "Juan Manuel Cotolio" },
  { slug: "born", author: "Noel Perez Fernandez" },
  { slug: "raval", author: "Adriana Rubio Romero" },
  { slug: "raval", author: "Manel Rossy" },
];
const quotes = QUOTE_PICKS.map(({ slug, author }) => {
  const review = reviewsByLocationSlug[slug]?.find((r) => r.author === author);
  const location = getLocationBySlug(slug);
  if (!review || !location) {
    throw new Error(
      `mejor-pizzeria-barcelona: no existe la reseña de "${author}" en "${slug}"`
    );
  }
  return { ...review, location };
});

export const metadata: Metadata = pageMetadata({
  title: `Mejor Pizzería de Barcelona – Lo Dicen ${reviewsFormat.format(totalReviewCount)} Reseñas`,
  description: `¿Buscas la mejor pizzería de Barcelona? Las 6 pizzerías napolitanas Da Nanni suman ${reviewsFormat.format(totalReviewCount)} reseñas en Google con ${ratingFormat.format(aggregateRating)}★ de media. Del Gòtic a Gràcia, pizza al corte desde 3 € o trattoria con horno de leña.`,
  path: "/mejor-pizzeria-barcelona",
});

const OCCASIONS = [
  {
    title: "La mejor valorada",
    slug: "raval",
    text: "Da Nanni Tallers, 4,7★: trattoria napolitana con servicio completo en Carrer dels Tallers 69, junto a Plaça de Catalunya.",
  },
  {
    title: "La original, desde 2018",
    slug: "gotic",
    text: "El primer Da Nanni, junto a la Catedral: pizza al corte en formato 24 y 33 cm desde 3 €, y el local con más reseñas del grupo.",
  },
  {
    title: "Para cenar en el Born",
    slug: "born",
    text: "Techos altos, horno de leña y el ambiente histórico de una de las calles con más carácter del barrio, a pasos de Santa Maria del Mar.",
  },
  {
    title: "Cerca de la playa",
    slug: "poblenou",
    text: "En la Rambla del Poblenou, el Da Nanni más cercano al mar, con horario corrido de mediodía a medianoche y terraza.",
  },
  {
    title: "La carta más completa",
    slug: "gracia",
    text: "En Carrer de Verdi, Gràcia: pizza, antipasti, pasta fresca y una selecta carta de vinos italianos.",
  },
  {
    title: "Parada rápida en el Raval",
    slug: "raval-take-away",
    text: "Pizza de bolsillo junto al MACBA, con barra y una pequeña terraza para no perder el ritmo del día.",
  },
];

const FAQ_ITEMS = [
  {
    q: "¿Cuál es la mejor pizzería de Barcelona?",
    a: `Según las valoraciones de Google, la mejor puntuada de nuestros seis locales es ${topRated.name}, con ${ratingFormat.format(topRated.googleRating ?? 0)} estrellas. En conjunto, las seis pizzerías Da Nanni suman más de ${reviewsFormat.format(totalReviewCount)} reseñas con una media de ${ratingFormat.format(aggregateRating)}.`,
  },
  {
    q: "¿Cuánto cuesta comer en Da Nanni?",
    a: "Desde 3 € por una marinara al corte en los take away del Gòtic y el Raval. En formato grande de 33 cm, las pizzas van de 6 a 13 €, y en las trattorias puedes añadir antipasti, pasta fresca y vino italiano.",
  },
  {
    q: "¿Hace falta reservar mesa?",
    a: "En las cuatro trattorias (Born, Tallers, Poblenou y Gràcia) se reserva por teléfono. Los dos locales take away del Gòtic y el Raval no necesitan reserva: pides y en unos minutos tienes tu pizza.",
  },
  {
    q: "¿Hacen pizza a domicilio?",
    a: "Sí. Los locales del Gòtic, Born, Poblenou y Gràcia reparten a domicilio a través de Glovo y Just Eat.",
  },
];

export default function MejorPizzeriaPage() {
  return (
    <>
      <SchemaOrg
        data={breadcrumbSchema([
          { name: "Inicio", path: "/" },
          {
            name: "Mejor Pizzería de Barcelona",
            path: "/mejor-pizzeria-barcelona",
          },
        ])}
      />

      <header className="mx-auto w-full max-w-5xl px-4 pt-12 text-center text-cream sm:pt-16">
        <p className="eyebrow">Barcelona · 6 locales</p>
        <h1 className="mx-auto mt-3 max-w-4xl font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
          ¿La mejor pizzería de Barcelona? Lo dicen las reseñas
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-cream/85">
          No vamos a decirte que somos la mejor pizzería de Barcelona: eso lo
          deciden los que comen aquí cada día. Seis locales napolitanos, del
          Gòtic a Gràcia, y miles de opiniones públicas en Google que puedes
          comprobar antes de venir.
        </p>
        <p className="mt-5 text-sm text-cream/70">
          <span className="font-semibold text-mustard">
            ★ {ratingFormat.format(aggregateRating)}
          </span>{" "}
          de valoración media · {reviewsFormat.format(totalReviewCount)}{" "}
          reseñas en Google
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/restaurantes"
            className="inline-flex items-center justify-center rounded-full bg-electric px-7 py-3 font-sans text-sm font-semibold text-night transition-colors duration-500 ease-fluid hover:bg-electric-dark active:scale-[0.98]"
          >
            Reservar mesa
          </Link>
          <Link
            href="/restaurantes/cartas"
            className="inline-flex items-center justify-center rounded-full bg-cream/10 px-7 py-3 font-sans text-sm font-semibold text-cream ring-1 ring-cream/20 transition-colors duration-500 ease-fluid hover:bg-cream/15 active:scale-[0.98]"
          >
            Ver las cartas
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <h2 className="font-display text-3xl tracking-tight text-cream sm:text-4xl">
          Los números, local a local
        </h2>
        <p className="mt-3 max-w-[60ch] leading-relaxed text-cream/75">
          Valoraciones públicas en la ficha de Google de cada local (julio de
          2026). Sin trampas: también verás cuál tiene la nota más baja.
        </p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {byRating.map((location) => (
            <li key={location.slug}>
              <Link
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                href={hrefFor(location) as any}
                className="group block rounded-[1.5rem] bg-cream/5 p-6 ring-1 ring-cream/10 transition-all duration-500 ease-fluid hover:-translate-y-1 hover:ring-cream/25"
              >
                <p className="font-display text-3xl text-mustard">
                  ★ {ratingFormat.format(location.googleRating ?? 0)}
                </p>
                <p className="mt-1 text-xs text-cream/60">
                  {reviewsFormat.format(location.googleReviewCount ?? 0)}{" "}
                  reseñas
                </p>
                <p className="mt-3 font-display text-lg text-cream group-hover:text-electric">
                  {location.name}
                </p>
                <p className="mt-1 text-sm text-cream/70">{location.address}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:pb-20">
        <h2 className="font-display text-3xl tracking-tight text-cream sm:text-4xl">
          Lo que dicen, palabra por palabra
        </h2>
        <p className="mt-3 max-w-[60ch] leading-relaxed text-cream/75">
          Citas literales de reseñas de Google, verificables en la ficha de
          cada local.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {quotes.map((quote) => (
            <figure
              key={quote.author}
              className="rounded-[1.5rem] bg-night-soft p-6 shadow-card ring-1 ring-cream/10 sm:p-7"
            >
              <blockquote className="text-sm leading-relaxed text-cream/85">
                &ldquo;{quote.text}&rdquo;
              </blockquote>
              <figcaption className="mt-4 text-xs text-cream/60">
                <span className="font-semibold text-cream/80">
                  {quote.author}
                </span>{" "}
                · reseña de Google en {quote.location.name}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:pb-20">
        <h2 className="font-display text-3xl tracking-tight text-cream sm:text-4xl">
          La mejor según lo que busques
        </h2>
        <p className="mt-3 max-w-[60ch] leading-relaxed text-cream/75">
          &ldquo;La mejor&rdquo; depende del plan: no es lo mismo una cena
          tranquila que una pizza al corte entre museo y museo.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {OCCASIONS.map((occasion) => {
            const location = getLocationBySlug(occasion.slug);
            if (!location) {
              throw new Error(
                `mejor-pizzeria-barcelona: slug desconocido "${occasion.slug}"`
              );
            }
            return (
              <Link
                key={occasion.title}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                href={hrefFor(location) as any}
                className="group rounded-[1.75rem] bg-night-soft p-6 shadow-card ring-1 ring-cream/10 transition-all duration-500 ease-fluid hover:-translate-y-1 sm:p-7"
              >
                <p className="font-script text-2xl text-electric">
                  {occasion.title}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-cream/80">
                  {occasion.text}
                </p>
              </Link>
            );
          })}
        </div>
        <p className="mt-8 leading-relaxed text-cream/75">
          ¿Quieres saber qué hace distinta a una pizza napolitana de verdad
          —la masa, el San Marzano, el horno de leña—? Te lo contamos en{" "}
          <Link
            href="/pizzeria-napolitana-barcelona"
            className="font-medium underline underline-offset-2 hover:text-electric"
          >
            nuestra página de pizza napolitana
          </Link>
          , o ve directo a{" "}
          <Link
            href="/restaurantes/cartas"
            className="font-medium underline underline-offset-2 hover:text-electric"
          >
            las cartas
          </Link>
          , con foto y video de cada plato.
        </p>
      </section>

      <FaqSection items={FAQ_ITEMS} />
    </>
  );
}
