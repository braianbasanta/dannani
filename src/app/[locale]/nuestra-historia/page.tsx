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
  title: "Nuestra Historia",
  description:
    "Da Nanni nace en 2017 de una familia napolitana en Barcelona. Descubre la historia detrás de nuestra sirena Partenope, nuestra mascota Nanni y cada local que hemos abierto.",
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
              <p className="eyebrow">Bienvenidos a nuestra historia</p>
              <h1 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight sm:text-6xl">
                De Nápoles a Barcelona
              </h1>
              <p className="mt-6 max-w-md leading-relaxed text-cream/75">
                En 2017 tuvimos una idea sencilla: traer la auténtica cocina
                napolitana a las calles de Barcelona, sin atajos. Masa de
                larga fermentación, horno de leña encendido los siete días
                de la semana y una familia napolitana detrás de cada mesa.
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
                  src="/images/historia/fontana-sirena-partenope.jpg"
                  alt="Fontana della Sirena Partenope, en Nápoles"
                  fill
                  sizes="(min-width: 768px) 40vw, 100vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="mt-3 text-xs text-cream/55 sm:text-sm">
                Fontana della Sirena Partenope · Piazza Sannazaro, Nápoles
              </figcaption>
            </figure>
          </div>
        }
      />

      <article className="mx-auto max-w-3xl px-4 py-16 font-sans text-teal-dark sm:py-20">
        <h2 className="font-display text-2xl text-teal-dark sm:text-3xl">
          Nápoles en el corazón
        </h2>
        <p className="mt-3 leading-relaxed">
          Cada plato de nuestra cocina es una celebración de la riqueza
          culinaria de Nápoles, preparado con pasión e ingredientes
          genuinos. En la base de nuestra filosofía culinaria está la pizza
          napolitana: masa de larga fermentación e ingredientes frescos,
          una declaración de amor por la tradición y la excelencia
          culinaria.
        </p>

        <p className="mt-6 rounded-xl bg-teal-dark/5 px-5 py-4 text-sm italic text-teal-dark/80">
          &ldquo;Usamos solo los mejores ingredientes para lograr sabores
          excepcionales.&rdquo;
        </p>

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
            <div className="absolute inset-0 bg-gradient-to-t from-teal-dark/90 via-teal-dark/30 to-transparent" />
            <div className="relative p-6 text-cream">
              <p className="font-display text-xl">Restaurantes</p>
              <p className="mt-1 text-sm text-cream/80">
                Born · Raval · Poblenou · Gràcia
              </p>
            </div>
          </Link>
          <Link
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            href={"/para-llevar" as any}
            className="group relative flex aspect-[4/3] items-end overflow-hidden rounded-2xl"
          >
            <Image
              src={heroImageSrc(gotic)}
              alt="Pizza para llevar Da Nanni"
              fill
              sizes="(min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-teal-dark/90 via-teal-dark/30 to-transparent" />
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
