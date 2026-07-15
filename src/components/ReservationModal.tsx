"use client";

import { createPortal } from "react-dom";
import { useLocale, useTranslations } from "next-intl";
import type { Location } from "@/data/locations";
import { ReservationForm } from "./ReservationForm";

/**
 * Modal del flujo de reserva online (solo dine-in). Más ancho y scrollable
 * que CtaModal porque contiene el formulario completo. Mantiene un enlace de
 * "llamar" como alternativa. Se monta por portal en document.body para que el
 * `fixed` cubra el viewport aunque el CTA viva dentro de un ancestro con
 * transform/filter (ver nota en CtaModal).
 */
export function ReservationModal({
  location,
  onClose,
}: {
  location: Location;
  onClose: () => void;
}) {
  const t = useTranslations("reservar");
  const tCta = useTranslations("cta");
  const locale = useLocale();

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-end justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="my-auto w-full max-w-lg rounded-[1.75rem] bg-night-soft p-6 shadow-card-hover ring-1 ring-cream/15 sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl text-cream">
              {t("modalTitle")}
            </h2>
            <p className="mt-1 text-sm text-cream/70">
              {location.name} · {location.neighborhood}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("close")}
            className="-mr-1 -mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-cream/60 transition hover:bg-cream/10 hover:text-cream"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M18 6 6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <ReservationForm fixedLocationSlug={location.slug} locale={locale} />

        <p className="mt-5 border-t border-cream/10 pt-4 text-center text-xs text-cream/50">
          {t("orCall")}{" "}
          <a
            href={location.phoneHref}
            className="font-semibold text-electric hover:text-electric-dark"
          >
            {location.phone}
          </a>
        </p>
      </div>
    </div>,
    document.body
  );
}
