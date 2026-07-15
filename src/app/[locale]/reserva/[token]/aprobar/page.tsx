import type { Metadata } from "next";
import { getLocationBySlug } from "@/data/locations";
import { getSupabaseAdmin, RESERVATIONS_TABLE } from "@/lib/supabase";
import {
  formatReservationDate,
  normalizeTime,
  type ReservationRow,
} from "@/lib/reservations";
import {
  ApproveReservation,
  type ApproveData,
} from "@/components/ApproveReservation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Confirmar reserva · Da Nanni",
  robots: { index: false, follow: false },
};

async function fetchReservation(token: string): Promise<ReservationRow | null> {
  try {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from(RESERVATIONS_TABLE)
      .select("*")
      .eq("manage_token", token)
      .single();
    return (data as ReservationRow) ?? null;
  } catch (e) {
    console.error("[aprobar] fetch error:", e);
    return null;
  }
}

export default async function AprobarPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ d?: string }>;
}) {
  const { token } = await params;
  const { d } = await searchParams;
  const preselect = d === "confirm" || d === "reject" ? d : undefined;
  const row = await fetchReservation(token);

  return (
    <section className="mx-auto max-w-lg px-4 py-16 font-sans text-cream sm:py-20">
      <p className="eyebrow text-center">Panel · Reservas</p>
      <h1 className="mt-3 text-center font-display text-3xl leading-tight tracking-tight sm:text-4xl">
        Confirmar reserva
      </h1>

      {!row ? (
        <p className="mx-auto mt-8 max-w-md rounded-[1.5rem] border border-cream/10 p-6 text-center text-sm text-cream/60">
          No encontramos esta reserva. Puede que el enlace ya no sea válido.
        </p>
      ) : (
        <div className="mt-8">
          <ApproveReservation
            token={token}
            initialStatus={row.status}
            preselect={preselect}
            data={
              {
                locationName:
                  getLocationBySlug(row.location_slug)?.name ?? row.location_slug,
                address: getLocationBySlug(row.location_slug)?.address ?? "",
                dateLong: formatReservationDate(row.reservation_date, "es"),
                time: normalizeTime(row.reservation_time),
                partySize: row.party_size,
                name: `${row.first_name} ${row.last_name}`,
                phone: row.phone,
                email: row.email,
                occasion: row.occasion,
                dietary: row.dietary,
                notes: row.notes,
                childrenCount: row.children_count,
                needsHighChair: row.needs_high_chair,
              } satisfies ApproveData
            }
          />
        </div>
      )}
    </section>
  );
}
