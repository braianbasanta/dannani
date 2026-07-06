import Image from "next/image";
import { useTranslations } from "next-intl";
import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { SchemaOrg } from "@/components/SchemaOrg";
import { organizationSchema } from "@/lib/schema";
import {
  locations,
  dineInLocations,
  takeAwayLocations,
  hrefFor,
  heroImageSrc,
  type Location,
} from "@/data/locations";
import { reviewsByLocationSlug } from "@/data/reviews";
import { ReviewsMarquee } from "@/components/ReviewsMarquee";
import { AutoplayVideo } from "@/components/AutoplayVideo";
import { PhoneFrame } from "@/components/PhoneFrame";
import { Reveal } from "@/components/Reveal";
import { FeaturedDishesCarousel } from "@/components/FeaturedDishesCarousel";
import { LocationsMapLazy } from "@/components/LocationsMapLazy";
import { featuredDishEntries } from "@/data/featured";
import { heroClip, experienceClips } from "@/data/experience";

const ratingFormat = new Intl.NumberFormat("es-ES", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const countFormat = new Intl.NumberFormat("es-ES", { useGrouping: "always" });

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
// Redondeado hacia abajo a la decena de 50 más cercana: cifra estable que no
// hay que actualizar cada vez que se suma alguna reseña nueva en Google.
const roundedReviewCount = Math.floor(totalReviewCount / 50) * 50;

// Todas las reseñas reales (src/data/reviews.ts) de los 6 locales, con el
// rating real de cada local (locations.ts) para las estrellas de su tarjeta.
const marqueeReviews = Object.entries(reviewsByLocationSlug).flatMap(
  ([slug, reviews]) => {
    const location = locations.find((l) => l.slug === slug);
    if (!location) return [];
    return reviews.map((review) => ({
      author: review.author,
      text: review.text,
      neighborhood: location.neighborhood,
      rating: Math.round(location.googleRating ?? 5),
    }));
  }
);

const HOME_TITLE =
  "Da Nanni – Pizzería Napolitana y Restaurante Italiano en Barcelona";
const HOME_DESCRIPTION =
  "Pizza napolitana de masa de larga fermentación en 6 locales de Barcelona: trattorias con horno de leña en Born, Raval, Gràcia y Poblenou, y pizza para llevar en el Gòtic y el Raval.";

export const metadata: Metadata = {
  title: { absolute: HOME_TITLE },
  description: HOME_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    url: "/",
    type: "website",
    siteName: "Da Nanni",
    locale: "es_ES",
    images: [{ url: "/images/og/home.jpg", width: 1200, height: 630 }],
  },
};

function ArrowIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      aria-hidden
    >
      <path
        d="M5 12h14M13 6l6 6-6 6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CtaPill({
  href,
  color,
  children,
}: {
  href: "/restaurantes" | "/para-llevar" | "/nuestra-historia";
  color: "mustard" | "teal";
  children: React.ReactNode;
}) {
  const colors =
    color === "mustard"
      ? "bg-mustard hover:bg-mustard-dark"
      : "bg-teal hover:bg-teal-dark";
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-3 rounded-full py-1.5 pl-6 pr-1.5 font-sans text-sm font-semibold text-cream shadow-card transition-all duration-500 ease-fluid hover:-translate-y-0.5 hover:shadow-card-hover active:scale-[0.98] ${colors}`}
    >
      {children}
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cream/15 transition-transform duration-500 ease-fluid group-hover:translate-x-0.5">
        <ArrowIcon />
      </span>
    </Link>
  );
}

function LocationTile({
  location,
  badge,
}: {
  location: Location;
  badge: string;
}) {
  return (
    <Link
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      href={hrefFor(location) as any}
      className="group relative aspect-[4/3] overflow-hidden rounded-2xl"
    >
      <Image
        src={heroImageSrc(location)}
        alt={location.name}
        fill
        sizes="(min-width: 1024px) 25vw, 50vw"
        loading="lazy"
        className="object-cover transition-transform duration-700 ease-fluid group-hover:scale-[1.05]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-teal-dark/85 via-teal-dark/25 to-transparent" />
      <span
        aria-hidden
        className="absolute right-3 top-3 flex h-9 w-9 -translate-y-1 items-center justify-center rounded-full bg-cream/90 text-teal-dark opacity-0 backdrop-blur-sm transition-all duration-500 ease-fluid group-hover:translate-y-0 group-hover:opacity-100"
      >
        <span className="-rotate-45">
          <ArrowIcon />
        </span>
      </span>
      <div className="absolute inset-x-0 bottom-0 p-4 text-cream sm:p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cream/75">
          {badge}
        </p>
        <p className="font-display text-xl tracking-tight sm:text-2xl">
          {location.neighborhood}
        </p>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const t = useTranslations("home");
  const tBadges = useTranslations("badges");

  return (
    <>
      <SchemaOrg data={organizationSchema()} />

      {/* 1 · Hero: claim + video vertical del horno de leña dentro de una
          silueta de iPhone (como un reel). Fondo claro con luz ambiental. */}
      <section className="relative overflow-hidden">
        {/* Luz ambiental: rompe la planitud del cream sin tocar el contenido */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-32 right-[-8%] h-[32rem] w-[32rem] rounded-full bg-mustard/10 blur-3xl" />
          <div className="absolute bottom-[-35%] left-[-12%] h-[28rem] w-[28rem] rounded-full bg-teal/[0.08] blur-3xl" />
        </div>

        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-10 sm:pt-14 md:grid-cols-[1fr_auto] md:gap-16 md:pb-24 md:pt-16">
          <div>
            <p className="eyebrow animate-fade-up">{t("eyebrow")}</p>
            <h1 className="mt-4 max-w-2xl animate-fade-up font-display text-4xl leading-[1.05] tracking-tight text-teal-dark [animation-delay:100ms] sm:text-5xl lg:text-6xl xl:text-7xl">
              {t.rich("h1", {
                i: (chunks) => (
                  <em className="italic text-mustard-dark">{chunks}</em>
                ),
              })}
            </h1>
            <p className="mt-6 max-w-md animate-fade-up text-lg leading-relaxed text-teal-dark/75 [animation-delay:200ms]">
              {t("claim")}
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3 animate-fade-up [animation-delay:300ms]">
              <CtaPill href="/restaurantes" color="mustard">
                {t("ctaComerAqui")}
              </CtaPill>
              <CtaPill href="/para-llevar" color="teal">
                {t("ctaParaLlevar")}
              </CtaPill>
            </div>
            <div className="mt-8 flex items-center gap-2 animate-fade-up font-sans text-sm text-teal-dark/70 [animation-delay:400ms]">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="#d98e2b"
                aria-hidden
              >
                <path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.2l-6.1 3.4 1.4-6.8L2.2 9.1l6.9-.8L12 2z" />
              </svg>
              <span className="font-semibold text-teal-dark">
                {ratingFormat.format(aggregateRating)}
              </span>
              <span aria-hidden>·</span>
              <span>
                {t("heroResenas", {
                  count: `${countFormat.format(roundedReviewCount)}+`,
                })}
              </span>
            </div>
          </div>

          <div className="mx-auto w-60 animate-fade-up [animation-delay:200ms] sm:w-72 lg:w-80">
            <PhoneFrame className="md:rotate-[1.5deg]">
              <AutoplayVideo
                priority
                src={heroClip.video}
                poster={heroClip.poster}
                aria-label={heroClip.alt}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </PhoneFrame>
          </div>
        </div>
      </section>

      {/* 2 · Platos destacados: crear el antojo antes de pedir la decisión */}
      <section className="relative overflow-hidden border-t border-teal-dark/10 bg-teal-dark/[0.03] py-20 sm:py-28">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 right-[-6%] h-96 w-96 rounded-full bg-mustard/[0.07] blur-3xl"
        />
        <div className="mx-auto max-w-6xl px-4">
          <Reveal>
            <h2 className="font-display text-4xl tracking-tight text-teal-dark sm:text-5xl">
              {t("platosTitle")}
            </h2>
            <p className="mt-4 max-w-[55ch] text-lg text-teal-dark/70">
              {t("platosSubtitle")}
            </p>
          </Reveal>
        </div>
        <div className="mt-10 sm:mt-12">
          <FeaturedDishesCarousel entries={featuredDishEntries} />
        </div>
      </section>

      {/* 3 · Decisión: comer aquí o para llevar */}
      <section className="border-t border-teal-dark/10 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal>
            <h2 className="font-display text-4xl tracking-tight text-teal-dark sm:text-5xl">
              {t("dondeTitle")}
            </h2>
          </Reveal>

          <div className="mt-12 space-y-14 sm:space-y-16">
            <Reveal>
              <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-dark/50">
                    {t("dondeRestaurantesBarrios")}
                  </p>
                  <h3 className="mt-2 font-display text-2xl tracking-tight text-teal-dark sm:text-3xl">
                    {t("dondeRestaurantesTitle")}
                  </h3>
                  <p className="mt-2 max-w-[55ch] text-teal-dark/70">
                    {t("dondeRestaurantesText")}
                  </p>
                </div>
                <Link
                  href="/restaurantes"
                  className="inline-flex items-center gap-2 font-sans text-sm font-semibold text-teal transition-colors duration-300 hover:text-teal-dark"
                >
                  {t("dondeRestaurantesCta")}
                  <ArrowIcon />
                </Link>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                {dineInLocations.map((location) => (
                  <LocationTile
                    key={location.slug}
                    location={location}
                    badge={tBadges("dineIn")}
                  />
                ))}
              </div>
            </Reveal>

            <Reveal>
              <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-dark/50">
                    {t("dondeLlevarBarrios")}
                  </p>
                  <h3 className="mt-2 font-display text-2xl tracking-tight text-teal-dark sm:text-3xl">
                    {t("dondeLlevarTitle")}
                  </h3>
                  <p className="mt-2 max-w-[55ch] text-teal-dark/70">
                    {t("dondeLlevarText")}
                  </p>
                </div>
                <Link
                  href="/para-llevar"
                  className="inline-flex items-center gap-2 font-sans text-sm font-semibold text-teal transition-colors duration-300 hover:text-teal-dark"
                >
                  {t("dondeLlevarCta")}
                  <ArrowIcon />
                </Link>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                {takeAwayLocations.map((location) => (
                  <LocationTile
                    key={location.slug}
                    location={location}
                    badge={tBadges("takeAway")}
                  />
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 4 · Experiencia: el ambiente de los locales, en video */}
      <section className="relative overflow-hidden bg-teal-dark py-20 sm:py-28">
        {/* Profundidad del bloque oscuro: luz cenital + palabra editorial */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 left-1/2 h-[30rem] w-[46rem] -translate-x-1/2 rounded-full bg-teal/25 blur-3xl" />
          <p className="absolute -bottom-6 right-0 select-none font-display text-[7rem] italic leading-none tracking-tight text-cream/[0.05] sm:-bottom-10 sm:text-[12rem]">
            Napoli
          </p>
        </div>
        <div className="relative mx-auto max-w-6xl px-4">
          <Reveal>
            <h2 className="font-display text-4xl tracking-tight text-cream sm:text-5xl">
              {t("experienciaTitle")}
            </h2>
            <p className="mt-4 max-w-[55ch] text-lg text-cream/70">
              {t("experienciaSubtitle")}
            </p>
          </Reveal>
        </div>
        <div className="relative mt-10 flex snap-x snap-mandatory gap-3 overflow-x-auto px-[max(1rem,calc((100vw-72rem)/2))] scroll-px-[max(1rem,calc((100vw-72rem)/2))] pb-3 [scrollbar-width:none] sm:mt-12 sm:gap-4 [&::-webkit-scrollbar]:hidden">
          {experienceClips.map((clip) => (
            <div
              key={clip.slug}
              className="relative aspect-[9/16] w-[200px] shrink-0 snap-start overflow-hidden rounded-2xl bg-black/20 sm:w-[240px]"
            >
              <AutoplayVideo
                src={clip.video}
                poster={clip.poster}
                aria-label={clip.alt}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      </section>

      {/* 5 · Prueba social: reseñas reales de Google agregadas de los 6 locales */}
      <section className="bg-teal-dark/[0.03] py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal>
            <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <h2 className="font-display text-4xl tracking-tight text-teal-dark sm:text-5xl">
                {t("resenasTitle")}
              </h2>
              <p className="mt-4 max-w-[55ch] text-lg text-teal-dark/70">
                {t("resenasSubtitle", {
                  rating: ratingFormat.format(aggregateRating),
                  count: `${countFormat.format(roundedReviewCount)}+`,
                })}
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 shadow-card ring-1 ring-teal-dark/10">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#d98e2b" aria-hidden>
                <path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.2l-6.1 3.4 1.4-6.8L2.2 9.1l6.9-.8L12 2z" />
              </svg>
              <span className="font-display text-2xl tracking-tight text-teal-dark">
                {ratingFormat.format(aggregateRating)}
              </span>
                <span className="text-sm text-teal-dark/60">
                  / 5 {t("resenasBadgeSufijo")}
                </span>
              </div>
            </div>
          </Reveal>
        </div>

        <div className="mt-12">
          <ReviewsMarquee reviews={marqueeReviews} />
        </div>
      </section>

      {/* 6 · Mapa: elegir el local más cercano sin salir de la home */}
      <section className="border-t border-teal-dark/10 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal>
            <h2 className="font-display text-4xl tracking-tight text-teal-dark sm:text-5xl">
              {t("mapaTitle")}
            </h2>
            <p className="mt-4 max-w-[55ch] text-lg text-teal-dark/70">
              {t("mapaSubtitle")}
            </p>
          </Reveal>
          <Reveal delay={120}>
            <div className="mt-8 rounded-[1.75rem] bg-teal-dark/5 p-2 shadow-card ring-1 ring-teal-dark/10">
              <LocationsMapLazy locations={locations} />
            </div>
          </Reveal>
        </div>
      </section>

      {/* 7 · Teaser historia */}
      <section className="border-t border-teal-dark/10">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-24 sm:py-32 md:grid-cols-2">
          <Reveal>
            <div className="rounded-[1.75rem] bg-teal-dark/5 p-2 shadow-card ring-1 ring-teal-dark/10 md:-rotate-1">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[calc(1.75rem-0.5rem)]">
                <Image
                  src="/images/home/mapa-napoles-barcelona.jpg"
                  alt="Mapa ilustrado del recorrido de Nápoles a Barcelona"
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  loading="lazy"
                  className="object-cover"
                />
              </div>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <h2 className="font-display text-4xl tracking-tight text-teal-dark sm:text-5xl">
              {t("historiaTitle")}
            </h2>
            <p className="mt-5 max-w-md leading-relaxed text-teal-dark/80">
              {t("historiaTeaser")}
            </p>
            <p className="mt-3 max-w-md leading-relaxed text-teal-dark/80">
              {t("historiaTeaser2")}
            </p>
            <div className="mt-8">
              <CtaPill href="/nuestra-historia" color="teal">
                {t("historiaCta")}
              </CtaPill>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
