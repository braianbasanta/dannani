import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getSupabaseAdmin, RESERVATIONS_TABLE } from "@/lib/supabase";
import { normalizeTime, type ReservationRow } from "@/lib/reservations";
import {
  ManageReservation,
  type ManageReservationData,
} from "@/components/ManageReservation";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "gestion" });
  return {
    title: t("metaTitle"),
    robots: { index: false, follow: false },
  };
}

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
    console.error("[gestion] fetch error:", e);
    return null;
  }
}

export default async function GestionReservaPage({
  params,
}: {
  params: Promise<{ locale: string; token: string }>;
}) {
  const { locale, token } = await params;
  const t = await getTranslations({ locale, namespace: "gestion" });
  const row = await fetchReservation(token);

  return (
    <section className="mx-auto max-w-lg px-4 py-16 font-sans text-cream sm:py-20">
      <p className="eyebrow text-center">{t("eyebrow")}</p>
      <h1 className="mt-3 text-center font-display text-3xl leading-tight tracking-tight sm:text-4xl">
        {t("title")}
      </h1>

      {!row ? (
        <p className="mx-auto mt-8 max-w-md rounded-[1.5rem] border border-cream/10 p-6 text-center text-sm text-cream/60">
          {t("notFound")}
        </p>
      ) : (
        <div className="mt-8">
          <ManageReservation
            token={token}
            locale={locale}
            locationSlug={row.location_slug}
            initialStatus={row.status}
            initialData={
              {
                date: row.reservation_date,
                time: normalizeTime(row.reservation_time),
                partySize: row.party_size,
                firstName: row.first_name,
                occasion: row.occasion,
                childrenCount: row.children_count,
                needsHighChair: row.needs_high_chair,
                dietary: row.dietary,
                notes: row.notes,
              } satisfies ManageReservationData
            }
          />
        </div>
      )}
    </section>
  );
}
