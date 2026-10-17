import { db } from "@/lib/db"
import { TIPO_LABELS, TIPO_COLORS, type TipoLugar } from "@/lib/security"

/**
 * Wrapper de Prisma con manejo de errores.
 * En entornos serverless (Vercel) donde SQLite no está disponible,
 * devuelve datos demo en lugar de crashear la página.
 *
 * Uso: const lugares = await safeQuery(() => db.lugar.findMany(...), fallbackDemo)
 */
export async function safeQuery<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn()
  } catch (e) {
    console.warn("[db] Query falló, usando datos demo:", e instanceof Error ? e.message : String(e))
    return fallback
  }
}

/** Datos demo en memoria para cuando la DB no está disponible (ej. Vercel) */
export const DEMO_LUGARES = [
  {
    id: "demo-1",
    nombre: "Playa El Sol",
    tipo: "playa" as TipoLugar,
    direccion: "Av. Perú, Viña del Mar",
    comuna: "Viña del Mar",
    lat: -33.0193,
    lng: -71.5539,
    descripcion: "Playa urbana céntrica, sector Av. Perú.",
    horario: "Acceso libre 08:00–20:00",
    aforo: 5000,
    activo: true,
    colaboradores: [],
    _count: { matriculas: 0 },
  },
  {
    id: "demo-2",
    nombre: "Piscina Municipal Viña del Mar",
    tipo: "piscina_municipal" as TipoLugar,
    direccion: "Av. Valparaíso 1015, Viña del Mar",
    comuna: "Viña del Mar",
    lat: -33.0255,
    lng: -71.5536,
    descripcion: "Piscina municipal temperada, acceso público.",
    horario: "Lun–Vie 06:30–21:00",
    aforo: 250,
    activo: true,
    colaboradores: [],
    _count: { matriculas: 0 },
  },
  {
    id: "demo-3",
    nombre: "Gimnasio Municipal Sausalito",
    tipo: "gimnasio_con_piscina" as TipoLugar,
    direccion: "Av. Libertad 1341, Viña del Mar",
    comuna: "Viña del Mar",
    lat: -33.0312,
    lng: -71.5479,
    descripcion: "Complejo deportivo municipal con piscina temperada.",
    horario: "Lun–Vie 06:30–22:00",
    aforo: 400,
    activo: true,
    colaboradores: [],
    _count: { matriculas: 0 },
  },
]

export const DEMO_COLABORADORES = [
  {
    id: "demo-c1",
    nombre: "Carolina Pérez",
    rut: "12.345.678-5",
    telefono: "+56987654321",
    email: null,
    rol: "supervisora",
    metaDiaria: 30,
    activo: true,
    lugares: [],
    matriculas: [],
    _count: { lugares: 0, matriculas: 0 },
  },
  {
    id: "demo-c2",
    nombre: "Rodrigo Soto",
    rut: "9.876.543-2",
    telefono: "+56981122334",
    email: null,
    rol: "colaborador",
    metaDiaria: 20,
    activo: true,
    lugares: [],
    matriculas: [],
    _count: { lugares: 0, matriculas: 0 },
  },
]

/** Detecta si la DB está disponible */
export async function isDbAvailable(): Promise<boolean> {
  try {
    await db.$queryRaw`SELECT 1`
    return true
  } catch {
    return false
  }
}

/** Resumen día demo para endpoints de exportación cuando la DB no está disponible */
export const DEMO_RESUMEN_DIA = {
  fecha: new Date().toISOString(),
  fechaLabel: new Date().toLocaleDateString("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }),
  generadoEn: new Date().toLocaleString("es-CL", { hour: "2-digit", minute: "2-digit" }),
  totalMetaDia: 50,
  totalRealizado: 0,
  cumplimientoGlobal: 0,
  totalColaboradores: 2,
  totalRegistros: 0,
  totalLugaresMonitoreados: 3,
  colaboradores: [
    {
      id: "demo-c1",
      nombre: "Carolina Pérez",
      rol: "supervisora",
      meta: 30,
      realizado: 0,
      cumplimiento: 0,
      lugaresAsignados: [
        { id: "demo-1", nombre: "Playa El Sol", tipo: "playa", tipoLabel: "Playa", direccion: "Av. Perú", comuna: "Viña del Mar" },
      ],
      registros: [],
    },
    {
      id: "demo-c2",
      nombre: "Rodrigo Soto",
      rol: "colaborador",
      meta: 20,
      realizado: 0,
      cumplimiento: 0,
      lugaresAsignados: [
        { id: "demo-2", nombre: "Piscina Municipal Viña", tipo: "piscina_municipal", tipoLabel: "Piscina Municipal", direccion: "Av. Valparaíso 1015", comuna: "Viña del Mar" },
      ],
      registros: [],
    },
  ],
}
