import { Resend } from "resend";
import type { Location } from "@/data/locations";
import type { Locale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import { localePath } from "@/lib/seo";
import {
  formatReservationDate,
  normalizeTime,
  type ReservationRow,
} from "@/lib/reservations";

/**
 * Emails transaccionales de reservas vía Resend. El envío es "best effort":
 * si falla, se registra pero NO se tira la reserva (ya está guardada en DB).
 */

export type EmailKind = "created" | "rescheduled" | "cancelled";

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://dananni.es").replace(
    /\/$/,
    ""
  );
}

function fromAddress(): string {
  // reservas@dananni.es una vez verificado el dominio en Resend; hasta entonces
  // se puede usar onboarding@resend.dev vía la env.
  return process.env.RESERVATIONS_FROM_EMAIL || "Da Nanni <reservas@dananni.es>";
}

let resendClient: Resend | null = null;
function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (!resendClient) resendClient = new Resend(key);
  return resendClient;
}

function esc(v: string | null | undefined): string {
  if (!v) return "";
  return v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function asLocale(l: string): Locale {
  return (routing.locales as readonly string[]).includes(l)
    ? (l as Locale)
    : "es";
}

function manageUrl(row: ReservationRow, hash = ""): string {
  const locale = asLocale(row.locale);
  return `${siteUrl()}${localePath(locale, `/reserva/${row.manage_token}`)}${hash}`;
}

/* ------------------------------------------------------------------ *
 * Textos del email al cliente, por idioma
 * ------------------------------------------------------------------ */

interface CustomerCopy {
  subjectCreated: string;
  subjectRescheduled: string;
  subjectCancelled: string;
  headingCreated: string;
  headingRescheduled: string;
  headingCancelled: string;
  leadCreated: string;
  leadRescheduled: string;
  leadCancelled: string;
  detailsTitle: string;
  labelLocation: string;
  labelDate: string;
  labelTime: string;
  labelParty: string;
  labelOccasion: string;
  labelChildren: string;
  labelHighChair: string;
  labelDietary: string;
  labelNotes: string;
  guests: (n: number) => string;
  highChairYes: string;
  btnReschedule: string;
  btnCancel: string;
  manageHint: string;
  questions: (phone: string) => string;
  cancelledNote: string;
}

const CUSTOMER: Record<Locale, CustomerCopy> = {
  es: {
    subjectCreated: "Tu reserva en Da Nanni está confirmada",
    subjectRescheduled: "Tu reserva en Da Nanni se ha actualizado",
    subjectCancelled: "Tu reserva en Da Nanni se ha cancelado",
    headingCreated: "¡Reserva confirmada!",
    headingRescheduled: "Reserva actualizada",
    headingCancelled: "Reserva cancelada",
    leadCreated: "Gracias por reservar con nosotros. Te esperamos:",
    leadRescheduled: "Hemos actualizado tu reserva. Estos son los nuevos datos:",
    leadCancelled: "Tu reserva ha quedado cancelada. Estos eran los datos:",
    detailsTitle: "Detalles de la reserva",
    labelLocation: "Local",
    labelDate: "Fecha",
    labelTime: "Hora",
    labelParty: "Comensales",
    labelOccasion: "Ocasión",
    labelChildren: "Niños",
    labelHighChair: "Trona",
    labelDietary: "Alergias / dieta",
    labelNotes: "Notas",
    guests: (n) => `${n} ${n === 1 ? "persona" : "personas"}`,
    highChairYes: "Sí, necesitamos trona",
    btnReschedule: "Reprogramar",
    btnCancel: "Cancelar reserva",
    manageHint: "¿Necesitas cambiar algo? Puedes reprogramar o cancelar aquí:",
    questions: (phone) => `¿Dudas? Llámanos al ${phone}.`,
    cancelledNote:
      "Si ha sido un error o quieres volver a reservar, escríbenos o llama al local.",
  },
  en: {
    subjectCreated: "Your Da Nanni booking is confirmed",
    subjectRescheduled: "Your Da Nanni booking has been updated",
    subjectCancelled: "Your Da Nanni booking has been cancelled",
    headingCreated: "Booking confirmed!",
    headingRescheduled: "Booking updated",
    headingCancelled: "Booking cancelled",
    leadCreated: "Thanks for booking with us. We look forward to seeing you:",
    leadRescheduled: "We've updated your booking. Here are the new details:",
    leadCancelled: "Your booking has been cancelled. These were the details:",
    detailsTitle: "Booking details",
    labelLocation: "Restaurant",
    labelDate: "Date",
    labelTime: "Time",
    labelParty: "Guests",
    labelOccasion: "Occasion",
    labelChildren: "Children",
    labelHighChair: "High chair",
    labelDietary: "Allergies / diet",
    labelNotes: "Notes",
    guests: (n) => `${n} ${n === 1 ? "guest" : "guests"}`,
    highChairYes: "Yes, high chair needed",
    btnReschedule: "Reschedule",
    btnCancel: "Cancel booking",
    manageHint: "Need to change something? You can reschedule or cancel here:",
    questions: (phone) => `Questions? Call us on ${phone}.`,
    cancelledNote:
      "If this was a mistake or you'd like to book again, get in touch or call the restaurant.",
  },
  it: {
    subjectCreated: "La tua prenotazione da Da Nanni è confermata",
    subjectRescheduled: "La tua prenotazione da Da Nanni è stata aggiornata",
    subjectCancelled: "La tua prenotazione da Da Nanni è stata annullata",
    headingCreated: "Prenotazione confermata!",
    headingRescheduled: "Prenotazione aggiornata",
    headingCancelled: "Prenotazione annullata",
    leadCreated: "Grazie per aver prenotato con noi. Ti aspettiamo:",
    leadRescheduled: "Abbiamo aggiornato la tua prenotazione. Ecco i nuovi dettagli:",
    leadCancelled: "La tua prenotazione è stata annullata. Questi erano i dettagli:",
    detailsTitle: "Dettagli della prenotazione",
    labelLocation: "Locale",
    labelDate: "Data",
    labelTime: "Ora",
    labelParty: "Coperti",
    labelOccasion: "Occasione",
    labelChildren: "Bambini",
    labelHighChair: "Seggiolone",
    labelDietary: "Allergie / dieta",
    labelNotes: "Note",
    guests: (n) => `${n} ${n === 1 ? "persona" : "persone"}`,
    highChairYes: "Sì, serve un seggiolone",
    btnReschedule: "Riprogramma",
    btnCancel: "Annulla prenotazione",
    manageHint: "Devi modificare qualcosa? Puoi riprogrammare o annullare qui:",
    questions: (phone) => `Domande? Chiamaci allo ${phone}.`,
    cancelledNote:
      "Se è stato un errore o vuoi prenotare di nuovo, scrivici o chiama il locale.",
  },
  ca: {
    subjectCreated: "La teva reserva a Da Nanni està confirmada",
    subjectRescheduled: "La teva reserva a Da Nanni s'ha actualitzat",
    subjectCancelled: "La teva reserva a Da Nanni s'ha cancel·lat",
    headingCreated: "Reserva confirmada!",
    headingRescheduled: "Reserva actualitzada",
    headingCancelled: "Reserva cancel·lada",
    leadCreated: "Gràcies per reservar amb nosaltres. T'esperem:",
    leadRescheduled: "Hem actualitzat la teva reserva. Aquestes són les noves dades:",
    leadCancelled: "La teva reserva ha quedat cancel·lada. Aquestes eren les dades:",
    detailsTitle: "Detalls de la reserva",
    labelLocation: "Local",
    labelDate: "Data",
    labelTime: "Hora",
    labelParty: "Comensals",
    labelOccasion: "Ocasió",
    labelChildren: "Nens",
    labelHighChair: "Trona",
    labelDietary: "Al·lèrgies / dieta",
    labelNotes: "Notes",
    guests: (n) => `${n} ${n === 1 ? "persona" : "persones"}`,
    highChairYes: "Sí, necessitem trona",
    btnReschedule: "Reprogramar",
    btnCancel: "Cancel·lar reserva",
    manageHint: "Necessites canviar alguna cosa? Pots reprogramar o cancel·lar aquí:",
    questions: (phone) => `Dubtes? Truca'ns al ${phone}.`,
    cancelledNote:
      "Si ha estat un error o vols tornar a reservar, escriu-nos o truca al local.",
  },
};

/* ------------------------------------------------------------------ *
 * Plantilla HTML común
 * ------------------------------------------------------------------ */

const BRAND = {
  night: "#0a0f11",
  electric: "#5599aa",
  cream: "#fdfbf6",
  text: "#1f1d1a",
  muted: "#6b6b6b",
  border: "#e7e3d8",
  bg: "#f6f4ee",
  danger: "#b3261e",
};

function detailRow(label: string, value: string): string {
  if (!value) return "";
  return `<tr>
    <td style="padding:8px 0;color:${BRAND.muted};font-size:14px;width:130px;vertical-align:top">${esc(
      label
    )}</td>
    <td style="padding:8px 0;color:${BRAND.text};font-size:14px;font-weight:600">${value}</td>
  </tr>`;
}

function button(href: string, label: string, style: "solid" | "outline" | "danger"): string {
  const styles: Record<string, string> = {
    solid: `background:${BRAND.electric};color:${BRAND.night};border:1px solid ${BRAND.electric}`,
    outline: `background:transparent;color:${BRAND.text};border:1px solid ${BRAND.border}`,
    danger: `background:transparent;color:${BRAND.danger};border:1px solid ${BRAND.danger}`,
  };
  return `<a href="${href}" style="display:inline-block;padding:11px 22px;border-radius:999px;font-size:14px;font-weight:700;text-decoration:none;${styles[style]}">${esc(
    label
  )}</a>`;
}

function shell(innerHtml: string): string {
  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${BRAND.bg};font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.bg};padding:24px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid ${BRAND.border}">
        <tr><td style="background:${BRAND.night};padding:22px 28px">
          <span style="color:${BRAND.cream};font-size:20px;font-weight:700;letter-spacing:0.02em">Da Nanni</span>
          <span style="color:${BRAND.electric};font-size:12px;letter-spacing:0.18em;text-transform:uppercase;display:block;margin-top:4px">Ristorante e Pizzeria Napoletana</span>
        </td></tr>
        <tr><td style="padding:28px">${innerHtml}</td></tr>
        <tr><td style="padding:18px 28px;border-top:1px solid ${BRAND.border};color:${BRAND.muted};font-size:12px;line-height:1.6">
          Nanni 2015, S.L. · Barcelona<br>
          <a href="${siteUrl()}" style="color:${BRAND.muted}">dananni.es</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function detailsTable(
  row: ReservationRow,
  location: Location,
  copy: CustomerCopy
): string {
  const locale = asLocale(row.locale);
  const rows = [
    detailRow(copy.labelLocation, `${esc(location.name)}<br><span style="font-weight:400;color:${BRAND.muted}">${esc(location.address)}</span>`),
    detailRow(copy.labelDate, esc(formatReservationDate(row.reservation_date, locale))),
    detailRow(copy.labelTime, esc(normalizeTime(row.reservation_time))),
    detailRow(copy.labelParty, esc(copy.guests(row.party_size))),
    row.occasion ? detailRow(copy.labelOccasion, esc(row.occasion)) : "",
    row.children_count > 0 ? detailRow(copy.labelChildren, String(row.children_count)) : "",
    row.needs_high_chair ? detailRow(copy.labelHighChair, esc(copy.highChairYes)) : "",
    row.dietary ? detailRow(copy.labelDietary, esc(row.dietary)) : "",
    row.notes ? detailRow(copy.labelNotes, esc(row.notes)) : "",
  ].join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0 4px;border-top:1px solid ${BRAND.border}">${rows}</table>`;
}

export function buildCustomerEmail(
  row: ReservationRow,
  location: Location,
  kind: EmailKind
): { subject: string; html: string } {
  const copy = CUSTOMER[asLocale(row.locale)];
  const heading =
    kind === "created"
      ? copy.headingCreated
      : kind === "rescheduled"
        ? copy.headingRescheduled
        : copy.headingCancelled;
  const lead =
    kind === "created"
      ? copy.leadCreated
      : kind === "rescheduled"
        ? copy.leadRescheduled
        : copy.leadCancelled;
  const subject =
    kind === "created"
      ? copy.subjectCreated
      : kind === "rescheduled"
        ? copy.subjectRescheduled
        : copy.subjectCancelled;

  const manage = kind !== "cancelled"
    ? `<p style="color:${BRAND.muted};font-size:13px;margin:22px 0 10px">${esc(copy.manageHint)}</p>
       <div>${button(manageUrl(row, "#reprogramar"), copy.btnReschedule, "outline")}&nbsp;&nbsp;${button(
         manageUrl(row, "#cancelar"),
         copy.btnCancel,
         "danger"
       )}</div>`
    : `<p style="color:${BRAND.muted};font-size:13px;margin:22px 0 0">${esc(copy.cancelledNote)}</p>`;

  const inner = `
    <h1 style="margin:0 0 6px;color:${BRAND.text};font-size:22px">${esc(heading)}</h1>
    <p style="margin:0;color:${BRAND.text};font-size:15px;line-height:1.5">${esc(lead)}</p>
    ${detailsTable(row, location, copy)}
    ${manage}
    <p style="color:${BRAND.muted};font-size:13px;margin:22px 0 0">${esc(copy.questions(location.phone))}</p>
  `;
  return { subject, html: shell(inner) };
}

export function buildManagerEmail(
  row: ReservationRow,
  location: Location,
  kind: EmailKind
): { subject: string; html: string } {
  // La manager siempre en español.
  const copy = CUSTOMER.es;
  const tag =
    kind === "created"
      ? "NUEVA RESERVA"
      : kind === "rescheduled"
        ? "RESERVA MODIFICADA"
        : "RESERVA CANCELADA";
  const color = kind === "cancelled" ? BRAND.danger : BRAND.electric;
  const dateStr = formatReservationDate(row.reservation_date, "es");
  const time = normalizeTime(row.reservation_time);
  const subject = `[${tag}] ${location.name} · ${dateStr} ${time} · ${row.party_size}p`;

  const contactRows = [
    detailRow("Cliente", esc(`${row.first_name} ${row.last_name}`)),
    detailRow("Teléfono", `<a href="tel:${esc(row.phone)}" style="color:${BRAND.text}">${esc(row.phone)}</a>`),
    detailRow("Email", `<a href="mailto:${esc(row.email)}" style="color:${BRAND.text}">${esc(row.email)}</a>`),
    detailRow("Marketing", row.marketing_opt_in ? "Sí (acepta novedades)" : "No"),
  ].join("");

  const inner = `
    <span style="display:inline-block;background:${color};color:#fff;font-size:11px;font-weight:700;letter-spacing:0.12em;padding:4px 10px;border-radius:999px">${tag}</span>
    <h1 style="margin:12px 0 4px;color:${BRAND.text};font-size:20px">${esc(location.name)}</h1>
    ${detailsTable(row, location, copy)}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 4px;border-top:1px solid ${BRAND.border}">${contactRows}</table>
    <p style="color:${BRAND.muted};font-size:12px;margin:20px 0 0">Reserva #${esc(
      row.id.slice(0, 8)
    )} · gestiona todas en <a href="${siteUrl()}/admin/reservas" style="color:${BRAND.electric}">/admin/reservas</a></p>
  `;
  return { subject, html: shell(inner) };
}

/* ------------------------------------------------------------------ *
 * Envío
 * ------------------------------------------------------------------ */

async function send(
  to: string,
  subject: string,
  html: string,
  replyTo?: string
): Promise<boolean> {
  const resend = getResend();
  if (!resend) {
    console.warn("[email] RESEND_API_KEY no configurada; email omitido:", subject);
    return false;
  }
  try {
    const { error } = await resend.emails.send({
      from: fromAddress(),
      to,
      subject,
      html,
      ...(replyTo ? { replyTo } : {}),
    });
    if (error) {
      console.error("[email] Resend error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email] envío fallido:", err);
    return false;
  }
}

/** Dispara los dos emails de una reserva (cliente + manager). Best effort. */
export async function notifyReservation(
  row: ReservationRow,
  location: Location,
  kind: EmailKind
): Promise<void> {
  const managerTo = process.env.RESERVATIONS_NOTIFY_EMAIL;
  const customer = buildCustomerEmail(row, location, kind);
  const tasks: Promise<boolean>[] = [
    send(row.email, customer.subject, customer.html, managerTo),
  ];
  if (managerTo) {
    const manager = buildManagerEmail(row, location, kind);
    tasks.push(send(managerTo, manager.subject, manager.html, row.email));
  } else {
    console.warn("[email] RESERVATIONS_NOTIFY_EMAIL no configurada; aviso a manager omitido.");
  }
  await Promise.all(tasks);
}
