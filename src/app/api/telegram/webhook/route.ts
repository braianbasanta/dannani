import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getSupabaseAdmin, RESERVATIONS_TABLE } from "@/lib/supabase";
import {
  reservableLocations,
  getReservableLocation,
  getSlotsForLocation,
  formatReservationDate,
  todayInMadrid,
  PARTY_MIN,
  PARTY_MAX_TOTAL,
  type ReservationRow,
} from "@/lib/reservations";

export const runtime = "nodejs";

/**
 * Webhook del bot @DaNanni_bot: permite CREAR reservas desde Telegram
 * (grupo "DaNanni Reservas"), además de recibir los avisos.
 *
 * Flujo (sin estado en DB — todo viaja en callback_data y en el texto):
 *   /reserva → teclado de restaurantes → día → hora → comensales →
 *   el bot manda una "ficha" con una línea máquina `#nr slug fecha hora pax`
 *   y el manager RESPONDE a ese mensaje con "Nombre, teléfono" (+ notas).
 *
 * Seguridad: header `x-telegram-bot-api-secret-token` (setWebhook) y solo
 * chats/usuarios listados en TELEGRAM_CHAT_IDS.
 */

/* ------------------------------------------------------------------ *
 * Telegram API mínima
 * ------------------------------------------------------------------ */

interface TgUser {
  id: number;
  is_bot?: boolean;
}
interface TgChat {
  id: number;
}
interface TgMessage {
  message_id: number;
  chat: TgChat;
  from?: TgUser;
  text?: string;
  reply_to_message?: TgMessage;
  migrate_to_chat_id?: number;
}
interface TgCallbackQuery {
  id: string;
  from: TgUser;
  data?: string;
  message?: TgMessage;
}
interface TgUpdate {
  message?: TgMessage;
  callback_query?: TgCallbackQuery;
}

type InlineKeyboard = { text: string; callback_data: string }[][];

async function tg(
  method: string,
  payload: Record<string, unknown>
): Promise<{ message_id?: number } | null> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.warn("[telegram-bot] TELEGRAM_BOT_TOKEN sin configurar.");
    return null;
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => null);
    if (!json?.ok) {
      console.error(`[telegram-bot] ${method} falló:`, JSON.stringify(json));
      return null;
    }
    const result = json.result as { message_id?: number } | boolean;
    if (typeof result === "object" && result?.message_id) {
      console.log(`[telegram-bot] ${method} ok message_id=${result.message_id}`);
    }
    return typeof result === "object" ? result : null;
  } catch (err) {
    console.error(`[telegram-bot] ${method} error de red:`, err);
    return null;
  }
}

function botUserId(): number | null {
  const token = process.env.TELEGRAM_BOT_TOKEN ?? "";
  const id = Number(token.split(":")[0]);
  return Number.isFinite(id) && id > 0 ? id : null;
}

/** Chats/usuarios autorizados a usar el bot (TELEGRAM_CHAT_IDS, CSV). */
function isAllowed(chatId: number, userId?: number): boolean {
  const ids = (process.env.TELEGRAM_CHAT_IDS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return (
    ids.includes(String(chatId)) ||
    (userId !== undefined && ids.includes(String(userId)))
  );
}

/* ------------------------------------------------------------------ *
 * Helpers de fechas y teclados
 * ------------------------------------------------------------------ */

function addDaysISO(dateStr: string, n: number): string {
  const d = new Date(`${dateStr}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** "vie 17/07" para los botones de día. */
function dayLabel(dateStr: string, today: string): string {
  if (dateStr === today) return "Hoy";
  if (dateStr === addDaysISO(today, 1)) return "Mañana";
  const d = new Date(`${dateStr}T12:00:00Z`);
  const wd = new Intl.DateTimeFormat("es-ES", {
    weekday: "short",
    timeZone: "Europe/Madrid",
  }).format(d);
  const [, m, day] = dateStr.split("-");
  return `${wd} ${day}/${m}`;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

const CANCEL_ROW = [{ text: "✖️ Cancelar", callback_data: "nr|x" }];

function restaurantsKeyboard(presetDate?: string): InlineKeyboard {
  const suffix = presetDate ? `|${presetDate}` : "";
  return [
    ...reservableLocations.map((l) => [
      { text: `${l.name} · ${l.neighborhood}`, callback_data: `nr|${l.slug}${suffix}` },
    ]),
    CANCEL_ROW,
  ];
}

function datesKeyboard(slug: string, today: string): InlineKeyboard {
  const days = Array.from({ length: 7 }, (_, i) => addDaysISO(today, i));
  return [
    ...chunk(
      days.map((d) => ({ text: dayLabel(d, today), callback_data: `nr|${slug}|${d}` })),
      3
    ),
    [{ text: "📅 Otra fecha", callback_data: `nr|${slug}|otra` }],
    CANCEL_ROW,
  ];
}

/** Parsea "DD/MM" o "DD/MM/YYYY"; si ya pasó este año, salta al siguiente. */
function parseDateArg(arg: string, today: string): string | null {
  const m = arg.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/);
  if (!m) return null;
  const day = Number(m[1]);
  const month = Number(m[2]);
  let year = m[3] ? Number(m[3]) : Number(today.slice(0, 4));
  if (year < 100) year += 2000;
  const pad = (n: number) => String(n).padStart(2, "0");
  let iso = `${year}-${pad(month)}-${pad(day)}`;
  if (!m[3] && iso < today) iso = `${year + 1}-${pad(month)}-${pad(day)}`;
  const check = new Date(`${iso}T12:00:00Z`);
  if (
    Number.isNaN(check.getTime()) ||
    check.getUTCMonth() + 1 !== month ||
    check.getUTCDate() !== day
  )
    return null;
  return iso;
}

/* ------------------------------------------------------------------ *
 * Pasos del flujo
 * ------------------------------------------------------------------ */

const HELP =
  "🍕 Bot de reservas de Da Nanni.\n\n" +
  "• /reserva — crear una reserva (teléfono/walk-in)\n" +
  "• /reserva 24/07 — lo mismo, con la fecha ya elegida\n\n" +
  "También aviso aquí de cada reserva que entra por la web.";

async function handleMessage(msg: TgMessage): Promise<void> {
  if (msg.migrate_to_chat_id) {
    console.error(
      `[telegram-bot] ¡El grupo migró a supergrupo! Nuevo chat id: ${msg.migrate_to_chat_id}. Actualizar TELEGRAM_CHAT_IDS.`
    );
    return;
  }
  if (!isAllowed(msg.chat.id, msg.from?.id)) return;

  // ¿Respuesta a una ficha del bot? → completar la reserva.
  const replied = msg.reply_to_message;
  if (replied && replied.from?.id === botUserId() && replied.text?.includes("#nr ")) {
    await completeReservation(msg, replied.text);
    return;
  }

  const text = (msg.text ?? "").trim();
  if (!text.startsWith("/")) return;
  const [cmdRaw, ...args] = text.split(/\s+/);
  const cmd = cmdRaw.split("@")[0].toLowerCase();

  if (cmd === "/start" || cmd === "/ayuda" || cmd === "/help") {
    await tg("sendMessage", { chat_id: msg.chat.id, text: HELP });
    return;
  }

  if (cmd === "/reserva" || cmd === "/nueva") {
    const today = todayInMadrid();
    let presetDate: string | undefined;
    if (args[0]) {
      const parsed = parseDateArg(args[0], today);
      if (!parsed || parsed < today) {
        await tg("sendMessage", {
          chat_id: msg.chat.id,
          text: "No entendí la fecha. Usá /reserva DD/MM (ej: /reserva 24/07).",
        });
        return;
      }
      presetDate = parsed;
    }
    await tg("sendMessage", {
      chat_id: msg.chat.id,
      text: presetDate
        ? `📝 Nueva reserva para el ${formatReservationDate(presetDate, "es")}. ¿En qué restaurante?`
        : "📝 Nueva reserva. ¿En qué restaurante?",
      reply_markup: { inline_keyboard: restaurantsKeyboard(presetDate) },
    });
  }
}

async function handleCallback(cb: TgCallbackQuery): Promise<void> {
  // Cortar el "relojito" del botón siempre, pase lo que pase después.
  await tg("answerCallbackQuery", { callback_query_id: cb.id });

  const msg = cb.message;
  if (!msg || !isAllowed(msg.chat.id, cb.from.id)) return;
  const parts = (cb.data ?? "").split("|");
  if (parts[0] !== "nr") return;

  const edit = (text: string, keyboard?: InlineKeyboard) =>
    tg("editMessageText", {
      chat_id: msg.chat.id,
      message_id: msg.message_id,
      text,
      ...(keyboard ? { reply_markup: { inline_keyboard: keyboard } } : {}),
    });

  const today = todayInMadrid();
  const [, slug, date, time, paxStr] = parts;

  if (slug === "x") {
    await edit("✖️ Reserva cancelada. Empezá de nuevo con /reserva.");
    return;
  }

  const location = getReservableLocation(slug);
  if (!location) {
    await edit("Ese local ya no acepta reservas. Empezá de nuevo con /reserva.");
    return;
  }

  // Paso 2: elegir día.
  if (!date) {
    await edit(`📍 ${location.name}. ¿Para qué día?`, datesKeyboard(slug, today));
    return;
  }
  if (date === "otra") {
    await edit(
      `📍 ${location.name}. Para otra fecha escribí /reserva DD/MM (ej: /reserva 31/07) y volvé a elegir restaurante.`
    );
    return;
  }
  if (date < today) {
    await edit("Esa fecha ya pasó. Empezá de nuevo con /reserva.");
    return;
  }

  // Paso 3: elegir hora (respeta turnos fijos y bloqueos del día).
  if (!time) {
    const slots = getSlotsForLocation(location, date);
    if (slots.length === 0) {
      await edit(
        `📍 ${location.name} no tiene horas disponibles el ${formatReservationDate(date, "es")}.`
      );
      return;
    }
    await edit(
      `📍 ${location.name} · ${formatReservationDate(date, "es")}. ¿A qué hora?`,
      [
        ...chunk(
          slots.map((s) => ({ text: s, callback_data: `nr|${slug}|${date}|${s}` })),
          4
        ),
        CANCEL_ROW,
      ]
    );
    return;
  }

  // Paso 4: comensales.
  if (!paxStr) {
    await edit(
      `📍 ${location.name} · ${formatReservationDate(date, "es")} · ${time}. ¿Cuántas personas? (para más de 20, usar dananni.es/admin/reservas/nueva)`,
      [
        ...chunk(
          Array.from({ length: 20 }, (_, i) => ({
            text: String(i + 1),
            callback_data: `nr|${slug}|${date}|${time}|${i + 1}`,
          })),
          5
        ),
        CANCEL_ROW,
      ]
    );
    return;
  }

  // Paso 5: ficha + pedir nombre y teléfono respondiendo al mensaje.
  await edit(
    `📍 ${location.name} · ${formatReservationDate(date, "es")} · ${time} · ${paxStr} pax\n⬇️ Falta el cliente: respondé al siguiente mensaje.`
  );
  await tg("sendMessage", {
    chat_id: msg.chat.id,
    text:
      `📝 ${location.name} · ${formatReservationDate(date, "es")} · ${time} · ${paxStr} pax\n\n` +
      `RESPONDÉ a este mensaje con nombre y teléfono del cliente.\n` +
      `Ej: "Juan Pérez, 600 111 222" (líneas extra = notas; sin teléfono, solo el nombre)\n\n` +
      `#nr ${slug} ${date} ${time} ${paxStr}`,
    reply_markup: { force_reply: true, selective: true },
  });
}

/** Parsea "Nombre Apellido, 600 111 222\nnotas..." de la respuesta del manager. */
function parseContact(text: string): {
  name: string;
  phone: string;
  notes: string;
} {
  const [first = "", ...rest] = text.split("\n");
  let name = first.trim();
  let phone = "";
  const comma = first.indexOf(",");
  if (comma !== -1) {
    name = first.slice(0, comma).trim();
    phone = first.slice(comma + 1).trim();
  } else {
    const m = first.match(/(\+?\d[\d\s.\-()]{5,}\d)\s*$/);
    if (m && m.index !== undefined) {
      phone = m[1].trim();
      name = first.slice(0, m.index).trim();
    }
  }
  return { name, phone, notes: rest.join("\n").trim() };
}

async function completeReservation(msg: TgMessage, fichaText: string): Promise<void> {
  const say = (text: string) =>
    tg("sendMessage", {
      chat_id: msg.chat.id,
      text,
      reply_to_message_id: msg.message_id,
    });

  const m = fichaText.match(/#nr (\S+) (\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}) (\d{1,2})/);
  if (!m) return;
  const [, slug, date, time, paxStr] = m;
  const location = getReservableLocation(slug);
  const partySize = Number(paxStr);
  const today = todayInMadrid();

  if (!location || !Number.isInteger(partySize) || partySize < PARTY_MIN || partySize > PARTY_MAX_TOTAL) {
    await say("Esa ficha ya no es válida. Empezá de nuevo con /reserva.");
    return;
  }
  if (date < today) {
    await say("La fecha de esa ficha ya pasó. Empezá de nuevo con /reserva.");
    return;
  }
  if (!getSlotsForLocation(location, date).includes(time)) {
    await say("Esa hora ya no está disponible en ese local. Empezá de nuevo con /reserva.");
    return;
  }

  const { name, phone, notes } = parseContact(msg.text ?? "");
  if (!name) {
    await say('No encontré el nombre. Respondé a la ficha con: "Nombre, teléfono".');
    return;
  }

  const [firstName, ...lastParts] = name.split(/\s+/);
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(RESERVATIONS_TABLE)
    .insert({
      location_slug: slug,
      first_name: firstName.slice(0, 80),
      last_name: lastParts.join(" ").slice(0, 80),
      phone: (phone || "(sin teléfono)").slice(0, 40),
      email: "reservas@dananni.es",
      reservation_date: date,
      reservation_time: time,
      party_size: partySize,
      notes: (notes ? `${notes}\n` : "") + "Creada desde Telegram.",
      marketing_opt_in: false,
      locale: "es",
      attribution: { utm_source: "telegram", utm_medium: "manual" },
      status: "confirmed",
      manage_token: randomBytes(20).toString("base64url"),
    })
    .select()
    .single();

  if (error || !data) {
    console.error("[telegram-bot] insert error:", error);
    await say("⚠️ No pude guardar la reserva. Probá de nuevo o usá dananni.es/admin/reservas/nueva.");
    return;
  }

  const row = data as ReservationRow;
  await say(
    `✅ Reserva creada — ${location.name}\n` +
      `📅 ${formatReservationDate(row.reservation_date, "es")} · ${time} · ${row.party_size} pax\n` +
      `👤 ${row.first_name} ${row.last_name}`.trimEnd() +
      `${phone ? ` · ${phone}` : ""}\n` +
      `Se puede ver y modificar en dananni.es/admin/reservas`
  );
}

/* ------------------------------------------------------------------ *
 * Entrada del webhook
 * ------------------------------------------------------------------ */

export async function POST(req: Request) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secret && req.headers.get("x-telegram-bot-api-secret-token") !== secret) {
    return new NextResponse("forbidden", { status: 403 });
  }

  const update = (await req.json().catch(() => null)) as TgUpdate | null;
  if (update) {
    try {
      if (update.callback_query) await handleCallback(update.callback_query);
      else if (update.message) await handleMessage(update.message);
    } catch (err) {
      console.error("[telegram-bot] error procesando update:", err);
    }
  }
  // Siempre 200: si no, Telegram reintenta el mismo update en bucle.
  return NextResponse.json({ ok: true });
}
