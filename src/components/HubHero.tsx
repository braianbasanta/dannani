import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { Location } from "@/data/locations";
import { hrefFor, heroImageSrc, hoursParts } from "@/data/locations";
import { localizeLocation } from "@/data/translations";

/**
 * Hero split a pantalla completa para los hubs: un panel por local,
 * con el H1 de la página superpuesto. Misma estética que la home.
 */
export function HubHero({
  locations: locationsProp,
  eyebrow,
  h1,
  sub,
}: {
  locations: Location[];
  eyebrow: string;
  h1: string;
  sub: string;
}) {
  const t = useTranslations("local");
  const tBadges = useTranslations("badges");
  const tCta = useTranslations("cta");
  const locale = useLocale() as Locale;
  const locations = locationsProp.map((l) => localizeLocation(l, locale));
  const four = locations.length > 2;

  return (
    <>
    <section className="relative -mt-16 flex h-[100dvh] min-h-[600px] flex-col md:min-h-[680px]">
      <div
        className={`grid flex-1 ${
          four
            ? "grid-cols-2 grid-rows-2 lg:grid-cols-4 lg:grid-rows-1"
            : "grid-rows-2 md:grid-cols-2 md:grid-rows-1"
        }`}
      >
        {locations.map((location, index) => (
          <Link
            key={location.slug}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            href={hrefFor(location) as any}
            className="group relative flex items-end overflow-hidden"
          >
            <Image
              src={heroImageSrc(location)}
              alt={t("altFicha", {
                name: location.name,
                neighborhood: location.neighborhood,
              })}
              fill
              // Solo las dos primeras compiten por el LCP; el resto carga normal
              preload={index < 2}
              sizes={
                four
                  ? "(min-width: 1024px) 25vw, 50vw"
                  : "(min-width: 768px) 50vw, 100vw"
              }
              className="object-cover transition-transform duration-700 ease-fluid group-hover:scale-[1.04]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-night/90 via-night/25 to-transparent transition-opacity duration-500 group-hover:opacity-85" />
            {/* Con 2 locales (para llevar) el CTA va a la derecha del texto;
                con 4 paneles no hay ancho y se mantiene debajo */}
            <div
              className={`relative w-full p-5 pb-7 text-cream drop-shadow-[0_1px_6px_rgba(0,0,0,0.55)] lg:p-7 lg:pb-10 ${
                four ? "" : "flex items-end justify-between gap-4"
              }`}
            >
              <div>
                {location.nearBeach && (
                  <span className="mb-2.5 inline-block rounded-full bg-mustard px-3 py-1 text-xs font-semibold text-cream">
                    {tBadges("cercaPlaya")}
                  </span>
                )}
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cream/75">
                  {t("desde")} {location.openedYear}
                </p>
                <h2
                  className={`mt-1.5 font-display tracking-tight ${
                    four
                      ? "text-3xl sm:text-4xl lg:text-5xl"
                      : "text-4xl sm:text-5xl lg:text-6xl"
                  }`}
                >
                  {location.neighborhood}
                </h2>
                <p className="mt-3 hidden text-sm leading-relaxed text-cream/85 md:block">
                  {location.address}
                  <br />
                  {hoursParts(location).days}
                  <br />
                  {hoursParts(location).times}
                </p>
              </div>
              <span
                className={`inline-flex items-center gap-3 rounded-full bg-electric py-1.5 pl-6 pr-1.5 font-sans text-sm font-semibold text-night transition-colors duration-500 ease-fluid group-hover:bg-electric-dark group-active:scale-[0.98] ${
                  four ? "mt-5" : "shrink-0"
                }`}>
                {tCta("verLocal")}
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-night/15 transition-transform duration-500 ease-fluid group-hover:translate-x-0.5">
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
                </span>
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Scrim superior: legibilidad del nav transparente */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-night/70 to-transparent" />
    </section>

      {/* H1 fuera del hero: cuenta para SEO sin tapar las fotos */}
      <header className="mx-auto w-full max-w-5xl px-4 pt-12 text-center text-cream sm:pt-16">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mx-auto mt-3 max-w-4xl font-display text-3xl leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
          {h1}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-cream/85">{sub}</p>
      </header>
    </>
  );
}
