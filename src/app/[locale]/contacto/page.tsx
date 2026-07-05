import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { locations } from "@/data/locations";
import { ReservaCTA } from "@/components/ReservaCTA";
import { DeliveryCTA } from "@/components/DeliveryCTA";
import { ComoLlegar } from "@/components/ComoLlegar";
import { SchemaOrg } from "@/components/SchemaOrg";
import { breadcrumbSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Contacto y Reservas",
  description:
    "Reserva mesa o pide para llevar en cualquiera de los 6 locales Da Nanni en Barcelona. Direcciones, teléfonos y horarios.",
  path: "/contacto",
});

export default function ContactoPage() {
  const t = useTranslations("contacto");

  return (
    <>
      <SchemaOrg
        data={breadcrumbSchema([
          { name: "Inicio", path: "/" },
          { name: "Contacto", path: "/contacto" },
        ])}
      />

      <section className="mx-auto max-w-4xl px-4 py-16 font-sans text-teal-dark sm:py-20">
        <p className="eyebrow">{t("eyebrow")}</p>
        <h1 className="mt-3 max-w-2xl font-display text-4xl leading-[1.05] tracking-tight sm:text-6xl">
          {t("title")}
        </h1>
        <p className="mt-3 max-w-2xl text-teal-dark/70">{t("intro")}</p>

        <ul className="mt-10 space-y-4">
          {locations.map((location) => (
            <li
              key={location.slug}
              className="flex flex-col gap-4 rounded-[1.75rem] bg-white p-6 shadow-card ring-1 ring-teal-dark/10 sm:flex-row sm:items-center sm:justify-between sm:p-7"
            >
              <div>
                <p className="font-display text-xl">{location.name}</p>
                <p className="text-sm text-teal-dark/70">{location.address}</p>
                <p className="text-sm text-teal-dark/70">{location.hoursLabel}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <ComoLlegar location={location} />
                <DeliveryCTA location={location} />
                <ReservaCTA location={location} />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
