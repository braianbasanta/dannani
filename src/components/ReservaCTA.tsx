"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { Location } from "@/data/locations";
import { CtaModal } from "./CtaModal";

/**
 * CTA de reserva (dine-in) / pedido para recoger (take-away): abre un modal
 * con llamada directa al local. El día que se integre Cover Manager (u otra
 * plataforma de reservas), este componente pasa a renderizar su iframe/script
 * sin tocar el resto de la maqueta. El delivery vive en <DeliveryCTA>.
 */
export function ReservaCTA({
  location,
  variant = "primary",
}: {
  location: Location;
  variant?: "primary" | "secondary";
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
        className={
          variant === "primary"
            ? "inline-flex items-center justify-center rounded-full bg-mustard px-6 py-3 font-sans text-sm font-semibold text-cream transition hover:bg-mustard-dark"
            : "inline-flex items-center justify-center rounded-full border border-cream/70 px-6 py-3 font-sans text-sm font-semibold text-cream transition hover:bg-cream/10"
        }
      >
        {label}
      </button>

      {open && (
        <CtaModal
          title={
            isTakeAway
              ? tReserva("modalTitleTakeAway")
              : tReserva("modalTitleDineIn")
          }
          body={
            isTakeAway
              ? tReserva("modalBodyTakeAway", { name: location.name })
              : tReserva("modalBodyDineIn", { name: location.name })
          }
          onClose={() => setOpen(false)}
        >
          <a
            href={location.phoneHref}
            className="inline-flex items-center justify-center rounded-full bg-mustard px-5 py-3 text-sm font-semibold text-cream hover:bg-mustard-dark"
          >
            {t("llamar")} · {location.phone}
          </a>
        </CtaModal>
      )}
    </>
  );
}
