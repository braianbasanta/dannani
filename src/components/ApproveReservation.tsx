"use client";

import { useState } from "react";

export interface ApproveData {
  locationName: string;
  address: string;
  dateLong: string;
  time: string;
  partySize: number;
  name: string;
  phone: string;
  email: string;
  occasion: string | null;
  dietary: string | null;
  notes: string | null;
  childrenCount: number;
  needsHighChair: boolean;
}

/**
 * Pantalla interna para que la manager confirme o rechace una reserva de grupo
 * grande (pending). Enviada por email; en español. La acción va por POST (no
 * por GET) para evitar que el prefetch del correo la ejecute sola.
 */
export function ApproveReservation({
  token,
  initialStatus,
  preselect,
  data,
}: {
  token: string;
  initialStatus: "pending" | "confirmed" | "cancelled" | "rejected";
  preselect?: "confirm" | "reject";
  data: ApproveData;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [busy, setBusy] = useState<"confirm" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function decide(decision: "confirm" | "reject") {
    setBusy(decision);
    setError(null);
    try {
      const res = await fetch(`/api/reservations/${token}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error || "No se pudo procesar.");
        setBusy(null);
        return;
      }
      setStatus(decision === "confirm" ? "confirmed" : "rejected");
      setBusy(null);
    } catch {
      setError("Error de conexión.");
      setBusy(null);
    }
  }

  const Row = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between gap-4 py-2 text-sm">
      <span className="text-cream/50">{label}</span>
      <span className="text-right font-semibold text-cream">{value}</span>
    </div>
  );

  return (
    <div className="rounded-[1.5rem] bg-night-soft p-6 shadow-card ring-1 ring-cream/10">
      <div className="flex items-center justify-between gap-3">
        <p className="font-display text-xl text-cream">{data.locationName}</p>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
            status === "confirmed"
              ? "bg-electric/15 text-electric"
              : status === "pending"
                ? "bg-mustard/15 text-mustard"
                : "bg-cream/10 text-cream/60"
          }`}
        >
          {status === "pending"
            ? "Pendiente"
            : status === "confirmed"
              ? "Confirmada"
              : status === "rejected"
                ? "Rechazada"
                : "Cancelada"}
        </span>
      </div>
      <p className="mt-1 text-sm text-cream/60">{data.address}</p>

      <div className="mt-4 divide-y divide-cream/10 border-t border-cream/10">
        <Row label="Día" value={data.dateLong} />
        <Row label="Hora" value={data.time} />
        <Row label="Comensales" value={`${data.partySize} personas`} />
        {data.childrenCount > 0 && (
          <Row
            label="Niños"
            value={`${data.childrenCount}${data.needsHighChair ? " · trona" : ""}`}
          />
        )}
        {data.occasion && <Row label="Ocasión" value={data.occasion} />}
        {data.dietary && <Row label="Alergias" value={data.dietary} />}
        {data.notes && <Row label="Notas" value={data.notes} />}
        <Row label="Cliente" value={data.name} />
        <Row label="Teléfono" value={data.phone} />
        <Row label="Email" value={data.email} />
      </div>

      {status === "pending" ? (
        <>
          {error && (
            <p className="mt-4 rounded-xl bg-mustard/15 px-4 py-2.5 text-sm text-mustard">
              {error}
            </p>
          )}
          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={() => decide("confirm")}
              disabled={busy !== null}
              className={`flex-1 rounded-full px-5 py-3 text-sm font-bold uppercase tracking-wider text-night transition disabled:opacity-60 ${
                preselect === "confirm"
                  ? "bg-electric ring-2 ring-electric/50"
                  : "bg-electric hover:bg-electric-dark"
              }`}
            >
              {busy === "confirm" ? "Confirmando…" : "Confirmar"}
            </button>
            <button
              type="button"
              onClick={() => decide("reject")}
              disabled={busy !== null}
              className="flex-1 rounded-full border border-mustard/50 px-5 py-3 text-sm font-bold uppercase tracking-wider text-mustard transition hover:bg-mustard/10 disabled:opacity-60"
            >
              {busy === "reject" ? "Rechazando…" : "Rechazar"}
            </button>
          </div>
        </>
      ) : (
        <p className="mt-5 rounded-xl bg-cream/[0.04] px-4 py-3 text-sm text-cream/70">
          {status === "confirmed"
            ? "Reserva confirmada. Se ha enviado el email de confirmación al cliente."
            : status === "rejected"
              ? "Reserva rechazada. Se ha avisado al cliente por email."
              : "Esta reserva está cancelada."}
        </p>
      )}
    </div>
  );
}
