/**
 * Datos centralizados para reportes (Excel / Word / PDF).
 * Reutiliza la misma fuente que el dashboard, con datos sensibles protegidos.
 */
import { db } from "@/lib/db"
import { TIPO_LABELS, type TipoLugar } from "@/lib/security"

export type ReportLugar = {
  nombre: string
  tipo: TipoLugar
  tipoLabel: string
  direccion: string
  comuna: string
  lat: number
  lng: number
  horario: string | null
  aforo: number | null
  descripcion: string | null
  matriculas: number
  colaboradores: string[]
}

export type ReportColaborador = {
  nombre: string
  rut: string // enmascarado
  rol: string
  telefono: string | null
  email: string | null
  lugaresAsignados: number
  matriculasGestionadas: number
}

export type ReportMatricula = {
  nombre: string
  rut: string // enmascarado
  comuna: string
  direccion: string
  lugar: string | null
  tipoLugar: string | null
  colaborador: string | null
  fecha: string
}

export type ReportData = {
  generadoEn: string
  periodo: string
  lugares: ReportLugar[]
  colaboradores: ReportColaborador[]
  matriculas: ReportMatricula[]
  resumen: {
    totalLugares: number
    playas: number
    piscinas: number
    gimnasios: number
    totalColaboradores: number
    totalMatriculas: number
  }
  porTipo: { tipo: TipoLugar; label: string; count: number }[]
  topLugares: { nombre: string; tipo: string; matriculas: number }[]
}

function maskRut(rut: string): string {
  if (!rut) return ""
  const parts = rut.split("-")
  if (parts.length !== 2) return rut
  return `••.••.${parts[0].slice(-3)}.${parts[1]}`
}

export async function getReportData(): Promise<ReportData> {
  const [lugares, colaboradores, matriculas] = await Promise.all([
    db.lugar.findMany({
      where: { activo: true },
      orderBy: [{ tipo: "asc" }, { nombre: "asc" }],
      include: {
        colaboradores: { include: { colaborador: true } },
        _count: { select: { matriculas: true } },
      },
    }),
    db.colaborador.findMany({
      where: { activo: true },
      orderBy: { nombre: "asc" },
      include: { _count: { select: { lugares: true, matriculas: true } } },
    }),
    db.matricula.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { lugar: true, colaborador: true },
    }),
  ])

  const lugaresReport: ReportLugar[] = lugares.map((l) => ({
    nombre: l.nombre,
    tipo: l.tipo as TipoLugar,
    tipoLabel: TIPO_LABELS[l.tipo as TipoLugar],
    direccion: l.direccion,
    comuna: l.comuna,
    lat: l.lat,
    lng: l.lng,
    horario: l.horario,
    aforo: l.aforo,
    descripcion: l.descripcion,
    matriculas: l._count.matriculas,
    colaboradores: l.colaboradores.map((c) => c.colaborador.nombre),
  }))

  const colaboradoresReport: ReportColaborador[] = colaboradores.map((c) => ({
    nombre: c.nombre,
    rut: maskRut(c.rut),
    rol: c.rol,
    telefono: c.telefono,
    email: c.email,
    lugaresAsignados: c._count.lugares,
    matriculasGestionadas: c._count.matriculas,
  }))

  const matriculasReport: ReportMatricula[] = matriculas.map((m) => ({
    nombre: m.nombre,
    rut: maskRut(m.rut),
    comuna: m.comuna,
    direccion: m.direccion,
    lugar: m.lugar?.nombre ?? null,
    tipoLugar: m.lugar ? TIPO_LABELS[m.lugar.tipo as TipoLugar] : null,
    colaborador: m.colaborador?.nombre ?? null,
    fecha: m.createdAt.toLocaleString("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  }))

  const resumen = {
    totalLugares: lugares.length,
    playas: lugares.filter((l) => l.tipo === "playa").length,
    piscinas: lugares.filter((l) => l.tipo === "piscina_municipal").length,
    gimnasios: lugares.filter((l) => l.tipo === "gimnasio_con_piscina").length,
    totalColaboradores: colaboradores.length,
    totalMatriculas: matriculas.length,
  }

  const porTipo = (["playa", "piscina_municipal", "gimnasio_con_piscina"] as TipoLugar[]).map(
    (tipo) => ({
      tipo,
      label: TIPO_LABELS[tipo],
      count: lugares.filter((l) => l.tipo === tipo).length,
    }),
  )

  const topLugares = [...lugares]
    .sort((a, b) => b._count.matriculas - a._count.matriculas)
    .slice(0, 8)
    .map((l) => ({
      nombre: l.nombre,
      tipo: TIPO_LABELS[l.tipo as TipoLugar],
      matriculas: l._count.matriculas,
    }))

  const ahora = new Date()
  return {
    generadoEn: ahora.toLocaleString("es-CL", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    periodo: ahora.toLocaleDateString("es-CL", { month: "long", year: "numeric" }),
    lugares: lugaresReport,
    colaboradores: colaboradoresReport,
    matriculas: matriculasReport,
    resumen,
    porTipo,
    topLugares,
  }
}
