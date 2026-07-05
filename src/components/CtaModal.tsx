"use client";

import { useTranslations } from "next-intl";

/** Shell del modal de CTAs (reserva/pedido): fondo oscuro clickable,
 * tarjeta crema y botón de cerrar al pie. Los botones de acción llegan
 * como children y se apilan en columna. */
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

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-end justify-center bg-teal-dark/60 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-[1.75rem] bg-cream p-7 shadow-card-hover ring-1 ring-teal-dark/10"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-xl text-teal-dark">{title}</h2>
        <p className="mt-2 text-sm text-teal-dark/80">{body}</p>

        <div className="mt-5 flex flex-col gap-2">
          {children}
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-full border border-teal-dark/20 px-5 py-3 text-sm font-semibold text-teal-dark hover:bg-teal-dark/5"
          >
            {t("cerrar")}
          </button>
        </div>
      </div>
    </div>
  );
}
