import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";

export const metadata: Metadata = {
  title: "Aviso Legal",
  robots: { index: false },
};

export default function AvisoLegalPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 font-sans text-teal-dark">
      <h1 className="font-display text-4xl">Aviso Legal</h1>

      <p className="mt-6 rounded-xl bg-mustard/10 px-5 py-4 text-sm text-mustard-dark">
        Pendiente de completar con los datos fiscales reales del titular
        (razón social, CIF, domicilio social) antes de publicar el sitio.
      </p>

      <div className="mt-8 space-y-6 leading-relaxed">
        <p>
          En cumplimiento del deber de información recogido en el artículo 10
          de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la
          Información y del Comercio Electrónico, se informa a los usuarios de
          los siguientes datos: el titular de este sitio web es{" "}
          <strong>[Razón social pendiente]</strong>, con CIF{" "}
          <strong>[CIF pendiente]</strong> y domicilio en{" "}
          <strong>[Domicilio social pendiente]</strong>, Barcelona.
        </p>
        <p>
          Para cualquier consulta relacionada con este aviso legal puede
          contactar a través del teléfono de cualquiera de nuestros locales,
          disponibles en la página de{" "}
          <Link href="/contacto" className="underline hover:text-mustard">
            contacto
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
