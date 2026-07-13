import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { pageMetadata, BCP47 } from "@/lib/seo";
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
import { translateData } from "@/data/translations";

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

// Todas las reseñas reales (src/data/reviews.ts) de los 6 locales. Las
// tarjetas muestran siempre 5 estrellas (decisión de Braian, jul-2026): son
// reseñas seleccionadas, no un promedio del local.
const marqueeReviews = Object.entries(reviewsByLocationSlug).flatMap(
  ([slug, reviews]) => {
    const location = locations.find((l) => l.slug === slug);
    if (!location) return [];
    return reviews.map((review) => ({
      author: review.author,
      text: review.text,
      neighborhood: location.neighborhood,
      rating: 5,
    }));
  }
);

/**
 * Title/description alineados con lo que más se busca (research jul. 2026,
 * volúmenes mensuales en Barcelona): "restaurante italiano barcelona" (~2.900),
 * "pizzería barcelona" (~2.400) y "pizzería napolitana barcelona" (~880).
 * Keyword primero, marca al final; description ≤160 caracteres.
 * El título no incluye "| Da Nanni": lo añade el template del layout raíz.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.home" });

  // La home lleva la marca como sufijo (patrón "keyword | Marca"), fuera
  // del template del layout, que no aplica a su propio segmento.
  const title = `${t("title")} | Da Nanni`;
  return {
    ...pageMetadata({
      title,
      description: t("description"),
      path: "/",
      image: "/images/og/home.jpg",
      locale: locale as Locale,
    }),
    title: { absolute: title },
  };
}

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

/**
 * CTA premium: pill eléctrica con degradado del azul de marca y halo neón
 * (como los rótulos de los locales), ghost con borde que hereda el color
 * del texto (pasar colores vía className según el fondo del botón), o
 * hoverElectric: ghost en reposo que se enciende en eléctrico al hover
 * (para pares de CTAs donde ninguno debe destacar sobre el otro).
 */
function CtaPill({
  href,
  variant,
  className = "",
  children,
}: {
  href:
    | "/restaurantes"
    | "/pizza-para-llevar"
    | "/nuestra-historia"
    | "/restaurantes/cartas";
  variant: "electric" | "ghost" | "hoverElectric";
  className?: string;
  children: React.ReactNode;
}) {
  const base =
    "inline-flex items-center justify-center rounded-full px-8 text-center font-sans text-sm font-bold uppercase tracking-[0.18em] transition-all duration-300 ease-fluid hover:-translate-y-0.5 active:scale-[0.98]";
  const styles =
    variant === "electric"
      ? "bg-[linear-gradient(160deg,#7bafbc_0%,#5599aa_52%,#3d7e8f_100%)] py-4 text-night ring-1 ring-black/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_14px_34px_-8px_rgba(0,0,0,0.6),0_0_24px_rgba(85,153,170,0.25)] hover:tracking-[0.22em] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_22px_46px_-10px_rgba(0,0,0,0.65),0_0_40px_rgba(85,153,170,0.4)]"
      : variant === "hoverElectric"
        ? "bg-cream/10 py-4 text-cream ring-1 ring-cream/25 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_10px_30px_-12px_rgba(0,0,0,0.5)] hover:bg-[linear-gradient(160deg,#7bafbc_0%,#5599aa_52%,#3d7e8f_100%)] hover:text-night hover:tracking-[0.22em] hover:ring-black/20 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_14px_34px_-8px_rgba(0,0,0,0.6),0_0_24px_rgba(85,153,170,0.25)]"
        : "border-2 border-current py-[0.85rem] backdrop-blur-sm";
  return (
    <Link href={href} className={`${base} ${styles} ${className}`}>
      {children}
    </Link>
  );
}

/** Tarjeta vertical estilo "fila de Netflix": póster con zoom sutil al hover. */
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
      className="group relative block aspect-[2/3] w-[220px] shrink-0 snap-start overflow-hidden rounded-2xl shadow-card transition-all duration-500 ease-fluid hover:scale-[1.02] hover:shadow-card-hover sm:w-[260px]"
    >
      <Image
        src={heroImageSrc(location)}
        alt={location.name}
        fill
        sizes="(min-width: 640px) 260px, 220px"
        loading="lazy"
        className="object-cover transition-transform duration-700 ease-fluid group-hover:scale-[1.06]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-night/90 via-night/20 to-transparent" />
      <span
        aria-hidden
        className="absolute right-3 top-3 flex h-9 w-9 -translate-y-1 items-center justify-center rounded-full bg-cream/90 text-night opacity-0 backdrop-blur-sm transition-all duration-500 ease-fluid group-hover:translate-y-0 group-hover:opacity-100"
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
  const locale = useLocale() as Locale;
  const ratingFormat = new Intl.NumberFormat(BCP47[locale], {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  const countFormat = new Intl.NumberFormat(BCP47[locale], {
    useGrouping: "always",
  });

  return (
    <>
      <SchemaOrg data={organizationSchema(locale)} />

      {/* 1 · Hero: claim + reel de elaboración. En móvil el video es el fondo
          a pantalla completa con el texto encima; en desktop va dentro de una
          silueta de iPhone sobre fondo negro con luz ambiental eléctrica. */}
      {/* Se sube bajo el nav (-mt-16) en TODOS los tamaños: si no, la franja
          del nav muestra el night plano del body y el fondo del hero empieza
          de golpe justo debajo, dejando una línea visible. */}
      <section className="relative -mt-16 overflow-hidden">
        {/* Fondo móvil: el reel con scrim de marca para legibilidad */}
        <div aria-hidden className="absolute inset-0 md:hidden">
          <AutoplayVideo
            priority
            src={heroClip.video}
            poster={heroClip.poster}
            className="h-full w-full object-cover"
          />
          {/* Scrim de abajo hacia arriba: oscuro donde vive el texto, video
              limpio arriba; termina en night sólido para fundirse con la
              sección siguiente */}
          <div className="absolute inset-0 bg-gradient-to-t from-night via-night/60 to-transparent" />
          {/* Tinte mínimo arriba para que el logo y el menú lean bien */}
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-night/50 to-transparent" />
        </div>

        {/* Luz ambiental desktop: rompe la planitud del negro */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 hidden md:block"
        >
          <div className="absolute -top-16 right-[-8%] h-[32rem] w-[32rem] rounded-full bg-electric/[0.07] blur-3xl" />
          <div className="absolute bottom-[-35%] left-[-12%] h-[28rem] w-[28rem] rounded-full bg-teal/10 blur-3xl" />
          {/* Funde el corte de las luces con la sección siguiente */}
          <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-b from-transparent to-night" />
        </div>

        {/* En móvil el bloque de texto se ancla abajo (content-end) para dejar
            el máximo de video a la vista; el cue "descubre" queda justo debajo */}
        <div className="relative mx-auto grid min-h-[100svh] max-w-6xl content-end items-center gap-12 px-4 pb-20 pt-24 md:content-center md:grid-cols-[1fr_auto] md:gap-16 md:min-h-0 md:pb-24 md:pt-32">
          <div>
            <p className="eyebrow animate-fade-up">{t("eyebrow")}</p>
            {/* El tamaño móvil se escala con el viewport para que
                "Ristorante e pizzeria" entre siempre en una línea */}
            <h1 className="mt-4 max-w-2xl animate-fade-up font-display text-[min(3rem,9.5vw)] leading-[1.05] tracking-tight text-cream [animation-delay:100ms] lg:text-6xl xl:text-7xl">
              {t.rich("h1", {
                i: (chunks) => (
                  <em className="neon-blue italic">{chunks}</em>
                ),
                br: () => <br />,
                nw: (chunks) => (
                  <span className="whitespace-nowrap">{chunks}</span>
                ),
              })}
            </h1>
            <div className="mt-9 flex flex-col gap-3 animate-fade-up [animation-delay:300ms] sm:flex-row sm:flex-wrap sm:items-center">
              <CtaPill href="/restaurantes" variant="hoverElectric">
                {t("ctaComerAqui")}
              </CtaPill>
              <CtaPill href="/pizza-para-llevar" variant="hoverElectric">
                {t("ctaParaLlevar")}
              </CtaPill>
            </div>
            <div className="mt-8 flex items-center justify-center gap-2 animate-fade-up font-sans text-sm text-cream/80 [animation-delay:400ms] md:justify-start">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="#d98e2b"
                aria-hidden
              >
                <path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.2l-6.1 3.4 1.4-6.8L2.2 9.1l6.9-.8L12 2z" />
              </svg>
              <span className="font-semibold text-cream">
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

          <div className="mx-auto hidden w-72 animate-fade-up [animation-delay:200ms] md:block lg:w-80">
            <div className="phone-sway">
              <PhoneFrame className="md:rotate-[1.5deg]">
                <AutoplayVideo
                  priority
                  src={heroClip.video}
                  poster={heroClip.poster}
                  aria-label={translateData(heroClip.alt, locale)}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </PhoneFrame>
            </div>
          </div>
        </div>

        {/* Cue de scroll (solo móvil): avisa de que hay más contenido abajo */}
        <a
          href="#platos"
          className="absolute inset-x-0 bottom-5 z-10 flex flex-col items-center gap-1.5 md:hidden"
        >
          <span className="font-sans text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-cream/60">
            {t("descubre")}
          </span>
          <svg
            className="h-4 w-4 animate-bounce text-cream/60 [animation-duration:2s]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </a>
      </section>

      {/* 2 · Platos destacados: crear el antojo antes de pedir la decisión */}
      <section
        id="platos"
        className="relative overflow-hidden bg-cream/[0.02] py-20 sm:py-28"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 right-[-6%] h-96 w-96 rounded-full bg-electric/[0.05] blur-3xl"
        />
        {/* Bordes difuminados hacia night (última capa: enmascara también el
            glow para que no haya cortes duros entre secciones) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-night to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-night to-transparent"
        />
        <div className="mx-auto max-w-6xl px-4">
          <Reveal>
            <h2 className="font-display text-4xl tracking-tight text-cream sm:text-5xl">
              {t("platosTitle")}
            </h2>
            <p className="mt-4 max-w-[55ch] text-lg text-cream/70">
              {t("platosSubtitle")}
            </p>
          </Reveal>
        </div>
        <div className="mt-10 sm:mt-12">
          <FeaturedDishesCarousel entries={featuredDishEntries} />
        </div>
        <Reveal>
          <div className="mt-10 flex justify-center px-4 sm:mt-12">
            <CtaPill
              href="/restaurantes/cartas"
              variant="ghost"
              className="text-cream"
            >
              {t("platosCta")}
            </CtaPill>
          </div>
        </Reveal>
      </section>

      {/* 3 · Decisión: comer aquí o para llevar */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal>
            <h2 className="font-display text-4xl tracking-tight text-cream sm:text-5xl">
              {t("dondeTitle")}
            </h2>
          </Reveal>
        </div>

        {/* Filas estilo Netflix: cabecera alineada al contenedor, tarjetas
            a sangre desde el borde izquierdo del viewport */}
        <div className="mt-12 space-y-14 sm:space-y-16">
          <Reveal>
            <div className="mx-auto max-w-6xl px-4">
              <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cream/50">
                    {t("dondeRestaurantesBarrios")}
                  </p>
                  <h3 className="mt-2 font-display text-2xl tracking-tight text-cream sm:text-3xl">
                    {t("dondeRestaurantesTitle")}
                  </h3>
                  <p className="mt-2 max-w-[55ch] text-cream/70">
                    {t("dondeRestaurantesText")}
                  </p>
                </div>
                <Link
                  href="/restaurantes"
                  className="inline-flex items-center gap-2 font-sans text-sm font-semibold text-electric transition-colors duration-300 hover:text-cream"
                >
                  {t("dondeRestaurantesCta")}
                  <ArrowIcon />
                </Link>
              </div>
            </div>
            <div className="mt-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 scroll-px-4 pb-3 [scrollbar-width:none] sm:gap-4 [&::-webkit-scrollbar]:hidden lg:px-[max(1rem,calc((100vw-72rem)/2))] lg:scroll-px-[max(1rem,calc((100vw-72rem)/2))]">
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
            <div className="mx-auto max-w-6xl px-4">
              <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cream/50">
                    {t("dondeLlevarBarrios")}
                  </p>
                  <h3 className="mt-2 font-display text-2xl tracking-tight text-cream sm:text-3xl">
                    {t("dondeLlevarTitle")}
                  </h3>
                  <p className="mt-2 max-w-[55ch] text-cream/70">
                    {t("dondeLlevarText")}
                  </p>
                </div>
                <Link
                  href="/pizza-para-llevar"
                  className="inline-flex items-center gap-2 font-sans text-sm font-semibold text-electric transition-colors duration-300 hover:text-cream"
                >
                  {t("dondeLlevarCta")}
                  <ArrowIcon />
                </Link>
              </div>
            </div>
            <div className="mt-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 scroll-px-4 pb-3 [scrollbar-width:none] sm:gap-4 [&::-webkit-scrollbar]:hidden lg:px-[max(1rem,calc((100vw-72rem)/2))] lg:scroll-px-[max(1rem,calc((100vw-72rem)/2))]">
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
      </section>

      {/* 4 · Experiencia: el ambiente de los locales, en video */}
      <section className="relative overflow-hidden bg-night-soft py-20 sm:py-28">
        {/* Profundidad del bloque: luz cenital eléctrica */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 left-1/2 h-[30rem] w-[46rem] -translate-x-1/2 rounded-full bg-electric/[0.08] blur-3xl" />
        </div>
        {/* Bordes difuminados hacia night (tapan el fondo y el glow) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-night to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-night to-transparent"
        />
        {/* Palabra editorial por encima del fundido para que siga leyéndose */}
        <p
          aria-hidden
          className="pointer-events-none absolute -bottom-6 right-0 select-none font-display text-[7rem] italic leading-none tracking-tight text-cream/[0.05] sm:-bottom-10 sm:text-[12rem]"
        >
          Napoli
        </p>
        <div className="relative mx-auto max-w-6xl px-4">
          <Reveal>
            {/* Frase del neón real que cuelga en los locales */}
            <p className="neon-blue font-script text-2xl sm:text-3xl">
              {t("experienciaNeon")}
            </p>
            <h2 className="mt-3 font-display text-4xl tracking-tight text-cream sm:text-5xl">
              {t("experienciaTitle")}
            </h2>
            <p className="mt-4 max-w-[55ch] text-lg text-cream/70">
              {t("experienciaSubtitle")}
            </p>
          </Reveal>
        </div>
        {/* Móvil: fila deslizable desde el borde izquierdo. Desktop: los 6
            clips en un grid a todo el ancho del viewport, sin scroll lateral. */}
        <div className="relative mt-10 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 scroll-px-4 pb-3 [scrollbar-width:none] sm:mt-12 sm:gap-4 [&::-webkit-scrollbar]:hidden lg:grid lg:grid-cols-6 lg:overflow-visible lg:pb-0">
          {experienceClips.map((clip) => (
            <div
              key={clip.slug}
              className="relative aspect-[9/16] w-[200px] shrink-0 snap-start overflow-hidden rounded-2xl bg-black/20 sm:w-[240px] lg:w-auto"
            >
              <AutoplayVideo
                src={clip.video}
                poster={clip.poster}
                aria-label={translateData(clip.alt, locale)}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      </section>

      {/* 5 · Prueba social: reseñas reales de Google agregadas de los 6 locales */}
      <section className="relative bg-cream/[0.02] py-24 sm:py-32">
        {/* Bordes difuminados hacia night */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-night to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-night to-transparent"
        />
        <div className="mx-auto max-w-6xl px-4">
          <Reveal>
            <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <h2 className="font-display text-4xl tracking-tight text-cream sm:text-5xl">
                {t("resenasTitle")}
              </h2>
              <p className="mt-4 max-w-[55ch] text-lg text-cream/70">
                {t("resenasSubtitle", {
                  rating: ratingFormat.format(aggregateRating),
                  count: `${countFormat.format(roundedReviewCount)}+`,
                })}
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-night-soft px-5 py-2.5 shadow-card ring-1 ring-cream/10">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#d98e2b" aria-hidden>
                <path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.2l-6.1 3.4 1.4-6.8L2.2 9.1l6.9-.8L12 2z" />
              </svg>
              <span className="font-display text-2xl tracking-tight text-cream">
                {ratingFormat.format(aggregateRating)}
              </span>
                <span className="text-sm text-cream/60">
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
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal>
            <h2 className="font-display text-4xl tracking-tight text-cream sm:text-5xl">
              {t("mapaTitle")}
            </h2>
            <p className="mt-4 max-w-[55ch] text-lg text-cream/70">
              {t("mapaSubtitle")}
            </p>
          </Reveal>
          <Reveal delay={120}>
            <div className="mt-8 rounded-[1.75rem] bg-cream/5 p-2 shadow-card ring-1 ring-cream/10">
              <LocationsMapLazy locations={locations} />
            </div>
          </Reveal>
        </div>
      </section>

      {/* 7 · Teaser historia */}
      <section>
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-24 sm:py-32 md:grid-cols-2">
          <Reveal>
            <div className="mx-auto max-w-md rounded-[1.75rem] bg-cream/5 p-2 shadow-card ring-1 ring-cream/10 md:-rotate-1">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[calc(1.75rem-0.5rem)]">
                <Image
                  src="/images/historia/nanni-nino-pizza.jpg"
                  alt={t("historiaImgAlt")}
                  fill
                  sizes="(min-width: 768px) 40vw, 100vw"
                  loading="lazy"
                  className="object-cover"
                />
              </div>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <h2 className="font-display text-4xl tracking-tight text-cream sm:text-5xl">
              {t("historiaTitle")}
            </h2>
            <p className="mt-5 max-w-md leading-relaxed text-cream/80">
              {t("historiaTeaser")}
            </p>
            <p className="mt-3 max-w-md leading-relaxed text-cream/80">
              {t("historiaTeaser2")}
            </p>
            <div className="mt-8">
              <CtaPill
                href="/nuestra-historia"
                variant="ghost"
                className="text-electric hover:bg-electric hover:text-night"
              >
                {t("historiaCta")}
              </CtaPill>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
