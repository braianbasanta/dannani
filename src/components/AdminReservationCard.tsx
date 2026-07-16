"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  getReservableLocation,
  getSlotsForLocation,
  normalizeTime,
  attributionLabel,
  PARTY_MAX,
  type ReservationRow,
} from "@/lib/reservations";
import { setReservationStatus } from "@/app/admin/actions";

/**
 * Tarjeta de reserva del panel admin (client). Acciones según estado:
 * - pending: Confirmar / Rechazar (avisan al cliente por email) + Modificar
 * - confirmed: Cancelar + Modificar
 * - cancelled / rejected: Restaurar
 */
export function AdminReservationCard({ r }: { r: ReservationRow }) {
  const router = useRouter();
  const status = r.status;
  const inactive = status === "cancelled" || status === "rejected";
  const pending = status === "pending";

  const [modOpen, setModOpen] = useState(false);
  const [d, setD] = useState(r.reservation_date);
  const [tm, setTm] = useState(normalizeTime(r.reservation_time));
  const [p, setP] = useState(r.party_size);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const location = getReservableLocation(r.location_slug);
  const slots = location ? getSlotsForLocation(location, d) : [];

  const attr = r.attribution;
  const attrLabel = attributionLabel(attr);
  const attrTitle = attr
    ? [
        attr.utm_source && `source: ${attr.utm_source}`,
        attr.utm_medium && `medium: ${attr.utm_medium}`,
        attr.utm_campaign && `campaign: ${attr.utm_campaign}`,
        attr.utm_content && `content: ${attr.utm_content}`,
        attr.gclid && `gclid: ${attr.gclid}`,
        attr.fbclid && `fbclid: ${attr.fbclid}`,
        attr.referrer && `ref: ${attr.referrer}`,
        attr.landing && `landing: ${attr.landing}`,
      ]
        .filter(Boolean)
        .join(" · ")
    : undefined;
  const field =
    "rounded-lg bg-cream/[0.06] px-2 py-1.5 text-xs text-cream ring-1 ring-cream/15 outline-none focus:ring-electric [color-scheme:dark]";

  async function save() {
    setBusy("save");
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
        setBusy(null);
        return;
      }
      setModOpen(false);
      setBusy(null);
      router.refresh();
    } catch {
      setErr("Error de conexión.");
      setBusy(null);
    }
  }

  async function decide(decision: "confirm" | "reject") {
    setBusy(decision);
    setErr(null);
    try {
      const res = await fetch(`/api/reservations/${r.manage_token}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(j.error || "No se pudo procesar.");
        setBusy(null);
        return;
      }
      setBusy(null);
      router.refresh();
    } catch {
      setErr("Error de conexión.");
      setBusy(null);
    }
  }

  const badge = pending
    ? { t: "Pendiente", c: "bg-mustard/15 text-mustard" }
    : status === "cancelled"
      ? { t: "Cancelada", c: "bg-cream/10 text-cream/50" }
      : status === "rejected"
        ? { t: "Rechazada", c: "bg-cream/10 text-cream/50" }
        : null;

  return (
    <li
      className={`rounded-2xl bg-night-soft p-4 ring-1 ${
        pending ? "ring-mustard/30" : "ring-cream/10"
      } ${inactive ? "opacity-55" : ""}`}
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
              {badge && (
                <span
                  className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${badge.c}`}
                >
                  {badge.t}
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
              {attrLabel && <Tag title={attrTitle}>📍 {attrLabel}</Tag>}
            </div>
            {r.notes && <p className="mt-1.5 text-sm text-cream/70">“{r.notes}”</p>}
          </div>
        </div>

        {/* Acciones según estado */}
        <div className="flex w-32 flex-col gap-2">
          {pending && (
            <>
              <button
                type="button"
                onClick={() => decide("confirm")}
                disabled={busy !== null}
                className="w-full rounded-full bg-electric px-3 py-1.5 text-xs font-bold text-night transition hover:bg-electric-dark disabled:opacity-60"
              >
                {busy === "confirm" ? "…" : "Confirmar"}
              </button>
              <button
                type="button"
                onClick={() => decide("reject")}
                disabled={busy !== null}
                className="w-full rounded-full px-3 py-1.5 text-xs font-semibold text-mustard ring-1 ring-mustard/40 transition hover:bg-mustard/10 disabled:opacity-60"
              >
                {busy === "reject" ? "…" : "Rechazar"}
              </button>
            </>
          )}
          {status === "confirmed" && (
            <form action={setReservationStatus}>
              <input type="hidden" name="id" value={r.id} />
              <input type="hidden" name="status" value="cancelled" />
              <button className="w-full rounded-full px-3 py-1.5 text-xs font-semibold text-mustard ring-1 ring-mustard/40 transition hover:bg-mustard/10">
                Cancelar
              </button>
            </form>
          )}
          {inactive && (
            <form action={setReservationStatus}>
              <input type="hidden" name="id" value={r.id} />
              <input type="hidden" name="status" value="confirmed" />
              <button className="w-full rounded-full px-3 py-1.5 text-xs font-semibold text-electric ring-1 ring-electric/40 transition hover:bg-electric/10">
                Restaurar
              </button>
            </form>
          )}
          {!inactive && (
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

      {err && <p className="mt-2 text-xs text-mustard">{err}</p>}

      {modOpen && !inactive && (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-cream/[0.04] p-2 ring-1 ring-cream/10">
          <input
            type="date"
            value={d}
            onChange={(e) => setD(e.target.value)}
            className={field}
          />
          <select value={tm} onChange={(e) => setTm(e.target.value)} className={field}>
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
            {Array.from({ length: Math.max(PARTY_MAX, r.party_size) }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n} pax
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={save}
            disabled={busy !== null}
            className="rounded-full bg-electric px-3 py-1.5 text-xs font-bold text-night transition hover:bg-electric-dark disabled:opacity-60"
          >
            {busy === "save" ? "Guardando…" : "Guardar"}
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
        </div>
      )}
    </li>
  );
}

function Tag({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <span
      title={title}
      className="rounded-full bg-cream/[0.06] px-2 py-0.5 text-cream/70"
    >
      {children}
    </span>
  );
}
