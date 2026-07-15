"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  getReservableLocation,
  getSlotsForLocation,
  normalizeTime,
  PARTY_MAX,
  type ReservationRow,
} from "@/lib/reservations";
import { setReservationStatus } from "@/app/admin/actions";

/**
 * Tarjeta de reserva del panel admin (client) con acciones apiladas a la
 * derecha: Cancelar/Restaurar arriba y Modificar debajo. Al modificar se
 * despliega un panel (día/hora/comensales) que reusa el endpoint de
 * reprogramar — reenvía el email de cambio al cliente.
 */
export function AdminReservationCard({ r }: { r: ReservationRow }) {
  const cancelled = r.status === "cancelled";
  const router = useRouter();

  const [modOpen, setModOpen] = useState(false);
  const [d, setD] = useState(r.reservation_date);
  const [tm, setTm] = useState(normalizeTime(r.reservation_time));
  const [p, setP] = useState(r.party_size);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const location = getReservableLocation(r.location_slug);
  const slots = location ? getSlotsForLocation(location) : [];
  const field =
    "rounded-lg bg-cream/[0.06] px-2 py-1.5 text-xs text-cream ring-1 ring-cream/15 outline-none focus:ring-electric [color-scheme:dark]";

  async function save() {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch(`/api/reservations/${r.manage_token}/reschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: d, time: tm, partySize: p }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(j.error || "No se pudo modificar.");
        setBusy(false);
        return;
      }
      setModOpen(false);
      setBusy(false);
      router.refresh();
    } catch {
      setErr("Error de conexión.");
      setBusy(false);
    }
  }

  return (
    <li
      className={`rounded-2xl bg-night-soft p-4 ring-1 ring-cream/10 ${
        cancelled ? "opacity-55" : ""
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="font-display text-2xl leading-none text-cream">
              {normalizeTime(r.reservation_time)}
            </p>
            <p className="mt-1 text-xs text-cream/50">{r.party_size} pax</p>
          </div>
          <div>
            <p className="font-semibold text-cream">
              {r.first_name} {r.last_name}
              {cancelled && (
                <span className="ml-2 rounded-full bg-mustard/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-mustard">
                  Cancelada
                </span>
              )}
            </p>
            <p className="text-sm text-cream/60">
              <a href={`tel:${r.phone}`} className="hover:text-cream">
                {r.phone}
              </a>{" "}
              ·{" "}
              <a href={`mailto:${r.email}`} className="hover:text-cream">
                {r.email}
              </a>
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5 text-[11px]">
              {r.occasion && <Tag>🎉 {r.occasion}</Tag>}
              {r.children_count > 0 && <Tag>👶 {r.children_count}</Tag>}
              {r.needs_high_chair && <Tag>Trona</Tag>}
              {r.dietary && <Tag>⚠️ {r.dietary}</Tag>}
              {r.marketing_opt_in && <Tag>✉︎ marketing</Tag>}
            </div>
            {r.notes && <p className="mt-1.5 text-sm text-cream/70">“{r.notes}”</p>}
          </div>
        </div>

        {/* Acciones apiladas: Cancelar arriba, Modificar debajo */}
        <div className="flex w-28 flex-col gap-2">
          <form action={setReservationStatus}>
            <input type="hidden" name="id" value={r.id} />
            <input
              type="hidden"
              name="status"
              value={cancelled ? "confirmed" : "cancelled"}
            />
            <button
              className={`w-full rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition ${
                cancelled
                  ? "text-electric ring-electric/40 hover:bg-electric/10"
                  : "text-mustard ring-mustard/40 hover:bg-mustard/10"
              }`}
            >
              {cancelled ? "Restaurar" : "Cancelar"}
            </button>
          </form>
          {!cancelled && (
            <button
              type="button"
              onClick={() => setModOpen((v) => !v)}
              className="w-full rounded-full px-3 py-1.5 text-xs font-semibold text-cream/80 ring-1 ring-cream/20 transition hover:bg-cream/5"
            >
              Modificar
            </button>
          )}
        </div>
      </div>

      {modOpen && !cancelled && (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-cream/[0.04] p-2 ring-1 ring-cream/10">
          <input
            type="date"
            value={d}
            onChange={(e) => setD(e.target.value)}
            className={field}
          />
          <select
            value={tm}
            onChange={(e) => setTm(e.target.value)}
            className={field}
          >
            {!slots.includes(tm) && <option value={tm}>{tm}</option>}
            {slots.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            value={p}
            onChange={(e) => setP(Number(e.target.value))}
            className={field}
          >
            {Array.from({ length: PARTY_MAX }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n} pax
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={save}
            disabled={busy}
            className="rounded-full bg-electric px-3 py-1.5 text-xs font-bold text-night transition hover:bg-electric-dark disabled:opacity-60"
          >
            {busy ? "Guardando…" : "Guardar"}
          </button>
          <button
            type="button"
            onClick={() => {
              setModOpen(false);
              setErr(null);
            }}
            className="rounded-full px-3 py-1.5 text-xs font-semibold text-cream/60 hover:text-cream"
          >
            Cerrar
          </button>
          {err && <span className="w-full text-xs text-mustard">{err}</span>}
        </div>
      )}
    </li>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-cream/[0.06] px-2 py-0.5 text-cream/70">
      {children}
    </span>
  );
}
