import type { Location } from "@/data/locations";
import {
  formatReservationDate,
  normalizeTime,
  type ReservationRow,
} from "@/lib/reservations";
import type { EmailKind } from "@/lib/email";

/**
 * Aviso de reservas por Telegram al grupo "DaNanni Reservas" (Giusy + Braian),
 * además del email — el email a veces no le notifica a la manager. Best
 * effort: si falta config o falla Telegram, se registra y la reserva sigue.
 *
 * Bot: @DaNanni_bot. Env necesarias:
 * - TELEGRAM_BOT_TOKEN: token del bot (BotFather).
 * - TELEGRAM_CHAT_IDS: chat ids destino separados por comas (el del grupo
 *   es negativo, p. ej. "-5586809601").
 */

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://dananni.es").replace(
    /\/$/,
    ""
  );
}

const TAGS: Record<EmailKind, string> = {
  created: "🆕 NUEVA RESERVA",
  requested: "⏳ GRUPO GRANDE — pendiente de confirmar",
  rescheduled: "✏️ RESERVA MODIFICADA",
  cancelled: "❌ RESERVA CANCELADA",
  rejected: "🚫 RESERVA RECHAZADA",
};

function buildMessage(
  row: ReservationRow,
  location: Location,
  kind: EmailKind
): string {
  const lines = [
    `${TAGS[kind]} · ${location.name}`,
    `📅 ${formatReservationDate(row.reservation_date, "es")} · ${normalizeTime(
      row.reservation_time
    )} · ${row.party_size} pax`,
    `👤 ${row.first_name} ${row.last_name} · ${row.phone}`,
  ];
  if (row.occasion) lines.push(`🎉 ${row.occasion}`);
  if (row.children_count > 0)
    lines.push(
      `👶 ${row.children_count} niños${row.needs_high_chair ? " (trona)" : ""}`
    );
  if (row.dietary) lines.push(`⚠️ ${row.dietary}`);
  if (row.notes) lines.push(`📝 ${row.notes}`);
  if (kind === "requested")
    lines.push(
      `Confirmar o rechazar: ${siteUrl()}/reserva/${row.manage_token}/aprobar`
    );
  return lines.join("\n");
}

/** Manda el aviso a todos los chats configurados. Nunca lanza. */
export async function sendReservationTelegram(
  row: ReservationRow,
  location: Location,
  kind: EmailKind
): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatIds = (process.env.TELEGRAM_CHAT_IDS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!token || chatIds.length === 0) {
    console.warn("[telegram] TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_IDS sin configurar; aviso omitido.");
    return;
  }

  const text = buildMessage(row, location, kind);
  await Promise.all(
    chatIds.map(async (chatId) => {
      try {
        const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text,
            disable_web_page_preview: true,
          }),
        });
        if (!res.ok) {
          console.error("[telegram] sendMessage falló:", res.status, await res.text());
        }
      } catch (err) {
        console.error("[telegram] envío fallido:", err);
      }
    })
  );
}
