// Sube fotos estáticas (bebidas sin video) a Vercel Blob y devuelve el
// manifiesto slug -> url por stdout en JSON.
//
// USO:  node --env-file=.env.local scripts/upload-photos.mjs > /tmp/photo-manifest.json

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { put } from "@vercel/blob";

const TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
if (!TOKEN) {
  console.error("✗ Falta BLOB_READ_WRITE_TOKEN. Corré: vercel env pull .env.local");
  process.exit(1);
}

const ROOT = join(fileURLToPath(import.meta.url), "..", "..");
const DIR = join(ROOT, "public", "photos", "bebidas");

const manifest = {};
const files = readdirSync(DIR).filter((f) => f.endsWith(".jpg"));

for (const [i, file] of files.entries()) {
  const slug = file.replace(/\.jpg$/, "");
  const { url } = await put(`photos/bebidas/${slug}.jpg`, readFileSync(join(DIR, file)), {
    access: "public",
    token: TOKEN,
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "image/jpeg",
  });
  manifest[slug] = url;
  console.error(`✓ [${i + 1}/${files.length}] ${slug}`);
}

console.log(JSON.stringify(manifest, null, 2));
console.error(`\nListo: ${Object.keys(manifest).length} fotos en Blob.`);
