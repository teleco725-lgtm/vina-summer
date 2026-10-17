/**
 * Generador de PowerPoint (.pptx) — Informe diario dashboard de colaboradores.
 * Usa pptxgenjs v4 (TableRow = TableCell[]).
 * Slides dinámicos:
 *   1. Portada
 *   2. KPIs globales
 *   3. Cumplimiento por colaborador (meta vs realizado)
 *   4. Registros del día (con hora y fecha)
 *   5. Lugares asignados + nota de protección de datos
 */
import pptxgen from "pptxgenjs"
import type { ResumenDia } from "@/lib/resumen-dia"

const C = {
  primary: "0F766E",
  primaryDark: "134E4A",
  accent: "0369A1",
  amber: "B45309",
  emerald: "059669",
  red: "DC2626",
  yellow: "CA8A04",
  green: "16A34A",
  bg: "F8FAFB",
  card: "FFFFFF",
  text: "1F2937",
  muted: "64748B",
  border: "E2E8F0",
  white: "FFFFFF",
  lightTeal: "CCFBF1",
  lightSky: "E0F2FE",
  lightAmber: "FEF3C7",
  lightEmerald: "D1FAE5",
  lightRed: "FEE2E2",
}

function colorCumplimiento(p: number): string {
  if (p >= 100) return C.green
  if (p >= 50) return C.yellow
  return C.red
}

type Cell = pptxgen.Cell
type Row = Cell[]

function headerCell(text: string, align: "left" | "center" = "left"): Cell {
  return {
    text,
    options: {
      color: C.white, bold: true, fontSize: 11, align, valign: "middle",
      fill: { color: C.primary }, margin: [0, 6, 0, 8],
    },
  }
}

function bodyCell(text: string, zebra: boolean, opts?: { bold?: boolean; color?: string; align?: "left" | "center"; fontSize?: number }): Cell {
  return {
    text,
    options: {
      color: opts?.color ?? C.text,
      bold: opts?.bold,
      fontSize: opts?.fontSize ?? 11,
      align: opts?.align ?? "left",
      valign: "middle",
      fill: { color: zebra ? C.lightTeal : C.white },
      margin: [0, 4, 0, 8],
    },
  }
}

export async function generatePptx(data: ResumenDia): Promise<Buffer> {
  const pptx = new pptxgen()
  pptx.layout = "LAYOUT_WIDE" // 13.333 x 7.5 inches
  pptx.author = "Municipalidad de Viña del Mar"
  pptx.title = "Informe Diario de Colaboradores Deportivos"
  pptx.subject = `Informe del día — ${data.fechaLabel}`

  const W = 13.333

  // ============ Slide 1: Portada ============
  const s1 = pptx.addSlide()
  s1.background = { color: C.bg }
  s1.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: W, h: 4.2, fill: { color: C.primary } })
  s1.addShape(pptx.ShapeType.rect, { x: 0, y: 4.0, w: W, h: 0.3, fill: { color: C.primaryDark } })
  s1.addText("MUNICIPALIDAD DE VIÑA DEL MAR · DIDECO", {
    x: 0.8, y: 0.6, w: 11, h: 0.4,
    fontFace: "Calibri", fontSize: 14, bold: true, color: C.lightTeal, align: "left",
  })
  s1.addText("Informe Diario de\nColaboradores Deportivos", {
    x: 0.8, y: 1.3, w: 11.5, h: 1.8,
    fontFace: "Calibri", fontSize: 44, bold: true, color: C.white, align: "left", lineSpacingMultiple: 1,
  })
  s1.addText("Playas, piscinas municipales y gimnasios con piscina", {
    x: 0.8, y: 3.1, w: 11, h: 0.5,
    fontFace: "Calibri", fontSize: 18, color: C.lightSky, align: "left",
  })
  s1.addText(data.fechaLabel, {
    x: 0.8, y: 4.6, w: 11.5, h: 0.6,
    fontFace: "Calibri", fontSize: 22, bold: true, color: C.primary, align: "left",
  })
  s1.addText(`Generado: ${data.generadoEn}`, {
    x: 0.8, y: 5.2, w: 11.5, h: 0.4,
    fontFace: "Calibri", fontSize: 13, color: C.muted, align: "left",
  })
  const kpiPortada = [
    { label: "Colaboradores", value: String(data.totalColaboradores) },
    { label: "Registros del día", value: String(data.totalRegistros) },
    { label: "Cumplimiento", value: `${data.cumplimientoGlobal}%` },
    { label: "Lugares monitoreados", value: String(data.totalLugaresMonitoreados) },
  ]
  const kpiW = 2.7
  kpiPortada.forEach((k, i) => {
    const x = 0.8 + i * (kpiW + 0.2)
    s1.addShape(pptx.ShapeType.roundRect, { x, y: 6.0, w: kpiW, h: 1.1, fill: { color: C.card }, line: { color: C.border, width: 1 }, rectRadius: 0.1 })
    s1.addText(k.value, { x, y: 6.1, w: kpiW, h: 0.55, fontFace: "Calibri", fontSize: 28, bold: true, color: C.primary, align: "center" })
    s1.addText(k.label.toUpperCase(), { x, y: 6.65, w: kpiW, h: 0.35, fontFace: "Calibri", fontSize: 10, color: C.muted, align: "center" })
  })

  // ============ Slide 2: KPIs globales del día ============
  const s2 = pptx.addSlide()
  s2.background = { color: C.bg }
  s2.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: W, h: 1.2, fill: { color: C.primary } })
  s2.addText("Resumen del día", { x: 0.8, y: 0.25, w: 11, h: 0.5, fontFace: "Calibri", fontSize: 26, bold: true, color: C.white })
  s2.addText(data.fechaLabel, { x: 0.8, y: 0.75, w: 11, h: 0.3, fontFace: "Calibri", fontSize: 12, color: C.lightTeal })

  const kpis2 = [
    { label: "Meta total del día", value: String(data.totalMetaDia), color: C.accent },
    { label: "Registros realizados", value: String(data.totalRealizado), color: C.primary },
    { label: "Cumplimiento global", value: `${data.cumplimientoGlobal}%`, color: colorCumplimiento(data.cumplimientoGlobal) },
    { label: "Colaboradores activos", value: String(data.totalColaboradores), color: C.amber },
    { label: "Lugares monitoreados", value: String(data.totalLugaresMonitoreados), color: C.primary },
    { label: "Estado meta", value: data.totalRealizado >= data.totalMetaDia ? "✓ Alcanzada" : "En progreso", color: data.totalRealizado >= data.totalMetaDia ? C.green : C.yellow },
  ]
  const cardW = 3.7
  const cardH = 1.8
  kpis2.forEach((k, i) => {
    const col = i % 3
    const row = Math.floor(i / 3)
    const x = 0.8 + col * (cardW + 0.25)
    const y = 1.7 + row * (cardH + 0.25)
    s2.addShape(pptx.ShapeType.roundRect, { x, y, w: cardW, h: cardH, fill: { color: C.card }, line: { color: C.border, width: 1 }, rectRadius: 0.08 })
    s2.addShape(pptx.ShapeType.rect, { x, y, w: 0.12, h: cardH, fill: { color: k.color } })
    s2.addText(k.value, { x: x + 0.3, y: y + 0.25, w: cardW - 0.5, h: 0.7, fontFace: "Calibri", fontSize: 34, bold: true, color: k.color, align: "left" })
    s2.addText(k.label.toUpperCase(), { x: x + 0.3, y: y + 1.0, w: cardW - 0.5, h: 0.35, fontFace: "Calibri", fontSize: 11, color: C.muted, align: "left" })
  })
  s2.addText("Datos consolidados del día · Información protegida (RUT enmascarados)", {
    x: 0.8, y: 6.9, w: 11.5, h: 0.4, fontFace: "Calibri", fontSize: 11, italic: true, color: C.muted, align: "left",
  })

  // ============ Slide 3: Cumplimiento por colaborador ============
  const s3 = pptx.addSlide()
  s3.background = { color: C.bg }
  s3.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: W, h: 1.2, fill: { color: C.primary } })
  s3.addText("Cumplimiento por colaborador", { x: 0.8, y: 0.25, w: 11, h: 0.5, fontFace: "Calibri", fontSize: 26, bold: true, color: C.white })
  s3.addText("Meta versus realizado del día", { x: 0.8, y: 0.75, w: 11, h: 0.3, fontFace: "Calibri", fontSize: 12, color: C.lightTeal })

  const headerRow3: Row = [
    headerCell("Colaborador"),
    headerCell("Rol"),
    headerCell("Lugar asignado"),
    headerCell("Meta", "center"),
    headerCell("Realizado", "center"),
    headerCell("%", "center"),
    headerCell("Estado", "center"),
  ]

  const bodyRows3: Row[] = data.colaboradores.map((c, i) => {
    const pct = c.cumplimiento
    const estado = pct >= 100 ? "✓ OK" : pct >= 50 ? "⚠ Prog" : "✗ Bajo"
    const lugarTxt = c.lugaresAsignados.slice(0, 2).map((l) => l.nombre).join(", ") + (c.lugaresAsignados.length > 2 ? ` +${c.lugaresAsignados.length - 2}` : "")
    const z = i % 2 === 0
    const pctColor = colorCumplimiento(pct)
    return [
      bodyCell(c.nombre, z, { bold: true }),
      bodyCell(c.rol, z, { color: C.muted, fontSize: 10 }),
      bodyCell(lugarTxt || "—", z, { fontSize: 10 }),
      bodyCell(String(c.meta), z, { bold: true, align: "center" }),
      bodyCell(String(c.realizado), z, { bold: true, align: "center" }),
      bodyCell(`${pct}%`, z, { bold: true, color: pctColor, align: "center" }),
      bodyCell(estado, z, { bold: true, color: pctColor, align: "center", fontSize: 10 }),
    ]
  })

  const totalRow3: Row = [
    { text: "TOTAL", options: { color: C.white, bold: true, fontSize: 12, align: "left", valign: "middle", fill: { color: C.primaryDark }, margin: [0, 6, 0, 8] } },
    { text: "", options: { fill: { color: C.primaryDark } } },
    { text: "", options: { fill: { color: C.primaryDark } } },
    { text: String(data.totalMetaDia), options: { color: C.white, bold: true, fontSize: 12, align: "center", valign: "middle", fill: { color: C.primaryDark } } },
    { text: String(data.totalRealizado), options: { color: C.white, bold: true, fontSize: 12, align: "center", valign: "middle", fill: { color: C.primaryDark } } },
    { text: `${data.cumplimientoGlobal}%`, options: { color: C.white, bold: true, fontSize: 12, align: "center", valign: "middle", fill: { color: C.primaryDark } } },
    { text: "", options: { fill: { color: C.primaryDark } } },
  ]

  s3.addTable([headerRow3, ...bodyRows3, totalRow3], {
    x: 0.5, y: 1.5, w: 12.3,
    colW: [2.3, 1.5, 3.5, 1.0, 1.3, 1.0, 1.7],
    border: { type: "solid", color: C.border, pt: 1 },
    rowH: 0.5,
    fontFace: "Calibri",
    autoPage: false,
  })

  // ============ Slide 4: Registros del día ============
  const s4 = pptx.addSlide()
  s4.background = { color: C.bg }
  s4.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: W, h: 1.2, fill: { color: C.primary } })
  s4.addText("Registros capturados del día", { x: 0.8, y: 0.25, w: 11, h: 0.5, fontFace: "Calibri", fontSize: 26, bold: true, color: C.white })
  s4.addText(`Total: ${data.totalRegistros} registros · con fecha y hora`, { x: 0.8, y: 0.75, w: 11, h: 0.3, fontFace: "Calibri", fontSize: 12, color: C.lightTeal })

  const todosRegistros = data.colaboradores
    .flatMap((c) => c.registros.map((r) => ({ ...r, colaborador: c.nombre })))
    .sort((a, b) => a.hora.localeCompare(b.hora))
    .slice(0, 12)

  if (todosRegistros.length === 0) {
    s4.addText("Sin registros capturados el día de hoy.", {
      x: 1, y: 3, w: 11, h: 1, fontFace: "Calibri", fontSize: 18, color: C.muted, align: "center",
    })
  } else {
    const headerRow4: Row = [
      headerCell("Hora", "center"),
      headerCell("Fecha", "center"),
      headerCell("Beneficiario"),
      headerCell("Lugar asignado"),
      headerCell("Tipo"),
      headerCell("Colaborador"),
    ]
    const bodyRows4: Row[] = todosRegistros.map((r, i) => {
      const z = i % 2 === 0
      return [
        bodyCell(r.hora, z, { bold: true, color: C.primary, align: "center" }),
        bodyCell(r.fecha, z, { color: C.muted, fontSize: 10, align: "center" }),
        bodyCell(r.beneficiario, z, { bold: true }),
        bodyCell(r.lugar, z, { fontSize: 10 }),
        bodyCell(r.tipoLugar, z, { color: C.muted, fontSize: 10 }),
        bodyCell(r.colaborador, z, { fontSize: 10 }),
      ]
    })
    s4.addTable([headerRow4, ...bodyRows4], {
      x: 0.5, y: 1.5, w: 12.3,
      colW: [1.1, 1.4, 2.6, 3.2, 1.8, 2.2],
      border: { type: "solid", color: C.border, pt: 1 },
      rowH: 0.4,
      fontFace: "Calibri",
      autoPage: false,
    })
    if (data.totalRegistros > 12) {
      s4.addText(`Mostrando 12 de ${data.totalRegistros} registros. Descargue Excel para ver el detalle completo.`, {
        x: 0.8, y: 6.9, w: 11.5, h: 0.4, fontFace: "Calibri", fontSize: 11, italic: true, color: C.muted, align: "left",
      })
    }
  }

  // ============ Slide 5: Lugares asignados + protección de datos ============
  const s5 = pptx.addSlide()
  s5.background = { color: C.bg }
  s5.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: W, h: 1.2, fill: { color: C.primary } })
  s5.addText("Lugares asignados y protección de datos", { x: 0.8, y: 0.25, w: 11, h: 0.5, fontFace: "Calibri", fontSize: 26, bold: true, color: C.white })
  s5.addText("Asignaciones del día por colaborador", { x: 0.8, y: 0.75, w: 11, h: 0.3, fontFace: "Calibri", fontSize: 12, color: C.lightTeal })

  const lugaresFlat = data.colaboradores
    .flatMap((c) => c.lugaresAsignados.map((l) => ({ colaborador: c.nombre, lugar: l.nombre, tipo: l.tipoLabel, direccion: `${l.direccion}, ${l.comuna}` })))
    .slice(0, 10)

  if (lugaresFlat.length > 0) {
    const headerRow5: Row = [
      headerCell("Colaborador"),
      headerCell("Lugar"),
      headerCell("Tipo"),
      headerCell("Dirección"),
    ]
    const bodyRows5: Row[] = lugaresFlat.map((l, i) => {
      const z = i % 2 === 0
      return [
        bodyCell(l.colaborador, z, { bold: true }),
        bodyCell(l.lugar, z, { fontSize: 10 }),
        bodyCell(l.tipo, z, { color: C.muted, fontSize: 10 }),
        bodyCell(l.direccion, z, { color: C.muted, fontSize: 10 }),
      ]
    })
    s5.addTable([headerRow5, ...bodyRows5], {
      x: 0.5, y: 1.5, w: 12.3,
      colW: [2.5, 3.5, 2.0, 4.3],
      border: { type: "solid", color: C.border, pt: 1 },
      rowH: 0.4,
      fontFace: "Calibri",
      autoPage: false,
    })
  }

  // Caja de protección de datos
  s5.addShape(pptx.ShapeType.roundRect, { x: 0.5, y: 6.0, w: 12.3, h: 1.1, fill: { color: C.lightEmerald }, line: { color: C.emerald, width: 1 }, rectRadius: 0.08 })
  s5.addText("🛡️ Protección de datos y ciberseguridad", { x: 0.8, y: 6.1, w: 11.5, h: 0.4, fontFace: "Calibri", fontSize: 13, bold: true, color: C.primaryDark, align: "left" })
  s5.addText("RUT enmascarados · Validación de identidad (módulo 11) · Firma de integridad · Cabeceras HTTP de seguridad (CSP, HSTS, X-Frame-Options).", {
    x: 0.8, y: 6.5, w: 11.5, h: 0.4, fontFace: "Calibri", fontSize: 10, color: C.text, align: "left",
  })
  s5.addText("Contacto: deportes.dideco@munivina.cl", { x: 0.8, y: 6.8, w: 11.5, h: 0.3, fontFace: "Calibri", fontSize: 10, bold: true, color: C.accent, align: "left" })

  const result = (await pptx.write({ outputType: "nodebuffer" })) as Buffer
  return Buffer.from(result)
}
