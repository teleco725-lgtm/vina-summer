import { NextResponse } from "next/server"
import { getResumenDia } from "@/lib/resumen-dia"
import { safeQuery } from "@/lib/db-safe"

/** Resumen demo para cuando la DB no está disponible */
const RESUMEN_DEMO = {
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
        { id: "demo-1", nombre: "Playa El Sol", tipo: "playa" as const, tipoLabel: "Playa", direccion: "Av. Perú", comuna: "Viña del Mar" },
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
        { id: "demo-2", nombre: "Piscina Municipal Viña", tipo: "piscina_municipal" as const, tipoLabel: "Piscina Municipal", direccion: "Av. Valparaíso 1015", comuna: "Viña del Mar" },
      ],
      registros: [],
    },
  ],
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const fechaParam = searchParams.get("fecha") ?? undefined
  const data = await safeQuery(() => getResumenDia(fechaParam), RESUMEN_DEMO)
  return NextResponse.json(data)
}
