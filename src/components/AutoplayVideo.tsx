"use client";

import { useEffect, useRef } from "react";

type AutoplayVideoProps = {
  src: string;
  /** Omitir cuando el póster se renderiza aparte (p. ej. next/image detrás
   * del video): el video queda transparente hasta que arranca. */
  poster?: string;
  className?: string;
  /** Solo para el video del hero: precarga los metadatos para arrancar rápido.
   * No usamos preload="auto": el hero se monta dos veces (móvil/desktop) y el
   * oculto por CSS también descargaría el mp4 entero (~3,8 MB extra). */
  priority?: boolean;
  "aria-label"?: string;
};

/**
 * Video mudo en loop que se reproduce solo mientras está en viewport
 * (IntersectionObserver) y respeta prefers-reduced-motion (queda el póster).
 * Con preload="none" el video no descarga nada hasta que entra en pantalla.
 */
export function AutoplayVideo({
  src,
  poster,
  className,
  priority = false,
  "aria-label": ariaLabel,
}: AutoplayVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {
            // Autoplay bloqueado (p. ej. ahorro de datos): queda el póster.
          });
        } else {
          video.pause();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload={priority ? "metadata" : "none"}
      draggable={false}
      aria-label={ariaLabel}
      className={className}
    />
  );
}
