/**
 * Generador de Excel DASHBOARD (informe diario de colaboradores).
 *
 * Tres hojas:
 *   1. "Resumen del día"    → banda de título + KPIs + tabla de cumplimiento por colaborador.
 *   2. "Registros del día"  → libro mayor (fecha Y hora de cada matrícula).
 *   3. "Lugares asignados"  → matriz colaborador × lugar con dirección.
 *
 * Stack: exceljs. Sin fórmulas dinámicas. Los % se calculan (no formulas) salvo
 * el TOTAL que usa SUM(...) sobre las columnas meta y realizado.
 */
import ExcelJS from "exceljs"
import {
  colorPorCumplimiento,
  estadoCumplimiento,
  flattenLugares,
  flattenRegistros,
  type ResumenDia,
} from "@/lib/resumen-dia"

const C = {
  primary: "0F766E", // teal-700
  primaryDark: "134E4A", // teal-900
  primaryLight: "CCFBF1", // teal-100
  accent: "0369A1", // sky-700
  accentLight: "E0F2FE", // sky-100
  amber: "B45309",
  header: "0F766E",
  headerText: "FFFFFF",
  zebra: "F0FDFA", // teal-50
  zebraAlt: "FFFFFF",
  border: "A7F3D0", // emerald-200
  title: "134E4A",
  muted: "475569",
  kpiLabel: "0F766E",
  total: "115E59",
}

const thin = { style: "thin" as const, color: { argb: "E2E8F0" } }
const borderAll = { top: thin, bottom: thin, left: thin, right: thin }

function headerCell(cell: ExcelJS.Cell) {
  cell.font = { bold: true, color: { argb: C.headerText }, size: 11, name: "Calibri" }
  cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: C.header } }
  cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true }
  cell.border = borderAll
}

function bodyCell(
  cell: ExcelJS.Cell,
  rowIdx: number,
  opts?: { align?: "left" | "center" | "right"; bold?: boolean; color?: string; fill?: string },
) {
  cell.font = {
    size: 10,
    name: "Calibri",
    bold: opts?.bold,
    color: { argb: opts?.color ?? "1F2937" },
  }
  cell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: opts?.fill ?? (rowIdx % 2 === 0 ? C.zebra : C.zebraAlt) },
  }
  cell.alignment = { vertical: "middle", horizontal: opts?.align ?? "left", wrapText: true }
  cell.border = borderAll
}

export async function generateExcel(data: ResumenDia): Promise<Buffer> {
  const wb = new ExcelJS.Workbook()
  wb.creator = "Municipalidad de Viña del Mar"
  wb.created = new Date()
  wb.modified = new Date()
  wb.title = "Informe Diario Colaboradores Deportivos"
  wb.subject = `Informe del día ${data.fechaLabel}`
  wb.description = "Dashboard diario de cumplimiento por colaborador"
  wb.keywords = "Viña del Mar, deportes, colaboradores, informe diario"
  wb.lastModifiedBy = "Dashboard Deportivo Municipal"

  // ============================================================
  // Hoja 1: "Resumen del día" — dashboard principal
  // ============================================================
  const ws1 = wb.addWorksheet("Resumen del día", {
    properties: { defaultColWidth: 22 },
    views: [{ showGridLines: false }],
  })

  // --- Banda de título (fila 1-2 merged) ---
  ws1.mergeCells("A1:G2")
  const titleCell = ws1.getCell("A1")
  titleCell.value = "INFORME DIARIO · COLABORADORES DEPORTIVOS"
  titleCell.font = { bold: true, size: 18, color: { argb: "FFFFFF" }, name: "Calibri" }
  titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: C.primary } }
  titleCell.alignment = { vertical: "middle", horizontal: "center" }
  ws1.getRow(1).height = 26
  ws1.getRow(2).height = 26

  // Sub-banda: fechaLabel + generadoEn
  ws1.mergeCells("A3:G3")
  const subCell = ws1.getCell("A3")
  subCell.value = `${data.fechaLabel}  ·  Generado: ${data.generadoEn}`
  subCell.font = { italic: true, size: 11, color: { argb: C.muted } }
  subCell.alignment = { horizontal: "center", vertical: "middle" }
  ws1.getRow(3).height = 20

  // --- KPI row (fila 5 etiqueta + fila 6 valor) ---
  ws1.mergeCells("A5:G5")
  const kpiTitleCell = ws1.getCell("A5")
  kpiTitleCell.value = "Indicadores del día"
  kpiTitleCell.font = { bold: true, size: 12, color: { argb: C.title }, name: "Calibri" }
  kpiTitleCell.alignment = { horizontal: "left", vertical: "middle" }

  const kpis: Array<{ label: string; value: string | number; color: string }> = [
    { label: "Meta total día", value: data.totalMetaDia, color: C.accent },
    { label: "Realizado total", value: data.totalRealizado, color: C.primary },
    { label: "Cumplimiento global", value: `${data.cumplimientoGlobal}%`, color: C.primary },
    { label: "N° colaboradores", value: data.totalColaboradores, color: C.accent },
    { label: "N° registros", value: data.totalRegistros, color: C.amber },
    { label: "Lugares monitoreados", value: data.totalLugaresMonitoreados, color: C.primary },
    { label: "Prom. registros/colab.", value: data.totalColaboradores ? Number((data.totalRegistros / data.totalColaboradores).toFixed(1)) : 0, color: C.accent },
  ]
  // KPI cards across columns A..G (one per column)
  kpis.forEach((kpi, i) => {
    const col = i + 1
    const labelCell = ws1.getCell(6, col)
    labelCell.value = kpi.label
    labelCell.font = { bold: true, size: 9, color: { argb: "FFFFFF" }, name: "Calibri" }
    labelCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: kpi.color } }
    labelCell.alignment = { horizontal: "center", vertical: "middle", wrapText: true }
    labelCell.border = borderAll

    const valCell = ws1.getCell(7, col)
    valCell.value = kpi.value
    valCell.font = { bold: true, size: 16, color: { argb: kpi.color }, name: "Calibri" }
    valCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: C.accentLight } }
    valCell.alignment = { horizontal: "center", vertical: "middle" }
    valCell.border = borderAll
  })
  ws1.getRow(6).height = 30
  ws1.getRow(7).height = 28

  // --- Tabla principal: "Cumplimiento por colaborador" ---
  ws1.mergeCells("A9:G9")
  const tblTitleCell = ws1.getCell("A9")
  tblTitleCell.value = "Cumplimiento por colaborador"
  tblTitleCell.font = { bold: true, size: 13, color: { argb: C.title }, name: "Calibri" }
  tblTitleCell.alignment = { horizontal: "left", vertical: "middle" }
  ws1.getRow(9).height = 22

  const headers = [
    "Colaborador",
    "Rol",
    "Lugar(es) asignado(s)",
    "Meta día",
    "Realizado",
    "% cumplimiento",
    "Estado",
  ]
  headers.forEach((h, i) => {
    const cell = ws1.getCell(10, i + 1)
    cell.value = h
    headerCell(cell)
  })
  ws1.getRow(10).height = 28

  data.colaboradores.forEach((c, idx) => {
    const r = 11 + idx
    const lugaresStr = c.lugaresAsignados.map((l) => l.nombre).join(", ") || "Sin asignar"
    const est = estadoCumplimiento(c.cumplimiento)
    const colors = colorPorCumplimiento(c.cumplimiento)

    const vals: Array<{ v: string | number; align: "left" | "center"; bold?: boolean; color?: string; fill?: string }> = [
      { v: c.nombre, align: "left", bold: true },
      { v: c.rol, align: "center" },
      { v: lugaresStr, align: "left" },
      { v: c.meta, align: "center" },
      { v: c.realizado, align: "center" },
      { v: `${c.cumplimiento}%`, align: "center", bold: true, color: colors.fg, fill: colors.bg },
      { v: `${est.icon} ${est.label}`, align: "center", color: colors.fg },
    ]
    vals.forEach((val, i) => {
      const cell = ws1.getCell(r, i + 1)
      cell.value = val.v
      bodyCell(cell, idx, { align: val.align, bold: val.bold, color: val.color, fill: val.fill })
    })
    ws1.getRow(r).height = 22
  })

  // --- Fila TOTAL con SUM formulas ---
  const totalRow = 11 + data.colaboradores.length
  ws1.getCell(`A${totalRow}`).value = "TOTAL"
  ws1.getCell(`D${totalRow}`).value = { f: `=SUM(D11:D${totalRow - 1})` }
  ws1.getCell(`E${totalRow}`).value = { f: `=SUM(E11:E${totalRow - 1})` }
  const globalPct =
    data.totalMetaDia > 0 ? Math.round((data.totalRealizado / data.totalMetaDia) * 100) : 0
  const totalColors = colorPorCumplimiento(globalPct)
  ws1.getCell(`F${totalRow}`).value = `${globalPct}%`
  ws1.getCell(`G${totalRow}`).value = estadoCumplimiento(globalPct).icon + " Global"
  bodyCell(ws1.getCell(`A${totalRow}`), data.colaboradores.length, {
    bold: true,
    color: "FFFFFF",
    fill: C.total,
  })
  bodyCell(ws1.getCell(`B${totalRow}`), data.colaboradores.length, {
    align: "center",
    bold: true,
    color: "FFFFFF",
    fill: C.total,
  })
  bodyCell(ws1.getCell(`C${totalRow}`), data.colaboradores.length, {
    bold: true,
    color: "FFFFFF",
    fill: C.total,
  })
  bodyCell(ws1.getCell(`D${totalRow}`), data.colaboradores.length, {
    align: "center",
    bold: true,
    color: "FFFFFF",
    fill: C.total,
  })
  bodyCell(ws1.getCell(`E${totalRow}`), data.colaboradores.length, {
    align: "center",
    bold: true,
    color: "FFFFFF",
    fill: C.total,
  })
  bodyCell(ws1.getCell(`F${totalRow}`), data.colaboradores.length, {
    align: "center",
    bold: true,
    color: totalColors.fg,
    fill: totalColors.bg,
  })
  bodyCell(ws1.getCell(`G${totalRow}`), data.colaboradores.length, {
    align: "center",
    bold: true,
    color: totalColors.fg,
  })
  ws1.getRow(totalRow).height = 24

  // Anchos de columna hoja 1
  const widths1 = [26, 18, 38, 12, 12, 16, 22]
  widths1.forEach((w, i) => (ws1.getColumn(i + 1).width = w))

  // ============================================================
  // Hoja 2: "Registros del día" — libro mayor (fecha + hora)
  // ============================================================
  const ws2 = wb.addWorksheet("Registros del día", {
    views: [{ showGridLines: false, state: "frozen", xSplit: 0, ySplit: 1 }],
  })
  const headers2 = ["Hora", "Fecha", "Beneficiario", "Lugar asignado", "Tipo", "Colaborador", "Rol"]
  headers2.forEach((h, i) => {
    const cell = ws2.getCell(1, i + 1)
    cell.value = h
    headerCell(cell)
  })
  ws2.getRow(1).height = 28

  const registros = flattenRegistros(data)
  registros.forEach((r, idx) => {
    const row = idx + 2
    const vals: Array<{ v: string; align: "left" | "center"; bold?: boolean }> = [
      { v: r.hora, align: "center", bold: true },
      { v: r.fecha, align: "center" },
      { v: r.beneficiario, align: "left", bold: true },
      { v: r.lugar, align: "left" },
      { v: r.tipoLugar, align: "center" },
      { v: r.colaborador, align: "left" },
      { v: r.rol, align: "center" },
    ]
    vals.forEach((val, i) => {
      const cell = ws2.getCell(row, i + 1)
      cell.value = val.v
      bodyCell(cell, idx, { align: val.align, bold: val.bold })
    })
  })
  // Total note row
  const totalRow2 = registros.length + 2
  ws2.getCell(`A${totalRow2}`).value = "TOTAL REGISTROS DEL DÍA"
  ws2.getCell(`B${totalRow2}`).value = registros.length
  bodyCell(ws2.getCell(`A${totalRow2}`), registros.length, {
    bold: true,
    color: "FFFFFF",
    fill: C.total,
  })
  bodyCell(ws2.getCell(`B${totalRow2}`), registros.length, {
    align: "center",
    bold: true,
    color: "FFFFFF",
    fill: C.total,
  })
  for (let i = 3; i <= 7; i++) {
    bodyCell(ws2.getCell(totalRow2, i), registros.length, {
      bold: true,
      color: "FFFFFF",
      fill: C.total,
    })
  }
  ws2.getColumn(1).width = 10
  ws2.getColumn(2).width = 14
  ws2.getColumn(3).width = 26
  ws2.getColumn(4).width = 32
  ws2.getColumn(5).width = 20
  ws2.getColumn(6).width = 24
  ws2.getColumn(7).width = 16

  // ============================================================
  // Hoja 3: "Lugares asignados"
  // ============================================================
  const ws3 = wb.addWorksheet("Lugares asignados", {
    views: [{ showGridLines: false, state: "frozen", xSplit: 0, ySplit: 1 }],
  })
  const headers3 = ["Colaborador", "Rol", "Lugar", "Tipo", "Dirección", "Comuna"]
  headers3.forEach((h, i) => {
    const cell = ws3.getCell(1, i + 1)
    cell.value = h
    headerCell(cell)
  })
  ws3.getRow(1).height = 28

  const lugares = flattenLugares(data)
  lugares.forEach((l, idx) => {
    const row = idx + 2
    const vals: Array<{ v: string; align: "left" | "center"; bold?: boolean }> = [
      { v: l.colaborador, align: "left", bold: true },
      { v: l.rol, align: "center" },
      { v: l.lugar, align: "left" },
      { v: l.tipo, align: "center" },
      { v: l.direccion, align: "left" },
      { v: l.comuna, align: "center" },
    ]
    vals.forEach((val, i) => {
      const cell = ws3.getCell(row, i + 1)
      cell.value = val.v
      bodyCell(cell, idx, { align: val.align, bold: val.bold })
    })
  })
  ws3.getColumn(1).width = 26
  ws3.getColumn(2).width = 18
  ws3.getColumn(3).width = 30
  ws3.getColumn(4).width = 22
  ws3.getColumn(5).width = 36
  ws3.getColumn(6).width = 18

  const buf = await wb.xlsx.writeBuffer()
  return Buffer.from(buf)
}
