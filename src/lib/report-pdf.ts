/**
 * Generador de PDF — Informe diario de colaboradores deportivos.
 *
 * Estructura:
 *   - Página 1: Portada (banda teal) + KPIs + tabla de cumplimiento por colaborador.
 *   - Página 2: Registros capturados del día (libro mayor con hora y fecha).
 *   - Página 3: Lugares asignados por colaborador.
 *   - Página 4: Protección de datos + caja de contacto.
 *
 * Stack: jsPDF + jspdf-autotable. Footer con paginación en todas las páginas.
 */
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import {
  estadoCumplimiento,
  flattenLugares,
  flattenRegistros,
  type ResumenDia,
} from "@/lib/resumen-dia"

type RGB = [number, number, number]

const C = {
  primary: [15, 118, 110] as RGB, // teal-700
  primaryDark: [19, 78, 74] as RGB, // teal-900
  accent: [3, 105, 161] as RGB, // sky-700
  amber: [180, 83, 9] as RGB,
  headerBg: [15, 118, 110] as RGB,
  headerText: [255, 255, 255] as RGB,
  zebra: [240, 253, 250] as RGB, // teal-50
  muted: [71, 85, 105] as RGB,
  dark: [31, 41, 55] as RGB,
  light: [241, 245, 249] as RGB,
  green: [22, 163, 74] as RGB, // green-600
  greenBg: [209, 250, 229] as RGB, // green-100
  yellow: [202, 138, 4] as RGB, // yellow-600
  yellowBg: [254, 243, 199] as RGB, // amber-100
  red: [220, 38, 38] as RGB, // red-600
  redBg: [254, 226, 226] as RGB, // red-100
}

function colorsForPdf(p: number): { bg: RGB; fg: RGB } {
  if (p >= 100) return { bg: C.greenBg, fg: C.green }
  if (p >= 50) return { bg: C.yellowBg, fg: C.yellow }
  return { bg: C.redBg, fg: C.red }
}

export async function generatePdf(data: ResumenDia): Promise<Buffer> {
  const doc = new jsPDF({ unit: "pt", format: "a4" })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 40
  const contentW = pageW - margin * 2

  // ===================================================================
  // PÁGINA 1 — Portada + dashboard
  // ===================================================================
  drawCover(doc, data, pageW, margin)

  let y = 230
  // Intro paragraph
  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.setTextColor(...C.muted)
  const intro =
    "El presente informe consolida la gestión diaria de los colaboradores deportivos de la Dirección de Deportes (DIDECO) de la Municipalidad de Viña del Mar. Para cada colaborador se detalla: lugar asignado, usuarios capturados durante la jornada, meta diaria, cumplimiento individual y el detalle de cada registro con fecha y hora exactas."
  const introLines = doc.splitTextToSize(intro, contentW)
  doc.text(introLines, margin, y)
  y += introLines.length * 13 + 16

  // KPI grid 3x2 (6 cards)
  doc.setTextColor(...C.dark)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(13)
  doc.text("Indicadores del día", margin, y)
  y += 8
  doc.setDrawColor(...C.primary)
  doc.setLineWidth(2)
  doc.line(margin, y, margin + 60, y)
  y += 18

  const kpis: Array<{ label: string; value: string; color: RGB }> = [
    { label: "Meta total día", value: String(data.totalMetaDia), color: C.accent },
    { label: "Realizado total", value: String(data.totalRealizado), color: C.primary },
    { label: "Cumplimiento global", value: `${data.cumplimientoGlobal}%`, color: C.primary },
    { label: "Colaboradores activos", value: String(data.totalColaboradores), color: C.accent },
    { label: "Registros del día", value: String(data.totalRegistros), color: C.amber },
    { label: "Lugares monitoreados", value: String(data.totalLugaresMonitoreados), color: C.primary },
  ]
  const cardW = (contentW - 20) / 3
  const cardH = 60
  kpis.forEach((kpi, i) => {
    const col = i % 3
    const row = Math.floor(i / 3)
    const x = margin + col * (cardW + 10)
    const cy = y + row * (cardH + 10)
    doc.setFillColor(255, 255, 255)
    doc.setDrawColor(226, 232, 240)
    doc.setLineWidth(0.8)
    doc.roundedRect(x, cy, cardW, cardH, 6, 6, "FD")
    // Barra lateral de color
    doc.setFillColor(...kpi.color)
    doc.roundedRect(x, cy, 5, cardH, 2, 2, "F")
    // Valor
    doc.setTextColor(...kpi.color)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(20)
    doc.text(kpi.value, x + 16, cy + 28)
    // Etiqueta
    doc.setTextColor(...C.muted)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    doc.text(kpi.label.toUpperCase(), x + 16, cy + 44)
  })
  y += 2 * (cardH + 10) + 14

  // Tabla principal: Cumplimiento por colaborador
  doc.setTextColor(...C.dark)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(13)
  doc.text("Cumplimiento por colaborador", margin, y)
  y += 8

  autoTable(doc, {
    startY: y,
    head: [["Colaborador", "Rol", "Lugar asignado", "Meta", "Realizado", "%", "Estado"]],
    body: data.colaboradores.map((c) => {
      const est = estadoCumplimiento(c.cumplimiento)
      return [
        c.nombre,
        c.rol,
        c.lugaresAsignados.map((l) => l.nombre).join(", ") || "Sin asignar",
        String(c.meta),
        String(c.realizado),
        `${c.cumplimiento}%`,
        `${est.icon} ${est.label}`,
      ]
    }),
    foot: [
      [
        "TOTAL",
        "",
        "Global",
        String(data.totalMetaDia),
        String(data.totalRealizado),
        `${data.cumplimientoGlobal}%`,
        `${estadoCumplimiento(data.cumplimientoGlobal).icon} Global`,
      ],
    ],
    theme: "grid",
    headStyles: {
      fillColor: C.headerBg,
      textColor: C.headerText,
      fontStyle: "bold",
      fontSize: 9.5,
    },
    footStyles: {
      fillColor: C.primaryDark,
      textColor: C.headerText,
      fontStyle: "bold",
      fontSize: 9.5,
    },
    bodyStyles: { fontSize: 9, textColor: C.dark, lineColor: [226, 232, 240], lineWidth: 0.4 },
    alternateRowStyles: { fillColor: C.zebra },
    columnStyles: {
      0: { cellWidth: contentW * 0.2, fontStyle: "bold" },
      1: { cellWidth: contentW * 0.11, halign: "center" },
      2: { cellWidth: contentW * 0.27 },
      3: { cellWidth: contentW * 0.08, halign: "center" },
      4: { cellWidth: contentW * 0.1, halign: "center" },
      5: { cellWidth: contentW * 0.1, halign: "center", fontStyle: "bold" },
      6: { cellWidth: contentW * 0.14, halign: "center" },
    },
    margin: { left: margin, right: margin },
    didParseCell: (hookData) => {
      const section = hookData.section
      const colIdx = hookData.column.index
      // Body % column → color by threshold
      if (section === "body" && colIdx === 5) {
        const raw = hookData.cell.raw
        const num = typeof raw === "string" ? parseInt(raw, 10) : Number(raw)
        if (!Number.isNaN(num)) {
          const colors = colorsForPdf(num)
          hookData.cell.styles.fillColor = colors.bg
          hookData.cell.styles.textColor = colors.fg
        }
      }
      // Body Estado column → color by threshold (lookup based on icon char in raw)
      if (section === "body" && colIdx === 6) {
        const raw = String(hookData.cell.raw ?? "")
        let kind: "ok" | "warn" | "bad" = "bad"
        if (raw.startsWith("✓")) kind = "ok"
        else if (raw.startsWith("⚠")) kind = "warn"
        const map = {
          ok: { bg: C.greenBg, fg: C.green },
          warn: { bg: C.yellowBg, fg: C.yellow },
          bad: { bg: C.redBg, fg: C.red },
        }
        hookData.cell.styles.fillColor = map[kind].bg
        hookData.cell.styles.textColor = map[kind].fg
      }
      // Foot % column → color by global cumplimiento
      if (section === "foot" && colIdx === 5) {
        const colors = colorsForPdf(data.cumplimientoGlobal)
        hookData.cell.styles.fillColor = colors.bg
        hookData.cell.styles.textColor = colors.fg
      }
    },
    didDrawPage: () => drawFooter(doc, pageW, pageH),
  })

  // ===================================================================
  // PÁGINA 2 — Registros capturados del día
  // ===================================================================
  doc.addPage()
  drawPageHeader(doc, "Registros capturados del día", margin)
  let y2 = 70
  doc.setFont("helvetica", "italic")
  doc.setFontSize(9)
  doc.setTextColor(...C.muted)
  doc.text(
    `Total registros del día: ${data.totalRegistros}. Detalle con fecha y hora exactas, ordenado por hora ascendente.`,
    margin,
    y2,
  )
  y2 += 14

  const registros = flattenRegistros(data)
  autoTable(doc, {
    startY: y2,
    head: [["Hora", "Fecha", "Beneficiario", "Lugar asignado", "Tipo", "Colaborador"]],
    body: registros.map((r) => [
      r.hora,
      r.fecha,
      r.beneficiario,
      r.lugar,
      r.tipoLugar,
      r.colaborador,
    ]),
    theme: "striped",
    headStyles: { fillColor: C.headerBg, textColor: C.headerText, fontStyle: "bold", fontSize: 9 },
    bodyStyles: { fontSize: 8.5, textColor: C.dark },
    alternateRowStyles: { fillColor: C.zebra },
    columnStyles: {
      0: { cellWidth: contentW * 0.09, halign: "center", fontStyle: "bold" },
      1: { cellWidth: contentW * 0.11, halign: "center" },
      2: { cellWidth: contentW * 0.22, fontStyle: "bold" },
      3: { cellWidth: contentW * 0.26 },
      4: { cellWidth: contentW * 0.14, halign: "center" },
      5: { cellWidth: contentW * 0.18 },
    },
    margin: { left: margin, right: margin },
    didDrawPage: () => drawFooter(doc, pageW, pageH),
  })

  // ===================================================================
  // PÁGINA 3 — Lugares asignados por colaborador
  // ===================================================================
  doc.addPage()
  drawPageHeader(doc, "Lugares asignados por colaborador", margin)
  let y3 = 70
  doc.setFont("helvetica", "italic")
  doc.setFontSize(9)
  doc.setTextColor(...C.muted)
  doc.text(
    `Matriz colaborador × lugar con dirección. ${data.totalLugaresMonitoreados} lugares monitoreados por ${data.totalColaboradores} colaboradores.`,
    margin,
    y3,
  )
  y3 += 14

  const lugares = flattenLugares(data)
  autoTable(doc, {
    startY: y3,
    head: [["Colaborador", "Rol", "Lugar", "Tipo", "Dirección", "Comuna"]],
    body: lugares.map((l) => [
      l.colaborador,
      l.rol,
      l.lugar,
      l.tipo,
      l.direccion,
      l.comuna,
    ]),
    theme: "striped",
    headStyles: { fillColor: C.headerBg, textColor: C.headerText, fontStyle: "bold", fontSize: 9.5 },
    bodyStyles: { fontSize: 9, textColor: C.dark },
    alternateRowStyles: { fillColor: C.zebra },
    columnStyles: {
      0: { cellWidth: contentW * 0.2, fontStyle: "bold" },
      1: { cellWidth: contentW * 0.11, halign: "center" },
      2: { cellWidth: contentW * 0.22 },
      3: { cellWidth: contentW * 0.17, halign: "center" },
      4: { cellWidth: contentW * 0.22 },
      5: { cellWidth: contentW * 0.08, halign: "center" },
    },
    margin: { left: margin, right: margin },
    didDrawPage: () => drawFooter(doc, pageW, pageH),
  })

  // ===================================================================
  // PÁGINA 4 — Protección de datos + contacto
  // ===================================================================
  doc.addPage()
  drawPageHeader(doc, "Protección de datos y ciberseguridad", margin)
  let y4 = 70
  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.setTextColor(...C.dark)
  const nota =
    "Este documento se ha generado aplicando los siguientes estándares de protección de datos y ciberseguridad, conforme a la Ley N° 19.628 sobre Protección de la Vida Privada:"
  const notaLines = doc.splitTextToSize(nota, contentW)
  doc.text(notaLines, margin, y4)
  y4 += notaLines.length * 14 + 8

  const medidas = [
    "Validación de identidad mediante RUT chileno (algoritmo módulo 11).",
    "Enmascaramiento de datos sensibles (RUT) en reportes y listados.",
    "Firma de integridad de cada matrícula registrada.",
    "Cabeceras HTTP de seguridad: Content-Security-Policy, X-Frame-Options (DENY), X-Content-Type-Options, Referrer-Policy y HSTS.",
    "Permissions-Policy restrictiva (geolocalización limitada al propio sitio).",
    "Sanitización de entradas para prevención de ataques XSS e inyección SQL.",
    "Mensajes de error genéricos para evitar fuga de información.",
  ]
  doc.setFontSize(9.5)
  medidas.forEach((m) => {
    const lines = doc.splitTextToSize(m, contentW - 14)
    lines.forEach((line: string) => {
      doc.setFillColor(...C.primary)
      doc.circle(margin + 3, y4 - 3, 2, "F")
      doc.setTextColor(...C.dark)
      doc.text(line, margin + 12, y4)
      y4 += 13
    })
    y4 += 3
  })

  y4 += 18
  // Caja de contacto con borde teal
  doc.setFillColor(...C.zebra)
  doc.setDrawColor(...C.primary)
  doc.setLineWidth(1)
  doc.roundedRect(margin, y4, contentW, 80, 6, 6, "FD")
  doc.setTextColor(...C.primaryDark)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.text("Contacto", margin + 16, y4 + 24)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9.5)
  doc.setTextColor(...C.dark)
  doc.text("Dirección de Deportes · DIDECO · Municipalidad de Viña del Mar", margin + 16, y4 + 42)
  doc.setTextColor(...C.accent)
  doc.setFont("helvetica", "bold")
  doc.text("deportes.dideco@munivina.cl", margin + 16, y4 + 60)

  drawFooter(doc, pageW, pageH)

  // Metadatos
  doc.setProperties({
    title: "Informe Diario Colaboradores Deportivos",
    subject: `Informe del día ${data.fechaLabel}`,
    author: "Municipalidad de Viña del Mar",
    creator: "Dashboard Deportivo Municipal",
    keywords:
      "Viña del Mar, deportes, colaboradores, informe diario, cumplimiento, DIDECO",
  })

  return Buffer.from(doc.output("arraybuffer"))
}

// ============================================================
// Helpers
// ============================================================

function drawCover(
  doc: jsPDF,
  data: ResumenDia,
  pageW: number,
  margin: number,
) {
  // Banda teal superior (simula gradiente con dos rectángulos)
  doc.setFillColor(...C.primary)
  doc.rect(0, 0, pageW, 180, "F")
  doc.setFillColor(...C.primaryDark)
  doc.rect(0, 165, pageW, 15, "F")

  doc.setTextColor(255, 255, 255)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.text("DIRECCIÓN DE DEPORTES · DIDECO", margin, 50)
  doc.setFontSize(22)
  doc.text("INFORME DIARIO DE", margin, 86)
  doc.text("COLABORADORES DEPORTIVOS", margin, 112)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(12)
  doc.text("Municipalidad de Viña del Mar", margin, 138)
  doc.setFontSize(10)
  doc.text(
    `${data.fechaLabel}  ·  Generado: ${data.generadoEn}`,
    margin,
    154,
  )

  // Título del dashboard
  doc.setTextColor(...C.dark)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(14)
  doc.text("Informe del día", margin, 210)
  doc.setDrawColor(...C.primary)
  doc.setLineWidth(2)
  doc.line(margin, 216, margin + 60, 216)
}

function drawPageHeader(doc: jsPDF, title: string, margin: number) {
  // Pequeña banda teal superior
  const pageW = doc.internal.pageSize.getWidth()
  doc.setFillColor(...C.primary)
  doc.rect(0, 0, pageW, 50, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(14)
  doc.text(title, margin, 32)
}

function drawFooter(doc: jsPDF, pageW: number, pageH: number) {
  const pageCount = doc.getNumberOfPages()
  const current = doc.getCurrentPageInfo().pageNumber
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.5)
  doc.line(40, pageH - 30, pageW - 40, pageH - 30)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.setTextColor(...C.muted)
  doc.text("Informe Diario Colaboradores · Municipalidad de Viña del Mar", 40, pageH - 16)
  doc.text(`Página ${current} de ${pageCount}`, pageW - 40, pageH - 16, { align: "right" })
}
