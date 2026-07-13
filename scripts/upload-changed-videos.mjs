// Re-sube al Blob una lista de mp4 locales (mismas rutas → URLs intactas).
// Útil tras re-encodear videos en public/videos/ sin tocar src/data.
//
// USO:  node --env-file=.env.local scripts/upload-changed-videos.mjs <lista.txt>
//       (lista.txt: una ruta por línea, p.ej. public/videos/dine-in/marinara.mp4)

import { readFileSync } from "node:fs";
import { put } from "@vercel/blob";

const TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
if (!TOKEN) {
  console.error("✗ Falta BLOB_READ_WRITE_TOKEN. Corré: vercel env pull .env.local");
  process.exit(1);
}

const list = process.argv[2];
if (!list) {
  console.error("✗ Falta la lista de archivos: node scripts/upload-changed-videos.mjs <lista.txt>");
  process.exit(1);
}

const files = readFileSync(list, "utf8").trim().split("\n");
for (const [i, local] of files.entries()) {
  const blobPath = local.replace(/^public\//, ""); // videos/<grupo>/<slug>.mp4
  await put(blobPath, readFileSync(local), {
    access: "public",
    token: TOKEN,
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "video/mp4",
  });
  console.error(`✓ [${i + 1}/${files.length}] ${blobPath}`);
}
console.error(`\nListo: ${files.length} videos actualizados en Blob.`);
