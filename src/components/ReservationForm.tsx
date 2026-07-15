"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Location } from "@/data/locations";
import {
  reservableLocations,
  getSlotsForLocation,
  PARTY_MAX,
  PARTY_MAX_TOTAL,
  CHILDREN_MAX,
} from "@/lib/reservations";
import { DEFAULT_COUNTRY_ISO, dialForIso } from "@/lib/countries";
import { InlineCalendar } from "./InlineCalendar";
import { CountrySelect } from "./CountrySelect";

const FIELD =
  "w-full rounded-2xl bg-cream/[0.04] px-4 py-3 font-sans text-sm text-cream ring-1 ring-cream/15 outline-none transition focus:ring-electric focus:bg-cream/[0.06] placeholder:text-cream/35";
const LABEL = "block text-xs font-semibold uppercase tracking-wider text-cream/60 mb-1.5";

function localDateString(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(`${dateStr}T12:00:00`);
  d.setDate(d.getDate() + n);
  return localDateString(d);
}

/** Franjas disponibles del local en `date`; si es hoy, filtra las ya pasadas (+30 min). */
function computeSlots(location: Location, date: string, today: string): string[] {
  const all = getSlotsForLocation(location);
  if (date && date === today) {
    const now = new Date();
    const cutoff = now.getHours() * 60 + now.getMinutes() + 30;
    return all.filter((s) => {
      const [h, m] = s.split(":").map(Number);
      return h * 60 + m >= cutoff;
    });
  }
  return all;
}

/** Primer día (desde hoy) con hueco + su primera franja: preselección de menos fricción. */
function firstAvailability(
  location: Location,
  today: string
): { date: string; time: string } {
  for (let i = 0; i < 14; i++) {
    const ds = addDays(today, i);
    const s = computeSlots(location, ds, today);
    if (s.length) return { date: ds, time: s[0] };
  }
  return { date: today, time: "" };
}

export function ReservationForm({
  fixedLocationSlug,
  locale,
  onSuccess,
}: {
  fixedLocationSlug?: string;
  locale: string;
  onSuccess?: () => void;
}) {
  const t = useTranslations("reservar");

  const today = localDateString(new Date());
  const initialSlug =
    fixedLocationSlug &&
    reservableLocations.some((l) => l.slug === fixedLocationSlug)
      ? fixedLocationSlug
      : reservableLocations[0]?.slug ?? "";
  const initialLocation = reservableLocations.find((l) => l.slug === initialSlug);
  const initialAvail = initialLocation
    ? firstAvailability(initialLocation, today)
    : { date: today, time: "" };

  const [step, setStep] = useState<1 | 2>(1);
  const [locationSlug, setLocationSlug] = useState(initialSlug);
  const [date, setDate] = useState(initialAvail.date);
  const [time, setTime] = useState(initialAvail.time);
  const [partySize, setPartySize] = useState(2);
  // Texto libre del campo de grupo grande (>15). Se mantiene desacoplado de
  // partySize para que el usuario pueda teclear cifras intermedias (p. ej. "1"
  // camino de "19") sin que el clamp lo empuje al máximo.
  const [partyExact, setPartyExact] = useState(String(PARTY_MAX + 1));
  const [childrenCount, setChildrenCount] = useState(0);
  const [needsHighChair, setNeedsHighChair] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [countryIso, setCountryIso] = useState(DEFAULT_COUNTRY_ISO);
  const [phoneLocal, setPhoneLocal] = useState("");
  const [email, setEmail] = useState("");
  const [showExtras, setShowExtras] = useState(false);
  const [occasion, setOccasion] = useState("");
  const [dietary, setDietary] = useState("");
  const [notes, setNotes] = useState("");

  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [manageToken, setManageToken] = useState<string | null>(null);

  const location = reservableLocations.find((l) => l.slug === locationSlug);
  const isLargeGroup = partySize > 15;

  const slots = useMemo(
    () => (location ? computeSlots(location, date, today) : []),
    [location, date, today]
  );
  const lunchSlots = slots.filter((s) => Number(s.slice(0, 2)) < 17);
  const dinnerSlots = slots.filter((s) => Number(s.slice(0, 2)) >= 17);

  // Al cambiar local o día, si la hora elegida ya no vale, saltar a la primera disponible.
  useEffect(() => {
    const loc = reservableLocations.find((l) => l.slug === locationSlug);
    if (!loc) return;
    const s = computeSlots(loc, date, today);
    setTime((prev) => (s.includes(prev) ? prev : s[0] ?? ""));
  }, [locationSlug, date, today]);

  const timeValid = time !== "" && slots.includes(time);

  function goToStep2() {
    setError(null);
    if (!date) {
      setError(t("errorDate"));
      return;
    }
    if (!timeValid) {
      setError(t("errorTime"));
      return;
    }
    setStep(2);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus("submitting");
    const phone = `${dialForIso(countryIso)} ${phoneLocal}`.trim();
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locationSlug,
          firstName,
          lastName,
          phone,
          email,
          date,
          time,
          partySize,
          childrenCount,
          needsHighChair: childrenCount > 0 ? needsHighChair : false,
          occasion: showExtras ? occasion : undefined,
          dietary: showExtras ? dietary : undefined,
          notes,
          marketingOptIn: true,
          locale,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("errorGeneric"));
        setStatus("idle");
        return;
      }
      setManageToken(data.token);
      setStatus("done");
      onSuccess?.();
    } catch {
      setError(t("errorGeneric"));
      setStatus("idle");
    }
  }

  if (status === "done") {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-electric/15 text-electric">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M20 6 9 17l-5-5"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h3 className="font-display text-2xl text-cream">{t("successTitle")}</h3>
        <p className="mt-2 text-sm text-cream/70">
          {t("successBody", { email })}
        </p>
        {manageToken && (
          <Link
            href={`/reserva/${manageToken}`}
            className="mt-5 inline-flex items-center justify-center rounded-full bg-cream/10 px-5 py-2.5 text-sm font-semibold text-cream ring-1 ring-cream/20 transition hover:bg-cream/15"
          >
            {t("successManage")}
          </Link>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Indicador de pasos */}
      <div className="mb-1 flex items-center gap-3">
        <div className="flex flex-1 gap-1.5">
          <span
            className={`h-1 flex-1 rounded-full transition-colors ${
              step >= 1 ? "bg-electric" : "bg-cream/15"
            }`}
          />
          <span
            className={`h-1 flex-1 rounded-full transition-colors ${
              step >= 2 ? "bg-electric" : "bg-cream/15"
            }`}
          />
        </div>
        <span className="shrink-0 text-xs text-cream/50">
          {step === 1 ? t("step1") : t("step2")}
        </span>
      </div>

      {step === 1 && (
        <>
          {!fixedLocationSlug && (
            <div>
              <label className={LABEL} htmlFor="rf-location">
                {t("selectLocation")}
              </label>
              <select
                id="rf-location"
                className={FIELD}
                value={locationSlug}
                onChange={(e) => setLocationSlug(e.target.value)}
              >
                {reservableLocations.map((l) => (
                  <option key={l.slug} value={l.slug}>
                    {l.name} · {l.neighborhood}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className={LABEL}>{t("date")}</label>
            <InlineCalendar
              value={date}
              min={today}
              onChange={setDate}
              locale={locale}
            />
          </div>

          <div>
            <label className={LABEL}>{t("time")}</label>
            {slots.length === 0 ? (
              <p className="rounded-xl bg-mustard/15 px-4 py-2.5 text-sm text-mustard">
                {t("noSlots")}
              </p>
            ) : (
              <div className="space-y-3">
                {[
                  { label: t("lunch"), items: lunchSlots },
                  { label: t("dinner"), items: dinnerSlots },
                ]
                  .filter((g) => g.items.length > 0)
                  .map((g) => (
                    <div key={g.label}>
                      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-cream/40">
                        {g.label}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {g.items.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setTime(s)}
                            className={`rounded-full px-3.5 py-2 text-sm font-semibold ring-1 transition ${
                              time === s
                                ? "bg-electric text-night ring-electric"
                                : "text-cream ring-cream/15 hover:bg-cream/5"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {error && (
            <p className="rounded-xl bg-mustard/15 px-4 py-2.5 text-sm text-mustard">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={goToStep2}
            className="w-full rounded-full bg-[linear-gradient(160deg,#7bafbc_0%,#5599aa_52%,#3d7e8f_100%)] px-6 py-3.5 font-sans text-sm font-bold uppercase tracking-[0.18em] text-night shadow-neon transition-all duration-300 hover:-translate-y-0.5"
          >
            {t("continue")}
          </button>
        </>
      )}

      {step === 2 && (
        <>
          {/* Comensales + niños (o nº exacto si es grupo grande) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL} htmlFor="rf-party">
                {t("party")}
              </label>
              <select
                id="rf-party"
                className={FIELD}
                value={isLargeGroup ? PARTY_MAX + 1 : partySize}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  setPartySize(n);
                  if (n > PARTY_MAX) setPartyExact(String(n));
                }}
              >
                {Array.from({ length: PARTY_MAX }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
                <option value={PARTY_MAX + 1}>{t("moreThan15")}</option>
              </select>
            </div>
            {isLargeGroup ? (
              <div>
                <label className={LABEL} htmlFor="rf-party-exact">
                  {t("howMany")}
                </label>
                <input
                  id="rf-party-exact"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={partyExact}
                  onChange={(e) => {
                    // Solo dígitos, hasta 2 (máx. 40). Mientras el número sea
                    // válido (>15) sincroniza partySize; si el usuario aún está
                    // tecleando un valor incompleto (vacío o ≤15) conserva el
                    // texto sin alterar partySize, para no salir de "grupo grande".
                    const raw = e.target.value.replace(/\D/g, "").slice(0, 2);
                    const n = Number(raw);
                    if (n > PARTY_MAX_TOTAL) {
                      setPartyExact(String(PARTY_MAX_TOTAL));
                      setPartySize(PARTY_MAX_TOTAL);
                      return;
                    }
                    setPartyExact(raw);
                    if (n > PARTY_MAX) setPartySize(n);
                  }}
                  onBlur={() => {
                    const n = Math.max(
                      PARTY_MAX + 1,
                      Math.min(PARTY_MAX_TOTAL, Number(partyExact) || PARTY_MAX + 1)
                    );
                    setPartySize(n);
                    setPartyExact(String(n));
                  }}
                  className={FIELD}
                />
              </div>
            ) : (
              <div>
                <label className={LABEL} htmlFor="rf-children">
                  {t("children")}
                </label>
                <select
                  id="rf-children"
                  className={FIELD}
                  value={childrenCount}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    setChildrenCount(n);
                    if (n === 0) setNeedsHighChair(false);
                  }}
                >
                  {Array.from({ length: CHILDREN_MAX + 1 }, (_, i) => i).map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {isLargeGroup && (
            <p className="rounded-xl bg-electric/10 px-4 py-2.5 text-sm text-electric">
              {t("groupText")}
            </p>
          )}

          {!isLargeGroup && childrenCount > 0 && (
            <label className="flex cursor-pointer items-center gap-2.5 rounded-2xl bg-cream/[0.03] px-4 py-3 text-sm text-cream/80 ring-1 ring-cream/10">
              <input
                type="checkbox"
                checked={needsHighChair}
                onChange={(e) => setNeedsHighChair(e.target.checked)}
                className="h-4 w-4 accent-electric"
              />
              {t("highChair")}
            </label>
          )}

          {!isLargeGroup && partySize > 8 && (
            <p className="rounded-xl bg-electric/10 px-4 py-2.5 text-sm text-electric">
              {t("groupNote")}
            </p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL} htmlFor="rf-first">
                {t("firstName")}
              </label>
              <input
                id="rf-first"
                required
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={FIELD}
              />
            </div>
            <div>
              <label className={LABEL} htmlFor="rf-last">
                {t("lastName")}
              </label>
              <input
                id="rf-last"
                required
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={FIELD}
              />
            </div>
          </div>

          <div>
            <label className={LABEL} htmlFor="rf-phone">
              {t("phone")}
            </label>
            <div className="space-y-2">
              <CountrySelect value={countryIso} onChange={setCountryIso} />
              <input
                id="rf-phone"
                type="tel"
                required
                autoComplete="tel-national"
                inputMode="tel"
                value={phoneLocal}
                onChange={(e) => setPhoneLocal(e.target.value)}
                placeholder={t("phonePlaceholder")}
                className={FIELD}
              />
            </div>
          </div>

          <div>
            <label className={LABEL} htmlFor="rf-email">
              {t("email")}
            </label>
            <input
              id="rf-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={FIELD}
            />
          </div>

          {!showExtras && (
            <button
              type="button"
              onClick={() => setShowExtras(true)}
              className="text-sm font-semibold text-electric hover:text-electric-dark"
            >
              + {t("extrasToggle")}
            </button>
          )}

          {showExtras && (
            <div className="space-y-4 rounded-2xl bg-cream/[0.03] p-4 ring-1 ring-cream/10">
              <div>
                <label className={LABEL} htmlFor="rf-occasion">
                  {t("occasion")}
                </label>
                <input
                  id="rf-occasion"
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  placeholder={t("occasionPlaceholder")}
                  className={FIELD}
                />
              </div>
              <div>
                <label className={LABEL} htmlFor="rf-dietary">
                  {t("dietary")}
                </label>
                <input
                  id="rf-dietary"
                  value={dietary}
                  onChange={(e) => setDietary(e.target.value)}
                  placeholder={t("dietaryPlaceholder")}
                  className={FIELD}
                />
              </div>
            </div>
          )}

          <div>
            <label className={LABEL} htmlFor="rf-notes">
              {t("notes")}
            </label>
            <textarea
              id="rf-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("notesPlaceholder")}
              className={`${FIELD} resize-none`}
            />
          </div>

          {error && (
            <p className="rounded-xl bg-mustard/15 px-4 py-2.5 text-sm text-mustard">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setError(null);
                setStep(1);
              }}
              className="rounded-full border border-cream/20 px-5 py-3.5 text-sm font-semibold text-cream transition hover:bg-cream/5"
            >
              {t("back")}
            </button>
            <button
              type="submit"
              disabled={status === "submitting"}
              className="flex-1 rounded-full bg-[linear-gradient(160deg,#7bafbc_0%,#5599aa_52%,#3d7e8f_100%)] px-6 py-3.5 font-sans text-sm font-bold uppercase tracking-[0.18em] text-night shadow-neon transition-all duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "submitting" ? t("submitting") : t("submit")}
            </button>
          </div>

          <p className="text-center text-[11px] leading-relaxed text-cream/40">
            {t.rich("privacy", {
              link: (chunks) => (
                <Link href="/privacidad" className="underline hover:text-cream/60">
                  {chunks}
                </Link>
              ),
            })}
          </p>
        </>
      )}
    </form>
  );
}
