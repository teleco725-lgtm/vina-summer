/**
 * Generador de Excel profesional con exceljs.
 * Aplica principios del skill xlsx: fórmulas vivas, cero errores, estilos consistentes,
 * tablas con encabezados, paleta coherente, sin funciones dinámicas.
 */
import ExcelJS from "exceljs"
import type { ReportData } from "./report-data"

// Paleta — sobria, amigable, coherente con el dashboard (sky/teal/emerald)
const C = {
  primary: "0F766E", // teal-700
  primaryLight: "CCFBF1", // teal-100
  accent: "0369A1", // sky-700
  accentLight: "E0F2FE", // sky-100
  amber: "B45309", // amber-700
  amberLight: "FEF3C7", // amber-100
  header: "0F766E",
  headerText: "FFFFFF",
  zebra: "F0FDFA", // teal-50
  border: "A7F3D0", // emerald-200
  title: "134E4A", // teal-900
  muted: "475569", // slate-600
}

function applyHeaderStyle(cell: ExcelJS.Cell) {
  cell.font = { bold: true, color: { argb: C.headerText }, size: 11, name: "Calibri" }
  cell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: C.header },
  }
  cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true }
  cell.border = {
    top: { style: "thin", color: { argb: C.border } },
    bottom: { style: "thin", color: { argb: C.border } },
    left: { style: "thin", color: { argb: C.border } },
    right: { style: "thin", color: { argb: C.border } },
  }
}

function applyBodyStyle(cell: ExcelJS.Cell, rowIdx: number, opts?: { align?: "left" | "center" | "right"; bold?: boolean }) {
  cell.font = { size: 10, name: "Calibri", bold: opts?.bold, color: { argb: "1F2937" } }
  if (rowIdx % 2 === 0) {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: C.zebra } }
  }
  cell.alignment = { vertical: "middle", horizontal: opts?.align ?? "left", wrapText: true }
  cell.border = {
    top: { style: "thin", color: { argb: "E2E8F0" } },
    bottom: { style: "thin", color: { argb: "E2E8F0" } },
    left: { style: "thin", color: { argb: "E2E8F0" } },
    right: { style: "thin", color: { argb: "E2E8F0" } },
  }
}

function setTitleRow(ws: ExcelJS.Worksheet, row: number, text: string, color = C.title) {
  ws.mergeCells(`A${row}:H${row}`)
  const cell = ws.getCell(`A${row}`)
  cell.value = text
  cell.font = { bold: true, size: 14, name: "Calibri", color: { argb: color } }
  cell.alignment = { horizontal: "left", vertical: "middle" }
}

export async function generateExcel(data: ReportData): Promise<Buffer> {
  const wb = new ExcelJS.Workbook()
  wb.creator = "Municipalidad de Viña del Mar"
  wb.created = new Date()

  // ============ Hoja 1: Resumen ============
  const ws1 = wb.addWorksheet("Resumen", {
    properties: { defaultColWidth: 22 },
    views: [{ showGridLines: false }],
  })

  // Banda de título
  ws1.mergeCells("A1:H2")
  const titleCell = ws1.getCell("A1")
  titleCell.value = "INFORME MUNICIPAL · PLAYAS, PISCINAS Y GIMNASIOS"
  titleCell.font = { bold: true, size: 16, color: { argb: "FFFFFF" }, name: "Calibri" }
  titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: C.primary } }
  titleCell.alignment = { vertical: "middle", horizontal: "center" }
  ws1.getRow(1).height = 24
  ws1.getRow(2).height = 24

  ws1.mergeCells("A3:H3")
  const subCell = ws1.getCell("A3")
  subCell.value = `Municipalidad de Viña del Mar · ${data.generadoEn}`
  subCell.font = { italic: true, size: 11, color: { argb: C.muted } }
  subCell.alignment = { horizontal: "center" }

  // Tarjetas de KPIs
  setTitleRow(ws1, 5, "Resumen ejecutivo")
  const kpis = [
    ["Total de lugares", data.resumen.totalLugares],
    ["Playas", data.resumen.playas],
    ["Piscinas municipales", data.resumen.piscinas],
    ["Gimnasios con piscina", data.resumen.gimnasios],
    ["Colaboradores activos", data.resumen.totalColaboradores],
    ["Matrículas registradas", data.resumen.totalMatriculas],
  ]
  kpis.forEach(([label, val], i) => {
    const r = 7 + i
    ws1.getCell(`A${r}`).value = label
    ws1.getCell(`B${r}`).value = val
    applyBodyStyle(ws1.getCell(`A${r}`), i, { bold: true })
    applyBodyStyle(ws1.getCell(`B${r}`), i, { align: "center", bold: true })
    ws1.getCell(`B${r}`).font = { ...ws1.getCell(`B${r}`).font, color: { argb: C.accent } }
  })

  // Distribución por tipo
  setTitleRow(ws1, 15, "Distribución por tipo de lugar")
  ws1.getCell("A17").value = "Tipo"
  ws1.getCell("B17").value = "Cantidad"
  ws1.getCell("C17").value = "Porcentaje"
  applyHeaderStyle(ws1.getCell("A17"))
  applyHeaderStyle(ws1.getCell("B17"))
  applyHeaderStyle(ws1.getCell("C17"))
  const totalLugares = data.resumen.totalLugares || 1
  data.porTipo.forEach((p, i) => {
    const r = 18 + i
    ws1.getCell(`A${r}`).value = p.label
    ws1.getCell(`B${r}`).value = p.count
    // Fórmula viva para el porcentaje
    ws1.getCell(`C${r}`).value = { f: `=B${r}/${totalLugares}` }
    ws1.getCell(`C${r}`).numFmt = "0.0%"
    applyBodyStyle(ws1.getCell(`A${r}`), i)
    applyBodyStyle(ws1.getCell(`B${r}`), i, { align: "center" })
    applyBodyStyle(ws1.getCell(`C${r}`), i, { align: "center" })
  })
  // Total
  const totalRow = 18 + data.porTipo.length
  ws1.getCell(`A${totalRow}`).value = "TOTAL"
  ws1.getCell(`B${totalRow}`).value = { f: `=SUM(B18:B${totalRow - 1})` }
  ws1.getCell(`C${totalRow}`).value = { f: `=SUM(C18:C${totalRow - 1})` }
  ws1.getCell(`C${totalRow}`).numFmt = "0.0%"
  applyBodyStyle(ws1.getCell(`A${totalRow}`), data.porTipo.length, { bold: true })
  applyBodyStyle(ws1.getCell(`B${totalRow}`), data.porTipo.length, { align: "center", bold: true })
  applyBodyStyle(ws1.getCell(`C${totalRow}`), data.porTipo.length, { align: "center", bold: true })

  // Top lugares
  setTitleRow(ws1, totalRow + 3, "Lugares con mayor número de matrículas")
  const topHeaderRow = totalRow + 4
  ws1.getCell(`A${topHeaderRow}`).value = "Lugar"
  ws1.getCell(`B${topHeaderRow}`).value = "Tipo"
  ws1.getCell(`C${topHeaderRow}`).value = "Matrículas"
  applyHeaderStyle(ws1.getCell(`A${topHeaderRow}`))
  applyHeaderStyle(ws1.getCell(`B${topHeaderRow}`))
  applyHeaderStyle(ws1.getCell(`C${topHeaderRow}`))
  data.topLugares.forEach((l, i) => {
    const r = topHeaderRow + 1 + i
    ws1.getCell(`A${r}`).value = l.nombre
    ws1.getCell(`B${r}`).value = l.tipo
    ws1.getCell(`C${r}`).value = l.matriculas
    applyBodyStyle(ws1.getCell(`A${r}`), i)
    applyBodyStyle(ws1.getCell(`B${r}`), i, { align: "center" })
    applyBodyStyle(ws1.getCell(`C${r}`), i, { align: "center" })
  })

  ws1.getColumn(1).width = 34
  ws1.getColumn(2).width = 22
  ws1.getColumn(3).width = 16

  // ============ Hoja 2: Lugares ============
  const ws2 = wb.addWorksheet("Lugares", {
    views: [{ showGridLines: false, state: "frozen", xSplit: 0, ySplit: 1 }],
  })
  const headers2 = [
    "Nombre", "Tipo", "Dirección", "Comuna", "Latitud", "Longitud", "Horario", "Aforo", "Matrículas", "Colaboradores",
  ]
  headers2.forEach((h, i) => {
    const cell = ws2.getCell(1, i + 1)
    cell.value = h
    applyHeaderStyle(cell)
  })
  ws2.getRow(1).height = 28
  data.lugares.forEach((l, idx) => {
    const r = idx + 2
    const vals = [
      l.nombre, l.tipoLabel, l.direccion, l.comuna, l.lat, l.lng,
      l.horario ?? "—", l.aforo ?? "—", l.matriculas, l.colaboradores.join(", ") || "Sin asignar",
    ]
    vals.forEach((v, i) => {
      const cell = ws2.getCell(r, i + 1)
      cell.value = v
      applyBodyStyle(cell, idx, { align: i >= 4 && i <= 7 ? "center" : "left" })
    })
  })
  const colWidths2 = [28, 20, 34, 16, 12, 12, 28, 12, 12, 34]
  colWidths2.forEach((w, i) => (ws2.getColumn(i + 1).width = w))

  // ============ Hoja 3: Colaboradores ============
  const ws3 = wb.addWorksheet("Colaboradores", {
    views: [{ showGridLines: false, state: "frozen", ySplit: 1 }],
  })
  const headers3 = ["Nombre", "RUT (protegido)", "Rol", "Teléfono", "Email", "Lugares asignados", "Matrículas gestionadas"]
  headers3.forEach((h, i) => {
    const cell = ws3.getCell(1, i + 1)
    cell.value = h
    applyHeaderStyle(cell)
  })
  ws3.getRow(1).height = 28
  data.colaboradores.forEach((c, idx) => {
    const r = idx + 2
    const vals = [c.nombre, c.rut, c.rol, c.telefono ?? "—", c.email ?? "—", c.lugaresAsignados, c.matriculasGestionadas]
    vals.forEach((v, i) => {
      const cell = ws3.getCell(r, i + 1)
      cell.value = v
      applyBodyStyle(cell, idx, { align: i >= 5 ? "center" : "left" })
    })
  })
  // Total con fórmula
  const totalRow3 = data.colaboradores.length + 2
  ws3.getCell(`A${totalRow3}`).value = "TOTAL"
  ws3.getCell(`F${totalRow3}`).value = { f: `=SUM(F2:F${totalRow3 - 1})` }
  ws3.getCell(`G${totalRow3}`).value = { f: `=SUM(G2:G${totalRow3 - 1})` }
  applyBodyStyle(ws3.getCell(`A${totalRow3}`), data.colaboradores.length, { bold: true })
  applyBodyStyle(ws3.getCell(`F${totalRow3}`), data.colaboradores.length, { align: "center", bold: true })
  applyBodyStyle(ws3.getCell(`G${totalRow3}`), data.colaboradores.length, { align: "center", bold: true })
  const colWidths3 = [26, 20, 16, 18, 30, 18, 22]
  colWidths3.forEach((w, i) => (ws3.getColumn(i + 1).width = w))

  // ============ Hoja 4: Matrículas ============
  const ws4 = wb.addWorksheet("Matrículas", {
    views: [{ showGridLines: false, state: "frozen", ySplit: 1 }],
  })
  const headers4 = ["Beneficiario", "RUT (protegido)", "Comuna", "Dirección", "Lugar", "Tipo", "Colaborador", "Fecha"]
  headers4.forEach((h, i) => {
    const cell = ws4.getCell(1, i + 1)
    cell.value = h
    applyHeaderStyle(cell)
  })
  ws4.getRow(1).height = 28
  data.matriculas.forEach((m, idx) => {
    const r = idx + 2
    const vals = [m.nombre, m.rut, m.comuna, m.direccion, m.lugar ?? "—", m.tipoLugar ?? "—", m.colaborador ?? "Sin asignar", m.fecha]
    vals.forEach((v, i) => {
      const cell = ws4.getCell(r, i + 1)
      cell.value = v
      applyBodyStyle(cell, idx)
    })
  })
  const colWidths4 = [24, 20, 16, 30, 28, 18, 24, 22]
  colWidths4.forEach((w, i) => (ws4.getColumn(i + 1).width = w))

  const buf = await wb.xlsx.writeBuffer()
  return Buffer.from(buf)
}
