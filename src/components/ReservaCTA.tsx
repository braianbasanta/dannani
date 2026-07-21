"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { Location } from "@/data/locations";
import { CtaModal } from "./CtaModal";
import { ReservationModal } from "./ReservationModal";
import { DeliveryButtons } from "./DeliveryCTA";

/**
 * CTA de reserva (dine-in) / pedido (take-away). En dine-in abre el modal de
 * reserva online (widget de Cover Manager). En take-away abre un modal con
 * llamada directa + delivery (Glovo/Just Eat).
 */
export function ReservaCTA({
  location,
  variant = "primary",
  className,
}: {
  location: Location;
  variant?: "primary" | "secondary";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("cta");
  const tReserva = useTranslations("reserva");
  const isTakeAway = location.type === "take-away";

  const label = isTakeAway ? t("pedirParaLlevar") : t("reservarMesa");

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`${
          variant === "primary"
            ? "inline-flex items-center justify-center rounded-full bg-[linear-gradient(160deg,#7bafbc_0%,#5599aa_52%,#3d7e8f_100%)] px-6 py-3 font-sans text-sm font-bold uppercase tracking-[0.18em] text-night ring-1 ring-black/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_14px_34px_-8px_rgba(0,0,0,0.6),0_0_24px_rgba(85,153,170,0.25)] transition-all duration-300 ease-fluid hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_22px_46px_-10px_rgba(0,0,0,0.65),0_0_40px_rgba(85,153,170,0.4)] active:scale-[0.98]"
            : "inline-flex items-center justify-center rounded-full bg-cream/10 px-6 py-3 font-sans text-sm font-bold uppercase tracking-[0.14em] text-cream ring-1 ring-cream/25 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_10px_30px_-12px_rgba(0,0,0,0.5)] transition-all duration-300 ease-fluid hover:-translate-y-0.5 hover:bg-[linear-gradient(160deg,#7bafbc_0%,#5599aa_52%,#3d7e8f_100%)] hover:text-night hover:ring-black/20 active:scale-[0.98]"
        }${className ? ` ${className}` : ""}`}
      >
        {label}
      </button>

      {open && !isTakeAway && (
        <ReservationModal location={location} onClose={() => setOpen(false)} />
      )}

      {open && isTakeAway && (
        <CtaModal
          title={tReserva("modalTitleTakeAway")}
          body={tReserva(
            location.delivery
              ? "modalBodyTakeAwayDomicilio"
              : "modalBodyTakeAway",
            { name: location.name }
          )}
          onClose={() => setOpen(false)}
        >
          <a
            href={location.phoneHref}
            className="inline-flex items-center justify-center rounded-full bg-electric px-5 py-3 text-sm font-semibold text-night hover:bg-electric-dark"
          >
            {t("llamar")} · {location.phone}
          </a>
          <DeliveryButtons location={location} />
        </CtaModal>
      )}
    </>
  );
}
