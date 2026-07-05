import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  robots: { index: false },
};

export default function PrivacidadPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 font-sans text-teal-dark">
      <h1 className="font-display text-4xl">Política de Privacidad</h1>

      <p className="mt-6 rounded-xl bg-mustard/10 px-5 py-4 text-sm text-mustard-dark">
        Pendiente de completar con los datos fiscales reales del titular y el
        email de contacto oficial antes de publicar el sitio.
      </p>

      <div className="mt-8 space-y-6 leading-relaxed">
        <p>
          <strong>Responsable del tratamiento:</strong>{" "}
          <strong>[Razón social pendiente]</strong>, con CIF{" "}
          <strong>[CIF pendiente]</strong>.
        </p>
        <p>
          Los datos personales que nos facilites a través del formulario de
          contacto o de reserva se utilizarán exclusivamente para gestionar tu
          solicitud (reserva de mesa, pedido para llevar o consulta general) y
          no se cederán a terceros salvo obligación legal.
        </p>
        <p>
          Puedes ejercer tus derechos de acceso, rectificación, supresión y
          oposición escribiendo a{" "}
          <strong>[email de contacto pendiente]</strong> o llamando a
          cualquiera de nuestros locales.
        </p>
      </div>
    </section>
  );
}
