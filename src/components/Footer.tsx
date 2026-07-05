import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { locations, hrefFor } from "@/data/locations";

export function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");

  return (
    <footer className="border-t border-teal-dark/10 bg-teal-dark text-cream">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-10 md:grid-cols-[1.1fr_1.8fr_0.9fr_0.9fr]">
          <div>
            <p className="font-display text-3xl">da Nanni</p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-cream/70">
              {t("tagline")}
            </p>
            <div className="mt-5 flex gap-4 text-sm">
              <a
                href="https://www.instagram.com/danannibcn/"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors duration-200 hover:text-mustard"
              >
                Instagram
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61557151444831"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors duration-200 hover:text-mustard"
              >
                Facebook
              </a>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cream/60">
              {t("navegacion")}
            </p>
            <ul className="mt-4 space-y-2.5 text-sm text-cream/80">
              <li>
                <Link
                  href="/"
                  className="transition-colors duration-200 hover:text-mustard"
                >
                  {tNav("home")}
                </Link>
              </li>
              <li>
                <Link
                  href="/restaurantes"
                  className="transition-colors duration-200 hover:text-mustard"
                >
                  {tNav("restaurantes")}
                </Link>
              </li>
              <li>
                <Link
                  href="/para-llevar"
                  className="transition-colors duration-200 hover:text-mustard"
                >
                  {tNav("paraLlevar")}
                </Link>
              </li>
              <li>
                <Link
                  href="/carta"
                  className="transition-colors duration-200 hover:text-mustard"
                >
                  {tNav("carta")}
                </Link>
              </li>
              <li>
                <Link
                  href="/nuestra-historia"
                  className="transition-colors duration-200 hover:text-mustard"
                >
                  {tNav("nuestraHistoria")}
                </Link>
              </li>
              <li>
                <Link
                  href="/contacto"
                  className="transition-colors duration-200 hover:text-mustard"
                >
                  {tNav("contacto")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cream/60">
              {t("locales")}
            </p>
            <ul className="mt-4 grid gap-x-8 gap-y-4 text-sm text-cream/80 sm:grid-cols-2">
              {locations.map((l) => (
                <li key={l.slug}>
                  <Link
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    href={hrefFor(l) as any}
                    className="font-medium text-cream transition-colors duration-200 hover:text-mustard"
                  >
                    {l.name}
                  </Link>
                  <br />
                  {l.address}
                  <br />
                  <a
                    href={l.phoneHref}
                    className="transition-colors duration-200 hover:text-mustard"
                  >
                    {l.phone}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cream/60">
              {t("legal")}
            </p>
            <ul className="mt-4 space-y-2.5 text-sm text-cream/80">
              <li>
                <Link
                  href="/privacidad"
                  className="transition-colors duration-200 hover:text-mustard"
                >
                  {t("privacidad")}
                </Link>
              </li>
              <li>
                <Link
                  href="/aviso-legal"
                  className="transition-colors duration-200 hover:text-mustard"
                >
                  {t("avisoLegal")}
                </Link>
              </li>
              <li>
                <Link
                  href="/cookies"
                  className="transition-colors duration-200 hover:text-mustard"
                >
                  {t("cookies")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <p className="mt-12 border-t border-cream/10 pt-6 text-xs text-cream/50">
          © 2017–{new Date().getFullYear()} {t("rights")}
        </p>
      </div>
    </footer>
  );
}
