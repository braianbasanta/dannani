/**
 * Traduce todo el contenido del sitio a en/it/ca vía DeepL API:
 *   - messages/es.json  →  messages/{en,it,ca}.json (misma estructura)
 *   - textos de src/data/{locations,menu,experience}.ts
 *       →  src/data/translations.{en,it,ca}.ts (diccionario ES→traducción)
 *
 * Uso:  node scripts/translate-content.mjs
 * Key:  DEEPL_API_KEY o ~/.deepl-api-key. Corre en ~1 min; ~85k caracteres.
 * Es idempotente: regenera los 6 archivos de salida desde cero.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const KEY =
  process.env.DEEPL_API_KEY ??
  readFileSync(path.join(homedir(), ".deepl-api-key"), "utf8").trim();
const API = KEY.endsWith(":fx")
  ? "https://api-free.deepl.com"
  : "https://api.deepl.com";

const TARGETS = { en: "EN-GB", it: "IT", ca: "CA" };

const CONTEXT =
  "Website copy for Da Nanni, a family-run Neapolitan pizzeria and trattoria " +
  "chain in Barcelona. Warm, informal brand voice (address the reader as tú/tu/you). " +
  "Dish names, 'trattoria', 'antipasti' and Italian culinary terms stay in Italian. " +
  "Neighbourhood names (Gòtic, Born, Raval, Poblenou, Gràcia) and street addresses stay unchanged.";

/* Claves de messages/es.json que se copian tal cual (idioma deliberado de marca). */
const KEEP_VERBATIM = new Set([
  "home.h1", // italiano de marca
  "home.experienciaNeon", // frase neón en inglés
  "historia.eyebrow", // "Ristorante e Pizzeria Napoletana"
]);

/* Títulos de sección de carta en español (el resto son italiano de carta y
   no entran al diccionario: el fallback los deja tal cual). */
const TRANSLATABLE_MENU_TITLES = new Set(["Bebidas", "Chupitos y Licores"]);

/* ---------- protección de placeholders/markup ---------- */

// {var} ICU → <ph i="var"/> (DeepL los ignora con ignore_tags), **bold** → <b>.
function protect(text) {
  return text
    .replaceAll("&", "&amp;")
    .replace(/\{(\w+)\}/g, '<ph i="$1"/>')
    .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
}

function unprotect(text) {
  return text
    .replace(/<ph i="(\w+)"\s*\/>/g, "{$1}")
    .replace(/<b>(.+?)<\/b>/gs, "**$1**")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'");
}

/* ---------- DeepL ---------- */

async function deeplBatch(texts, targetLang) {
  const body = {
    text: texts,
    source_lang: "ES",
    target_lang: targetLang,
    formality: "prefer_less",
    tag_handling: "xml",
    ignore_tags: ["ph"],
    context: CONTEXT,
  };
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(`${API}/v2/translate`, {
      method: "POST",
      headers: {
        Authorization: `DeepL-Auth-Key ${KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const data = await res.json();
      return data.translations.map((t) => t.text);
    }
    if ((res.status === 429 || res.status >= 500) && attempt <= 5) {
      const wait = attempt * 2000;
      console.warn(`  DeepL ${res.status}, reintento en ${wait / 1000}s…`);
      await new Promise((r) => setTimeout(r, wait));
      continue;
    }
    throw new Error(`DeepL ${res.status}: ${await res.text()}`);
  }
}

/** Traduce una lista de strings ES → targetLang preservando {vars} y **bold**. */
async function translateAll(texts, targetLang) {
  const out = [];
  for (let i = 0; i < texts.length; i += 50) {
    const batch = texts.slice(i, i + 50).map(protect);
    const translated = await deeplBatch(batch, targetLang);
    out.push(...translated.map(unprotect));
    process.stdout.write(
      `  ${Math.min(i + 50, texts.length)}/${texts.length}\r`
    );
  }
  process.stdout.write("\n");
  return out;
}

/* ---------- 1. messages/es.json ---------- */

function flatten(obj, prefix = "", into = {}) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof v === "string") into[key] = v;
    else flatten(v, key, into);
  }
  return into;
}

function unflatten(flat) {
  const root = {};
  for (const [key, value] of Object.entries(flat)) {
    const parts = key.split(".");
    let node = root;
    for (const part of parts.slice(0, -1)) {
      node[part] ??= {};
      node = node[part];
    }
    node[parts.at(-1)] = value;
  }
  return root;
}

/* ---------- 2. textos de src/data ---------- */

async function collectDataTexts() {
  const { locations } = await import("../src/data/locations.ts");
  const { menuByLocationSlug } = await import("../src/data/menu.ts");
  const { heroClip, experienceClips } = await import(
    "../src/data/experience.ts"
  );

  const texts = new Set();

  for (const l of locations) {
    texts.add(l.hoursLabel);
    texts.add(l.description);
    texts.add(l.metaTitle);
    texts.add(l.metaDescription);
    texts.add(l.h1);
  }

  const seenSections = new Set();
  for (const sections of Object.values(menuByLocationSlug)) {
    for (const section of sections) {
      if (seenSections.has(section)) continue;
      seenSections.add(section);
      if (TRANSLATABLE_MENU_TITLES.has(section.title)) texts.add(section.title);
      if (section.note) texts.add(section.note);
      for (const item of section.items) {
        if (item.description) texts.add(item.description);
      }
    }
  }

  for (const clip of [heroClip, ...experienceClips]) texts.add(clip.alt);

  return [...texts];
}

/* ---------- main ---------- */

const esMessages = JSON.parse(
  readFileSync(path.join(ROOT, "messages/es.json"), "utf8")
);
const flat = flatten(esMessages);
const messageKeys = Object.keys(flat);
const toTranslate = messageKeys.filter((k) => !KEEP_VERBATIM.has(k));

const dataTexts = await collectDataTexts();

const totalChars =
  (toTranslate.reduce((n, k) => n + flat[k].length, 0) +
    dataTexts.reduce((n, t) => n + t.length, 0)) *
  Object.keys(TARGETS).length;
console.log(
  `${messageKeys.length} claves de mensajes + ${dataTexts.length} textos de datos ≈ ${totalChars.toLocaleString("es-ES")} caracteres DeepL\n`
);

for (const [locale, targetLang] of Object.entries(TARGETS)) {
  console.log(`— ${locale} (${targetLang})`);

  console.log("  messages…");
  const translatedValues = await translateAll(
    toTranslate.map((k) => flat[k]),
    targetLang
  );
  const flatOut = {};
  for (const key of messageKeys) {
    flatOut[key] = KEEP_VERBATIM.has(key)
      ? flat[key]
      : translatedValues[toTranslate.indexOf(key)];
  }
  writeFileSync(
    path.join(ROOT, `messages/${locale}.json`),
    JSON.stringify(unflatten(flatOut), null, 2) + "\n"
  );

  console.log("  datos…");
  const translatedData = await translateAll(dataTexts, targetLang);
  const dict = Object.fromEntries(
    dataTexts.map((src, i) => [src, translatedData[i]])
  );
  writeFileSync(
    path.join(ROOT, `src/data/translations.${locale}.ts`),
    `/* GENERADO por scripts/translate-content.mjs (DeepL) — revisado a mano.\n` +
      `   Clave: texto español exacto de src/data/*.ts → traducción. */\n` +
      `export const ${locale}: Record<string, string> = ${JSON.stringify(dict, null, 2)};\n`
  );
}

const usage = await (
  await fetch(`${API}/v2/usage`, {
    headers: { Authorization: `DeepL-Auth-Key ${KEY}` },
  })
).json();
console.log(
  `\nConsumo DeepL: ${usage.character_count.toLocaleString("es-ES")} / ${usage.character_limit.toLocaleString("es-ES")} caracteres`
);
