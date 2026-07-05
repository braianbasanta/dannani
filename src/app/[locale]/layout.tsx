import type { Metadata } from "next";
import { Fraunces, Public_Sans } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import "../globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
});

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.dananni.es"),
  title: {
    default: "Da Nanni – Pizzería Napolitana y Restaurante Italiano en Barcelona",
    template: "%s | Da Nanni",
  },
  description:
    "Pizza napolitana de masa de larga fermentación y trattoria italiana en 6 locales de Barcelona. Proyecto familiar napolitano desde 2017.",
  openGraph: {
    type: "website",
    siteName: "Da Nanni",
    locale: "es_ES",
    title: "Da Nanni – Pizzería Napolitana y Restaurante Italiano en Barcelona",
    description:
      "Pizza napolitana de masa de larga fermentación y trattoria italiana en 6 locales de Barcelona. Proyecto familiar napolitano desde 2017.",
    images: [{ url: "/images/og/home.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
  },
};

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
      className={`${fraunces.variable} ${publicSans.variable} h-full antialiased`}
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
