"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, isAdminAuthed } from "@/lib/admin-auth";
import { getSupabaseAdmin, RESERVATIONS_TABLE } from "@/lib/supabase";

/** Cambia el estado de una reserva desde el panel (no envía emails). */
export async function setReservationStatus(formData: FormData) {
  if (!(await isAdminAuthed())) {
    throw new Error("No autorizado");
  }
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !["confirmed", "cancelled"].includes(status)) return;

  const supabase = getSupabaseAdmin();
  await supabase
    .from(RESERVATIONS_TABLE)
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  revalidatePath("/admin/reservas");
}

/** Cierra la sesión del panel. */
export async function logoutAdmin() {
  (await cookies()).delete(ADMIN_COOKIE);
  redirect("/admin/reservas");
}
