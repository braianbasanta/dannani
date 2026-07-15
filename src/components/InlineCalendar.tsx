"use client";

import { useState } from "react";

function ymd(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/**
 * Calendario inline (mes navegable) para elegir el día de la reserva sin abrir
 * el date-picker nativo: menos fricción, un clic. Semana empieza en lunes.
 * Los días anteriores a `min` (YYYY-MM-DD) quedan deshabilitados.
 */
export function InlineCalendar({
  value,
  min,
  onChange,
  locale,
}: {
  value: string;
  min: string;
  onChange: (date: string) => void;
  locale: string;
}) {
  const base = value || min;
  const [y, setY] = useState(Number(base.slice(0, 4)));
  const [m, setM] = useState(Number(base.slice(5, 7)) - 1);

  const minY = Number(min.slice(0, 4));
  const minM = Number(min.slice(5, 7)) - 1;

  const firstOfMonth = new Date(Date.UTC(y, m, 1));
  const weekdayMon0 = (firstOfMonth.getUTCDay() + 6) % 7; // 0 = lunes
  const daysInMonth = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  const canPrev = y > minY || (y === minY && m > minM);

  // Cabeceras L–D localizadas (1 ene 2024 fue lunes).
  const weekdays = Array.from({ length: 7 }, (_, i) =>
    new Intl.DateTimeFormat(locale, { weekday: "narrow", timeZone: "UTC" }).format(
      new Date(Date.UTC(2024, 0, 1 + i))
    )
  );
  const monthLabel = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(firstOfMonth);

  function prev() {
    if (!canPrev) return;
    if (m === 0) {
      setY(y - 1);
      setM(11);
    } else setM(m - 1);
  }
  function next() {
    if (m === 11) {
      setY(y + 1);
      setM(0);
    } else setM(m + 1);
  }

  const cells: (number | null)[] = [];
  for (let i = 0; i < weekdayMon0; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const navBtn =
    "flex h-8 w-8 items-center justify-center rounded-lg text-cream/70 transition hover:bg-cream/10 disabled:cursor-not-allowed disabled:opacity-30";

  return (
    <div className="rounded-2xl bg-cream/[0.03] p-3 ring-1 ring-cream/10">
      <div className="mb-2 flex items-center justify-between">
        <button type="button" onClick={prev} disabled={!canPrev} className={navBtn} aria-label="Mes anterior">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="m15 18-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span className="text-sm font-semibold capitalize text-cream">{monthLabel}</span>
        <button type="button" onClick={next} className={navBtn} aria-label="Mes siguiente">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="m9 18 6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase text-cream/40">
        {weekdays.map((w, i) => (
          <span key={i}>{w}</span>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (d === null) return <span key={i} />;
          const ds = ymd(y, m, d);
          const disabled = ds < min;
          const selected = ds === value;
          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => onChange(ds)}
              className={`flex aspect-square items-center justify-center rounded-lg text-sm transition ${
                selected
                  ? "bg-electric font-bold text-night"
                  : disabled
                    ? "cursor-not-allowed text-cream/20"
                    : "text-cream hover:bg-cream/10"
              }`}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}
