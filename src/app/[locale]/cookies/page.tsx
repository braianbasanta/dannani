import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Cookies",
  robots: { index: false },
};

export default function CookiesPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 font-sans text-cream">
      <h1 className="font-display text-4xl">Política de Cookies</h1>

      <div className="mt-8 space-y-6 leading-relaxed">
        <p>
          Este sitio utiliza cookies técnicas necesarias para su
          funcionamiento. Cuando se incorporen herramientas de analítica o de
          reservas online (por ejemplo, Cover Manager), esta página se
          actualizará detallando qué cookies de terceros se instalan y con qué
          finalidad.
        </p>
        <p>
          Puedes configurar tu navegador para bloquear o eliminar las cookies
          instaladas en tu equipo en cualquier momento.
        </p>
      </div>
    </section>
  );
}
