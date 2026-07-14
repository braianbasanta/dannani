"use client";

import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";

/** Shell del modal de CTAs (reserva/pedido): fondo oscuro clickable,
 * tarjeta crema y botón de cerrar al pie. Los botones de acción llegan
 * como children y se apilan en columna. Se monta en document.body vía
 * portal: si quedara dentro de un ancestro con filter/transform (p. ej.
 * el hero, con drop-shadow y fade-up), el `fixed` se acota a ese div y
 * el fondo se ve como un recuadro en vez de cubrir el viewport. */
export function CtaModal({
  title,
  body,
  onClose,
  children,
}: {
  title: string;
  body: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const t = useTranslations("reserva");

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-[1.75rem] bg-night-soft p-7 shadow-card-hover ring-1 ring-cream/15"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-xl text-cream">{title}</h2>
        <p className="mt-2 text-sm text-cream/80">{body}</p>

        <div className="mt-5 flex flex-col gap-2">
          {children}
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-full border border-cream/20 px-5 py-3 text-sm font-semibold text-cream hover:bg-cream/5"
          >
            {t("cerrar")}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
