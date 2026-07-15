"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import {
  getReservableLocation,
  getSlotsForLocation,
  formatReservationDate,
  PARTY_MAX,
} from "@/lib/reservations";

const FIELD =
  "w-full rounded-2xl bg-cream/[0.04] px-4 py-3 font-sans text-sm text-cream ring-1 ring-cream/15 outline-none transition focus:ring-electric";
const LABEL = "block text-xs font-semibold uppercase tracking-wider text-cream/60 mb-1.5";

function localDateString(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export interface ManageReservationData {
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  partySize: number;
  firstName: string;
  occasion: string | null;
  childrenCount: number;
  needsHighChair: boolean;
  dietary: string | null;
  notes: string | null;
}

export function ManageReservation({
  token,
  locale,
  locationSlug,
  initialStatus,
  initialData,
}: {
  token: string;
  locale: string;
  locationSlug: string;
  initialStatus: "confirmed" | "cancelled";
  initialData: ManageReservationData;
}) {
  const t = useTranslations("gestion");
  const location = getReservableLocation(locationSlug);

  const today = localDateString(new Date());
  const [status, setStatus] = useState(initialStatus);
  const [data, setData] = useState(initialData);

  const [date, setDate] = useState(initialData.date);
  const [time, setTime] = useState(initialData.time);
  const [partySize, setPartySize] = useState(initialData.partySize);

  const [busy, setBusy] = useState<"reschedule" | "cancel" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const slots = useMemo(() => {
    if (!location) return [] as string[];
    const all = getSlotsForLocation(location);
    if (date === today) {
      const now = new Date();
      const cutoff = now.getHours() * 60 + now.getMinutes() + 30;
      return all.filter((s) => {
        const [h, m] = s.split(":").map(Number);
        return h * 60 + m >= cutoff;
      });
    }
    return all;
  }, [location, date, today]);

  const timeValid = slots.includes(time);

  async function handleReschedule(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFlash(null);
    if (!timeValid) {
      setError(t("errorTime"));
      return;
    }
    setBusy("reschedule");
    try {
      const res = await fetch(`/api/reservations/${token}/reschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, time, partySize }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || t("errorGeneric"));
      } else {
        setData((d) => ({ ...d, date, time, partySize }));
        setFlash(t("rescheduleOk"));
      }
    } catch {
      setError(t("errorGeneric"));
    } finally {
      setBusy(null);
    }
  }

  async function handleCancel() {
    setError(null);
    setFlash(null);
    setBusy("cancel");
    try {
      const res = await fetch(`/api/reservations/${token}/cancel`, {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || t("errorGeneric"));
      } else {
        setStatus("cancelled");
      }
    } catch {
      setError(t("errorGeneric"));
    } finally {
      setBusy(null);
    }
  }

  const dateLong = formatReservationDate(data.date, locale as Locale);

  return (
    <div className="space-y-6">
      {/* Resumen */}
      <div className="rounded-[1.5rem] bg-night-soft p-6 shadow-card ring-1 ring-cream/10">
        <div className="flex items-center justify-between gap-3">
          <p className="font-display text-xl text-cream">{location?.name}</p>
          {status === "cancelled" ? (
            <span className="rounded-full bg-mustard/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-mustard">
              {t("statusCancelled")}
            </span>
          ) : (
            <span className="rounded-full bg-electric/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-electric">
              {t("statusConfirmed")}
            </span>
          )}
        </div>
        {location && (
          <p className="mt-1 text-sm text-cream/60">{location.address}</p>
        )}
        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <div>
            <dt className="text-cream/50">{t("date")}</dt>
            <dd className="font-semibold capitalize text-cream">{dateLong}</dd>
          </div>
          <div>
            <dt className="text-cream/50">{t("time")}</dt>
            <dd className="font-semibold text-cream">{data.time}</dd>
          </div>
          <div>
            <dt className="text-cream/50">{t("party")}</dt>
            <dd className="font-semibold text-cream">
              {data.partySize} {data.partySize === 1 ? t("person") : t("people")}
            </dd>
          </div>
          {data.occasion && (
            <div>
              <dt className="text-cream/50">{t("occasion")}</dt>
              <dd className="font-semibold text-cream">{data.occasion}</dd>
            </div>
          )}
        </dl>
      </div>

      {flash && (
        <p className="rounded-xl bg-electric/15 px-4 py-3 text-sm text-electric">
          {flash}
        </p>
      )}
      {error && (
        <p className="rounded-xl bg-mustard/15 px-4 py-3 text-sm text-mustard">
          {error}
        </p>
      )}

      {status === "cancelled" ? (
        <p className="rounded-[1.5rem] border border-cream/10 p-6 text-center text-sm text-cream/60">
          {t("cancelledNote")}
        </p>
      ) : (
        <>
          {/* Reprogramar */}
          <form
            id="reprogramar"
            onSubmit={handleReschedule}
            className="scroll-mt-24 rounded-[1.5rem] bg-night-soft p-6 shadow-card ring-1 ring-cream/10"
          >
            <h2 className="font-display text-lg text-cream">
              {t("rescheduleTitle")}
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL} htmlFor="mg-date">
                  {t("date")}
                </label>
                <input
                  id="mg-date"
                  type="date"
                  min={today}
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    setTime("");
                  }}
                  className={`${FIELD} [color-scheme:dark]`}
                />
              </div>
              <div>
                <label className={LABEL} htmlFor="mg-time">
                  {t("time")}
                </label>
                <select
                  id="mg-time"
                  value={timeValid ? time : ""}
                  onChange={(e) => setTime(e.target.value)}
                  className={FIELD}
                >
                  <option value="" disabled>
                    {t("chooseTime")}
                  </option>
                  {slots.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-3">
              <label className={LABEL} htmlFor="mg-party">
                {t("party")}
              </label>
              <select
                id="mg-party"
                value={partySize}
                onChange={(e) => setPartySize(Number(e.target.value))}
                className={FIELD}
              >
                {Array.from({ length: PARTY_MAX }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? t("person") : t("people")}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={busy !== null}
              className="mt-5 w-full rounded-full bg-[linear-gradient(160deg,#7bafbc_0%,#5599aa_52%,#3d7e8f_100%)] px-6 py-3 font-sans text-sm font-bold uppercase tracking-[0.18em] text-night shadow-neon transition-all hover:-translate-y-0.5 disabled:opacity-60"
            >
              {busy === "reschedule" ? t("saving") : t("saveChanges")}
            </button>
          </form>

          {/* Cancelar */}
          <div
            id="cancelar"
            className="scroll-mt-24 rounded-[1.5rem] border border-cream/10 p-6"
          >
            <h2 className="font-display text-lg text-cream">
              {t("cancelTitle")}
            </h2>
            <p className="mt-1 text-sm text-cream/60">{t("cancelBody")}</p>
            {confirmCancel ? (
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={busy !== null}
                  className="rounded-full bg-mustard px-5 py-2.5 text-sm font-bold text-night transition hover:bg-mustard-dark disabled:opacity-60"
                >
                  {busy === "cancel" ? t("cancelling") : t("cancelConfirm")}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmCancel(false)}
                  className="rounded-full border border-cream/20 px-5 py-2.5 text-sm font-semibold text-cream hover:bg-cream/5"
                >
                  {t("keepReservation")}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmCancel(true)}
                className="mt-4 rounded-full border border-mustard/40 px-5 py-2.5 text-sm font-semibold text-mustard transition hover:bg-mustard/10"
              >
                {t("cancelCta")}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
