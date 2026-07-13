import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { locations } from "@/data/locations";
import { LocationCard } from "@/components/LocationCard";
import { SchemaOrg } from "@/components/SchemaOrg";
import { breadcrumbSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Pizzería Napolitana en Barcelona – 6 Locales",
  description:
    "La auténtica pizza napolitana en Barcelona: masa de larga fermentación, horno de leña e ingredientes de la Campania. Seis pizzerías Da Nanni del Gòtic a Gràcia, para comer en mesa, llevar o pedir a domicilio.",
  path: "/pizzeria-napolitana-barcelona",
});

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

export default function PizzeriaNapolitanaPage() {
  return (
    <>
      <SchemaOrg
        data={breadcrumbSchema([
          { name: "Inicio", path: "/" },
          {
            name: "Pizzería Napolitana en Barcelona",
            path: "/pizzeria-napolitana-barcelona",
          },
        ])}
      />

      <header className="mx-auto w-full max-w-5xl px-4 pt-12 text-center text-cream sm:pt-16">
        <p className="eyebrow">Barcelona · Desde 2018</p>
        <h1 className="mx-auto mt-3 max-w-4xl font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
          Pizzería napolitana en Barcelona
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-cream/85">
          Somos una familia de Nápoles con seis pizzerías en Barcelona. La
          misma pizza napolitana de siempre —masa de larga fermentación e
          ingredientes que viajan directos desde la Campania— para comer en
          mesa, llevar paseando o pedir a domicilio.
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
            href="/pizza-para-llevar"
            className="inline-flex items-center justify-center rounded-full bg-cream/10 px-7 py-3 font-sans text-sm font-semibold text-cream ring-1 ring-cream/20 transition-colors duration-500 ease-fluid hover:bg-cream/15 active:scale-[0.98]"
          >
            Pizza para llevar
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <h2 className="font-display text-3xl tracking-tight text-cream sm:text-4xl">
          La auténtica pizza de Nápoles
        </h2>
        <p className="mt-3 max-w-[60ch] leading-relaxed text-cream/75">
          Para nosotros la cocina napolitana es sagrada: no hacemos
          concesiones. Cada pizza sale estirada a mano, de borde alveolado y
          ligero, horneada como manda la tradición.
        </p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-3">
          <li className="rounded-[1.25rem] bg-cream/5 p-5 ring-1 ring-cream/10">
            <p className="font-script text-2xl text-electric">La masa</p>
            <p className="mt-2 text-sm leading-relaxed text-cream/80">
              Larga fermentación para una masa ligera y digestiva, estirada a
              mano al momento en cada local.
            </p>
          </li>
          <li className="rounded-[1.25rem] bg-cream/5 p-5 ring-1 ring-cream/10">
            <p className="font-script text-2xl text-electric">
              Los ingredientes
            </p>
            <p className="mt-2 text-sm leading-relaxed text-cream/80">
              Tomate San Marzano, mozzarella de búfala campana DOP y harina
              que viajan directamente desde la Campania a Barcelona.
            </p>
          </li>
          <li className="rounded-[1.25rem] bg-cream/5 p-5 ring-1 ring-cream/10">
            <p className="font-script text-2xl text-electric">El horno</p>
            <p className="mt-2 text-sm leading-relaxed text-cream/80">
              Horno de leña en nuestras trattorias y pizza al corte recién
              hecha en los locales para llevar.
            </p>
          </li>
        </ul>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:pb-20">
        <h2 className="font-display text-3xl tracking-tight text-cream sm:text-4xl">
          Seis pizzerías del Gòtic a Gràcia
        </h2>
        <p className="mt-3 max-w-[60ch] leading-relaxed text-cream/75">
          Cuatro trattorias con servicio de mesa en el Born, el Raval,
          Poblenou y Gràcia, y dos locales de pizza para llevar en el Barrio
          Gótico y el Raval. Elige el que te quede más cerca.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {locations.map((location) => (
            <LocationCard key={location.slug} location={location} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:pb-24">
        <h2 className="font-display text-3xl tracking-tight text-cream sm:text-4xl">
          ¿Cómo la quieres hoy?
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Link
            href="/restaurantes"
            className="group rounded-[1.75rem] bg-night-soft p-6 shadow-card ring-1 ring-cream/10 transition-all duration-500 ease-fluid hover:-translate-y-1 sm:p-7"
          >
            <p className="font-display text-xl text-cream group-hover:text-electric">
              En la mesa
            </p>
            <p className="mt-2 text-sm leading-relaxed text-cream/75">
              Cuatro restaurantes italianos con horno de leña, pasta fresca y
              vinos italianos. Reserva por teléfono.
            </p>
          </Link>
          <Link
            href="/pizza-para-llevar"
            className="group rounded-[1.75rem] bg-night-soft p-6 shadow-card ring-1 ring-cream/10 transition-all duration-500 ease-fluid hover:-translate-y-1 sm:p-7"
          >
            <p className="font-display text-xl text-cream group-hover:text-electric">
              Para llevar
            </p>
            <p className="mt-2 text-sm leading-relaxed text-cream/75">
              Pizza napolitana &quot;de bolsillo&quot; al corte, en formato 24
              y 33 cm, lista en minutos en el Gòtic y el Raval.
            </p>
          </Link>
          <Link
            href="/a-domicilio"
            className="group rounded-[1.75rem] bg-night-soft p-6 shadow-card ring-1 ring-cream/10 transition-all duration-500 ease-fluid hover:-translate-y-1 sm:p-7"
          >
            <p className="font-display text-xl text-cream group-hover:text-electric">
              A domicilio
            </p>
            <p className="mt-2 text-sm leading-relaxed text-cream/75">
              Del horno a tu casa por Glovo o Just Eat desde el Gòtic, Born,
              Poblenou y Gràcia.
            </p>
          </Link>
        </div>
        <p className="mt-8 leading-relaxed text-cream/75">
          ¿Quieres ver qué sale de nuestras cocinas antes de decidir? Echa un
          vistazo a{" "}
          <Link
            href="/restaurantes/cartas"
            className="font-medium underline underline-offset-2 hover:text-electric"
          >
            la carta
          </Link>
          , con foto y video de cada plato, o descubre{" "}
          <Link
            href="/nuestra-historia"
            className="font-medium underline underline-offset-2 hover:text-electric"
          >
            nuestra historia
          </Link>
          : la de una familia napolitana que en 2018 empezó vendiendo pizza al
          corte junto a la Catedral y hoy lleva su trattoria por toda
          Barcelona.
        </p>
      </section>
    </>
  );
}
