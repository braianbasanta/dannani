"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { Location } from "@/data/locations";
import { CtaModal } from "./CtaModal";

const PLATFORM_BTN =
  "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition-colors";
// Colores de marca de cada plataforma: con ver el botón ya sabes a dónde vas.
const GLOVO_BTN = `${PLATFORM_BTN} bg-[#ffc244] text-[#1d1d1d] hover:bg-[#f2b52e]`;
const JUST_EAT_BTN = `${PLATFORM_BTN} bg-[#ff8000] text-white hover:bg-[#e67300]`;

/** Botones directos a las tiendas de delivery del local (Glovo/Just Eat).
 * Se usan dentro del modal y en la landing /a-domicilio. */
export function DeliveryButtons({ location }: { location: Location }) {
  const t = useTranslations("cta");
  if (!location.delivery) return null;

  return (
    <>
      {location.delivery.glovo && (
        <a
          href={location.delivery.glovo}
          target="_blank"
          rel="noopener noreferrer"
          className={GLOVO_BTN}
        >
          {t("pedirGlovo")}
        </a>
      )}
      {location.delivery.justEat && (
        <a
          href={location.delivery.justEat}
          target="_blank"
          rel="noopener noreferrer"
          className={JUST_EAT_BTN}
        >
          {t("pedirJustEat")}
        </a>
      )}
    </>
  );
}

/** CTA "Pedir a domicilio". Con una sola plataforma enlaza directo a su
 * tienda; con varias abre un modal para elegir. No renderiza nada si el
 * local no tiene delivery (p.ej. Raval) ni en take-away: ahí "Pedir para
 * llevar" y "Pedir a domicilio" suenan a lo mismo, así que el delivery vive
 * dentro del modal de <ReservaCTA> (un único CTA de pedido). */
export function DeliveryCTA({
  location,
  className,
}: {
  location: Location;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("cta");
  const tReserva = useTranslations("reserva");
  const delivery = location.delivery;

  if (!delivery || location.type === "take-away") return null;

  // Glass pill (mismo look que los CTAs del hero de la home) en ambas
  // variantes; se enciende en eléctrico al hover.
  const btnClassName = `inline-flex items-center justify-center rounded-full bg-cream/10 px-4 py-3 font-sans text-xs font-bold uppercase tracking-[0.14em] text-cream ring-1 ring-cream/25 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_10px_30px_-12px_rgba(0,0,0,0.5)] transition-all duration-300 ease-fluid hover:-translate-y-0.5 hover:bg-[linear-gradient(160deg,#7bafbc_0%,#5599aa_52%,#3d7e8f_100%)] hover:text-night hover:ring-black/20 active:scale-[0.98]${
    className ? ` ${className}` : ""
  }`;

  const single = !delivery.glovo || !delivery.justEat;
  if (single) {
    return (
      <a
        href={delivery.glovo ?? delivery.justEat}
        target="_blank"
        rel="noopener noreferrer"
        className={btnClassName}
      >
        {t("pedirDomicilio")}
      </a>
    );
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={btnClassName}>
        {t("pedirDomicilio")}
      </button>

      {open && (
        <CtaModal
          title={tReserva("modalTitleDomicilio")}
          body={tReserva("modalBodyDomicilio", { name: location.name })}
          onClose={() => setOpen(false)}
        >
          <DeliveryButtons location={location} />
        </CtaModal>
      )}
    </>
  );
}
