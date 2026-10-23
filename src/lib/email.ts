import "server-only"
import { buildIcs, googleCalendarUrl, outlookCalendarUrl, type CalendarEvent } from "./calendar"
import { brl, TZ } from "./utils"

type Confirmation = {
  to: string
  clientName: string
  serviceName: string
  professionalName: string
  price: number
  event: CalendarEvent
  whatsapp?: string | null
}

/**
 * Envia o e-mail de confirmação via Resend (https://resend.com).
 * Sem RESEND_API_KEY configurada, não faz nada.
 */
export async function sendConfirmationEmail(c: Confirmation) {
  const key = process.env.RESEND_API_KEY
  if (!key) return { skipped: true }

  const from = process.env.EMAIL_FROM ?? "Bela Flor Nails <onboarding@resend.dev>"
  const when = c.event.start.toLocaleString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TZ,
  })
  const ics = buildIcs(c.event)

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [c.to],
      subject: `Horário confirmado · ${c.serviceName}`,
      html: confirmationHtml({ ...c, when }),
      attachments: [{ filename: "agendamento.ics", content: Buffer.from(ics).toString("base64"), content_type: "text/calendar" }],
    }),
  })
  if (!res.ok) console.error("Resend falhou:", res.status, await res.text())
  return { skipped: false, ok: res.ok }
}

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`)

function confirmationHtml(c: Confirmation & { when: string }) {
  const btn = (href: string, label: string, primary = false) =>
    `<a href="${href}" style="display:inline-block;margin:4px;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:600;font-size:14px;${
      primary ? "background:#a14d5a;color:#fff" : "background:#f3e6e4;color:#5a2a31"
    }">${label}</a>`

  return `<!doctype html>
<html lang="pt-BR"><body style="margin:0;background:#f8efed;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#2b1d1f">
  <div style="max-width:520px;margin:0 auto;padding:32px 16px">
    <div style="background:#ffffffcc;border:1px solid #ecd9d6;border-radius:28px;padding:32px;text-align:center">
      <p style="font-family:Georgia,serif;font-style:italic;font-size:22px;margin:0 0 4px">Bela Flor <span style="font-style:normal;font-family:inherit;font-size:13px;color:#a14d5a;font-weight:700">NAILS</span></p>
      <h1 style="font-size:24px;margin:24px 0 8px">Seu horário está confirmado</h1>
      <p style="margin:0 0 24px;color:#6b5558">Olá, ${escapeHtml(c.clientName.split(" ")[0])}. Seu horário está reservado.</p>
      <div style="background:#f8efed;border-radius:20px;padding:20px;text-align:left;font-size:15px;line-height:1.7">
        <b>${escapeHtml(c.serviceName)}</b><br>
        ${c.when.charAt(0).toUpperCase() + c.when.slice(1)}<br>
        Com ${escapeHtml(c.professionalName)} · ${brl(c.price)}<br>
        <span style="color:#6b5558">${escapeHtml(c.event.location)}</span>
      </div>
      <p style="margin:24px 0 8px;font-weight:600">Adicionar à sua agenda</p>
      ${btn(googleCalendarUrl(c.event), "Google Agenda", true)}
      ${btn(outlookCalendarUrl(c.event), "Outlook")}
      <p style="font-size:13px;color:#6b5558;margin:12px 0 0">iPhone / Apple Calendar: abra o anexo <b>agendamento.ics</b>.</p>
      ${c.whatsapp ? `<p style="margin:24px 0 0;font-size:14px">Precisa remarcar? <a href="https://wa.me/${c.whatsapp}" style="color:#a14d5a">Fale no WhatsApp</a></p>` : ""}
    </div>
  </div>
</body></html>`
}

/** Avisa a cliente da lista de espera que abriu um horário. */
export async function sendWaitlistEmail(to: string, clientName: string, link: string, businessName: string) {
  const key = process.env.RESEND_API_KEY
  if (!key) return { skipped: true }
  const from = process.env.EMAIL_FROM ?? "Bela Flor Nails <onboarding@resend.dev>"
  const name = escapeHtml(clientName)
  const html = `<!doctype html>
<html lang="pt-BR"><body style="margin:0;background:#f8efed;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#2b1d1f">
  <div style="max-width:520px;margin:0 auto;padding:32px 16px">
    <div style="background:#ffffffcc;border:1px solid #ecd9d6;border-radius:28px;padding:32px;text-align:center">
      <h1 style="margin:0 0 12px;font-size:24px">Abriu um horário, ${name}</h1>
      <p style="margin:0 0 24px;line-height:1.5">Você estava na nossa lista de espera e uma vaga acabou de abrir na ${escapeHtml(businessName)}. Quem confirmar primeiro fica com ela.</p>
      <a href="${link}" style="display:inline-block;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:600;background:#a14d5a;color:#fff">Escolher meu horário</a>
    </div>
  </div>
</body></html>`
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [to], subject: "Abriu um horário para você", html }),
  })
  if (!res.ok) console.error("Resend falhou:", res.status, await res.text())
  return { skipped: false, ok: res.ok }
}
