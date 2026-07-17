"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import {
  dineInLocations,
  takeAwayLocations,
  hrefFor,
  cartaHrefFor,
} from "@/data/locations";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

// Locales ordenados por año de apertura (queda más natural en los menús)
const dineInByYear = [...dineInLocations].sort((a, b) => a.openedYear - b.openedYear);
const takeAwayByYear = [...takeAwayLocations].sort((a, b) => a.openedYear - b.openedYear);
// Todas las cartas para el desplegable de "Carta": trattorias primero,
// take away al final (con su etiqueta). Hoy los 6 locales tienen carta.
const cartaLocations = [...dineInByYear, ...takeAwayByYear];

type MobileSection = "restaurantes" | "paraLlevar" | "carta";

export function Nav() {
  const t = useTranslations("nav");
  const tLocal = useTranslations("local");
  const tReservar = useTranslations("reservar");
  const [open, setOpen] = useState(false);
  // Acordeón del menú móvil: cerrado por defecto para que todo el menú
  // (idiomas y CTAs incluidos) entre en pantalla sin scroll.
  const [openSection, setOpenSection] = useState<MobileSection | null>(null);
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

  // Menú móvil fullscreen: bloquea el scroll de la página mientras está
  // abierto. iOS Safari ignora overflow:hidden en body para el scroll táctil
  // y descoloca los elementos fixed si se pone en <html> con la página
  // scrolleada, así que se usa el bloqueo clásico: congelar el body con
  // position:fixed conservando el offset y restaurar el scroll al cerrar.
  useEffect(() => {
    if (!open) return;
    const scrollY = window.scrollY;
    const body = document.body.style;
    body.position = "fixed";
    body.top = `-${scrollY}px`;
    body.left = "0";
    body.right = "0";
    body.width = "100%";
    body.overflow = "hidden";
    return () => {
      body.position = "";
      body.top = "";
      body.left = "";
      body.right = "";
      body.width = "";
      body.overflow = "";
      // instant: el scroll-behavior:smooth global animaría el salto de vuelta
      window.scrollTo({ top: scrollY, behavior: "instant" });
    };
  }, [open]);

  // Cierra el menú móvil y repliega el acordeón (estado inicial).
  const closeMenu = () => {
    setOpen(false);
    setOpenSection(null);
  };

  const toggleSection = (section: MobileSection) =>
    setOpenSection((current) => (current === section ? null : section));

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  // Páginas cuyo hero (imagen/video oscuro) pasa por debajo del nav
  // transparente. Con el tema oscuro el texto es cream siempre; lo único
  // que cambia al scrollear es el fondo del nav.
  const hasDarkHero =
    pathname === "/" ||
    pathname === "/nuestra-historia" ||
    pathname === "/a-domicilio" ||
    pathname.startsWith("/restaurantes") ||
    pathname.startsWith("/pizza-para-llevar");

  const solid = scrolled || open || !hasDarkHero;

  const desktopLink = (href: string) =>
    `py-2 transition-colors duration-500 hover:text-electric ${
      isActive(href) ? "text-electric" : ""
    }`;

  return (
    <>
      {/* Sentinel: al salir del viewport, el nav gana fondo */}
      <div
        ref={sentinelRef}
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-6"
      />

      {/* -mb-px: el border-b (aun transparente) añade 1px a la altura del nav;
          sin compensarlo, los heros que se suben con -mt-16 dejan ver una
          línea de 1px del fondo night del body arriba del todo. */}
      {/* Con el menú abierto el body queda congelado (position:fixed) y el
          sticky dejaría el header fuera de pantalla; se fija al viewport. */}
      <header
        className={`${open ? "fixed inset-x-0" : "sticky"} top-0 z-50 -mb-px border-b transition-colors duration-300 ${
          solid
            ? "border-cream/10 bg-night/90 backdrop-blur"
            : "border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 text-cream">
          <Link
            href="/"
            className="flex items-center gap-2"
            onClick={closeMenu}
          >
            <Image
              src="/images/logo/logo-nero-nav.png"
              alt="Da Nanni"
              width={1001}
              height={575}
              preload
              className="h-12 w-auto"
            />
          </Link>

          <nav className="hidden items-center gap-6 font-sans text-sm font-medium md:flex">
            <div className="group relative">
              <Link href="/restaurantes" className={desktopLink("/restaurantes")}>
                {t("restaurantes")}
              </Link>
              <div className="invisible absolute left-0 top-full w-64 translate-y-2 pt-3 opacity-0 transition-all duration-300 ease-fluid group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                <div className="rounded-2xl bg-night-soft p-2 text-cream ring-1 ring-cream/10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.7),0_0_30px_rgba(85,153,170,0.08)]">
                  {dineInByYear.map((l) => (
                    <Link
                      key={l.slug}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      href={hrefFor(l) as any}
                      className="group/item flex items-baseline justify-between gap-3 rounded-xl px-4 py-3 transition-colors duration-200 hover:bg-electric/10"
                    >
                      <span className="font-display text-lg tracking-tight transition-colors duration-200 group-hover/item:text-electric">
                        {l.neighborhood}
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cream/40 transition-colors duration-200 group-hover/item:text-electric/70">
                        {tLocal("desde")} {l.openedYear}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="group relative">
              <Link href="/pizza-para-llevar" className={desktopLink("/pizza-para-llevar")}>
                {t("paraLlevar")}
              </Link>
              <div className="invisible absolute left-0 top-full w-64 translate-y-2 pt-3 opacity-0 transition-all duration-300 ease-fluid group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                <div className="rounded-2xl bg-night-soft p-2 text-cream ring-1 ring-cream/10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.7),0_0_30px_rgba(85,153,170,0.08)]">
                  {takeAwayByYear.map((l) => (
                    <Link
                      key={l.slug}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      href={hrefFor(l) as any}
                      className="group/item flex items-baseline justify-between gap-3 rounded-xl px-4 py-3 transition-colors duration-200 hover:bg-electric/10"
                    >
                      <span className="font-display text-lg tracking-tight transition-colors duration-200 group-hover/item:text-electric">
                        {l.neighborhood}
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cream/40 transition-colors duration-200 group-hover/item:text-electric/70">
                        {tLocal("desde")} {l.openedYear}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <Link href="/a-domicilio" className={desktopLink("/a-domicilio")}>
              {t("aDomicilio")}
            </Link>
            <div className="group relative">
              <Link href="/restaurantes/cartas" className={desktopLink("/restaurantes/cartas")}>
                {t("carta")}
              </Link>
              <div className="invisible absolute left-0 top-full w-64 translate-y-2 pt-3 opacity-0 transition-all duration-300 ease-fluid group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                <div className="rounded-2xl bg-night-soft p-2 text-cream ring-1 ring-cream/10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.7),0_0_30px_rgba(85,153,170,0.08)]">
                  {cartaLocations.map((l) => (
                    <Link
                      key={l.slug}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      href={cartaHrefFor(l) as any}
                      className="group/item flex items-baseline justify-between gap-3 rounded-xl px-4 py-3 transition-colors duration-200 hover:bg-electric/10"
                    >
                      <span className="font-display text-lg tracking-tight transition-colors duration-200 group-hover/item:text-electric">
                        {l.neighborhood}
                      </span>
                      {l.type === "take-away" && (
                        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cream/40 transition-colors duration-200 group-hover/item:text-electric/70">
                          {t("paraLlevar")}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <Link
              href="/nuestra-historia"
              className={desktopLink("/nuestra-historia")}
            >
              {t("nuestraHistoria")}
            </Link>
            <Link href="/contacto" className={desktopLink("/contacto")}>
              {t("contacto")}
            </Link>
            <LanguageSwitcher variant="desktop" />
            <Link
              href="/reservar"
              className="rounded-full bg-electric px-5 py-2.5 font-semibold text-night transition-all duration-300 hover:bg-electric-dark hover:shadow-neon active:scale-[0.98]"
            >
              {tReservar("navLabel")}
            </Link>
          </nav>

          <div className="flex items-center gap-3 md:hidden">
            <Link
              href="/reservar"
              className="rounded-full bg-electric px-4 py-2 font-sans text-sm font-semibold text-night transition-transform active:scale-[0.98]"
              onClick={closeMenu}
            >
              {tReservar("navLabel")}
            </Link>
            <button
              type="button"
              aria-label={t("menuButton")}
              aria-expanded={open}
              onClick={() => (open ? closeMenu() : setOpen(true))}
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
        </div>

      </header>

      {/* Menú móvil fullscreen. Vive fuera del <header> porque su
          backdrop-blur crearía un containing block y rompería el fixed. */}
      {open && (
        <nav className="fixed inset-x-0 bottom-0 top-16 z-40 flex flex-col overflow-y-auto overscroll-contain bg-night px-6 pb-8 pt-8 font-sans text-cream md:hidden">
          <div>
            <button
              type="button"
              aria-expanded={openSection === "restaurantes"}
              className={`flex w-full items-center justify-between font-display text-3xl tracking-tight ${isActive("/restaurantes") ? "text-electric" : ""}`}
              onClick={() => toggleSection("restaurantes")}
            >
              {t("restaurantes")}
              <Chevron open={openSection === "restaurantes"} />
            </button>
            {openSection === "restaurantes" && (
              <div className="mt-4 grid grid-cols-2 gap-2">
                {dineInByYear.map((l) => (
                  <Link
                    key={l.slug}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    href={hrefFor(l) as any}
                    className="rounded-xl bg-cream/5 px-5 py-4 text-lg font-medium ring-1 ring-cream/10 transition-colors active:bg-cream/10"
                    onClick={closeMenu}
                  >
                    {l.neighborhood}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6">
            <button
              type="button"
              aria-expanded={openSection === "paraLlevar"}
              className={`flex w-full items-center justify-between font-display text-3xl tracking-tight ${isActive("/pizza-para-llevar") ? "text-electric" : ""}`}
              onClick={() => toggleSection("paraLlevar")}
            >
              {t("paraLlevar")}
              <Chevron open={openSection === "paraLlevar"} />
            </button>
            {openSection === "paraLlevar" && (
              <div className="mt-4 grid grid-cols-2 gap-2">
                {takeAwayByYear.map((l) => (
                  <Link
                    key={l.slug}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    href={hrefFor(l) as any}
                    className="rounded-xl bg-cream/5 px-5 py-4 text-lg font-medium ring-1 ring-cream/10 transition-colors active:bg-cream/10"
                    onClick={closeMenu}
                  >
                    {l.neighborhood}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6">
            <button
              type="button"
              aria-expanded={openSection === "carta"}
              className={`flex w-full items-center justify-between font-display text-3xl tracking-tight ${isActive("/restaurantes/cartas") ? "text-electric" : ""}`}
              onClick={() => toggleSection("carta")}
            >
              {t("carta")}
              <Chevron open={openSection === "carta"} />
            </button>
            {openSection === "carta" && (
              <div className="mt-4 grid grid-cols-2 gap-2">
                {cartaLocations.map((l) => (
                  <Link
                    key={l.slug}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    href={cartaHrefFor(l) as any}
                    className="rounded-xl bg-cream/5 px-5 py-4 text-lg font-medium ring-1 ring-cream/10 transition-colors active:bg-cream/10"
                    onClick={closeMenu}
                  >
                    {l.neighborhood}
                    {l.type === "take-away" && (
                      <span className="block text-xs font-medium text-mustard">
                        {t("paraLlevar")}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-col gap-6">
            <Link
              href="/a-domicilio"
              className={`font-display text-3xl tracking-tight ${isActive("/a-domicilio") ? "text-electric" : ""}`}
              onClick={closeMenu}
            >
              {t("aDomicilio")}
            </Link>
            <Link
              href="/nuestra-historia"
              className={`font-display text-3xl tracking-tight ${isActive("/nuestra-historia") ? "text-electric" : ""}`}
              onClick={closeMenu}
            >
              {t("nuestraHistoria")}
            </Link>
          </div>

          <div className="mt-auto flex flex-col gap-3 pt-6">
            <LanguageSwitcher variant="mobile" onNavigate={() => setOpen(false)} />
            <Link
              href="/reservar"
              className="block rounded-full bg-electric px-6 py-3.5 text-center text-sm font-semibold text-night transition-colors hover:bg-electric-dark"
              onClick={closeMenu}
            >
              {tReservar("navLabel")}
            </Link>
            <Link
              href="/contacto"
              className="block rounded-full border border-cream/20 px-6 py-3.5 text-center text-sm font-semibold text-cream transition-colors hover:bg-cream/5"
              onClick={closeMenu}
            >
              {t("contacto")}
            </Link>
          </div>
        </nav>
      )}
    </>
  );
}

/** Flecha de los acordeones del menú móvil: rota 180° al abrir la sección. */
function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
      className={`shrink-0 text-cream/50 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
    >
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
