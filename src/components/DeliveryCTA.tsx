"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { Location } from "@/data/locations";
import { CtaModal } from "./CtaModal";

const PLATFORM_BTN =
  "inline-flex items-center justify-center rounded-full bg-mustard px-5 py-3 text-sm font-semibold text-cream hover:bg-mustard-dark";

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
          className={PLATFORM_BTN}
        >
          {t("pedirGlovo")}
        </a>
      )}
      {location.delivery.justEat && (
        <a
          href={location.delivery.justEat}
          target="_blank"
          rel="noopener noreferrer"
          className={PLATFORM_BTN}
        >
          {t("pedirJustEat")}
        </a>
      )}
    </>
  );
}

/** CTA "Pedir a domicilio". Con una sola plataforma enlaza directo a su
 * tienda; con varias abre un modal para elegir. No renderiza nada si el
 * local no tiene delivery (p.ej. Raval). */
export function DeliveryCTA({
  location,
  variant = "light",
}: {
  location: Location;
  variant?: "light" | "onDark";
}) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("cta");
  const tReserva = useTranslations("reserva");
  const delivery = location.delivery;

  if (!delivery) return null;

  const className =
    variant === "onDark"
      ? "inline-flex items-center justify-center rounded-full border border-cream/70 px-6 py-3 font-sans text-sm font-semibold text-cream transition hover:bg-cream/10"
      : "inline-flex items-center justify-center rounded-full border border-teal-dark/20 px-6 py-3 font-sans text-sm font-semibold text-teal-dark transition hover:bg-teal-dark/5";

  const single = !delivery.glovo || !delivery.justEat;
  if (single) {
    return (
      <a
        href={delivery.glovo ?? delivery.justEat}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {t("pedirDomicilio")}
      </a>
    );
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
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
