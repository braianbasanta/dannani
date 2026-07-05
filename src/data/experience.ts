/**
 * Clips de experiencia de la home ("Así se vive Da Nanni") + video del hero.
 * Recortados de los reels crudos de Media/wetransfer_video-* (720x1280, ~10s,
 * sin audio) y subidos a Vercel Blob con scripts/upload-experience.mjs.
 * Para añadir uno: recortar/comprimir con ffmpeg al mismo patrón, correr el
 * script y pegar aquí las URLs del manifiesto.
 */

const BLOB = "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/experience";

export interface ExperienceClip {
  slug: string;
  video: string;
  poster: string;
  /** Descripción accesible del clip (decorativo, sin audio). */
  alt: string;
}

function clip(slug: string, alt: string): ExperienceClip {
  return {
    slug,
    video: `${BLOB}/${slug}.mp4`,
    poster: `${BLOB}/${slug}.jpg`,
    alt,
  };
}

/** Video del hero de la home: la pizza saliendo del horno de leña. */
export const heroClip = clip(
  "horno-de-lena",
  "Pizza napolitana saliendo del horno de leña de Da Nanni"
);

export const experienceClips: ExperienceClip[] = [
  clip(
    "ambiente-local",
    "El horno de leña y el ambiente de una pizzería Da Nanni"
  ),
  clip("brindis", "Brindis con vino junto a platos de pasta y marisco"),
  clip(
    "carbonara-en-vivo",
    "Un cocinero manteca los spaghetti alla carbonara en la sartén"
  ),
  clip(
    "crudo-mediterraneo",
    "Emplatado de crudo de pescado con verduras mediterráneas"
  ),
  clip("pasta-fresca", "Platos de pasta fresca recién emplatados"),
  clip("parmigiana", "Una parmigiana de berenjena emplatada en cocina"),
];
