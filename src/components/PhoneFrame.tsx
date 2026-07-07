import type { ReactNode } from "react";

/**
 * Silueta de móvil (estilo iPhone) para presentar video vertical como un reel.
 * El contenido (children) llena la pantalla con object-cover; la dynamic island
 * y el home indicator flotan por encima, igual que en un teléfono real
 * reproduciendo un reel. Server component: sin JS. El bezel usa un casi-negro
 * tintado con el teal de marca; el ancho lo controla el contenedor padre.
 */
export function PhoneFrame({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative mx-auto w-full ${className}`}>
      {/* Glow eléctrico de marca detrás del teléfono, como un neón */}
      <div
        aria-hidden
        className="absolute -inset-8 -z-10 rounded-[3.5rem] bg-electric/15 blur-3xl"
      />

      {/* Cuerpo del teléfono */}
      <div className="relative rounded-[2.9rem] bg-[#13272b] p-2.5 shadow-card ring-1 ring-black/20">
        {/* Botones laterales */}
        <span
          aria-hidden
          className="absolute -left-[2px] top-24 h-8 w-[3px] rounded-l-sm bg-[#0c191c]"
        />
        <span
          aria-hidden
          className="absolute -left-[2px] top-36 h-12 w-[3px] rounded-l-sm bg-[#0c191c]"
        />
        <span
          aria-hidden
          className="absolute -right-[2px] top-32 h-16 w-[3px] rounded-r-sm bg-[#0c191c]"
        />

        {/* Pantalla */}
        <div className="relative aspect-[9/19] overflow-hidden rounded-[2.2rem] bg-black">
          {children}

          {/* Dynamic island */}
          <div
            aria-hidden
            className="absolute left-1/2 top-3 z-20 h-[26px] w-24 -translate-x-1/2 rounded-full bg-black"
          />

          {/* Home indicator */}
          <div
            aria-hidden
            className="absolute bottom-2.5 left-1/2 z-20 h-1 w-24 -translate-x-1/2 rounded-full bg-white/70"
          />
        </div>
      </div>
    </div>
  );
}
