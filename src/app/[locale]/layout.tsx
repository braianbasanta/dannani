import type { Metadata } from "next";
import { Dancing_Script, Fraunces, Public_Sans } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { OG_LOCALES } from "@/lib/seo";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import "../globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT", "WONK"],
});

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
});

/* Caligráfica de marca: la clienta usa Monotype Corsiva en menús y
   cartelería (licencia comercial, no embebible); Dancing Script es la
   sustituta libre más cercana. Alimenta font-script: historia, frases
   neón y detalles. latin-ext por el catalán futuro. */
const dancingScript = Dancing_Script({
  variable: "--font-dancing-script",
  subsets: ["latin", "latin-ext"],
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: requested } = await params;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;
  const t = await getTranslations({ locale, namespace: "meta.layout" });

  return {
    metadataBase: new URL("https://www.dananni.es"),
    title: {
      default: t("title"),
      template: "%s | Da Nanni",
    },
    description: t("description"),
    openGraph: {
      type: "website",
      siteName: "Da Nanni",
      locale: OG_LOCALES[locale],
      title: t("title"),
      description: t("description"),
      images: [{ url: "/images/og/home.jpg", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html
      lang={locale}
      // Next 16 ya no fuerza scroll instantáneo al navegar cuando el CSS tiene
      // scroll-behavior: smooth; este atributo restaura ese comportamiento.
      data-scroll-behavior="smooth"
      className={`${fraunces.variable} ${publicSans.variable} ${dancingScript.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <NextIntlClientProvider>
          <Nav />
          <main className="flex-1">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
