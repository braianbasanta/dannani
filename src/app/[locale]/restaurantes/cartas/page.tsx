import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { locations, cartaHrefFor } from "@/data/locations";
import { menuByLocationSlug } from "@/data/menu";
import { SchemaOrg } from "@/components/SchemaOrg";
import { breadcrumbSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Carta – Pizzas, Antipasti y Vinos",
  description:
    "Pizza napolitana, antipasti y vinos italianos. Consulta la carta y precios de cada local Da Nanni en Barcelona.",
  path: "/restaurantes/cartas",
});

export default function CartasPage() {
  const t = useTranslations("cartaPage");

  return (
    <>
      <SchemaOrg
        data={breadcrumbSchema([
          { name: "Inicio", path: "/" },
          { name: "Restaurantes", path: "/restaurantes" },
          { name: "Cartas", path: "/restaurantes/cartas" },
        ])}
      />

      <section className="mx-auto max-w-4xl px-4 py-16 font-sans text-cream sm:py-20">
        <p className="eyebrow">{t("eyebrow")}</p>
        <h1 className="mt-3 font-display text-4xl tracking-tight sm:text-6xl">
          {t("title")}
        </h1>
        <p className="mt-3 max-w-2xl text-cream/70">{t("intro")}</p>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {locations
            .filter((l) => menuByLocationSlug[l.slug])
            .map((location) => (
              <li key={location.slug}>
                <Link
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  href={cartaHrefFor(location) as any}
                  className="group flex items-center justify-between gap-4 rounded-[1.75rem] bg-night-soft p-6 shadow-card ring-1 ring-cream/10 transition hover:ring-electric/40 sm:p-7"
                >
                  <div>
                    <p className="font-display text-xl tracking-tight">
                      {location.name}
                    </p>
                    <p className="mt-1 text-sm text-cream/70">
                      {location.address}
                    </p>
                  </div>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream/10 transition group-hover:bg-electric group-hover:text-night">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </Link>
              </li>
            ))}
        </ul>
      </section>
    </>
  );
}
