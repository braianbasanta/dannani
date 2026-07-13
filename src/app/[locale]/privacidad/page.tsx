import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal.privacidad" });

  return {
    title: t("metaTitle"),
    robots: { index: false },
  };
}

export default function PrivacidadPage() {
  const t = useTranslations("legal");

  return (
    <section className="mx-auto max-w-3xl px-4 py-16 font-sans text-cream">
      <h1 className="font-display text-4xl">{t("privacidad.h1")}</h1>

      <div className="mt-8 space-y-6 leading-relaxed">
        <p>
          {t.rich("privacidad.p1", {
            strong: (chunks) => <strong>{chunks}</strong>,
          })}
        </p>
        <p>{t("privacidad.p2")}</p>
        <p>
          {t.rich("privacidad.p3", {
            strong: (chunks) => <strong>{chunks}</strong>,
          })}
        </p>
      </div>
    </section>
  );
}
