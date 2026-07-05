import type { Metadata } from "next";

/** Imagen OG por defecto del sitio (1200×630, generada de la foto de la
 * pizza frente a la Catedral). */
export const OG_DEFAULT_IMAGE = "/images/og/home.jpg";

/**
 * Metadata de página con canonical y Open Graph consistentes.
 * `path` es la ruta pública sin locale (p.ej. "/restaurantes/born");
 * las URLs relativas se resuelven contra `metadataBase` (layout raíz).
 */
export function pageMetadata({
  title,
  description,
  path,
  image,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      type: "website",
      siteName: "Da Nanni",
      locale: "es_ES",
      images: [{ url: image ?? OG_DEFAULT_IMAGE }],
    },
  };
}
