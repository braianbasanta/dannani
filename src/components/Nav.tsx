"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { dineInLocations, takeAwayLocations, hrefFor } from "@/data/locations";

export function Nav() {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  // Páginas cuyo hero (imagen oscura) pasa por debajo del nav transparente.
  const hasDarkHero =
    pathname === "/nuestra-historia" ||
    pathname.startsWith("/restaurantes") ||
    pathname.startsWith("/para-llevar");

  // La home tiene hero oscuro SOLO en móvil (video de fondo); en desktop es
  // claro. Por eso su transparencia se resuelve con variantes md: en CSS.
  const hasMobileDarkHero = pathname === "/";

  const solid = scrolled || open || !hasDarkHero;
  const onDark = !solid;
  const mobileOnDark = hasMobileDarkHero && !scrolled && !open;

  const desktopLink = (href: string) =>
    `py-2 transition-colors duration-500 hover:text-mustard ${
      isActive(href) ? "text-mustard" : ""
    }`;

  return (
    <>
      {/* Sentinel: al salir del viewport, el nav gana fondo */}
      <div
        ref={sentinelRef}
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-6"
      />

      <header
        className={`sticky top-0 z-50 border-b transition-colors duration-500 ${
          onDark || mobileOnDark
            ? "border-transparent bg-transparent"
            : "border-teal-dark/10 bg-cream/95 backdrop-blur"
        } ${
          mobileOnDark && !onDark
            ? "md:border-teal-dark/10 md:bg-cream/95 md:backdrop-blur"
            : ""
        }`}
      >
        <div
          className={`mx-auto flex h-16 max-w-6xl items-center justify-between px-4 transition-colors duration-500 ${
            onDark
              ? "text-cream"
              : mobileOnDark
                ? "text-cream md:text-teal-dark"
                : "text-teal-dark"
          }`}
        >
          <Link
            href="/"
            className="flex items-center gap-2"
            onClick={() => setOpen(false)}
          >
            <Image
              src="/images/logo/logo.png"
              alt="Da Nanni"
              width={140}
              height={74}
              preload
              className={`h-10 w-auto transition-[filter] duration-500 ${
                onDark
                  ? "brightness-0 invert"
                  : mobileOnDark
                    ? "brightness-0 invert md:filter-none"
                    : ""
              }`}
            />
          </Link>

          <nav className="hidden items-center gap-6 font-sans text-sm font-medium md:flex">
            <div className="group relative">
              <Link href="/restaurantes" className={desktopLink("/restaurantes")}>
                {t("restaurantes")}
              </Link>
              <div className="invisible absolute left-0 top-full flex w-56 translate-y-1 flex-col rounded-lg border border-teal-dark/10 bg-cream py-2 text-teal-dark opacity-0 shadow-card transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                {dineInLocations.map((l) => (
                  <Link
                    key={l.slug}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    href={hrefFor(l) as any}
                    className="px-4 py-2 transition-colors duration-150 hover:bg-teal/10"
                  >
                    {l.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="group relative">
              <Link href="/para-llevar" className={desktopLink("/para-llevar")}>
                {t("paraLlevar")}
              </Link>
              <div className="invisible absolute left-0 top-full flex w-56 translate-y-1 flex-col rounded-lg border border-teal-dark/10 bg-cream py-2 text-teal-dark opacity-0 shadow-card transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                {takeAwayLocations.map((l) => (
                  <Link
                    key={l.slug}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    href={hrefFor(l) as any}
                    className="px-4 py-2 transition-colors duration-150 hover:bg-teal/10"
                  >
                    {l.name}
                  </Link>
                ))}
              </div>
            </div>

            <Link href="/carta" className={desktopLink("/carta")}>
              {t("carta")}
            </Link>
            <Link
              href="/nuestra-historia"
              className={desktopLink("/nuestra-historia")}
            >
              {t("nuestraHistoria")}
            </Link>
            <Link
              href="/contacto"
              className="rounded-full bg-mustard px-5 py-2.5 text-cream transition-colors duration-300 hover:bg-mustard-dark active:scale-[0.98]"
            >
              {t("contacto")}
            </Link>
          </nav>

          <button
            type="button"
            aria-label="Menú"
            aria-expanded={open}
            className="md:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>

        {open && (
          <nav className="flex flex-col gap-1 border-t border-teal-dark/10 bg-cream px-4 py-3 font-sans text-sm font-medium text-teal-dark md:hidden">
            <Link
              href="/restaurantes"
              className={`py-2 ${isActive("/restaurantes") ? "text-mustard" : ""}`}
              onClick={() => setOpen(false)}
            >
              {t("restaurantes")}
            </Link>
            <Link
              href="/para-llevar"
              className={`py-2 ${isActive("/para-llevar") ? "text-mustard" : ""}`}
              onClick={() => setOpen(false)}
            >
              {t("paraLlevar")}
            </Link>
            <Link
              href="/carta"
              className={`py-2 ${isActive("/carta") ? "text-mustard" : ""}`}
              onClick={() => setOpen(false)}
            >
              {t("carta")}
            </Link>
            <Link
              href="/nuestra-historia"
              className={`py-2 ${isActive("/nuestra-historia") ? "text-mustard" : ""}`}
              onClick={() => setOpen(false)}
            >
              {t("nuestraHistoria")}
            </Link>
            <Link
              href="/contacto"
              className="mt-1 rounded-full bg-mustard px-4 py-2 text-center text-cream"
              onClick={() => setOpen(false)}
            >
              {t("contacto")}
            </Link>
          </nav>
        )}
      </header>
    </>
  );
}
