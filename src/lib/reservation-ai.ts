import Anthropic from "@anthropic-ai/sdk";
import { reservableLocations } from "@/lib/reservations";

/**
 * Extracción de reservas en lenguaje natural para el bot de Telegram
 * (@DaNanni_bot): el staff escribe "@bot reserva en poblenou el sábado a las
 * 20 para 20, Manolito 600..." y Claude devuelve los campos estructurados.
 * Modelo: claude-sonnet-5 con structured outputs (JSON garantizado) y
 * effort low (extracción barata y rápida). Si falta ANTHROPIC_API_KEY,
 * devuelve null y el bot lo indica.
 */

export interface ExtractedReservation {
  location_slug: string; // "" si no se menciona
  date: string; // YYYY-MM-DD, "" si falta
  time: string; // HH:MM, "" si falta
  party_size: number; // 0 si falta
  name: string;
  phone: string;
  email: string;
  notes: string;
  missing: string; // pregunta en español si falta algo esencial, "" si completo
}

const EXTRACT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "location_slug",
    "date",
    "time",
    "party_size",
    "name",
    "phone",
    "email",
    "notes",
    "missing",
  ],
  properties: {
    location_slug: {
      type: "string",
      enum: ["born", "raval", "poblenou", "gracia", ""],
      description: "Slug del restaurante mencionado; cadena vacía si no está claro.",
    },
    date: {
      type: "string",
      description:
        "Fecha resuelta en formato YYYY-MM-DD (resolver 'mañana', 'este sábado', '24/07'…); vacía si falta.",
    },
    time: {
      type: "string",
      description: "Hora en formato HH:MM de 24h ('a las 8 de la tarde' → '20:00'); vacía si falta.",
    },
    party_size: { type: "integer", description: "Número de comensales; 0 si falta." },
    name: { type: "string", description: "Nombre del cliente; vacío si falta." },
    phone: { type: "string", description: "Teléfono del cliente; vacío si falta." },
    email: { type: "string", description: "Email del cliente; vacío si falta." },
    notes: {
      type: "string",
      description:
        "Peticiones extra en una línea (terraza, alergias, trona, ocasión…); vacío si no hay.",
    },
    missing: {
      type: "string",
      description:
        "Si falta restaurante, fecha, hora, nº de personas o nombre: UNA pregunta breve en español pidiendo lo que falta. Vacía si no falta nada esencial.",
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

/** Extrae los datos de una reserva de un mensaje libre del staff. Null si falla. */
export async function extractReservation(
  text: string,
  todayISO: string
): Promise<ExtractedReservation | null> {
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

  // Sonnet 5 primero; si está sobrecargado (529/5xx/429) cae a Haiku 4.5,
  // que resuelve esta extracción igual de bien y casi nunca está saturado.
  const MODELS = ["claude-sonnet-5", "claude-haiku-4-5"] as const;

  const request = (model: (typeof MODELS)[number]) =>
    anthropic.messages.create({
      model,
      max_tokens: 4000,
      output_config: {
        // effort no está soportado en Haiku 4.5; solo se manda en Sonnet.
        ...(model === "claude-sonnet-5" ? { effort: "low" as const } : {}),
        format: { type: "json_schema", schema: EXTRACT_SCHEMA },
      },
      system:
        `Extraes datos de reservas de mesa de mensajes del staff de Da Nanni (grupo de trattorias napolitanas en Barcelona). ` +
        `Hoy es ${todayLong} (${todayISO}) en Madrid.\n\n` +
        `Restaurantes (slug: nombre):\n${locales}\n` +
        `Alias frecuentes: "tallers", "tallers 69" o "raval" → raval; "gràcia"/"gracia" → gracia.\n\n` +
        `Reglas:\n` +
        `- Resuelve fechas relativas respecto a hoy ("mañana", "este sábado", "el viernes que viene").\n` +
        `- Horas en 24h; en un restaurante "a las 8"/"a las 9" sin más contexto es por la noche (20:00/21:00).\n` +
        `- No inventes datos: si algo no está en el mensaje, deja el campo vacío (o 0).\n` +
        `- El mensaje puede estar en español, italiano, catalán o inglés.`,
      messages: [{ role: "user", content: text }],
    });

  for (const model of MODELS) {
    try {
      const res = await request(model);
      if (res.stop_reason === "refusal") return null;
      const block = res.content.find((b) => b.type === "text");
      if (!block || block.type !== "text") return null;
      return JSON.parse(block.text) as ExtractedReservation;
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
