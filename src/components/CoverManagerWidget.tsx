"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { useLocale, useTranslations } from "next-intl";
import { trackReservationConversion } from "@/lib/ads-conversions";

/**
 * Motor de reservas de Cover Manager. Sin `restaurantSlug` carga el módulo
 * de grupo (elige local dentro del widget); con él, el módulo individual del
 * restaurante ya preseleccionado (`coverManagerSlug` en locations.ts).
 * Sustituye al formulario propio desde jul-2026. El iframe arranca a 550px
 * y crece con el contenido vía iframeResizer, servido por Cover Manager.
 */

const COVERMANAGER_LANG: Record<string, string> = {
  es: "spanish",
  en: "english",
  it: "italian",
  ca: "catalan",
};

declare global {
  interface Window {
    iFrameResize?: (options: object, target: HTMLIFrameElement) => void;
  }
}

export function CoverManagerWidget({
  restaurantSlug,
}: {
  restaurantSlug?: string;
}) {
  const locale = useLocale();
  const t = useTranslations("reservar");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const bound = useRef(false);
  const [scriptReady, setScriptReady] = useState(false);
  const [frameReady, setFrameReady] = useState(false);

  useEffect(() => {
    if (!scriptReady || !frameReady || bound.current || !iframeRef.current)
      return;
    window.iFrameResize?.({}, iframeRef.current);
    bound.current = true;
  }, [scriptReady, frameReady]);

  // Al completarse una reserva, el motor hace `parent.postMessage({ reserv })`
  // (función execute_external de module_restaurante.js). Se aprovecha para
  // disparar la conversión "Reserva web" de las 4 cuentas de Ads desde nuestro
  // dominio, donde vive la cookie del clic — igual que con el formulario propio.
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== "https://www.covermanager.com") return;
      const data: unknown = event.data;
      if (!data || typeof data !== "object" || !("reserv" in data)) return;
      trackReservationConversion();
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const lang = COVERMANAGER_LANG[locale] ?? "spanish";
  const src = restaurantSlug
    ? `https://www.covermanager.com/reservation/module_restaurant/${restaurantSlug}/${lang}`
    : `https://www.covermanager.com/reservation/module_group/Grupo-Da-Nanni/${lang}`;

  return (
    <>
      <Script
        src="https://www.covermanager.com/js/iframeResizer/iframeResizer.min.js"
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
      />
      <iframe
        ref={iframeRef}
        id={restaurantSlug ?? "covermanager-grupo-da-nanni"}
        title={t("title")}
        src={src}
        allow="payment"
        height={550}
        width="100%"
        className="w-full rounded-xl bg-white"
        style={{ border: 0 }}
        onLoad={() => setFrameReady(true)}
      />
    </>
  );
}
