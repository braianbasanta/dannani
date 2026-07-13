import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  robots: { index: false },
};

export default function PrivacidadPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 font-sans text-cream">
      <h1 className="font-display text-4xl">Política de Privacidad</h1>

      <div className="mt-8 space-y-6 leading-relaxed">
        <p>
          <strong>Responsable del tratamiento:</strong>{" "}
          <strong>Nanni 2015, S.L.</strong>, con CIF{" "}
          <strong>B01732486</strong> y domicilio social en Calle Tuset 8,
          08006 Barcelona.
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
          <strong>danannipoblenou@gmail.com</strong>, por correo postal a la
          dirección del domicilio social, o llamando a cualquiera de nuestros
          locales.
        </p>
      </div>
    </section>
  );
}
