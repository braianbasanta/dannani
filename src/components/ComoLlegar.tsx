import { useTranslations } from "next-intl";
import type { Location } from "@/data/locations";
import { mapsUrl } from "@/data/locations";

export function ComoLlegar({
  location,
  className,
}: {
  location: Location;
  className?: string;
}) {
  const t = useTranslations("cta");

  return (
    <a
      href={mapsUrl(location)}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-cream/10 px-4 py-3 font-sans text-xs font-bold uppercase tracking-[0.14em] text-cream ring-1 ring-cream/25 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_10px_30px_-12px_rgba(0,0,0,0.5)] transition-all duration-300 ease-fluid hover:-translate-y-0.5 hover:bg-[linear-gradient(160deg,#8adcf5_0%,#59c8ec_52%,#35aed6_100%)] hover:text-night hover:ring-black/20 active:scale-[0.98]${
        className ? ` ${className}` : ""
      }`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11Z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
      {t("comoLlegar")}
    </a>
  );
}
