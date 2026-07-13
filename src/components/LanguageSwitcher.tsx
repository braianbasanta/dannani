"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";

const LOCALE_LABELS: Record<Locale, string> = {
  es: "Español",
  en: "English",
  it: "Italiano",
  ca: "Català",
};

/**
 * Selector de idioma. `variant="desktop"` replica el dropdown on-hover del
 * nav; `variant="mobile"` es una fila de píldoras para el menú fullscreen.
 * Mantiene la ruta actual y solo cambia el locale del prefijo.
 */
export function LanguageSwitcher({
  variant,
  onNavigate,
}: {
  variant: "desktop" | "mobile";
  onNavigate?: () => void;
}) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();

  if (variant === "mobile") {
    return (
      <div className="flex gap-2" aria-label={t("idioma")}>
        {routing.locales.map((l) => (
          <Link
            key={l}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            href={pathname as any}
            locale={l}
            onClick={onNavigate}
            className={`rounded-full px-4 py-2 text-sm font-semibold uppercase ring-1 transition-colors ${
              l === locale
                ? "bg-electric text-night ring-electric"
                : "bg-cream/5 text-cream ring-cream/10 active:bg-cream/10"
            }`}
          >
            {l}
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="group relative">
      <button
        type="button"
        aria-label={t("idioma")}
        className="flex items-center gap-1 py-2 uppercase transition-colors duration-500 hover:text-electric"
      >
        {locale}
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          aria-hidden
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div className="invisible absolute right-0 top-full w-40 translate-y-2 pt-3 opacity-0 transition-all duration-300 ease-fluid group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
        <div className="rounded-2xl bg-night-soft p-2 text-cream ring-1 ring-cream/10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.7),0_0_30px_rgba(85,153,170,0.08)]">
          {routing.locales.map((l) => (
            <Link
              key={l}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              href={pathname as any}
              locale={l}
              className={`flex items-center justify-between rounded-xl px-4 py-2.5 text-sm transition-colors duration-200 hover:bg-electric/10 ${
                l === locale ? "text-electric" : ""
              }`}
            >
              {LOCALE_LABELS[l]}
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cream/40">
                {l}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
