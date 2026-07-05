import { useTranslations } from "next-intl";
import type { Location } from "@/data/locations";
import { mapsUrl } from "@/data/locations";

export function ComoLlegar({
  location,
  variant = "light",
}: {
  location: Location;
  variant?: "light" | "onDark";
}) {
  const t = useTranslations("cta");

  return (
    <a
      href={mapsUrl(location)}
      target="_blank"
      rel="noopener noreferrer"
      className={
        variant === "onDark"
          ? "inline-flex items-center gap-2 rounded-full border border-cream/70 px-6 py-3 font-sans text-sm font-semibold text-cream transition hover:bg-cream/10"
          : "inline-flex items-center gap-2 rounded-full border border-teal-dark/20 px-6 py-3 font-sans text-sm font-semibold text-teal-dark transition hover:bg-teal-dark/5"
      }
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11Z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
      {t("comoLlegar")}
    </a>
  );
}
