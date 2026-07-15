"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { countries } from "@/lib/countries";

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/**
 * Selector de país a lo ancho con buscador: el disparador muestra bandera +
 * nombre del país (que la gente sí recuerda) y el prefijo a la derecha. El
 * dropdown filtra por nombre de país o por prefijo. Sustituye al <select>
 * nativo, que no deja teclear para encontrar el país.
 */
export function CountrySelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (iso: string) => void;
}) {
  const t = useTranslations("reservar");
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = countries.find((c) => c.iso === value) ?? countries[0];

  const filtered = useMemo(() => {
    const nq = norm(q.trim());
    if (!nq) return countries;
    const digits = q.replace(/[^\d]/g, "");
    return countries.filter(
      (c) =>
        norm(c.name).includes(nq) ||
        c.iso.toLowerCase().includes(nq) ||
        (digits.length > 0 && c.dial.replace("+", "").startsWith(digits))
    );
  }, [q]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function pick(iso: string) {
    onChange(iso);
    setOpen(false);
    setQ("");
  }

  return (
    <div className="relative w-full" ref={ref}>
      <button
        type="button"
        aria-label={t("country")}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-2xl bg-cream/[0.04] px-4 py-3 text-sm text-cream ring-1 ring-cream/15 outline-none transition focus:ring-electric"
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className="shrink-0">{selected.flag}</span>
          <span className="truncate">{selected.name}</span>
        </span>
        <span className="flex shrink-0 items-center gap-1.5 text-cream/50">
          {selected.dial}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-2xl bg-night-soft p-2 shadow-card-hover ring-1 ring-cream/15">
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("searchCountry")}
            className="mb-2 w-full rounded-lg bg-cream/[0.06] px-3 py-2 text-sm text-cream ring-1 ring-cream/15 outline-none transition focus:ring-electric placeholder:text-cream/35"
          />
          <ul className="max-h-56 overflow-y-auto">
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-sm text-cream/40">{t("noResults")}</li>
            )}
            {filtered.map((c) => (
              <li key={c.iso}>
                <button
                  type="button"
                  onClick={() => pick(c.iso)}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition hover:bg-cream/10 ${
                    c.iso === value ? "text-electric" : "text-cream"
                  }`}
                >
                  <span className="w-5 shrink-0">{c.flag}</span>
                  <span className="flex-1 truncate">{c.name}</span>
                  <span className="shrink-0 text-cream/50">{c.dial}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
