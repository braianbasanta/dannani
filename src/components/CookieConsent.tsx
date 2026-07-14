"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

/** IDs de las herramientas de análisis. GA_ID queda vacío hasta que exista
 * la propiedad GA4; con "" simplemente no se carga. */
const CLARITY_ID = "xmir5waytr";
const GA_ID = "G-VL3GX7LPHY";

const STORAGE_KEY = "dananni-cookie-consent";

type AnalyticsWindow = Window & {
  clarity?: { (...args: unknown[]): void; q?: unknown[] };
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
};

/** Inyecta Clarity y GA4 SOLO tras consentimiento (RGPD/AEPD: ambas usan
 * cookies — _clck/_clsk y _ga — y Clarity graba sesiones). Sin aceptación
 * no se carga ningún script y la web queda cookieless (Vercel Analytics
 * no usa cookies y por eso vive fuera de este gate, en el layout). */
function loadAnalytics() {
  const w = window as AnalyticsWindow;

  if (CLARITY_ID && !document.querySelector('script[src*="clarity.ms/tag/"]')) {
    w.clarity =
      w.clarity ||
      function (...args: unknown[]) {
        (w.clarity!.q = w.clarity!.q || []).push(args);
      };
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.clarity.ms/tag/${CLARITY_ID}`;
    document.head.appendChild(s);
  }

  if (GA_ID && !document.querySelector('script[src*="googletagmanager.com/gtag"]')) {
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(s);
    w.dataLayer = w.dataLayer || [];
    // GA exige que se pushee el objeto arguments, no un array.
    const gtag = function () {
      // eslint-disable-next-line prefer-rest-params
      w.dataLayer!.push(arguments);
    } as (...args: unknown[]) => void;
    w.gtag = gtag;
    gtag("js", new Date());
    gtag("config", GA_ID);
  }
}

export function CookieConsent() {
  const t = useTranslations("cookieBanner");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "accepted") {
      loadAnalytics();
    } else if (stored !== "rejected") {
      // Solo puede decidirse en cliente (localStorage): en SSR el banner va
      // oculto y se muestra aquí al montar, sin riesgo de hydration mismatch.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const decide = (accepted: boolean) => {
    localStorage.setItem(STORAGE_KEY, accepted ? "accepted" : "rejected");
    setVisible(false);
    if (accepted) loadAnalytics();
  };

  return (
    <div
      role="region"
      aria-label={t("text")}
      className="fixed inset-x-0 bottom-0 z-[90] p-4"
    >
      <div className="mx-auto max-w-3xl rounded-[1.25rem] bg-night-soft p-5 ring-1 ring-cream/15 shadow-card-hover sm:flex sm:items-center sm:gap-6">
        <p className="text-sm leading-relaxed text-cream/80">
          {t("text")}{" "}
          <Link href="/cookies" className="underline hover:text-cream">
            {t("policy")}
          </Link>
        </p>
        <div className="mt-4 flex shrink-0 gap-2 sm:mt-0">
          <button
            type="button"
            onClick={() => decide(true)}
            className="inline-flex items-center justify-center rounded-full bg-electric px-5 py-2.5 text-sm font-semibold text-night hover:bg-electric-dark"
          >
            {t("accept")}
          </button>
          <button
            type="button"
            onClick={() => decide(false)}
            className="inline-flex items-center justify-center rounded-full border border-cream/20 px-5 py-2.5 text-sm font-semibold text-cream hover:bg-cream/5"
          >
            {t("reject")}
          </button>
        </div>
      </div>
    </div>
  );
}
