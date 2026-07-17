import Link from "next/link";
import { isAdminAuthed, isAdminConfigured } from "@/lib/admin-auth";
import { AdminLogin } from "@/components/AdminLogin";
import { getSupabaseAdmin, RESERVATIONS_TABLE } from "@/lib/supabase";
import {
  attributionChannel,
  attributionDetail,
  type Attribution,
} from "@/lib/reservations";

export const dynamic = "force-dynamic";

/**
 * Informe de fuentes: por dónde entran las reservas (canal de adquisición),
 * agregado por fecha de CREACIÓN de la reserva (no la fecha de la mesa), que
 * es lo que interesa para decidir dónde invertir en marketing.
 */

const RANGES = [
  { key: "7", label: "7 días", days: 7 },
  { key: "30", label: "30 días", days: 30 },
  { key: "90", label: "90 días", days: 90 },
  { key: "all", label: "Todo", days: null },
] as const;

interface SourceRow {
  attribution: Attribution | null;
  party_size: number;
  status: "pending" | "confirmed" | "cancelled" | "rejected";
}

interface ChannelAgg {
  label: string;
  active: number; // confirmadas + pendientes
  pax: number; // comensales de las activas
  cancelled: number; // canceladas + rechazadas
  details: Map<string, number>;
}

type SP = Promise<{ [key: string]: string | string[] | undefined }>;

/** ISO de hace `days` días (fuera del componente por la regla de render puro). */
function cutoffISO(days: number): string {
  return new Date(Date.now() - days * 86400000).toISOString();
}

export default async function AdminFuentesPage({
  searchParams,
}: {
  searchParams: SP;
}) {
  if (!(await isAdminAuthed())) {
    return <AdminLogin notConfigured={!isAdminConfigured()} />;
  }

  const sp = await searchParams;
  const dParam = Array.isArray(sp.d) ? sp.d[0] : sp.d;
  const range = RANGES.find((r) => r.key === dParam) ?? RANGES[1];

  const supabase = getSupabaseAdmin();
  let query = supabase
    .from(RESERVATIONS_TABLE)
    .select("attribution, party_size, status")
    .order("created_at", { ascending: false })
    .limit(2000);
  if (range.days !== null) {
    query = query.gte("created_at", cutoffISO(range.days));
  }
  const { data, error } = await query;
  const rows = (data as SourceRow[] | null) ?? [];

  // Agregar por canal
  const channels = new Map<string, ChannelAgg>();
  for (const r of rows) {
    const ch = attributionChannel(r.attribution);
    let agg = channels.get(ch.key);
    if (!agg) {
      agg = { label: ch.label, active: 0, pax: 0, cancelled: 0, details: new Map() };
      channels.set(ch.key, agg);
    }
    if (r.status === "confirmed" || r.status === "pending") {
      agg.active += 1;
      agg.pax += r.party_size;
      const det = attributionDetail(r.attribution);
      if (det) agg.details.set(det, (agg.details.get(det) ?? 0) + 1);
    } else {
      agg.cancelled += 1;
    }
  }

  const sorted = [...channels.values()].sort(
    (a, b) => b.active - a.active || b.cancelled - a.cancelled
  );
  const totalActive = sorted.reduce((s, c) => s + c.active, 0);
  const totalPax = sorted.reduce((s, c) => s + c.pax, 0);
  const maxActive = Math.max(1, ...sorted.map((c) => c.active));
  const top = sorted.find((c) => c.active > 0);

  const chip =
    "rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition";
  const chipOn = "bg-electric text-night ring-electric";
  const chipOff = "text-cream/70 ring-cream/15 hover:bg-cream/5";

  return (
    <div className="min-h-screen bg-night text-cream">
      <header className="sticky top-0 z-10 border-b border-cream/10 bg-night/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <p className="eyebrow">Da Nanni</p>
            <h1 className="font-display text-xl">Fuentes de reservas</h1>
          </div>
          <Link
            href="/admin/reservas"
            className="rounded-full px-3 py-1.5 text-xs ring-1 ring-cream/15 hover:bg-cream/5"
          >
            ← Volver al panel
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        <p className="text-sm text-cream/60">
          Por dónde entran las reservas, según la fecha en que se hicieron (no la
          fecha de la mesa). Canceladas y rechazadas no cuentan en la barra.
        </p>

        {/* Rango temporal */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {RANGES.map((r) => (
            <a
              key={r.key}
              href={`/admin/reservas/fuentes?d=${r.key}`}
              className={`${chip} ${r.key === range.key ? chipOn : chipOff}`}
            >
              {r.label}
            </a>
          ))}
        </div>

        {error && (
          <p className="mt-8 rounded-xl bg-mustard/15 px-4 py-3 text-sm text-mustard">
            Error al cargar las reservas.
          </p>
        )}

        {/* KPIs */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-night-soft p-4 ring-1 ring-cream/10">
            <p className="text-xs text-cream/50">Reservas</p>
            <p className="mt-1 text-2xl font-semibold">{totalActive}</p>
          </div>
          <div className="rounded-2xl bg-night-soft p-4 ring-1 ring-cream/10">
            <p className="text-xs text-cream/50">Comensales</p>
            <p className="mt-1 text-2xl font-semibold">{totalPax}</p>
          </div>
          <div className="rounded-2xl bg-night-soft p-4 ring-1 ring-cream/10">
            <p className="text-xs text-cream/50">Canal principal</p>
            <p className="mt-1 truncate text-sm font-semibold leading-8">
              {top ? top.label : "—"}
            </p>
          </div>
        </div>

        {/* Canales */}
        {sorted.length === 0 ? (
          <p className="mt-16 text-center text-cream/50">
            No hay reservas en este período.
          </p>
        ) : (
          <ul className="mt-6 space-y-2">
            {sorted.map((c) => {
              const share = totalActive > 0 ? (c.active / totalActive) * 100 : 0;
              const details = [...c.details.entries()]
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3);
              return (
                <li
                  key={c.label}
                  className="rounded-2xl bg-night-soft p-4 ring-1 ring-cream/10"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <p className="font-semibold">{c.label}</p>
                    <p className="text-sm tabular-nums text-cream/70">
                      <span className="font-semibold text-cream">{c.active}</span>{" "}
                      reserva{c.active === 1 ? "" : "s"} · {c.pax} pax ·{" "}
                      {share.toFixed(0)}%
                      {c.cancelled > 0 && (
                        <span className="text-cream/40">
                          {" "}
                          · {c.cancelled} canc.
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="mt-2 h-2.5 w-full rounded-r-[4px] bg-electric/10">
                    <div
                      className="h-full rounded-r-[4px] bg-electric"
                      style={{ width: `${(c.active / maxActive) * 100}%` }}
                    />
                  </div>
                  {details.length > 0 && (
                    <p className="mt-2 truncate text-xs text-cream/50">
                      {details
                        .map(([det, n]) => (n > 1 ? `${det} ×${n}` : det))
                        .join(" · ")}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        <p className="mt-6 text-xs leading-relaxed text-cream/40">
          «Directo / sin datos» incluye a quien teclea la web, entra desde una app
          que no manda referrer (WhatsApp, Google Maps a veces), navega con
          bloqueo de rastreo — y todas las reservas anteriores al 16/07/2026,
          cuando se estrenó el rastreo. Las fichas de Google llevan UTMs propios
          (<code>gbp-&lt;local&gt;</code>): el local sale en el desglose del canal
          «Ficha de Google (GBP)».
        </p>
      </main>
    </div>
  );
}
