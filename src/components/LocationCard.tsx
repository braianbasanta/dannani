import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Location } from "@/data/locations";
import { hrefFor, heroImageSrc } from "@/data/locations";
import { ComoLlegar } from "@/components/ComoLlegar";

export function LocationCard({ location }: { location: Location }) {
  const t = useTranslations("badges");
  const tCta = useTranslations("cta");
  const href = hrefFor(location);

  return (
    <article className="group flex flex-col rounded-[1.75rem] bg-teal-dark/5 p-2 ring-1 ring-teal-dark/10 transition-all duration-500 ease-fluid hover:-translate-y-1 hover:shadow-card-hover">
      <Link
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        href={href as any}
        className="relative block aspect-[4/3] w-full overflow-hidden rounded-[calc(1.75rem-0.5rem)]"
        tabIndex={-1}
        aria-hidden
      >
        <Image
          src={heroImageSrc(location)}
          alt={location.name}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-fluid group-hover:scale-[1.04]"
        />
        <span className="absolute left-3 top-3 rounded-full bg-cream/95 px-3 py-1 text-xs font-semibold text-teal-dark">
          {location.type === "take-away" ? t("takeAway") : t("dineIn")}
        </span>
        {location.nearBeach && (
          <span className="absolute right-3 top-3 rounded-full bg-mustard px-3 py-1 text-xs font-semibold text-cream">
            {t("cercaPlaya")}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-4 p-5 sm:p-6">
        <div>
          <h3 className="font-display text-2xl tracking-tight text-teal-dark">
            {location.name}
          </h3>
          <p className="mt-1.5 text-sm text-teal-dark/70">{location.address}</p>
          <p className="mt-0.5 text-sm text-teal-dark/70">
            {location.hoursLabel}
          </p>
        </div>

        <div className="mt-auto flex flex-wrap gap-2 pt-1">
          <ComoLlegar location={location} />
          <Link
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            href={href as any}
            className="inline-flex items-center justify-center rounded-full bg-teal px-6 py-3 font-sans text-sm font-semibold text-cream transition-colors duration-500 ease-fluid hover:bg-teal-dark active:scale-[0.98]"
          >
            {tCta("verLocal")}
          </Link>
        </div>
      </div>
    </article>
  );
}
