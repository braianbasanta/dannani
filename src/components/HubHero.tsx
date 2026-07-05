import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Location } from "@/data/locations";
import { hrefFor, heroImageSrc } from "@/data/locations";
import { GoogleRating } from "@/components/GoogleRating";

/**
 * Hero split a pantalla completa para los hubs: un panel por local,
 * con el H1 de la página superpuesto. Misma estética que la home.
 */
export function HubHero({
  locations,
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
  const four = locations.length > 2;

  return (
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
              alt={location.name}
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
            <div className="absolute inset-0 bg-gradient-to-t from-teal-dark/90 via-teal-dark/25 to-transparent transition-opacity duration-500 group-hover:opacity-85" />
            <div className="relative w-full p-5 pb-7 text-cream drop-shadow-[0_1px_6px_rgba(31,59,64,0.45)] lg:p-7 lg:pb-10">
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
              <div className="mt-2">
                <GoogleRating location={location} link={false} />
              </div>
              <p className="mt-3 hidden text-sm leading-relaxed text-cream/85 md:block">
                {location.address}
                <br />
                {location.hoursLabel}
              </p>
              <span className="mt-5 inline-flex items-center gap-3 rounded-full bg-mustard py-1.5 pl-6 pr-1.5 font-sans text-sm font-semibold text-cream transition-colors duration-500 ease-fluid group-hover:bg-mustard-dark group-active:scale-[0.98]">
                {tCta("verLocal")}
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cream/15 transition-transform duration-500 ease-fluid group-hover:translate-x-0.5">
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

      {/* Scrim superior: legibilidad del H1 y del nav transparente */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-teal-dark/80 via-teal-dark/40 to-transparent" />

      <header className="pointer-events-none absolute inset-x-0 top-0 mx-auto w-full max-w-5xl px-4 pt-24 text-center text-cream drop-shadow-[0_1px_6px_rgba(31,59,64,0.45)] sm:pt-28">
        <p className="eyebrow hidden animate-fade-up sm:block">{eyebrow}</p>
        <h1 className="mx-auto max-w-4xl animate-fade-up font-display text-3xl leading-[1.05] tracking-tight [animation-delay:100ms] sm:mt-3 sm:text-5xl lg:text-6xl">
          {h1}
        </h1>
        <p className="mx-auto mt-4 hidden max-w-xl animate-fade-up text-cream/85 [animation-delay:200ms] sm:block">
          {sub}
        </p>
      </header>
    </section>
  );
}
