/**
 * Generador de PDF profesional con jsPDF + autotable.
 * Portada con banda de color, KPIs, tablas con cabecera coloreada y zebra.
 */
import { jsPDF } from "jspdf"
import autoTable, { type RowInput } from "jspdf-autotable"
import type { ReportData } from "./report-data"

const C = {
  primary: [15, 118, 110] as [number, number, number], // teal-700
  primaryDark: [19, 78, 74] as [number, number, number],
  accent: [3, 105, 161] as [number, number, number], // sky-700
  amber: [180, 83, 9] as [number, number, number],
  headerBg: [15, 118, 110] as [number, number, number],
  headerText: [255, 255, 255] as [number, number, number],
  zebra: [240, 253, 250] as [number, number, number],
  muted: [71, 85, 105] as [number, number, number],
  dark: [31, 41, 55] as [number, number, number],
  light: [241, 245, 249] as [number, number, number],
}

export async function generatePdf(data: ReportData): Promise<Buffer> {
  const doc = new jsPDF({ unit: "pt", format: "a4" })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 40
  const contentW = pageW - margin * 2

  // ============ PORTADA ============
  // Banda superior de color
  doc.setFillColor(...C.primary)
  doc.rect(0, 0, pageW, 180, "F")
  // Banda acento inferior
  doc.setFillColor(...C.primaryDark)
  doc.rect(0, 165, pageW, 15, "F")

  doc.setTextColor(255, 255, 255)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.text("MUNICIPALIDAD DE VIÑA DEL MAR", margin, 50)
  doc.setFontSize(26)
  doc.text("Informe de Gestión Deportiva", margin, 90)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(13)
  doc.text("Playas, piscinas municipales y gimnasios con piscina", margin, 115)
  doc.setFontSize(10)
  doc.text(`Periodo: ${data.periodo}  ·  Generado: ${data.generadoEn}`, margin, 140)

  // Tarjetas KPI
  let y = 230
  doc.setTextColor(...C.dark)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(14)
  doc.text("Resumen ejecutivo", margin, y)
  y += 18
  // Línea de acento
  doc.setDrawColor(...C.primary)
  doc.setLineWidth(2)
  doc.line(margin, y, margin + 60, y)
  y += 18

  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.setTextColor(...C.muted)
  const intro =
    "El presente informe consolida la información de lugares deportivos y recreativos de la Municipalidad de Viña del Mar, incluyendo matrículas registradas y colaboradores asignados. La información se ha generado aplicando estándares de ciberseguridad y protección de datos personales conforme a la Ley N° 19.628."
  const introLines = doc.splitTextToSize(intro, contentW)
  doc.text(introLines, margin, y)
  y += introLines.length * 13 + 16

  // KPIs en grid 3x2
  const kpis = [
    { label: "Total lugares", value: data.resumen.totalLugares, color: C.accent },
    { label: "Playas", value: data.resumen.playas, color: C.primary },
    { label: "Piscinas municipales", value: data.resumen.piscinas, color: C.primary },
    { label: "Gimnasios c/ piscina", value: data.resumen.gimnasios, color: C.amber },
    { label: "Colaboradores", value: data.resumen.totalColaboradores, color: C.accent },
    { label: "Matrículas", value: data.resumen.totalMatriculas, color: C.amber },
  ]
  const cardW = (contentW - 20) / 3
  const cardH = 64
  kpis.forEach((kpi, i) => {
    const col = i % 3
    const row = Math.floor(i / 3)
    const x = margin + col * (cardW + 10)
    const cy = y + row * (cardH + 10)
    // Fondo
    doc.setFillColor(255, 255, 255)
    doc.setDrawColor(226, 232, 240)
    doc.setLineWidth(0.8)
    doc.roundedRect(x, cy, cardW, cardH, 6, 6, "FD")
    // Barra de color izquierda
    doc.setFillColor(...kpi.color)
    doc.roundedRect(x, cy, 5, cardH, 2, 2, "F")
    // Valor
    doc.setTextColor(...kpi.color)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(22)
    doc.text(String(kpi.value), x + 16, cy + 30)
    // Etiqueta
    doc.setTextColor(...C.muted)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.text(kpi.label.toUpperCase(), x + 16, cy + 48)
  })
  y += 2 * (cardH + 10) + 18

  // Tabla distribución por tipo
  doc.setTextColor(...C.dark)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(12)
  doc.text("Distribución por tipo", margin, y)
  y += 8
  autoTable(doc, {
    startY: y,
    head: [["Tipo de lugar", "Cantidad", "Porcentaje"]],
    body: data.porTipo.map((t) => {
      const pct = data.resumen.totalLugares ? ((t.count / data.resumen.totalLugares) * 100).toFixed(1) : "0.0"
      return [t.label, String(t.count), `${pct}%`]
    }),
    theme: "striped",
    headStyles: { fillColor: C.headerBg, textColor: C.headerText, fontStyle: "bold", fontSize: 10 },
    bodyStyles: { fontSize: 10, textColor: C.dark },
    alternateRowStyles: { fillColor: C.zebra },
    columnStyles: {
      0: { cellWidth: contentW * 0.5 },
      1: { cellWidth: contentW * 0.25, halign: "center" },
      2: { cellWidth: contentW * 0.25, halign: "center" },
    },
    margin: { left: margin, right: margin },
  })

  // ============ Página 2: Lugares ============
  doc.addPage()
  let y2 = 50
  doc.setTextColor(...C.primaryDark)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(15)
  doc.text("Inventario de lugares", margin, y2)
  y2 += 10
  autoTable(doc, {
    startY: y2,
    head: [["Nombre", "Tipo", "Dirección", "Comuna", "Aforo"]],
    body: data.lugares.map((l) => [
      l.nombre,
      l.tipoLabel,
      l.direccion,
      l.comuna,
      l.aforo != null ? l.aforo.toLocaleString("es-CL") : "—",
    ]),
    theme: "striped",
    headStyles: { fillColor: C.headerBg, textColor: C.headerText, fontStyle: "bold", fontSize: 9 },
    bodyStyles: { fontSize: 8.5, textColor: C.dark },
    alternateRowStyles: { fillColor: C.zebra },
    columnStyles: {
      0: { cellWidth: contentW * 0.22, fontStyle: "bold" },
      1: { cellWidth: contentW * 0.16, halign: "center" },
      2: { cellWidth: contentW * 0.32 },
      3: { cellWidth: contentW * 0.18 },
      4: { cellWidth: contentW * 0.12, halign: "center" },
    },
    margin: { left: margin, right: margin },
    didDrawPage: () => drawFooter(doc, pageW, pageH),
  })

  // ============ Página: Colaboradores ============
  doc.addPage()
  let y3 = 50
  doc.setTextColor(...C.primaryDark)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(15)
  doc.text("Colaboradores asignados", margin, y3)
  y3 += 10
  autoTable(doc, {
    startY: y3,
    head: [["Nombre", "RUT (protegido)", "Rol", "Lugares", "Matrículas", "Contacto"]],
    body: data.colaboradores.map((c) => [
      c.nombre,
      c.rut,
      c.rol,
      String(c.lugaresAsignados),
      String(c.matriculasGestionadas),
      c.telefono ?? c.email ?? "—",
    ]),
    theme: "striped",
    headStyles: { fillColor: C.headerBg, textColor: C.headerText, fontStyle: "bold", fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: C.dark },
    alternateRowStyles: { fillColor: C.zebra },
    columnStyles: {
      0: { cellWidth: contentW * 0.2, fontStyle: "bold" },
      1: { cellWidth: contentW * 0.18, halign: "center" },
      2: { cellWidth: contentW * 0.13, halign: "center" },
      3: { cellWidth: contentW * 0.1, halign: "center" },
      4: { cellWidth: contentW * 0.13, halign: "center" },
      5: { cellWidth: contentW * 0.26 },
    },
    margin: { left: margin, right: margin },
    didDrawPage: () => drawFooter(doc, pageW, pageH),
  })

  // ============ Página: Matrículas ============
  doc.addPage()
  let y4 = 50
  doc.setTextColor(...C.primaryDark)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(15)
  doc.text("Matrículas recientes", margin, y4)
  y4 += 4
  doc.setFont("helvetica", "italic")
  doc.setFontSize(8.5)
  doc.setTextColor(...C.muted)
  doc.text("RUT enmascarados por protección de datos personales.", margin, y4 + 8)
  y4 += 18
  autoTable(doc, {
    startY: y4,
    head: [["Beneficiario", "RUT", "Lugar", "Colaborador", "Fecha"]],
    body: data.matriculas.slice(0, 40).map((m) => [
      m.nombre,
      m.rut,
      m.lugar ?? "—",
      m.colaborador ?? "Sin asignar",
      m.fecha,
    ]),
    theme: "striped",
    headStyles: { fillColor: C.headerBg, textColor: C.headerText, fontStyle: "bold", fontSize: 9 },
    bodyStyles: { fontSize: 8.5, textColor: C.dark },
    alternateRowStyles: { fillColor: C.zebra },
    columnStyles: {
      0: { cellWidth: contentW * 0.22, fontStyle: "bold" },
      1: { cellWidth: contentW * 0.18, halign: "center" },
      2: { cellWidth: contentW * 0.26 },
      3: { cellWidth: contentW * 0.2 },
      4: { cellWidth: contentW * 0.14 },
    },
    margin: { left: margin, right: margin },
    didDrawPage: () => drawFooter(doc, pageW, pageH),
  })

  // ============ Página: Protección de datos ============
  doc.addPage()
  let y5 = 50
  doc.setTextColor(...C.primaryDark)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(15)
  doc.text("Protección de datos y ciberseguridad", margin, y5)
  y5 += 22
  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.setTextColor(...C.dark)
  const nota =
    "Este documento se ha generado aplicando los siguientes estándares de protección de datos y ciberseguridad, conforme a la Ley N° 19.628 sobre Protección de la Vida Privada:"
  const notaLines = doc.splitTextToSize(nota, contentW)
  doc.text(notaLines, margin, y5)
  y5 += notaLines.length * 14 + 8

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
    // Bullet
    doc.setFillColor(...C.primary)
    doc.circle(margin + 3, y5 - 3, 2, "F")
    doc.text(m, margin + 12, y5)
    y5 += 16
  })

  y5 += 20
  // Caja de contacto
  doc.setFillColor(...C.zebra)
  doc.setDrawColor(...C.primary)
  doc.setLineWidth(1)
  doc.roundedRect(margin, y5, contentW, 70, 6, 6, "FD")
  doc.setTextColor(...C.primaryDark)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.text("Contacto", margin + 16, y5 + 24)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9.5)
  doc.setTextColor(...C.dark)
  doc.text("Dirección de Deportes · Municipalidad de Viña del Mar", margin + 16, y5 + 42)
  doc.setTextColor(...C.accent)
  doc.setFont("helvetica", "bold")
  doc.text("deportes.dideco@munivina.cl", margin + 16, y5 + 58)

  // Pie de página final
  drawFooter(doc, pageW, pageH)

  // Metadatos
  doc.setProperties({
    title: "Informe Gestión Deportiva - Viña del Mar",
    subject: `Informe de playas, piscinas y gimnasios - ${data.periodo}`,
    author: "Municipalidad de Viña del Mar",
    creator: "Sistema de Gestión Deportiva",
    keywords: "Viña del Mar, playas, piscinas, gimnasios, deportes, municipal",
  })

  return Buffer.from(doc.output("arraybuffer"))
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
  doc.text("Informe Gestión Deportiva · Municipalidad de Viña del Mar", 40, pageH - 16)
  doc.text(`Página ${current} de ${pageCount}`, pageW - 40, pageH - 16, { align: "right" })
}
