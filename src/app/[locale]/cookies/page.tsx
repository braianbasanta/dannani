import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal.cookies" });

  return {
    title: t("metaTitle"),
    robots: { index: false },
  };
}

export default function CookiesPage() {
  const t = useTranslations("legal");

  return (
    <section className="mx-auto max-w-3xl px-4 py-16 font-sans text-cream">
      <h1 className="font-display text-4xl">{t("cookies.h1")}</h1>

      <div className="mt-8 space-y-6 leading-relaxed">
        <p>{t("cookies.p1")}</p>
        <p>{t("cookies.p2")}</p>
      </div>
    </section>
  );
}
