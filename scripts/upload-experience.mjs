// Sube los clips de experiencia de la home (ya recortados/comprimidos en
// public/videos/experience/) + pósters a Vercel Blob y devuelve el manifiesto
// slug -> { videoUrl, posterUrl } por stdout en JSON, para pegar las URLs a
// mano en src/data/experience.ts.
//
// REQUISITOS: igual que upload-videos.mjs (BLOB_READ_WRITE_TOKEN en .env.local).
//
// USO:  node --env-file=.env.local scripts/upload-experience.mjs

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { put } from "@vercel/blob";

const TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
if (!TOKEN) {
  console.error(
    "✗ Falta BLOB_READ_WRITE_TOKEN. Corré: vercel env pull .env.local"
  );
  process.exit(1);
}

const ROOT = join(fileURLToPath(import.meta.url), "..", "..");

async function uploadFile(localPath, blobPath, contentType) {
  const { url } = await put(blobPath, readFileSync(localPath), {
    access: "public",
    token: TOKEN,
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType,
  });
  return url;
}

const dir = join(ROOT, "public", "videos", "experience");
const slugs = readdirSync(dir)
  .filter((f) => f.endsWith(".mp4"))
  .map((f) => f.replace(/\.mp4$/, ""));

const manifest = {};

for (const [i, slug] of slugs.entries()) {
  const mp4 = join(dir, `${slug}.mp4`);
  const jpg = join(dir, `${slug}.jpg`);
  const videoUrl = await uploadFile(mp4, `videos/experience/${slug}.mp4`, "video/mp4");
  const posterUrl = await uploadFile(jpg, `videos/experience/${slug}.jpg`, "image/jpeg");
  manifest[slug] = { videoUrl, posterUrl };
  console.error(`✓ [${i + 1}/${slugs.length}] ${slug}`);
}

console.log(JSON.stringify(manifest, null, 2));
console.error(`\nListo: ${Object.keys(manifest).length} clips en Blob.`);
