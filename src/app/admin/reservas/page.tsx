import { getLocationBySlug } from "@/data/locations";
import {
  isAdminAuthed,
  isAdminConfigured,
} from "@/lib/admin-auth";
import { getSupabaseAdmin, RESERVATIONS_TABLE } from "@/lib/supabase";
import {
  formatReservationDate,
  reservableLocations,
  todayInMadrid,
  type ReservationRow,
} from "@/lib/reservations";
import { AdminLogin } from "@/components/AdminLogin";
import { AdminReservationCard } from "@/components/AdminReservationCard";
import { logoutAdmin } from "../actions";

export const dynamic = "force-dynamic";

function tomorrowInMadrid(): string {
  const today = todayInMadrid();
  const d = new Date(`${today}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

type SP = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function AdminReservasPage({
  searchParams,
}: {
  searchParams: SP;
}) {
  if (!(await isAdminAuthed())) {
    return <AdminLogin notConfigured={!isAdminConfigured()} />;
  }

  const sp = await searchParams;
  const one = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v[0] : v;

  const today = todayInMadrid();
  const dateParam = one(sp.date) ?? today; // YYYY-MM-DD | "all"
  const locParam = one(sp.loc) ?? "all";
  const statusParam = one(sp.status) ?? "confirmed"; // confirmed | cancelled | all

  const supabase = getSupabaseAdmin();
  let query = supabase
    .from(RESERVATIONS_TABLE)
    .select("*")
    .order("reservation_date", { ascending: true })
    .order("reservation_time", { ascending: true });

  if (dateParam === "all") query = query.gte("reservation_date", today);
  else query = query.eq("reservation_date", dateParam);
  if (locParam !== "all") query = query.eq("location_slug", locParam);
  if (statusParam !== "all") query = query.eq("status", statusParam);

  const { data, error } = await query;
  const rows = (data as ReservationRow[] | null) ?? [];

  // Agrupar por fecha → local
  const byDate = new Map<string, Map<string, ReservationRow[]>>();
  for (const r of rows) {
    if (!byDate.has(r.reservation_date)) byDate.set(r.reservation_date, new Map());
    const locMap = byDate.get(r.reservation_date)!;
    if (!locMap.has(r.location_slug)) locMap.set(r.location_slug, []);
    locMap.get(r.location_slug)!.push(r);
  }

  const totalCovers = rows.reduce((s, r) => s + r.party_size, 0);

  const qs = (over: Record<string, string>) => {
    const p = new URLSearchParams({
      date: dateParam,
      loc: locParam,
      status: statusParam,
      ...over,
    });
    return `/admin/reservas?${p.toString()}`;
  };

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
            <h1 className="font-display text-xl">Reservas</h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-cream/60">
            <span>
              {rows.length} reserva{rows.length === 1 ? "" : "s"} · {totalCovers}{" "}
              comensales
            </span>
            <form action={logoutAdmin}>
              <button className="rounded-full ring-1 ring-cream/15 px-3 py-1.5 text-xs hover:bg-cream/5">
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={qs({ date: today })}
            className={`${chip} ${dateParam === today ? chipOn : chipOff}`}
          >
            Hoy
          </a>
          <a
            href={qs({ date: tomorrowInMadrid() })}
            className={`${chip} ${
              dateParam === tomorrowInMadrid() ? chipOn : chipOff
            }`}
          >
            Mañana
          </a>
          <a
            href={qs({ date: "all" })}
            className={`${chip} ${dateParam === "all" ? chipOn : chipOff}`}
          >
            Todas las próximas
          </a>
          <form action="/admin/reservas" method="get" className="contents">
            <input type="hidden" name="loc" value={locParam} />
            <input type="hidden" name="status" value={statusParam} />
            <input
              type="date"
              name="date"
              defaultValue={dateParam === "all" ? "" : dateParam}
              className="rounded-full bg-cream/[0.04] px-3 py-1.5 text-xs text-cream ring-1 ring-cream/15 [color-scheme:dark]"
            />
            <button className={`${chip} ${chipOff}`}>Ir</button>
          </form>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <a
            href={qs({ loc: "all" })}
            className={`${chip} ${locParam === "all" ? chipOn : chipOff}`}
          >
            Todos los locales
          </a>
          {reservableLocations.map((l) => (
            <a
              key={l.slug}
              href={qs({ loc: l.slug })}
              className={`${chip} ${locParam === l.slug ? chipOn : chipOff}`}
            >
              {l.neighborhood}
            </a>
          ))}
          <span className="mx-1 h-4 w-px bg-cream/15" />
          {(["confirmed", "cancelled", "all"] as const).map((s) => (
            <a
              key={s}
              href={qs({ status: s })}
              className={`${chip} ${statusParam === s ? chipOn : chipOff}`}
            >
              {s === "confirmed"
                ? "Confirmadas"
                : s === "cancelled"
                  ? "Canceladas"
                  : "Todas"}
            </a>
          ))}
        </div>

        {/* Listado */}
        {error && (
          <p className="mt-8 rounded-xl bg-mustard/15 px-4 py-3 text-sm text-mustard">
            Error al cargar las reservas.
          </p>
        )}

        {rows.length === 0 ? (
          <p className="mt-16 text-center text-cream/50">
            No hay reservas para este filtro.
          </p>
        ) : (
          <div className="mt-6 space-y-10">
            {[...byDate.entries()].map(([date, locMap]) => (
              <section key={date}>
                <h2 className="font-display text-lg capitalize text-cream/90">
                  {formatReservationDate(date, "es")}
                </h2>
                <div className="mt-4 space-y-6">
                  {[...locMap.entries()].map(([slug, list]) => {
                    const loc = getLocationBySlug(slug);
                    const covers = list.reduce((s, r) => s + r.party_size, 0);
                    return (
                      <div key={slug}>
                        <div className="mb-2 flex items-baseline gap-3">
                          <h3 className="font-semibold text-electric">
                            {loc?.name ?? slug}
                          </h3>
                          <span className="text-xs text-cream/50">
                            {list.length} reserva{list.length === 1 ? "" : "s"} ·{" "}
                            {covers} comensales
                          </span>
                        </div>
                        <ul className="space-y-2">
                          {list.map((r) => (
                            <AdminReservationCard key={r.id} r={r} />
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
