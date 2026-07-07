"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import Image from "next/image";
import { Reveal } from "@/components/Reveal";

export interface Milestone {
  date: string;
  title: string;
  copy: string;
  href?: string;
  icon: "flame" | "pin";
  image?: string;
}

function FlameIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path
        d="M12 2c1 3-2 4-2 7a3 3 0 0 0 6 0c1.5 1 2 3 2 4.5a6 6 0 1 1-12 0C6 9 9 8 12 2Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11Z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function MilestoneCard({ milestone }: { milestone: Milestone }) {
  const Icon = milestone.icon === "flame" ? FlameIcon : PinIcon;

  const content = milestone.image ? (
    <div className="group relative aspect-[3/4] overflow-hidden rounded-[1.75rem] shadow-card ring-1 ring-cream/10 transition-all duration-500 ease-fluid hover:-translate-y-1 hover:shadow-card-hover">
      <Image
        src={milestone.image}
        alt={milestone.title}
        fill
        sizes="(min-width: 768px) 24rem, 100vw"
        className="object-cover transition-transform duration-700 ease-fluid group-hover:scale-[1.06]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-night/95 via-night/35 to-night/5" />

      <div className="absolute inset-x-0 top-0 p-6 sm:p-8">
        <span className="rounded-full bg-night/70 px-3 py-1 font-display text-xs font-semibold uppercase tracking-[0.15em] text-electric ring-1 ring-cream/20 backdrop-blur">
          {milestone.date}
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 p-6 text-cream sm:p-8">
        <h3 className="font-display text-2xl tracking-tight sm:text-[1.75rem]">
          {milestone.title}
        </h3>
        <p className="mt-2 leading-relaxed text-cream/85">{milestone.copy}</p>
      </div>
    </div>
  ) : (
    <div className="group rounded-[1.75rem] bg-cream/5 p-6 shadow-card ring-1 ring-cream/10 transition-all duration-500 ease-fluid hover:-translate-y-1 hover:shadow-card-hover sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <span className="font-display text-sm font-semibold uppercase tracking-[0.15em] text-electric">
          {milestone.date}
        </span>
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-electric/10 text-electric transition-transform duration-500 ease-fluid group-hover:rotate-[10deg] group-hover:scale-110 sm:h-14 sm:w-14">
          <Icon />
        </span>
      </div>
      <h3 className="mt-4 font-display text-2xl tracking-tight text-cream sm:text-[1.75rem]">
        {milestone.title}
      </h3>
      <p className="mt-2 leading-relaxed text-cream/70">{milestone.copy}</p>
    </div>
  );

  return milestone.href ? (
    <a href={milestone.href} className="block">
      {content}
    </a>
  ) : (
    content
  );
}

// Genera un camino serpenteante suave que visita, una vez por milestone,
// la columna izquierda o derecha (alternando), enlazadas con curvas
// Bézier. El SVG usa preserveAspectRatio="none", así que este viewBox
// se estira al alto real del contenedor sin que importe su proporción.
function buildSnakePath(count: number) {
  const width = 800;
  const segH = 260;
  // El hueco real entre tarjetas es angosto (ver w-[calc(50%-3.5rem)] más
  // abajo): si el camino apunta muy adentro de cada tarjeta queda tapado
  // casi todo el trayecto. Lo mantenemos dentro del hueco visible.
  const leftX = width * 0.445;
  const rightX = width * 0.555;
  const midX = width / 2;

  const points = [{ x: midX, y: 0 }];
  for (let i = 0; i < count; i++) {
    points.push({ x: i % 2 === 0 ? leftX : rightX, y: segH * (i + 0.5) });
  }
  points.push({ x: midX, y: segH * count });

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cy = (prev.y + curr.y) / 2;
    d += ` C ${prev.x} ${cy}, ${curr.x} ${cy}, ${curr.x} ${curr.y}`;
  }

  return { d, width, height: segH * count };
}

export function HistoriaTimeline({
  header,
  milestones,
}: {
  header: ReactNode;
  milestones: Milestone[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const markerRef = useRef<HTMLDivElement>(null);
  const mobileFillRef = useRef<HTMLDivElement>(null);
  const totalLengthRef = useRef(0);

  const { d: snakeD, width: viewBoxWidth, height: viewBoxHeight } = buildSnakePath(
    milestones.length
  );

  useEffect(() => {
    if (pathRef.current) {
      const total = pathRef.current.getTotalLength();
      totalLengthRef.current = total;
      pathRef.current.style.strokeDasharray = `${total}`;
      pathRef.current.style.strokeDashoffset = `${total}`;
    }

    let raf = 0;

    const update = () => {
      raf = 0;
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // Progreso 0→1 mientras el timeline cruza la franja 65%→40% del viewport.
      const denom = 0.25 * vh + rect.height;
      let p = (0.65 * vh - rect.top) / denom;
      p = p < 0 ? 0 : p > 1 ? 1 : p;

      const total = totalLengthRef.current;
      if (pathRef.current && total) {
        pathRef.current.style.strokeDashoffset = `${(1 - p) * total}`;

        if (markerRef.current) {
          const point = pathRef.current.getPointAtLength(p * total);
          markerRef.current.style.left = `${(point.x / viewBoxWidth) * 100}%`;
          markerRef.current.style.top = `${(point.y / viewBoxHeight) * 100}%`;
          markerRef.current.style.opacity = p > 0.01 && p < 0.995 ? "1" : "0";
        }
      }

      if (mobileFillRef.current) {
        mobileFillRef.current.style.transform = `scaleY(${p})`;
      }
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [viewBoxWidth, viewBoxHeight]);

  return (
    <section className="relative -mt-16 overflow-hidden bg-night-soft pb-16 pt-32 text-cream sm:pt-36 md:pb-24">
      <div className="mx-auto max-w-6xl px-4">
        {header}

        <div className="relative mt-20 md:mt-28" ref={containerRef}>
          {/* DESKTOP: camino serpenteante que se dibuja con el scroll */}
          <div className="relative mx-auto hidden max-w-4xl md:block">
            <svg
              className="pointer-events-none absolute left-1/2 top-0 h-full w-full -translate-x-1/2"
              viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
              preserveAspectRatio="none"
              fill="none"
              aria-hidden
            >
              <defs>
                <linearGradient id="historia-line" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#59c8ec" />
                  <stop offset="100%" stopColor="#35aed6" />
                </linearGradient>
              </defs>

              <path
                d={snakeD}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="text-cream/15"
                strokeDasharray="1 10"
              />
              <path
                ref={pathRef}
                d={snakeD}
                stroke="url(#historia-line)"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            </svg>

            <div
              ref={markerRef}
              aria-hidden
              className="pointer-events-none absolute z-10 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-electric opacity-0 shadow-[0_0_16px_4px_rgba(89,200,236,0.55)] transition-opacity duration-300"
            />

            <div className="relative z-10 space-y-14">
              {milestones.map((m, i) => (
                <Reveal key={m.date + m.title} delay={i * 60}>
                  <div className={`flex ${i % 2 !== 0 ? "justify-end" : "justify-start"}`}>
                    <div className="w-[calc(50%-3.5rem)]">
                      <MilestoneCard milestone={m} />
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* MOBILE: línea a la izquierda que se rellena con el scroll */}
          <div className="relative pl-8 md:hidden">
            <div aria-hidden className="absolute bottom-2 left-3 top-2 w-px bg-cream/15" />
            <div
              ref={mobileFillRef}
              aria-hidden
              className="absolute bottom-2 left-3 top-2 w-px origin-top bg-electric"
              style={{ transform: "scaleY(0)" }}
            />
            <ol className="space-y-8">
              {milestones.map((m, i) => (
                <Reveal key={m.date + m.title} delay={i * 60}>
                  <li>
                    <MilestoneCard milestone={m} />
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
