import type { Metadata } from "next";
import { Fraunces, Public_Sans } from "next/font/google";
import "../globals.css";

/**
 * Root layout propio del panel admin. Vive fuera de [locale] (sin i18n,
 * sin Nav/Footer), por eso monta su propio <html>/<body>. El proxy excluye
 * /admin del enrutado de next-intl.
 */
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Reservas · Da Nanni",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${fraunces.variable} ${publicSans.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
