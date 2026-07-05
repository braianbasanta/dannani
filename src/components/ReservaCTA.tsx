"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { Location } from "@/data/locations";

/**
 * CTA de reserva/pedido reutilizable. Hoy abre un modal placeholder con
 * llamada directa; el día que se integre Cover Manager (u otra plataforma),
 * este componente pasa a renderizar su iframe/script sin tocar el resto de
 * la maqueta — solo hay que rellenar `reservationUrl` en los datos del local.
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
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-end justify-center bg-teal-dark/60 p-4 sm:items-center"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-[1.75rem] bg-cream p-7 shadow-card-hover ring-1 ring-teal-dark/10"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display text-xl text-teal-dark">
              {isTakeAway
                ? tReserva("modalTitleTakeAway")
                : tReserva("modalTitleDineIn")}
            </h2>
            <p className="mt-2 text-sm text-teal-dark/80">
              {isTakeAway
                ? tReserva("modalBodyTakeAway", { name: location.name })
                : tReserva("modalBodyDineIn", { name: location.name })}
            </p>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <a
                href={location.phoneHref}
                className="inline-flex flex-1 items-center justify-center rounded-full bg-mustard px-5 py-3 text-sm font-semibold text-cream hover:bg-mustard-dark"
              >
                {t("llamar")} · {location.phone}
              </a>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center rounded-full border border-teal-dark/20 px-5 py-3 text-sm font-semibold text-teal-dark hover:bg-teal-dark/5"
              >
                {tReserva("cerrar")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
