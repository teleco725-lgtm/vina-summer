/**
 * Shared server-side data fetcher for the "Resumen del día" report.
 *
 * This is the SINGLE SOURCE OF TRUTH consumed by:
 *   - the API route /api/resumen-dia (GET)
 *   - the report generators (Excel / Word / PDF) at src/lib/report-*.ts
 *   - the email attachment pipeline at /api/email
 *
 * Mirrors the original /api/resumen-dia query (rango "día" en tz local,
 * includes lugares + matrículas del día) and EXTENDS `lugaresAsignados`
 * with `direccion` and `comuna` so the report generators can render the
 * "Lugares asignados" sheet/table without a second prisma query.
 */
import { db } from "@/lib/db"
import { TIPO_LABELS, type TipoLugar } from "@/lib/security"

export type ResumenLugarAsignado = {
  id: string
  nombre: string
  tipo: TipoLugar
  tipoLabel: string
  direccion: string
  comuna: string
}

export type ResumenRegistro = {
  id: string
  beneficiario: string
  lugar: string
  tipoLugar: string
  hora: string // "HH:MM" (24h, es-CL)
  fecha: string // "DD-MM-YYYY" (es-CL)
}

export type ResumenColaborador = {
  id: string
  nombre: string
  rol: string
  meta: number
  realizado: number
  cumplimiento: number // %
  lugaresAsignados: ResumenLugarAsignado[]
  registros: ResumenRegistro[]
}

export type ResumenDia = {
  fecha: string // ISO
  fechaLabel: string // "lunes, 17 de octubre de 2025"
  generadoEn: string // local formatted timestamp of report generation
  totalMetaDia: number
  totalRealizado: number
  cumplimientoGlobal: number // %
  totalColaboradores: number
  totalRegistros: number
  totalLugaresMonitoreados: number
  colaboradores: ResumenColaborador[]
}

/**
 * Fetch the daily dashboard summary.
 * @param fecha Optional ISO date string "YYYY-MM-DD". Defaults to today (tz local).
 */
export async function getResumenDia(fecha?: string): Promise<ResumenDia> {
  const hoy = fecha ? new Date(fecha + "T00:00:00") : new Date()
  const inicio = new Date(hoy)
  inicio.setHours(0, 0, 0, 0)
  const fin = new Date(hoy)
  fin.setHours(23, 59, 59, 999)

  const colaboradores = await db.colaborador.findMany({
    where: { activo: true },
    orderBy: { nombre: "asc" },
    include: {
      lugares: { include: { lugar: true } },
      matriculas: {
        where: { createdAt: { gte: inicio, lte: fin } },
        orderBy: { createdAt: "asc" },
        include: { lugar: true },
      },
    },
  })

  const totalMetaDia = colaboradores.reduce((s, c) => s + (c.metaDiaria ?? 0), 0)
  const totalRealizado = colaboradores.reduce((s, c) => s + c.matriculas.length, 0)

  const items: ResumenColaborador[] = colaboradores.map((c) => {
    const realizado = c.matriculas.length
    const meta = c.metaDiaria ?? 0
    const cumplimiento = meta > 0 ? Math.round((realizado / meta) * 100) : 0
    const lugaresAsignados: ResumenLugarAsignado[] = c.lugares.map((l) => ({
      id: l.lugar.id,
      nombre: l.lugar.nombre,
      tipo: l.lugar.tipo as TipoLugar,
      tipoLabel: TIPO_LABELS[l.lugar.tipo as TipoLugar],
      direccion: l.lugar.direccion,
      comuna: l.lugar.comuna,
    }))
    const registros: ResumenRegistro[] = c.matriculas.map((m) => ({
      id: m.id,
      beneficiario: m.nombre,
      lugar: m.lugar?.nombre ?? "—",
      tipoLugar: m.lugar ? TIPO_LABELS[m.lugar.tipo as TipoLugar] : "—",
      hora: m.createdAt.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" }),
      fecha: m.createdAt.toLocaleDateString("es-CL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
    }))
    return {
      id: c.id,
      nombre: c.nombre,
      rol: c.rol,
      meta,
      realizado,
      cumplimiento,
      lugaresAsignados,
      registros,
    }
  })

  // Unique lugares count across colaboradores (for "lugares monitoreados" KPI)
  const lugaresSet = new Set<string>()
  items.forEach((c) => c.lugaresAsignados.forEach((l) => lugaresSet.add(l.id)))

  return {
    fecha: inicio.toISOString(),
    fechaLabel: inicio.toLocaleDateString("es-CL", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    generadoEn: new Date().toLocaleString("es-CL", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    totalMetaDia,
    totalRealizado,
    cumplimientoGlobal:
      totalMetaDia > 0 ? Math.round((totalRealizado / totalMetaDia) * 100) : 0,
    totalColaboradores: items.length,
    totalRegistros: totalRealizado,
    totalLugaresMonitoreados: lugaresSet.size,
    colaboradores: items,
  }
}

/**
 * Flatten all colaborador.registros into a single sorted ledger.
 * Sorted by hora asc ("HH:MM" lexicographic sort works for 24h zero-padded).
 * Each row carries the colaborador nombre + rol for display.
 */
export type RegistroLedger = ResumenRegistro & {
  colaborador: string
  rol: string
}

export function flattenRegistros(data: ResumenDia): RegistroLedger[] {
  const rows: RegistroLedger[] = []
  for (const c of data.colaboradores) {
    for (const r of c.registros) {
      rows.push({ ...r, colaborador: c.nombre, rol: c.rol })
    }
  }
  rows.sort((a, b) => {
    if (a.hora !== b.hora) return a.hora < b.hora ? -1 : 1
    return a.colaborador.localeCompare(b.colaborador)
  })
  return rows
}

/**
 * Flatten (colaborador, lugar) pairs for the "Lugares asignados" sheet.
 */
export type LugarAsignadoRow = {
  colaborador: string
  rol: string
  lugar: string
  tipo: string
  direccion: string
  comuna: string
}

export function flattenLugares(data: ResumenDia): LugarAsignadoRow[] {
  const rows: LugarAsignadoRow[] = []
  for (const c of data.colaboradores) {
    for (const l of c.lugaresAsignados) {
      rows.push({
        colaborador: c.nombre,
        rol: c.rol,
        lugar: l.nombre,
        tipo: l.tipoLabel,
        direccion: l.direccion,
        comuna: l.comuna,
      })
    }
  }
  return rows
}

/** Estado de cumplimiento basado en %. */
export function estadoCumplimiento(p: number): { icon: string; label: string; kind: "ok" | "warn" | "bad" } {
  if (p >= 100) return { icon: "✓", label: "Meta cumplida", kind: "ok" }
  if (p >= 50) return { icon: "⚠", label: "En progreso", kind: "warn" }
  return { icon: "✗", label: "Bajo", kind: "bad" }
}

/** Color hex (sin #) para relleno de celda según estado de cumplimiento. */
export function colorPorCumplimiento(p: number): { bg: string; fg: string } {
  if (p >= 100) return { bg: "D1FAE5", fg: "065F46" } // emerald-100 / emerald-800
  if (p >= 50) return { bg: "FEF3C7", fg: "92400E" } // amber-100 / amber-800
  return { bg: "FEE2E2", fg: "991B1B" } // red-100 / red-800
}
