import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

export const proxy = createMiddleware(routing);

export const config = {
  // `admin` queda fuera del enrutado i18n: el panel vive en /admin (sin locale),
  // con su propio root layout. `api` ya estaba excluido (route handlers).
  matcher: ["/((?!api|_next|_vercel|admin|.*\\..*).*)"],
};
