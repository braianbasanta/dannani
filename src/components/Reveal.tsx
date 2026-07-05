"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

/**
 * Fade-in al entrar en viewport. Sin JS el contenido es visible desde el
 * primer render (SSR-safe); solo empieza a ocultarse tras montar, así
 * nunca deja contenido invisible a crawlers o si el observer falla.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Diferido a rAF: evita el cascading render de hacer setState
    // síncrono dentro del cuerpo del efecto.
    const raf = requestAnimationFrame(() => setMounted(true));
    const el = ref.current;
    if (!el) return () => cancelAnimationFrame(raf);

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  const hidden = mounted && !visible;

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        hidden ? "translate-y-6 opacity-0" : "translate-y-0 opacity-100"
      } ${className}`}
      style={delay && !hidden ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
