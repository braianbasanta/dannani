import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getSupabaseAdmin, RESERVATIONS_TABLE } from "@/lib/supabase";
import {
  getReservableLocation,
  getSlotsForLocation,
  formatReservationDate,
  normalizeTime,
  todayInMadrid,
  PARTY_MIN,
  PARTY_MAX_TOTAL,
  type ReservationRow,
} from "@/lib/reservations";
import { notifyCustomer } from "@/lib/email";
import { aiConfigured, extractReservation, type ExtractedIntent } from "@/lib/reservation-ai";
import { remainingCapacity, capacityError } from "@/lib/capacity";

export const runtime = "nodejs";

/**
 * Webhook del bot @DaNanni_bot: el staff CREA, MODIFICA y CANCELA reservas
 * hablándole en lenguaje natural (mencionándolo en el grupo "DaNanni
 * Reservas", respondiendo a sus mensajes, o por privado si su user id está
 * en la allowlist). Claude interpreta el mensaje y el bot SIEMPRE pide
 * confirmación con botones antes de tocar la base de datos.
 *
 * Sin estado en DB: la acción pendiente viaja en una línea máquina dentro
 * del propio mensaje de confirmación (#nrc crear, #nrm modificar, #nrx
 * cancelar) y el callback la relee de ahí.
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

const HELP =
  "🍕 Bot de reservas de Da Nanni. Habladme directamente (mencionadme en el grupo) y yo me ocupo:\n\n" +
  '• "Reserva en poblenou el sábado a las 20 para 6, Ana López, 612 345 678, ana@mail.com"\n' +
  '• "Cambia la reserva de Ana López del sábado a las 21:30"\n' +
  '• "Cancela la reserva de Ana López del sábado"\n\n' +
  "Siempre os pido confirmación con un botón antes de tocar nada. " +
  "También aviso aquí de cada reserva que entra por la web.";

/* ------------------------------------------------------------------ *
 * Mensajes entrantes
 * ------------------------------------------------------------------ */

async function handleMessage(msg: TgMessage): Promise<void> {
  if (msg.migrate_to_chat_id) {
    console.error(
      `[telegram-bot] ¡El grupo migró a supergrupo! Nuevo chat id: ${msg.migrate_to_chat_id}. Actualizar TELEGRAM_CHAT_IDS.`
    );
    return;
  }
  if (!isAllowed(msg.chat.id, msg.from?.id)) return;

  const text = (msg.text ?? "").trim();
  if (!text) return;

  if (text.startsWith("/")) {
    const cmd = text.split(/\s+/)[0].split("@")[0].toLowerCase();
    if (cmd === "/reserva" || cmd === "/nueva") {
      await tg("sendMessage", {
        chat_id: msg.chat.id,
        text:
          "Los botones se retiraron: ahora simplemente escribime la reserva.\n" +
          'Ej: "reserva en tallers mañana a las 21 para 4, Juan Pérez, 600 111 222"',
      });
      return;
    }
    await tg("sendMessage", { chat_id: msg.chat.id, text: HELP });
    return;
  }

  // ¿Responde a un mensaje del bot? → seguimiento con ese contexto.
  const replied = msg.reply_to_message;
  if (replied && replied.from?.id === botUserId()) {
    await handleAi(msg, text, replied.text);
    return;
  }

  // Mención en grupo, o cualquier texto en privado.
  const mention = /@dananni_bot/gi;
  const isPrivate = msg.chat.id > 0;
  if (mention.test(text) || isPrivate) {
    const cleaned = text.replace(mention, "").trim();
    if (cleaned) await handleAi(msg, cleaned);
  }
}

/* ------------------------------------------------------------------ *
 * Interpretación con Claude y fichas de confirmación
 * ------------------------------------------------------------------ */

async function handleAi(msg: TgMessage, text: string, context?: string): Promise<void> {
  const say = (t: string, extra: Record<string, unknown> = {}) =>
    tg("sendMessage", {
      chat_id: msg.chat.id,
      reply_to_message_id: msg.message_id,
      allow_sending_without_reply: true,
      text: t,
      disable_web_page_preview: true,
      ...extra,
    });

  if (!aiConfigured()) {
    await say("El asistente no está activo (falta la API key). Usad dananni.es/admin/reservas/nueva.");
    return;
  }

  await tg("sendChatAction", { chat_id: msg.chat.id, action: "typing" });

  const today = todayInMadrid();
  const r = await extractReservation(text, today, context);
  console.log("[telegram-bot] ai extract:", r ? JSON.stringify(r) : "null");
  if (!r) {
    await say("No pude interpretar el mensaje. Probá a escribirlo de otra forma.");
    return;
  }

  if (r.intent === "create") {
    await proposeCreate(say, r, today);
    return;
  }
  if (r.intent === "modify" || r.intent === "cancel") {
    await proposeModifyOrCancel(say, r, today);
    return;
  }
  await say(
    "Decime qué reserva querés crear, modificar o cancelar. Ej:\n" +
      '"reserva en gracia el viernes a las 21 para 4, Marta Gil, 600 111 222"'
  );
}

type Say = (t: string, extra?: Record<string, unknown>) => Promise<unknown>;

const CONFIRM_BUTTONS = (okData: string, okLabel: string) => ({
  reply_markup: {
    inline_keyboard: [
      [
        { text: okLabel, callback_data: okData },
        { text: "✖️ No, dejalo", callback_data: "nr|x" },
      ],
    ],
  },
});

async function proposeCreate(say: Say, r: ExtractedIntent, today: string): Promise<void> {
  const location = getReservableLocation(r.location_slug);
  if (!location || !r.date || !r.time || !r.party_size || !r.name.trim()) {
    await say(r.missing || "Me falta algún dato (restaurante, día, hora, personas o nombre).");
    return;
  }
  if (r.date < today) {
    await say("Esa fecha ya pasó. Revisá el día y mandalo de nuevo.");
    return;
  }
  if (!Number.isInteger(r.party_size) || r.party_size < PARTY_MIN || r.party_size > PARTY_MAX_TOTAL) {
    await say(`Los comensales deben estar entre ${PARTY_MIN} y ${PARTY_MAX_TOTAL}.`);
    return;
  }
  const slots = getSlotsForLocation(location, r.date);
  if (!slots.includes(r.time)) {
    await say(
      `Las ${r.time} no están disponibles en ${location.name} el ${formatReservationDate(r.date, "es")}.\n` +
        (slots.length ? `Horas posibles: ${slots.join(", ")}` : "Ese día no hay horas disponibles.")
    );
    return;
  }
  const left = await remainingCapacity(r.location_slug, r.date, r.time);
  if (left !== null && r.party_size > left) {
    await say(`⛔ ${capacityError(left)} (aforo de ${location.name} superado a esa hora)`);
    return;
  }

  const payload: CreatePayload = {
    l: r.location_slug,
    d: r.date,
    t: r.time,
    p: r.party_size,
    n: r.name.trim().slice(0, 120),
    ph: r.phone.trim().slice(0, 40),
    e: r.email.trim().slice(0, 120),
    no: r.notes.trim().replace(/\s*\n\s*/g, "; ").slice(0, 400),
  };

  const lines = [
    `🤖 ¿Creo esta reserva?`,
    `📍 ${location.name} · ${formatReservationDate(r.date, "es")} · ${r.time} · ${r.party_size} pax`,
    `👤 ${payload.n}${payload.ph ? ` · ${payload.ph}` : ""}`,
  ];
  if (payload.e) lines.push(`📧 ${payload.e} (recibirá la confirmación)`);
  if (payload.no) lines.push(`📝 ${payload.no}`);
  lines.push("", `#nrc ${JSON.stringify(payload)}`);

  await say(lines.join("\n"), CONFIRM_BUTTONS("nrc|ok", "✅ Crear reserva"));
}

async function proposeModifyOrCancel(say: Say, r: ExtractedIntent, today: string): Promise<void> {
  const matches = await findReservations(r.find_name, r.find_date, r.find_location_slug);
  if (matches.length === 0) {
    await say(
      "No encontré ninguna reserva activa que encaje" +
        (r.find_name ? ` con "${r.find_name}"` : "") +
        ". Fijate en dananni.es/admin/reservas."
    );
    return;
  }
  if (matches.length > 1) {
    const list = matches
      .slice(0, 5)
      .map((m) => {
        const loc = getReservableLocation(m.location_slug);
        return `• ${m.first_name} ${m.last_name} — ${loc?.name ?? m.location_slug}, ${formatReservationDate(m.reservation_date, "es")} ${normalizeTime(m.reservation_time)}, ${m.party_size} pax`;
      })
      .join("\n");
    await say(
      `Encontré ${matches.length} reservas que encajan:\n${list}\n\nConcretá más (nombre completo, día o local).`
    );
    return;
  }

  const row = matches[0];
  const location = getReservableLocation(row.location_slug);
  if (!location) {
    await say("Esa reserva es de un local que ya no acepta reservas.");
    return;
  }
  const current = `${formatReservationDate(row.reservation_date, "es")} · ${normalizeTime(row.reservation_time)} · ${row.party_size} pax`;

  if (r.intent === "cancel") {
    await say(
      `🗑 ¿Cancelo esta reserva?\n` +
        `👤 ${row.first_name} ${row.last_name} · ${location.name}\n` +
        `📅 ${current}\n` +
        (hasRealEmail(row) ? `📧 Se le avisará por email.\n` : "") +
        `\n#nrx ${JSON.stringify({ id: row.id })}`,
      CONFIRM_BUTTONS("nrx|ok", "✅ Sí, cancelar")
    );
    return;
  }

  // modify: valores finales = lo pedido o lo que ya tenía.
  const newDate = r.new_date || row.reservation_date;
  const newTime = r.new_time || normalizeTime(row.reservation_time);
  const newParty = r.new_party_size || row.party_size;

  if (
    newDate === row.reservation_date &&
    newTime === normalizeTime(row.reservation_time) &&
    newParty === row.party_size
  ) {
    await say("¿Y qué le cambio? Decime nueva fecha, hora o nº de personas.");
    return;
  }
  if (newDate < today) {
    await say("Esa fecha nueva ya pasó. Revisá el día.");
    return;
  }
  const maxParty = Math.max(PARTY_MAX_TOTAL, row.party_size);
  if (!Number.isInteger(newParty) || newParty < PARTY_MIN || newParty > maxParty) {
    await say(`Los comensales deben estar entre ${PARTY_MIN} y ${maxParty}.`);
    return;
  }
  const keepsSlot =
    newDate === row.reservation_date && newTime === normalizeTime(row.reservation_time);
  if (!keepsSlot && !getSlotsForLocation(location, newDate).includes(newTime)) {
    const slots = getSlotsForLocation(location, newDate);
    await say(
      `Las ${newTime} no están disponibles en ${location.name} ese día.\n` +
        (slots.length ? `Horas posibles: ${slots.join(", ")}` : "Ese día no hay horas disponibles.")
    );
    return;
  }
  const left = await remainingCapacity(row.location_slug, newDate, newTime, row.id);
  if (left !== null && newParty > left) {
    await say(`⛔ ${capacityError(left)} (aforo de ${location.name} superado a esa hora)`);
    return;
  }

  await say(
    `✏️ ¿Modifico esta reserva?\n` +
      `👤 ${row.first_name} ${row.last_name} · ${location.name}\n` +
      `Antes: ${current}\n` +
      `Ahora: ${formatReservationDate(newDate, "es")} · ${newTime} · ${newParty} pax\n` +
      (hasRealEmail(row) ? `📧 Se le avisará por email.\n` : "") +
      `\n#nrm ${JSON.stringify({ id: row.id, d: newDate, t: newTime, p: newParty })}`,
    CONFIRM_BUTTONS("nrm|ok", "✅ Confirmar cambio")
  );
}

/* ------------------------------------------------------------------ *
 * Callbacks de confirmación
 * ------------------------------------------------------------------ */

async function handleCallback(cb: TgCallbackQuery): Promise<void> {
  // Cortar el "relojito" del botón siempre, pase lo que pase después.
  await tg("answerCallbackQuery", { callback_query_id: cb.id });

  const msg = cb.message;
  if (!msg || !isAllowed(msg.chat.id, cb.from.id)) return;
  const data = cb.data ?? "";

  const edit = (text: string) =>
    tg("editMessageText", {
      chat_id: msg.chat.id,
      message_id: msg.message_id,
      text,
      disable_web_page_preview: true,
    });

  if (data === "nr|x") {
    await edit("✖️ Cancelado, no he tocado nada.");
    return;
  }
  if (data === "nrc|ok") {
    await confirmCreate(msg, edit);
    return;
  }
  if (data === "nrm|ok") {
    await confirmModify(msg, edit);
    return;
  }
  if (data === "nrx|ok") {
    await confirmCancel(msg, edit);
    return;
  }
  // Botones del flujo antiguo (/reserva) que quedaron en mensajes viejos.
  if (data.startsWith("nr|")) {
    await edit(
      "Este flujo con botones se retiró: ahora escribime la reserva directamente (mencionándome) y la gestiono yo."
    );
  }
}

type Edit = (text: string) => Promise<unknown>;

/** Lee la línea máquina `#tag {json}` del propio mensaje de confirmación. */
function readPayload<T>(msg: TgMessage, tag: string): T | null {
  const m = (msg.text ?? "").match(new RegExp(`#${tag} (\\{.*\\})`));
  if (!m) return null;
  try {
    return JSON.parse(m[1]) as T;
  } catch {
    return null;
  }
}

interface CreatePayload {
  l: string;
  d: string;
  t: string;
  p: number;
  n: string;
  ph: string;
  e: string;
  no: string;
}

async function confirmCreate(msg: TgMessage, edit: Edit): Promise<void> {
  const p = readPayload<CreatePayload>(msg, "nrc");
  if (!p) {
    await edit("No pude leer la ficha. Empezá de nuevo.");
    return;
  }
  const location = getReservableLocation(p.l);
  const today = todayInMadrid();
  if (!location || !p.d || p.d < today || !getSlotsForLocation(location, p.d).includes(p.t)) {
    await edit("Esa reserva ya no es válida (fecha u hora no disponible). Empezá de nuevo.");
    return;
  }
  const left = await remainingCapacity(p.l, p.d, p.t);
  if (left !== null && Number(p.p) > left) {
    await edit(`⛔ ${capacityError(left)} (aforo de ${location.name} superado a esa hora)`);
    return;
  }

  const hasEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.e);
  const [firstName, ...lastParts] = p.n.split(/\s+/);
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(RESERVATIONS_TABLE)
    .insert({
      location_slug: p.l,
      first_name: firstName.slice(0, 80),
      last_name: lastParts.join(" ").slice(0, 80),
      phone: (p.ph || "(sin teléfono)").slice(0, 40),
      email: hasEmail ? p.e : "reservas@dananni.es",
      reservation_date: p.d,
      reservation_time: p.t,
      party_size: Number(p.p),
      notes: p.no || null,
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
    await edit("⚠️ No pude guardar la reserva. Probá de nuevo o usá dananni.es/admin/reservas/nueva.");
    return;
  }
  const row = data as ReservationRow;

  if (hasEmail) {
    await notifyCustomer(row, location, "created").catch((e) =>
      console.error("[telegram-bot] notifyCustomer error:", e)
    );
  }
  await edit(
    `✅ Reserva creada — ${location.name}\n` +
      `📅 ${formatReservationDate(row.reservation_date, "es")} · ${p.t} · ${row.party_size} pax\n` +
      `👤 ${row.first_name} ${row.last_name}`.trimEnd() +
      `${p.ph ? ` · ${p.ph}` : ""}\n` +
      (hasEmail ? `📧 ${row.email} — confirmación enviada al cliente\n` : "") +
      `Se puede ver y modificar en dananni.es/admin/reservas`
  );
}

async function confirmModify(msg: TgMessage, edit: Edit): Promise<void> {
  const p = readPayload<{ id: string; d: string; t: string; p: number }>(msg, "nrm");
  if (!p) {
    await edit("No pude leer la ficha. Empezá de nuevo.");
    return;
  }
  const row = await getRow(p.id);
  if (!row || row.status === "cancelled" || row.status === "rejected") {
    await edit("Esa reserva ya no está activa. Fijate en dananni.es/admin/reservas.");
    return;
  }
  const location = getReservableLocation(row.location_slug);
  const today = todayInMadrid();
  const keepsSlot =
    p.d === row.reservation_date && p.t === normalizeTime(row.reservation_time);
  if (!location || !p.d || p.d < today) {
    await edit("Ese cambio ya no es válido. Empezá de nuevo.");
    return;
  }
  if (!keepsSlot && !getSlotsForLocation(location, p.d).includes(p.t)) {
    await edit("Esa hora ya no está disponible. Empezá de nuevo.");
    return;
  }
  const left = await remainingCapacity(row.location_slug, p.d, p.t, row.id);
  if (left !== null && Number(p.p) > left) {
    await edit(`⛔ ${capacityError(left)} (aforo de ${location.name} superado a esa hora)`);
    return;
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(RESERVATIONS_TABLE)
    .update({
      reservation_date: p.d,
      reservation_time: p.t,
      party_size: Number(p.p),
      updated_at: new Date().toISOString(),
    })
    .eq("id", row.id)
    .select()
    .single();
  if (error || !data) {
    console.error("[telegram-bot] update error:", error);
    await edit("⚠️ No pude aplicar el cambio. Probá desde dananni.es/admin/reservas.");
    return;
  }
  const updated = data as ReservationRow;

  if (hasRealEmail(updated)) {
    await notifyCustomer(updated, location, "rescheduled").catch((e) =>
      console.error("[telegram-bot] notifyCustomer error:", e)
    );
  }
  await edit(
    `✅ Reserva modificada — ${location.name}\n` +
      `👤 ${updated.first_name} ${updated.last_name}\n` +
      `📅 ${formatReservationDate(updated.reservation_date, "es")} · ${normalizeTime(updated.reservation_time)} · ${updated.party_size} pax` +
      (hasRealEmail(updated) ? `\n📧 Aviso enviado al cliente` : "")
  );
}

async function confirmCancel(msg: TgMessage, edit: Edit): Promise<void> {
  const p = readPayload<{ id: string }>(msg, "nrx");
  if (!p) {
    await edit("No pude leer la ficha. Empezá de nuevo.");
    return;
  }
  const row = await getRow(p.id);
  if (!row) {
    await edit("No encontré esa reserva. Fijate en dananni.es/admin/reservas.");
    return;
  }
  if (row.status === "cancelled") {
    await edit("Esa reserva ya estaba cancelada.");
    return;
  }
  const location = getReservableLocation(row.location_slug);

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(RESERVATIONS_TABLE)
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("id", row.id)
    .select()
    .single();
  if (error || !data) {
    console.error("[telegram-bot] cancel error:", error);
    await edit("⚠️ No pude cancelarla. Probá desde dananni.es/admin/reservas.");
    return;
  }
  const updated = data as ReservationRow;

  if (location && hasRealEmail(updated)) {
    await notifyCustomer(updated, location, "cancelled").catch((e) =>
      console.error("[telegram-bot] notifyCustomer error:", e)
    );
  }
  await edit(
    `🗑 Reserva cancelada — ${location?.name ?? updated.location_slug}\n` +
      `👤 ${updated.first_name} ${updated.last_name}\n` +
      `📅 ${formatReservationDate(updated.reservation_date, "es")} · ${normalizeTime(updated.reservation_time)} · ${updated.party_size} pax` +
      (hasRealEmail(updated) ? `\n📧 Aviso enviado al cliente` : "")
  );
}

/* ------------------------------------------------------------------ *
 * Acceso a datos
 * ------------------------------------------------------------------ */

function hasRealEmail(row: ReservationRow): boolean {
  return Boolean(row.email) && row.email !== "reservas@dananni.es";
}

async function getRow(id: string): Promise<ReservationRow | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(RESERVATIONS_TABLE)
    .select("*")
    .eq("id", id)
    .single();
  if (error || !data) return null;
  return data as ReservationRow;
}

/** Reservas activas próximas que encajan con nombre/fecha/local (JS-filter por nombre). */
async function findReservations(
  name: string,
  date: string,
  slug: string
): Promise<ReservationRow[]> {
  const supabase = getSupabaseAdmin();
  let query = supabase
    .from(RESERVATIONS_TABLE)
    .select("*")
    .gte("reservation_date", todayInMadrid())
    .in("status", ["confirmed", "pending"])
    .order("reservation_date", { ascending: true })
    .order("reservation_time", { ascending: true })
    .limit(100);
  if (date) query = query.eq("reservation_date", date);
  if (slug) query = query.eq("location_slug", slug);
  const { data, error } = await query;
  if (error || !data) {
    console.error("[telegram-bot] búsqueda falló:", error);
    return [];
  }
  const rows = data as ReservationRow[];
  if (!name.trim()) return rows;
  const norm = (s: string) =>
    s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const tokens = norm(name).split(/\s+/).filter(Boolean);
  return rows.filter((r) => {
    const full = norm(`${r.first_name} ${r.last_name}`);
    return tokens.every((t) => full.includes(t));
  });
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
