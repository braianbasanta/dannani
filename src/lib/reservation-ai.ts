import Anthropic from "@anthropic-ai/sdk";
import { reservableLocations } from "@/lib/reservations";

/**
 * Interpretación de mensajes del staff para el bot de Telegram
 * (@DaNanni_bot): crear, modificar o cancelar reservas en lenguaje natural.
 * Modelo: claude-sonnet-5 (con fallback a claude-opus-4-8 solo si Sonnet
 * está sobrecargado — nunca un modelo menor: aquí prima no equivocarse).
 * Structured outputs garantizan el JSON. Sin ANTHROPIC_API_KEY devuelve null.
 */

export interface ExtractedIntent {
  intent: "create" | "modify" | "cancel" | "other";
  // create
  location_slug: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  party_size: number;
  name: string;
  phone: string;
  email: string;
  notes: string;
  // modify / cancel — localizar la reserva existente
  find_name: string;
  find_date: string; // YYYY-MM-DD
  find_location_slug: string;
  // modify — cambios pedidos ("" / 0 = sin cambio)
  new_date: string;
  new_time: string;
  new_party_size: number;
  // pregunta breve si falta algo esencial
  missing: string;
}

const SLUGS = ["born", "raval", "poblenou", "gracia", ""] as const;

const EXTRACT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "intent",
    "location_slug",
    "date",
    "time",
    "party_size",
    "name",
    "phone",
    "email",
    "notes",
    "find_name",
    "find_date",
    "find_location_slug",
    "new_date",
    "new_time",
    "new_party_size",
    "missing",
  ],
  properties: {
    intent: {
      type: "string",
      enum: ["create", "modify", "cancel", "other"],
      description:
        "create = reserva nueva; modify = cambiar una existente; cancel = anular una existente; other = el mensaje no pide nada de eso.",
    },
    location_slug: {
      type: "string",
      enum: SLUGS,
      description: "Solo para create: restaurante de la reserva nueva; '' si no está claro.",
    },
    date: {
      type: "string",
      description:
        "Solo para create: fecha resuelta YYYY-MM-DD (resolver 'mañana', 'este sábado', '24/07'…); '' si falta.",
    },
    time: {
      type: "string",
      description: "Solo para create: hora HH:MM de 24h ('a las 8 de la tarde' → '20:00'); '' si falta.",
    },
    party_size: { type: "integer", description: "Solo para create: comensales; 0 si falta." },
    name: { type: "string", description: "Solo para create: nombre del cliente; '' si falta." },
    phone: { type: "string", description: "Solo para create: teléfono; '' si falta." },
    email: { type: "string", description: "Solo para create: email; '' si falta." },
    notes: {
      type: "string",
      description: "Solo para create: peticiones extra en una línea (terraza, alergias, trona…); '' si no hay.",
    },
    find_name: {
      type: "string",
      description: "Para modify/cancel: nombre del cliente de la reserva a localizar; '' si no lo dicen.",
    },
    find_date: {
      type: "string",
      description:
        "Para modify/cancel: fecha ACTUAL de la reserva a localizar, YYYY-MM-DD resuelta; '' si no la dicen.",
    },
    find_location_slug: {
      type: "string",
      enum: SLUGS,
      description: "Para modify/cancel: restaurante de la reserva a localizar; '' si no lo dicen.",
    },
    new_date: {
      type: "string",
      description: "Solo para modify: NUEVA fecha YYYY-MM-DD si piden cambiarla; '' si no cambia.",
    },
    new_time: {
      type: "string",
      description: "Solo para modify: NUEVA hora HH:MM si piden cambiarla; '' si no cambia.",
    },
    new_party_size: {
      type: "integer",
      description: "Solo para modify: NUEVO nº de comensales si piden cambiarlo; 0 si no cambia.",
    },
    missing: {
      type: "string",
      description:
        "Si falta algo esencial para ejecutar el intent (p. ej. en create: restaurante/fecha/hora/personas/nombre): UNA pregunta breve en español pidiéndolo. '' si no falta nada.",
    },
  },
} as const;

let client: Anthropic | null = null;
function getClient(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!client) client = new Anthropic();
  return client;
}

export function aiConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

/**
 * Interpreta un mensaje libre del staff. `context` es el mensaje del bot al
 * que están respondiendo (si aplica), para que los seguimientos tipo
 * "mejor a las 22" tengan sentido. Null si falla.
 */
export async function extractReservation(
  text: string,
  todayISO: string,
  context?: string
): Promise<ExtractedIntent | null> {
  const anthropic = getClient();
  if (!anthropic) return null;

  const todayLong = new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Madrid",
  }).format(new Date(`${todayISO}T12:00:00Z`));

  const locales = reservableLocations
    .map((l) => `- ${l.slug}: ${l.name} (${l.neighborhood})`)
    .join("\n");

  const userContent = context
    ? `El staff responde a este mensaje anterior del bot:\n"""${context}"""\n\nMensaje del staff:\n${text}`
    : text;

  // Sonnet 5 siempre; solo si está sobrecargado (529/429/5xx) reintenta con
  // Opus 4.8 (igual o más capaz — nunca degradar a un modelo menor).
  const MODELS = ["claude-sonnet-5", "claude-opus-4-8"] as const;

  const request = (model: (typeof MODELS)[number]) =>
    anthropic.messages.create({
      model,
      max_tokens: 4000,
      output_config: { format: { type: "json_schema", schema: EXTRACT_SCHEMA } },
      system:
        `Interpretas mensajes del staff de Da Nanni (grupo de trattorias napolitanas en Barcelona) sobre reservas de mesa. ` +
        `Hoy es ${todayLong} (${todayISO}) en Madrid.\n\n` +
        `Restaurantes (slug: nombre):\n${locales}\n` +
        `Alias frecuentes: "tallers", "tallers 69" o "raval" → raval; "gràcia"/"gracia" → gracia.\n\n` +
        `Intents:\n` +
        `- create: piden apuntar una reserva nueva.\n` +
        `- modify: piden cambiar una reserva que ya existe (los datos para LOCALIZARLA van en find_*; los cambios en new_*).\n` +
        `- cancel: piden anular una reserva existente (localizarla con find_*).\n` +
        `- other: el mensaje no pide nada de lo anterior.\n\n` +
        `Reglas:\n` +
        `- Resuelve fechas relativas respecto a hoy ("mañana", "este sábado", "el viernes que viene").\n` +
        `- Horas en 24h; en un restaurante "a las 8"/"a las 9" sin más contexto es por la noche (20:00/21:00).\n` +
        `- No inventes datos: si algo no está en el mensaje (ni en el contexto), deja el campo vacío (o 0).\n` +
        `- En modify, no confundas la fecha de la reserva actual (find_date) con la nueva (new_date): ` +
        `"cambia la del sábado a las 22" → find_date=ese sábado y new_time=22:00.\n` +
        `- El mensaje puede estar en español, italiano, catalán o inglés.`,
      messages: [{ role: "user", content: userContent }],
    });

  for (const model of MODELS) {
    try {
      const res = await request(model);
      if (res.stop_reason === "refusal") return null;
      const block = res.content.find((b) => b.type === "text");
      if (!block || block.type !== "text") return null;
      return JSON.parse(block.text) as ExtractedIntent;
    } catch (err) {
      const status = err instanceof Anthropic.APIError ? err.status : undefined;
      const retryable = status === 529 || status === 429 || (status ?? 0) >= 500;
      console.error(`[reservation-ai] ${model} falló (${status ?? "?"}):`, err);
      if (!retryable) return null;
      // sobrecarga → probar el siguiente modelo
    }
  }
  return null;
}
