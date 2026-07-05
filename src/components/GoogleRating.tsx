import { useTranslations } from "next-intl";
import type { Location } from "@/data/locations";
import { mapsUrl } from "@/data/locations";

const ratingFormat = new Intl.NumberFormat("es-ES", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const countFormat = new Intl.NumberFormat("es-ES", {
  useGrouping: "always",
});

/** Valoración de Google del local, enlazada a su ficha de Maps.
 * Con `link=false` renderiza solo texto (para usar dentro de otros enlaces).
 * Solo contenido visible: no se marca como aggregateRating en el schema
 * (las directrices de Google no permiten usar sus reseñas como structured
 * data propio). */
export function GoogleRating({
  location,
  link = true,
}: {
  location: Location;
  link?: boolean;
}) {
  const t = useTranslations("local");
  if (!location.googleRating || !location.googleReviewCount) return null;

  const content = (
    <>
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="#d98e2b"
        aria-hidden
      >
        <path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.2l-6.1 3.4 1.4-6.8L2.2 9.1l6.9-.8L12 2z" />
      </svg>
      <span className="font-semibold">
        {ratingFormat.format(location.googleRating)}
      </span>
      <span
        className={
          link ? "underline decoration-cream/40 underline-offset-2" : undefined
        }
      >
        {t("resenasGoogle", {
          count: countFormat.format(location.googleReviewCount),
        })}
      </span>
    </>
  );

  if (!link) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm text-cream/90">
        {content}
      </span>
    );
  }

  return (
    <a
      href={mapsUrl(location)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-sm text-cream/90 transition-colors duration-200 hover:text-cream"
    >
      {content}
    </a>
  );
}
