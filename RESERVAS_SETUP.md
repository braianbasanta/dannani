# Sistema de reservas Da Nanni — puesta en marcha

Sistema propio de reservas de mesa (puente hasta Cover Manager). Todo el código
ya está hecho; solo faltan **4 credenciales tuyas** y replicarlas en Vercel.

## Qué se ha construido

- **Formulario de reserva** en `/reservar` (selector de local) y en el botón
  **Reservar** de cada restaurante (Born, Tallers, Poblenou, Gràcia). Los take-away
  (Gòtic, Raval) siguen con su CTA de pedido, no de mesa.
- **Emails automáticos** (Resend), en el idioma del cliente:
  - Al cliente: confirmación con botones **Reprogramar** y **Cancelar**.
  - A vosotros: aviso de cada reserva (y de cambios/cancelaciones) al buzón de la manager.
- **Páginas de gestión** por enlace secreto: `/reserva/<token>` (reprogramar / cancelar).
- **Panel admin** en `/admin/reservas` (clave de acceso): visión por local y por día,
  totales de comensales, filtros, y cancelar/restaurar.
- **Base de datos**: tabla `dananni_reservations` en Supabase (ya creada), con RLS
  cerrado (solo el servidor escribe/lee; los datos personales nunca se exponen).

## Lo que necesito de ti (4 cosas)

Rellena estas variables (en `.env.local` para probar en local y en **Vercel** para producción):

| Variable | De dónde sale |
|---|---|
| `RESEND_API_KEY` | Cuenta en https://resend.com → API Keys → *Create*. |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → proyecto → *Project Settings → API → service_role* (la secreta, **no** la anon). |
| `RESERVATIONS_NOTIFY_EMAIL` | El correo donde la manager recibe los avisos (de momento un Gmail vuestro). |
| `ADMIN_PASSWORD` | La clave del panel `/admin/reservas` (la eliges tú). |

Ya están puestas (no las toques): `NEXT_PUBLIC_SUPABASE_URL`, `RESERVATIONS_FROM_EMAIL`,
`NEXT_PUBLIC_SITE_URL`.

## Envío de emails desde `reservas@dananni.es` (Resend)

Para que los correos salgan desde `reservas@dananni.es` con buena entregabilidad hay
que **verificar el dominio en Resend**:

1. En Resend → *Domains → Add Domain* → `dananni.es`.
2. Resend te dará unos registros DNS (un TXT de verificación, DKIM y un MX de
   *return-path* sobre un subdominio `send.`). Añádelos en **DonDominio** (ahí están
   los nameservers: `ns1/ns2.dondominio.com`). No tocan el correo del dominio: van sobre
   el subdominio `send.`.
3. Cuando Resend marque el dominio como *Verified*, ya está.

> **Para lanzar HOY sin esperar al DNS**: cambia en las env
> `RESERVATIONS_FROM_EMAIL="Da Nanni <onboarding@resend.dev>"`. Funciona al instante
> (dominio de pruebas de Resend). En cuanto verifiques dananni.es, vuelve a
> `Da Nanni <reservas@dananni.es>`.

## Buzón de la manager en Google Workspace (en paralelo, no bloquea)

Hoy `dananni.es` **no tiene MX** (no recibe correo). Para tener `reservas@dananni.es`
como buzón real:

1. Alta en https://workspace.google.com con el dominio `dananni.es` (~7 €/mes/usuario).
2. Google te pedirá **verificar el dominio** (registro TXT) y añadir sus **registros MX**
   → se ponen en DonDominio.
3. Crea el usuario/alias `reservas@dananni.es`.
4. Cuando funcione, pon `RESERVATIONS_NOTIFY_EMAIL=reservas@dananni.es` en Vercel.

Mientras tanto, los avisos llegan al Gmail que pongas en `RESERVATIONS_NOTIFY_EMAIL`.

## Variables en Vercel

Proyecto `dannani` → *Settings → Environment Variables* → añade (Production **y** Preview):

```
NEXT_PUBLIC_SUPABASE_URL   = https://ipxkhcyzycoktfassukz.supabase.co
SUPABASE_SERVICE_ROLE_KEY  = (service_role de Supabase)
RESEND_API_KEY             = (de Resend)
RESERVATIONS_FROM_EMAIL    = Da Nanni <reservas@dananni.es>   (o onboarding@resend.dev al principio)
RESERVATIONS_NOTIFY_EMAIL  = (correo de avisos)
ADMIN_PASSWORD             = (tu clave del panel)
NEXT_PUBLIC_SITE_URL       = https://dananni.es
```

## Cómo probar

1. `.env.local` con las 4 claves + `NEXT_PUBLIC_SITE_URL=http://localhost:3000`.
2. `npm run dev` → abre `http://localhost:3000/reservar`, haz una reserva de prueba.
3. Revisa: email de confirmación al cliente + aviso en el buzón de la manager.
4. Desde el email, prueba **Reprogramar** y **Cancelar**.
5. Entra en `http://localhost:3000/admin/reservas` con tu `ADMIN_PASSWORD`.

## Notas

- Las franjas horarias salen de los horarios reales de cada local (última reserva 30 min
  antes de cerrar). Si quieres cambiar el intervalo o el margen, está en
  `src/lib/reservations.ts` (`SLOT_INTERVAL_MIN`, `LAST_BOOKING_BEFORE_CLOSE_MIN`).
- Cancelar/restaurar desde el panel admin **no** envía email al cliente (para evitar
  envíos accidentales); la manager llama si hace falta. Se puede activar si lo quieres.
- Cuando entre Cover Manager: basta con volver a apuntar el botón **Reservar** a su
  widget; el resto del sitio no se toca.
