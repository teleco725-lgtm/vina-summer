import { NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { getResumenDia } from "@/lib/resumen-dia"
import { generatePdf } from "@/lib/report-pdf"
import { generateExcel } from "@/lib/report-excel"
import { generateWord } from "@/lib/report-word"
import { sanitizeText } from "@/lib/security"

export const dynamic = "force-dynamic"

const DESTINO = "deportes.dideco@munivina.cl"

/**
 * POST /api/email
 * Body: { asunto, mensaje, formatoAdjunto: "pdf"|"excel"|"word"|"ninguno", remitenteNombre, remitenteEmail }
 *
 * - Si hay SMTP configurado (env SMTP_HOST/USER/PASS) envía el correo real con adjunto.
 * - Si no hay SMTP, devuelve un payload mailto: con el resumen + descarga del adjunto,
 *   para que el usuario lo abra en su cliente de correo.
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }

  const asunto = sanitizeText(body.asunto ?? `Informe Diario Colaboradores - ${new Date().toLocaleDateString("es-CL")}`, 200)
  const mensaje = sanitizeText(body.mensaje ?? "", 3000)
  const remitenteNombre = sanitizeText(body.remitenteNombre ?? "", 120)
  const remitenteEmail = sanitizeText(body.remitenteEmail ?? "", 120)
  const formato = String(body.formatoAdjunto ?? "pdf")

  if (remitenteEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(remitenteEmail)) {
    return NextResponse.json({ error: "Email del remitente inválido" }, { status: 400 })
  }

  // Generar adjunto si corresponde
  let adjunto: { filename: string; content: Buffer; contentType: string } | null = null
  try {
    if (formato !== "ninguno") {
      const data = await getResumenDia()
      const fecha = data.fecha.slice(0, 10)
      if (formato === "pdf") {
        const buf = await generatePdf(data)
        adjunto = { filename: `informe-diario-colaboradores-${fecha}.pdf`, content: buf, contentType: "application/pdf" }
      } else if (formato === "excel") {
        const buf = await generateExcel(data)
        adjunto = {
          filename: `informe-diario-colaboradores-${fecha}.xlsx`,
          content: buf,
          contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }
      } else if (formato === "word") {
        const buf = await generateWord(data)
        adjunto = {
          filename: `informe-diario-colaboradores-${fecha}.docx`,
          content: buf,
          contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        }
      }
    }
  } catch (e) {
    console.error("generar adjunto error:", e)
    return NextResponse.json({ error: "Error al generar el adjunto del informe" }, { status: 500 })
  }

  const cuerpoHtml = construirHtml(mensaje, remitenteNombre, remitenteEmail)

  // === Intentar envío real si hay SMTP ===
  const smtpHost = process.env.SMTP_HOST
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS
  const smtpPort = Number(process.env.SMTP_PORT ?? "587")

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: smtpUser, pass: smtpPass },
      })
      await transporter.sendMail({
        from: `"Dashboard Deportivo Viña" <${smtpUser}>`,
        to: DESTINO,
        replyTo: remitenteEmail || undefined,
        subject: asunto,
        text: cuerpoPlain(mensaje, remitenteNombre, remitenteEmail),
        html: cuerpoHtml,
        attachments: adjunto ? [{ filename: adjunto.filename, content: adjunto.content, contentType: adjunto.contentType }] : [],
      })
      return NextResponse.json({
        ok: true,
        enviado: true,
        destinatario: DESTINO,
        mensaje: "Correo enviado correctamente al destinatario municipal.",
      })
    } catch (e) {
      console.error("smtp error:", e)
      // Caer al fallback mailto
      return NextResponse.json({
        ok: false,
        enviado: false,
        fallback: "mailto",
        destinatario: DESTINO,
        error: "No se pudo enviar por SMTP. Use la opción de abrir en su cliente de correo.",
        mailto: buildMailto(DESTINO, asunto, cuerpoPlain(mensaje, remitenteNombre, remitenteEmail)),
      })
    }
  }

  // === Fallback: devolver mailto + sugerencia de descarga ===
  return NextResponse.json({
    ok: true,
    enviado: false,
    fallback: "mailto",
    destinatario: DESTINO,
    mailto: buildMailto(DESTINO, asunto, cuerpoPlain(mensaje, remitenteNombre, remitenteEmail)),
    adjuntoGenerado: !!adjunto,
    mensaje: "SMTP no configurado. Se abrió su cliente de correo con el destinatario y mensaje. Descargue el adjunto desde el botón de exportación.",
  })
}

function construirHtml(mensaje: string, nombre: string, email: string): string {
  return `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 640px; margin: 0 auto; color: #1f2937;">
      <div style="background: linear-gradient(135deg, #0f766e, #0369a1); padding: 24px; border-radius: 12px 12px 0 0;">
        <h1 style="color: #fff; margin: 0; font-size: 20px;">Informe Diario de Colaboradores</h1>
        <p style="color: #e0f2fe; margin: 4px 0 0; font-size: 13px;">Dirección de Deportes · DIDECO · Municipalidad de Viña del Mar</p>
      </div>
      <div style="background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
        ${mensaje ? `<p style="margin: 0 0 12px; line-height: 1.6;">${escapeHtml(mensaje).replace(/\n/g, "<br>")}</p>` : ""}
        <p style="margin: 12px 0 4px; font-size: 12px; color: #64748b;">Adjunto encontrará el informe diario con el cumplimiento por colaborador, los registros capturados (con fecha y hora) y los lugares asignados.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;">
        <p style="margin: 0; font-size: 12px; color: #64748b;">
          <strong>Remitente:</strong> ${escapeHtml(nombre || "—")} ${email ? `(${escapeHtml(email)})` : ""}
        </p>
        <p style="margin: 4px 0 0; font-size: 11px; color: #94a3b8;">
          Correo generado desde el Dashboard Deportivo Municipal · Protección de datos aplicada.
        </p>
      </div>
    </div>
  `
}

function cuerpoPlain(mensaje: string, nombre: string, email: string): string {
  return [
    mensaje,
    "",
    "---",
    "Municipalidad de Viña del Mar · Dirección de Deportes · DIDECO",
    `Remitente: ${nombre || "—"} ${email ? `(${email})` : ""}`,
    "",
    "Nota: Correo generado desde el Dashboard Deportivo Municipal.",
    "Si eligió adjuntar un informe, descárguelo desde el botón de exportación en el dashboard.",
  ].join("\n")
}

function buildMailto(to: string, subject: string, body: string): string {
  const params = new URLSearchParams({ subject, body })
  return `mailto:${to}?${params.toString()}`
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}
