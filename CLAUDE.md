# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## ⚠️ This is NOT the Next.js you know

This repo runs **Next.js 16.2.9** with breaking changes vs. training-data Next.js. Before touching routing, config, or middleware-like behavior, check `node_modules/next/dist/docs/01-app/` — it ships the exact docs for this version. Known deltas already present in this codebase:

- **`middleware.ts` is renamed to `proxy.ts`.** See `src/proxy.ts`. It exports `proxy()` (not `middleware()`) and configures the same `matcher` export.
- Don't assume other APIs work like the version you were trained on — verify against the bundled docs when in doubt.

## Comandos

```bash
npm run dev      # dev server (localhost:3000)
npm run build    # producción — el usuario suele correrlo en otra terminal, no lo ejecutes salvo que se pida explícitamente
npm run lint     # ESLint (eslint-config-next core-web-vitals + typescript)
```

No hay test runner configurado en este proyecto.

## Arquitectura

Sitio de marketing/SEO para **Da Nanni**, cadena de pizzería/trattoria napolitana con 6 locales físicos en Barcelona. App Router + contenido data-driven (sin CMS ni base de datos): todo el contenido vive en `src/data/*.ts` como TypeScript tipado.

### i18n (next-intl)

Todas las rutas de página cuelgan de `src/app/[locale]/`. La config vive en `src/i18n/`:

- `routing.ts` — locales activos: `es` (default, sin prefijo), `en`, `it`, `ca` (bajo `/en`, `/it`, `/ca` con las mismas rutas en español; `localePrefix: "as-needed"`). Añadir un idioma nuevo es: agregar el código aquí + `messages/<locale>.json` + regenerar los diccionarios de datos (ver abajo).
- `request.ts` — resuelve el locale por request y carga el JSON de mensajes correspondiente.
- `navigation.ts` — re-exporta `Link`/`redirect`/`usePathname`/`useRouter` "locale-aware" de next-intl; úsalos en vez de los de `next/navigation` o `next/link` dentro de `[locale]`.
- `src/proxy.ts` — el proxy (ex-middleware) que aplica el enrutado de next-intl.
- Textos de UI y copy de páginas están en `messages/{es,en,it,ca}.json`. `es.json` es la fuente de verdad; los otros tres deben mantener **paridad exacta de claves** (y de placeholders ICU `{var}` y tags rich-text). Al añadir una clave nueva, añadirla a los cuatro.
- El contenido data-driven (`locations.ts`, `menu.ts`, `experience.ts`) se traduce vía `src/data/translations.{en,it,ca}.ts`: diccionarios keyed por el **texto español exacto**, con fallback al original si falta la clave (así los nombres de plato en italiano pasan intactos). Helpers en `src/data/translations.ts` (`translateData`, `localizeLocation`). `reviews.ts` NO se traduce (citas reales de Google).
- `scripts/translate-content.mjs` regenera `messages/{en,it,ca}.json` + los tres diccionarios desde cero vía DeepL (key en `~/.deepl-api-key`). OJO: pisa la revisión editorial manual — tras correrlo, revisar el diff y re-aplicar tono/terminología, o traducir a mano solo las claves nuevas.
- SEO multi-idioma: `pageMetadata` (`src/lib/seo.ts`) acepta `locale` y genera canonical + hreflang (`languageAlternates`); los schemas de `src/lib/schema.ts` aceptan `locale` como último argumento; `sitemap.ts` emite las 4 variantes de cada URL con `xhtml:link`. El selector de idioma vive en `src/components/LanguageSwitcher.tsx` (dropdown desktop + píldoras móvil, montado en `Nav`).

### Modelo de datos: locations (el corazón del sitio)

`src/data/locations.ts` es la fuente de verdad de los 6 locales. Cada `Location` tiene un `type: "dine-in" | "take-away"` que determina en qué sección del sitio vive y qué ruta genera:

- `dine-in` → `/restaurantes/[slug]` (usa `dineInLocations`)
- `take-away` → `/para-llevar/[slug]` (usa `takeAwayLocations`)

Ambas páginas `[slug]/page.tsx` son casi idénticas: resuelven el location vía `getLocationByUrlSlug(type, slug)` y delegan el render a `<LocationDetail>`. `slug` (interno) puede diferir de `urlSlug` (público) — existe para evitar colisiones cuando un mismo barrio tiene local dine-in y take-away (ver Raval: `slug: "raval"` vs `"raval-take-away"`, ambos con `urlSlug: "raval"`).

Helpers clave en `locations.ts`: `hrefFor(location)` (URL pública según type), `mapsUrl(location)` (deep link a Google Maps).

Cada location puede tener `delivery: { glovo?, justEat? }` con las URLs de sus tiendas en esas plataformas (llevan UTMs propios `dananni-web` para atribución). Raval (Tallers 69 y 72) no tiene delivery hoy. Ese campo alimenta el CTA `<DeliveryCTA>`, la landing `/a-domicilio` (`deliveryLocations`) y el `OrderAction` del schema.

### Menú / carta

`src/data/menu.ts` tiene los `MenuSection[]` por local, indexados en `menuByLocationSlug` por `slug` de location. Las tres cartas son reales (jul. 2026, entregadas por el cliente): `pizzaTakeAway` (Gòtic + Raval Take Away, formato 24/33 cm), `gracia` (la más completa) y `bornPoblenouTallers69` (compartida por las tres trattorias). No inventar precios ni platos.

### SEO / structured data

- `src/lib/schema.ts` genera JSON-LD (Organization, Restaurant, BreadcrumbList) — `SITE_URL` está hardcodeado ahí (`https://www.dananni.es`) y se repite en `sitemap.ts` y el layout raíz; si cambia el dominio, actualizar los tres.
- `src/lib/seo.ts` (`pageMetadata`) centraliza title/description + canonical + Open Graph de cada página. Toda página indexable nueva debe usarlo (las legales van con `robots: { index: false }`).
- `<SchemaOrg data={...}>` (en `src/components/`) inyecta ese JSON-LD como `<script type="application/ld+json">` en cualquier página.
- `src/app/sitemap.ts` y `src/app/robots.ts` generan sitemap/robots a partir de las mismas listas de `locations.ts` — al añadir un local o ruta estática nueva, actualizar `sitemap.ts` también.

### Estilos

Tailwind v4 (`@import "tailwindcss"` en `globals.css`, sin `tailwind.config`). Paleta y fuentes están como custom properties en `@theme inline` dentro de `src/app/globals.css`: colores `teal` / `teal-dark` / `cream` / `mustard` / `mustard-dark`, fuentes `font-display` (Fraunces) / `font-sans` (Public Sans, cargadas vía `next/font/google` en el layout). Usar estas clases utilitarias existentes en vez de introducir nuevos colores/fuentes ad-hoc.

### Alias

`@/*` → `./src/*` (ver `tsconfig.json`).
