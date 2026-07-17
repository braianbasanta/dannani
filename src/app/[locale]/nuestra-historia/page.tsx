import { use } from "react";
import Image from "next/image";
import type { Metadata } from "next";
import { useTranslations, useLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getLocationBySlug, hrefFor, heroImageSrc } from "@/data/locations";
import { SchemaOrg } from "@/components/SchemaOrg";
import { breadcrumbSchema } from "@/lib/schema";
import { HistoriaTimeline } from "@/components/HistoriaTimeline";
import type { Milestone } from "@/components/HistoriaTimeline";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "historia" });
  return pageMetadata({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/nuestra-historia",
    locale: locale as Locale,
  });
}

const gotic = getLocationBySlug("gotic")!;
const ravalTakeAway = getLocationBySlug("raval-take-away")!;
const poblenou = getLocationBySlug("poblenou")!;
const born = getLocationBySlug("born")!;
const raval = getLocationBySlug("raval")!;
const gracia = getLocationBySlug("gracia")!;

export default function NuestraHistoriaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  // Habilita el prerender estático (next-intl): sin esto la página se
  // renderiza dinámica en cada request y no cachea en el CDN.
  const { locale: requestLocale } = use(params);
  setRequestLocale(requestLocale);
  const t = useTranslations("historia");
  const tNav = useTranslations("nav");
  const locale = useLocale();

  const milestones: Milestone[] = [
    {
      date: t("milestones.m1.date"),
      title: gotic.name,
      copy: t("milestones.m1.copy"),
      href: hrefFor(gotic),
      icon: "pin",
      image: "/images/llibreteria/10.jpg",
    },
    {
      date: t("milestones.m2.date"),
      title: ravalTakeAway.name,
      copy: t("milestones.m2.copy"),
      href: hrefFor(ravalTakeAway),
      icon: "pin",
      image: "/images/tallers72/10.jpg",
    },
    {
      date: t("milestones.m3.date"),
      title: poblenou.name,
      copy: t("milestones.m3.copy"),
      href: hrefFor(poblenou),
      icon: "pin",
      image: "/images/poblenou/11.jpg",
    },
    {
      date: t("milestones.m4.date"),
      title: born.name,
      copy: t("milestones.m4.copy"),
      href: hrefFor(born),
      icon: "pin",
      image: "/images/rec/11.jpg",
    },
    {
      date: t("milestones.m5.date"),
      title: raval.name,
      copy: t("milestones.m5.copy"),
      href: hrefFor(raval),
      icon: "pin",
      image: "/images/tallers69/05.jpg",
    },
    {
      date: t("milestones.m6.date"),
      title: gracia.name,
      copy: t("milestones.m6.copy"),
      href: hrefFor(gracia),
      icon: "pin",
      image: "/images/verdi/02.jpg",
    },
  ];

  return (
    <>
      <SchemaOrg
        data={breadcrumbSchema(
          [
            { name: tNav("home"), path: "/" },
            { name: tNav("nuestraHistoria"), path: "/nuestra-historia" },
          ],
          locale as Locale
        )}
      />

      <HistoriaTimeline
        milestones={milestones}
        header={
          <div className="grid items-center gap-12 md:grid-cols-2 lg:gap-16">
            <div>
              <p className="eyebrow">{t("eyebrow")}</p>
              <h1 className="mt-3 font-script text-5xl leading-[1.1] sm:text-7xl">
                {t("title")}
              </h1>
              <p className="mt-6 max-w-md leading-relaxed text-cream/75">
                {t("intro1")}
              </p>
              <p className="mt-4 max-w-md leading-relaxed text-cream/75">
                {t("intro2")}
              </p>
            </div>

            <figure>
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] shadow-card">
                <Image
                  src="/images/historia/nanni-nino-pizza.jpg"
                  alt={t("heroAlt")}
                  fill
                  sizes="(min-width: 768px) 40vw, 100vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="mt-3 text-xs text-cream/55 sm:text-sm">
                {t("heroFigcaption")}
              </figcaption>
            </figure>
          </div>
        }
      />

      <article className="mx-auto max-w-3xl px-4 py-16 font-sans text-cream sm:py-20">
        <h2 className="font-script text-4xl text-cream sm:text-5xl">
          {t("filosofiaTitle")}
        </h2>
        <p className="mt-3 leading-relaxed">{t("filosofiaText")}</p>

        <h2 className="mt-14 font-script text-4xl text-cream sm:text-5xl">
          {t("manifiestoTitle")}
        </h2>
        <p className="mt-3 leading-relaxed">{t("manifiestoIntro")}</p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-3">
          <li className="rounded-[1.25rem] bg-cream/5 p-5 ring-1 ring-cream/10">
            <p className="font-script text-2xl text-electric">
              {t("pilarPizzaTitle")}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-cream/80">
              {t("pilarPizzaText")}
            </p>
          </li>
          <li className="rounded-[1.25rem] bg-cream/5 p-5 ring-1 ring-cream/10">
            <p className="font-script text-2xl text-electric">
              {t("pilarPastaTitle")}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-cream/80">
              {t("pilarPastaText")}
            </p>
          </li>
          <li className="rounded-[1.25rem] bg-cream/5 p-5 ring-1 ring-cream/10">
            <p className="font-script text-2xl text-electric">
              {t("pilarHospitalidadTitle")}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-cream/80">
              {t("pilarHospitalidadText")}
            </p>
          </li>
        </ul>

        <div className="mt-14 grid items-center gap-8 sm:grid-cols-[1.35fr_1fr]">
          <div>
            <h2 className="font-script text-4xl text-cream sm:text-5xl">
              {t("viajeTitle")}
            </h2>
            <p className="mt-3 leading-relaxed">{t("viajeText")}</p>
            <p className="neon-blue mt-8 font-script text-3xl sm:text-4xl">
              {t("bienvenida")}
            </p>
          </div>

          <figure className="sm:-rotate-1">
            <div className="relative aspect-[3/4] overflow-hidden rounded-[1.75rem] shadow-card ring-1 ring-cream/10">
              <Image
                src="/images/historia/fontana-sirena-partenope.jpg"
                alt={t("sirenaAlt")}
                fill
                sizes="(min-width: 640px) 33vw, 100vw"
                loading="lazy"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-3 text-xs text-cream/55 sm:text-sm">
              {t("sirenaFigcaption")}
            </figcaption>
          </figure>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2">
          <Link
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            href={"/restaurantes" as any}
            className="group relative flex aspect-[4/3] items-end overflow-hidden rounded-2xl"
          >
            <Image
              src={heroImageSrc(born)}
              alt={t("restaurantesCardAlt")}
              fill
              sizes="(min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-night/90 via-night/30 to-transparent" />
            <div className="relative p-6 text-cream">
              <p className="font-display text-xl">
                {t("restaurantesCardTitle")}
              </p>
              <p className="mt-1 text-sm text-cream/80">
                {t("restaurantesCardSubtitle")}
              </p>
            </div>
          </Link>
          <Link
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            href={"/pizza-para-llevar" as any}
            className="group relative flex aspect-[4/3] items-end overflow-hidden rounded-2xl"
          >
            <Image
              src={heroImageSrc(gotic)}
              alt={t("paraLlevarCardAlt")}
              fill
              sizes="(min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-night/90 via-night/30 to-transparent" />
            <div className="relative p-6 text-cream">
              <p className="font-display text-xl">
                {t("paraLlevarCardTitle")}
              </p>
              <p className="mt-1 text-sm text-cream/80">
                {t("paraLlevarCardSubtitle")}
              </p>
            </div>
          </Link>
        </div>
      </article>
    </>
  );
}
