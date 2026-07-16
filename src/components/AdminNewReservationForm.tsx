"use client";

import { useActionState, useMemo, useState } from "react";
import {
  reservableLocations,
  getSlotsForLocation,
  todayInMadrid,
  PARTY_MAX_TOTAL,
} from "@/lib/reservations";
import {
  createManualReservation,
  type ManualReservationState,
} from "@/app/admin/actions";

const FIELD =
  "w-full rounded-2xl bg-cream/[0.04] px-4 py-3 font-sans text-sm text-cream ring-1 ring-cream/15 outline-none transition focus:ring-electric focus:bg-cream/[0.06] placeholder:text-cream/35 [color-scheme:dark]";
const LABEL =
  "block text-xs font-semibold uppercase tracking-wider text-cream/60 mb-1.5";

/**
 * Alta manual de reservas desde el panel (reservas tomadas por teléfono).
 * Flujo: restaurante → día → hora → comensales → datos del cliente.
 * Aplica las mismas franjas que el formulario público (turnos y bloqueos).
 */
export function AdminNewReservationForm() {
  const today = todayInMadrid();
  const [locationSlug, setLocationSlug] = useState("");
  const [date, setDate] = useState(today);
  const [time, setTime] = useState("");

  const location = reservableLocations.find((l) => l.slug === locationSlug);
  const slots = useMemo(
    () => (location ? getSlotsForLocation(location, date) : []),
    [location, date]
  );

  // Si cambia local o día y la hora elegida ya no existe, vuelve al placeholder.
  const timeValue = slots.includes(time) ? time : "";

  const [state, formAction, pending] = useActionState<
    ManualReservationState,
    FormData
  >(createManualReservation, {});

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className={LABEL} htmlFor="anr-location">
          Restaurante
        </label>
        <select
          id="anr-location"
          name="locationSlug"
          required
          value={locationSlug}
          onChange={(e) => setLocationSlug(e.target.value)}
          className={FIELD}
        >
          <option value="" disabled>
            Elige restaurante…
          </option>
          {reservableLocations.map((l) => (
            <option key={l.slug} value={l.slug}>
              {l.name} · {l.neighborhood}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL} htmlFor="anr-date">
            Día
          </label>
          <input
            id="anr-date"
            type="date"
            name="date"
            required
            min={today}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={FIELD}
          />
        </div>
        <div>
          <label className={LABEL} htmlFor="anr-time">
            Hora
          </label>
          <select
            id="anr-time"
            name="time"
            required
            value={timeValue}
            onChange={(e) => setTime(e.target.value)}
            disabled={!location}
            className={`${FIELD} disabled:opacity-50`}
          >
            <option value="" disabled>
              {location ? "Elige hora…" : "Elige restaurante primero"}
            </option>
            {slots.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={LABEL} htmlFor="anr-party">
          Comensales
        </label>
        <select
          id="anr-party"
          name="partySize"
          defaultValue={2}
          className={FIELD}
        >
          {Array.from({ length: PARTY_MAX_TOTAL }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL} htmlFor="anr-first">
            Nombre
          </label>
          <input
            id="anr-first"
            name="firstName"
            required
            className={FIELD}
            placeholder="Cliente"
          />
        </div>
        <div>
          <label className={LABEL} htmlFor="anr-last">
            Apellidos <span className="normal-case text-cream/35">(opcional)</span>
          </label>
          <input id="anr-last" name="lastName" className={FIELD} />
        </div>
      </div>

      <div>
        <label className={LABEL} htmlFor="anr-phone">
          Teléfono
        </label>
        <input
          id="anr-phone"
          name="phone"
          type="tel"
          required
          inputMode="tel"
          placeholder="600 000 000"
          className={FIELD}
        />
      </div>

      <div>
        <label className={LABEL} htmlFor="anr-email">
          Email <span className="normal-case text-cream/35">(opcional — si lo pones, el cliente recibe la confirmación)</span>
        </label>
        <input id="anr-email" name="email" type="email" className={FIELD} />
      </div>

      <div>
        <label className={LABEL} htmlFor="anr-notes">
          Notas <span className="normal-case text-cream/35">(opcional)</span>
        </label>
        <textarea
          id="anr-notes"
          name="notes"
          rows={2}
          placeholder="Alergias, trona, terraza…"
          className={`${FIELD} resize-none`}
        />
      </div>

      {state.error && (
        <p className="rounded-xl bg-mustard/15 px-4 py-2.5 text-sm text-mustard">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-electric px-6 py-3.5 font-sans text-sm font-bold uppercase tracking-[0.18em] text-night transition hover:bg-electric-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Guardando…" : "Crear reserva"}
      </button>
      <p className="text-center text-[11px] text-cream/40">
        Entra directamente como confirmada, sin pasar por aprobación.
      </p>
    </form>
  );
}
