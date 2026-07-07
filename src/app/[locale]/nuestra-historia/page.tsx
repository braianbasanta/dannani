import Image from "next/image";
import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { getLocationBySlug, hrefFor, heroImageSrc } from "@/data/locations";
import { SchemaOrg } from "@/components/SchemaOrg";
import { breadcrumbSchema } from "@/lib/schema";
import { HistoriaTimeline } from "@/components/HistoriaTimeline";
import type { Milestone } from "@/components/HistoriaTimeline";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Nuestra Historia – Un Viaje de Nápoles a Barcelona",
  description:
    "Da Nanni nace en 2018 de una familia napolitana en Barcelona. Descubre la historia detrás de nuestra sirena Partenope, nuestra mascota Nanni y cada local que hemos abierto.",
  path: "/nuestra-historia",
});

const gotic = getLocationBySlug("gotic")!;
const ravalTakeAway = getLocationBySlug("raval-take-away")!;
const poblenou = getLocationBySlug("poblenou")!;
const born = getLocationBySlug("born")!;
const raval = getLocationBySlug("raval")!;
const gracia = getLocationBySlug("gracia")!;

const milestones: Milestone[] = [
  {
    date: "Julio 2018",
    title: gotic.name,
    copy: "La primera pizza de bolsillo de Barcelona: pizza al corte para llevar en la Llibreteria, junto a la Catedral.",
    href: hrefFor(gotic),
    icon: "pin",
    image: "/images/llibreteria/03.jpg",
  },
  {
    date: "Febrero 2021",
    title: ravalTakeAway.name,
    copy: "Segundo local para llevar, con barra y terraza a pasos del MACBA, en pleno Raval.",
    href: hrefFor(ravalTakeAway),
    icon: "pin",
    image: "/images/tallers72/06.jpg",
  },
  {
    date: "Agosto 2021",
    title: poblenou.name,
    copy: "Trattoria con terraza en la Rambla del Poblenou, el Da Nanni más cerca del mar.",
    href: hrefFor(poblenou),
    icon: "pin",
    image: "/images/poblenou/06.jpg",
  },
  {
    date: "Junio 2022",
    title: born.name,
    copy: "Horno de leña y servicio de mesa junto a la Basílica de Santa Maria del Mar, en el Born.",
    href: hrefFor(born),
    icon: "pin",
    image: "/images/rec/03.jpg",
  },
  {
    date: "Febrero 2023",
    title: raval.name,
    copy: "Trattoria con servicio de mesa, justo enfrente de nuestro local para llevar del Raval.",
    href: hrefFor(raval),
    icon: "pin",
    image: "/images/tallers69/05.jpg",
  },
  {
    date: "Julio 2023",
    title: gracia.name,
    copy: "La carta más completa del grupo, en plena Carrer de Verdi de Gràcia.",
    href: hrefFor(gracia),
    icon: "pin",
    image: "/images/verdi/02.jpg",
  },
];

export default function NuestraHistoriaPage() {
  return (
    <>
      <SchemaOrg
        data={breadcrumbSchema([
          { name: "Inicio", path: "/" },
          { name: "Nuestra Historia", path: "/nuestra-historia" },
        ])}
      />

      <HistoriaTimeline
        milestones={milestones}
        header={
          <div className="grid items-center gap-12 md:grid-cols-2 lg:gap-16">
            <div>
              <p className="eyebrow">Ristorante e Pizzeria Napoletana</p>
              <h1 className="mt-3 font-script text-5xl leading-[1.1] sm:text-7xl">
                Un viaje de Nápoles a Barcelona, bocado a bocado
              </h1>
              <p className="mt-6 max-w-md leading-relaxed text-cream/75">
                En 2018, en el corazón vibrante de Barcelona, nace Da Nanni.
                No un simple restaurante, sino una promesa de amor nacida del
                encuentro entre dos culturas extraordinarias. La capital
                catalana nos acogió con los brazos abiertos, convirtiéndose
                en nuestro segundo hogar: una tierra generosa que hemos
                decidido corresponder trayendo con nosotros el tesoro más
                preciado que poseemos, la tradición gastronómica de Nápoles.
              </p>
              <p className="mt-4 max-w-md leading-relaxed text-cream/75">
                El logo lleva a Partenope, la sirena fundadora de Nápoles.
                El nombre Nanni honra al pequeño de la casa —que también
                verás aparecer por ahí, con una porción de pizza en la
                boca— y ese espíritu se siente en cada local, en la música
                y en las conversaciones de nuestros compañeros.
              </p>
            </div>

            <figure>
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] shadow-card">
                <Image
                  src="/images/historia/nanni-nino-pizza.jpg"
                  alt="Nanni, el pequeño de la casa, comiendo una porción de pizza"
                  fill
                  sizes="(min-width: 768px) 40vw, 100vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="mt-3 text-xs text-cream/55 sm:text-sm">
                Nanni, el pequeño de la casa
              </figcaption>
            </figure>
          </div>
        }
      />

      <article className="mx-auto max-w-3xl px-4 py-16 font-sans text-cream sm:py-20">
        <h2 className="font-script text-4xl text-cream sm:text-5xl">
          La filosofía: respeto y autenticidad
        </h2>
        <p className="mt-3 leading-relaxed">
          ¿Nuestro secreto? No hacer concesiones. Para nosotros, la cocina
          napolitana es sagrada. Por este motivo, cada ingrediente clave
          —desde los tomates San Marzano bañados por el sol hasta la
          mozzarella de búfala campana DOP, pasando por la harina de
          nuestras masas— viaja directamente desde la Campania a Barcelona.
          Respetamos las materias primas para no desvirtuar jamás los
          sabores genuinos de nuestra infancia, garantizando la
          autenticidad de recetas transmitidas de generación en generación.
        </p>

        <h2 className="mt-14 font-script text-4xl text-cream sm:text-5xl">
          Nuestro manifiesto: pizza, pasta y hospitalidad
        </h2>
        <p className="mt-3 leading-relaxed">
          En Da Nanni, la experiencia no se detiene en el plato. Lo que nos
          distingue desde 2018 es una tríada indisoluble:
        </p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-3">
          <li className="rounded-[1.25rem] bg-cream/5 p-5 ring-1 ring-cream/10">
            <p className="font-script text-2xl text-electric">La pizza</p>
            <p className="mt-2 text-sm leading-relaxed text-cream/80">
              Estirada a mano, de borde alveolado y ligero, horneada como
              manda la tradición.
            </p>
          </li>
          <li className="rounded-[1.25rem] bg-cream/5 p-5 ring-1 ring-cream/10">
            <p className="font-script text-2xl text-electric">La pasta</p>
            <p className="mt-2 text-sm leading-relaxed text-cream/80">
              Trefilada al bronce, unida a salsas lentas y sabrosas que
              huelen a hogar.
            </p>
          </li>
          <li className="rounded-[1.25rem] bg-cream/5 p-5 ring-1 ring-cream/10">
            <p className="font-script text-2xl text-electric">
              La hospitalidad
            </p>
            <p className="mt-2 text-sm leading-relaxed text-cream/80">
              Ese calor espontáneo y generoso que hace que cualquiera se
              sienta un invitado de honor, no un simple cliente.
            </p>
          </li>
        </ul>

        <div className="mt-14 grid items-center gap-8 sm:grid-cols-[1.35fr_1fr]">
          <div>
            <h2 className="font-script text-4xl text-cream sm:text-5xl">
              Un viaje papilar único
            </h2>
            <p className="mt-3 leading-relaxed">
              Cruzar el umbral de Da Nanni significa cerrar los ojos en
              Barcelona y abrirlos frente al Golfo de Nápoles. Queremos que
              el vuestro sea un verdadero viaje papilar: una experiencia
              sensorial donde el aroma de la albahaca fresca, la calidez de
              la bienvenida y la autenticidad de los sabores os
              transportarán directamente a los callejones napolitanos.
            </p>
            <p className="neon-blue mt-8 font-script text-3xl sm:text-4xl">
              Bienvenidos a nuestra tierra. Bienvenidos a Da Nanni.
            </p>
          </div>

          <figure className="sm:-rotate-1">
            <div className="relative aspect-[3/4] overflow-hidden rounded-[1.75rem] shadow-card ring-1 ring-cream/10">
              <Image
                src="/images/historia/fontana-sirena-partenope.jpg"
                alt="Fontana della Sirena Partenope, en Nápoles"
                fill
                sizes="(min-width: 640px) 33vw, 100vw"
                loading="lazy"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-3 text-xs text-cream/55 sm:text-sm">
              Fontana della Sirena Partenope · Piazza Sannazaro, Nápoles
            </figcaption>
          </figure>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2">
          <Link
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            href={"/restaurantes" as any}
            className="group relative flex aspect-[4/3] items-end overflow-hidden rounded-2xl"
          >
            <Image
              src={heroImageSrc(born)}
              alt="Restaurantes Da Nanni"
              fill
              sizes="(min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-night/90 via-night/30 to-transparent" />
            <div className="relative p-6 text-cream">
              <p className="font-display text-xl">Restaurantes</p>
              <p className="mt-1 text-sm text-cream/80">
                Born · Raval · Poblenou · Gràcia
              </p>
            </div>
          </Link>
          <Link
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            href={"/pizza-para-llevar" as any}
            className="group relative flex aspect-[4/3] items-end overflow-hidden rounded-2xl"
          >
            <Image
              src={heroImageSrc(gotic)}
              alt="Pizza para llevar Da Nanni"
              fill
              sizes="(min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-night/90 via-night/30 to-transparent" />
            <div className="relative p-6 text-cream">
              <p className="font-display text-xl">Para llevar</p>
              <p className="mt-1 text-sm text-cream/80">Gòtic · Raval</p>
            </div>
          </Link>
        </div>
      </article>
    </>
  );
}
