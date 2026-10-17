import { NextResponse } from "next/server"
import { db } from "@/lib/db"

/**
 * GET /api/stats — métricas para el dashboard.
 * No expone datos personales: solo agregados.
 */
export async function GET() {
  const [totalLugares, playas, piscinas, gimnasios, totalColaboradores, totalMatriculas, porTipoRaw] =
    await Promise.all([
      db.lugar.count({ where: { activo: true } }),
      db.lugar.count({ where: { activo: true, tipo: "playa" } }),
      db.lugar.count({ where: { activo: true, tipo: "piscina_municipal" } }),
      db.lugar.count({ where: { activo: true, tipo: "gimnasio_con_piscina" } }),
      db.colaborador.count({ where: { activo: true } }),
      db.matricula.count(),
      db.lugar.groupBy({
        by: ["tipo"],
        where: { activo: true },
        _count: { _all: true },
      }),
    ])

  // Matrículas por comuna (últimos 90 días aprox. sin filtrar fechas para demo)
  const porComunaRaw = await db.matricula.groupBy({
    by: ["comuna"],
    _count: { _all: true },
  })

  const porTipo = porTipoRaw.map((g) => ({ tipo: g.tipo, count: g._count._all }))
  const porComuna = porComunaRaw.map((g) => ({ comuna: g.comuna, count: g._count._all }))

  // Lugares con más matrículas (top 5)
  const topLugaresRaw = await db.lugar.findMany({
    where: { activo: true },
    orderBy: { matriculas: { _count: "desc" } },
    take: 5,
    include: { _count: { select: { matriculas: true } } },
  })
  const topLugares = topLugaresRaw.map((l) => ({
    nombre: l.nombre,
    tipo: l.tipo,
    matriculas: l._count.matriculas,
  }))

  return NextResponse.json({
    totalLugares,
    playas,
    piscinas,
    gimnasios,
    totalColaboradores,
    totalMatriculas,
    porTipo,
    porComuna,
    topLugares,
  })
}
