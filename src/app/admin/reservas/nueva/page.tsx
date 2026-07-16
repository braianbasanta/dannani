import Link from "next/link";
import { isAdminAuthed, isAdminConfigured } from "@/lib/admin-auth";
import { AdminLogin } from "@/components/AdminLogin";
import { AdminNewReservationForm } from "@/components/AdminNewReservationForm";

export const dynamic = "force-dynamic";

/** Alta manual de reservas (teléfono / walk-in) desde el panel admin. */
export default async function AdminNuevaReservaPage() {
  if (!(await isAdminAuthed())) {
    return <AdminLogin notConfigured={!isAdminConfigured()} />;
  }

  return (
    <div className="min-h-screen bg-night text-cream">
      <header className="sticky top-0 z-10 border-b border-cream/10 bg-night/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <p className="eyebrow">Da Nanni</p>
            <h1 className="font-display text-xl">Nueva reserva</h1>
          </div>
          <Link
            href="/admin/reservas"
            className="rounded-full px-3 py-1.5 text-xs ring-1 ring-cream/15 hover:bg-cream/5"
          >
            ← Volver al panel
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-4 py-8">
        <p className="mb-6 text-sm text-cream/60">
          Para reservas tomadas por teléfono o en persona. Se guarda como
          confirmada y avisa a la manager por Telegram y email.
        </p>
        <AdminNewReservationForm />
      </main>
    </div>
  );
}
