"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type TransitionEvent as ReactTransitionEvent,
  type WheelEvent as ReactWheelEvent,
} from "react";
import { useTranslations } from "next-intl";
import type { MenuItem } from "@/data/menu";

export type MediaEntry = { item: MenuItem; sectionTitle: string };

type DishMediaViewerProps = {
  entries: MediaEntry[];
  startIndex: number;
  onClose: () => void;
};

const DRAG_RATIO = 0.18; // fracción del ancho para confirmar el cambio
const SLIDE_MS = 340;
const WHEEL_COOLDOWN_MS = 700;

export function DishMediaViewer({
  entries,
  startIndex,
  onClose,
}: DishMediaViewerProps) {
  const t = useTranslations("menuVideo");
  const n = entries.length;
  const [index, setIndex] = useState(() =>
    Math.min(Math.max(startIndex, 0), n - 1)
  );
  const [dragPx, setDragPx] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [stageW, setStageW] = useState(0);

  const stageRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const pointerStart = useRef<{ x: number; id: number } | null>(null);
  const pendingDir = useRef(0);
  const lastWheel = useRef(0);
  // Este componente solo se monta client-side (tras un click), así que
  // `window` ya está disponible en el render inicial.
  const [reducedMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () => setStageW(el.offsetWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  const commitNav = useCallback(
    (dir: number) => {
      setIndex((i) => (i + dir + n) % n);
      setAnimating(false);
      setDragPx(0);
    },
    [n]
  );

  // dir: 1 = siguiente, -1 = anterior, 0 = volver a su sitio.
  const navigate = useCallback(
    (dir: number) => {
      if (dir === 0) {
        setAnimating(true);
        setDragPx(0);
        return;
      }
      if (pendingDir.current !== 0) return;
      if (reducedMotion || stageW === 0) {
        commitNav(dir);
        return;
      }
      pendingDir.current = dir;
      setAnimating(true);
      setDragPx(dir > 0 ? -stageW : stageW);
    },
    [commitNav, reducedMotion, stageW]
  );

  const onTransitionEnd = useCallback(
    (event: ReactTransitionEvent<HTMLDivElement>) => {
      if (event.target !== event.currentTarget) return;
      if (pendingDir.current !== 0) {
        const dir = pendingDir.current;
        pendingDir.current = 0;
        commitNav(dir);
      } else {
        setAnimating(false);
      }
    },
    [commitNav]
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      else if (event.key === "ArrowRight" || event.key === "ArrowDown")
        navigate(1);
      else if (event.key === "ArrowLeft" || event.key === "ArrowUp")
        navigate(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate, onClose]);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  const isBusy = () => animating || pendingDir.current !== 0;

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (isBusy() || event.pointerType === "mouse") return;
    pointerStart.current = { x: event.clientX, id: event.pointerId };
    event.currentTarget.setPointerCapture(event.pointerId);
    setAnimating(false);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = pointerStart.current;
    if (!start || start.id !== event.pointerId) return;
    setDragPx(event.clientX - start.x);
  };

  const onPointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = pointerStart.current;
    if (!start || start.id !== event.pointerId) return;
    pointerStart.current = null;
    const dx = event.clientX - start.x;
    const threshold = Math.max(stageW * DRAG_RATIO, 48);
    if (dx <= -threshold) navigate(1);
    else if (dx >= threshold) navigate(-1);
    else if (Math.abs(dx) < 2) {
      setDragPx(0);
      setAnimating(false);
    } else {
      navigate(0);
    }
  };

  const onWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    if (isBusy()) return;
    if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
    if (Math.abs(event.deltaX) < 30) return;
    const now = Date.now();
    if (now - lastWheel.current < WHEEL_COOLDOWN_MS) return;
    lastWheel.current = now;
    navigate(event.deltaX > 0 ? 1 : -1);
  };

  const transition = animating
    ? `transform ${reducedMotion ? 0 : SLIDE_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`
    : "none";

  const trio = [
    entries[(index - 1 + n) % n],
    entries[index],
    entries[(index + 1) % n],
  ];
  const current = entries[index];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={current.item.name}
      className="fixed inset-0 z-[100] flex items-center justify-center"
    >
      {/* Fondo con los colores de la marca — clic fuera cierra */}
      <button
        type="button"
        aria-label={t("cerrarFondo")}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-teal-dark/95 backdrop-blur-md"
      />

      {/* Escenario — a pantalla completa en móvil, tarjeta 9:16 en desktop */}
      <div
        ref={stageRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onWheel={onWheel}
        style={{ touchAction: "none" }}
        className="relative h-[100dvh] w-full max-w-[100vw] touch-none select-none overflow-hidden bg-black shadow-[0_30px_80px_rgba(0,0,0,0.55)] sm:aspect-[9/16] sm:h-full sm:max-h-[90svh] sm:w-auto sm:max-w-[94vw] sm:rounded-2xl"
      >
        <div
          onTransitionEnd={onTransitionEnd}
          style={{
            transform: `translateX(${-stageW + dragPx}px)`,
            transition,
          }}
          className="flex h-full"
        >
          {trio.map((entry, i) => (
            <div
              key={`${entry.item.name}-${i}`}
              style={{ width: stageW || "100%" }}
              className="relative h-full shrink-0 bg-black"
            >
              {entry.item.video ? (
                <video
                  src={entry.item.video}
                  poster={entry.item.poster}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  draggable={false}
                  className="h-full w-full object-cover"
                />
              ) : entry.item.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={entry.item.photo}
                  alt={entry.item.name}
                  draggable={false}
                  className="h-full w-full object-cover"
                />
              ) : null}

              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-teal-dark via-teal-dark/55 to-transparent px-6 pb-9 pt-20 sm:pb-7">
                <h2 className="font-display text-2xl leading-tight text-cream md:text-3xl">
                  {entry.item.name}
                </h2>
                <p className="mt-1 font-sans text-lg font-semibold text-mustard">
                  {entry.item.price}
                </p>
                {entry.item.description ? (
                  <p className="mt-2 max-w-md text-sm italic leading-snug text-cream/75">
                    {entry.item.description}
                  </p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contador */}
      <span className="absolute left-5 top-5 font-display text-sm tracking-[0.3em] text-mustard">
        {String(index + 1).padStart(2, "0")} / {n}
      </span>

      {/* Cerrar */}
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label={t("cerrar")}
        className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-cream/30 text-cream transition-colors duration-300 hover:border-mustard hover:text-mustard"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
          <path
            d="M6 6l12 12M18 6L6 18"
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinecap="round"
          />
        </svg>
      </button>

      {n > 1 && (
        <>
          {/* Anterior */}
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label={t("anterior")}
            className="absolute left-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center text-cream/70 transition-colors duration-300 hover:text-mustard sm:left-5 md:h-14 md:w-14"
          >
            <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden>
              <path
                d="M15 5l-7 7 7 7"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.6}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Siguiente */}
          <button
            type="button"
            onClick={() => navigate(1)}
            aria-label={t("siguiente")}
            className="absolute right-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center text-cream/70 transition-colors duration-300 hover:text-mustard sm:right-5 md:h-14 md:w-14"
          >
            <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden>
              <path
                d="M9 5l7 7-7 7"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.6}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}
