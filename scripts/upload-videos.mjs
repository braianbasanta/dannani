// Sube los videos de platos (ya comprimidos en public/videos/) + pósters a
// Vercel Blob y devuelve el manifiesto slug -> { videoUrl, posterUrl } por stdout
// en JSON, para que un script separado reescriba src/data/menu.ts.
//
// REQUISITOS (una sola vez):
//   1. Videos comprimidos en public/videos/{take-away,dine-in}/<slug>.mp4
//      + póster public/videos/{take-away,dine-in}/<slug>.jpg
//   2. Blob store conectado al proyecto (Storage -> Blob en Vercel) y
//      BLOB_READ_WRITE_TOKEN en .env.local (`vercel env pull` si falta).
//
// USO:  node --env-file=.env.local scripts/upload-videos.mjs > /tmp/video-manifest.json

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
const GROUPS = ["take-away", "dine-in"];

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

const manifest = {};

for (const group of GROUPS) {
  const dir = join(ROOT, "public", "videos", group);
  const slugs = readdirSync(dir)
    .filter((f) => f.endsWith(".mp4"))
    .map((f) => f.replace(/\.mp4$/, ""));

  for (const [i, slug] of slugs.entries()) {
    const mp4 = join(dir, `${slug}.mp4`);
    const jpg = join(dir, `${slug}.jpg`);
    const videoUrl = await uploadFile(mp4, `videos/${group}/${slug}.mp4`, "video/mp4");
    const posterUrl = await uploadFile(jpg, `videos/${group}/${slug}.jpg`, "image/jpeg");
    manifest[`${group}/${slug}`] = { videoUrl, posterUrl };
    console.error(`✓ [${group} ${i + 1}/${slugs.length}] ${slug}`);
  }
}

console.log(JSON.stringify(manifest, null, 2));
console.error(`\nListo: ${Object.keys(manifest).length} videos en Blob.`);
