import { SchemaOrg } from "@/components/SchemaOrg";
import { faqSchema } from "@/lib/schema";

export interface FaqItem {
  q: string;
  a: string;
}

/** Sección de preguntas frecuentes con su JSON-LD FAQPage. Las respuestas
 * son texto plano: deben poder leerse igual en la página y en el schema. */
export function FaqSection({ items }: { items: FaqItem[] }) {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-16 sm:pb-20">
      <SchemaOrg data={faqSchema(items)} />
      <h2 className="font-display text-3xl tracking-tight text-cream sm:text-4xl">
        Preguntas frecuentes
      </h2>
      <dl className="mt-8 grid gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.q}
            className="rounded-[1.25rem] bg-cream/5 p-5 ring-1 ring-cream/10 sm:p-6"
          >
            <dt className="font-display text-lg text-cream">{item.q}</dt>
            <dd className="mt-2 text-sm leading-relaxed text-cream/80">
              {item.a}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
