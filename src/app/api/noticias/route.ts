import { NextResponse } from "next/server"
import { db } from "@/lib/db"

/**
 * GET /api/noticias — lista noticias municipales agregadas de múltiples medios.
 * Query: ?categoria=alerta|info|evento & fuente=municipal|prensa|radio|redes|television & limite=N
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const categoria = searchParams.get("categoria")
  const fuente = searchParams.get("fuente")
  const limite = Math.min(50, Math.max(1, Number(searchParams.get("limite") ?? "20")))

  const where: Record<string, unknown> = { activa: true }
  if (categoria) where.categoria = categoria
  if (fuente) where.fuente = fuente

  const noticias = await db.noticia.findMany({
    where,
    orderBy: { publicadaEn: "desc" },
    take: limite,
    include: { lugar: true },
  })

  const safe = noticias.map((n) => ({
    id: n.id,
    titulo: n.titulo,
    resumen: n.resumen,
    url: n.url,
    fuente: n.fuente,
    medio: n.medio,
    categoria: n.categoria,
    lugar: n.lugar ? { id: n.lugar.id, nombre: n.lugar.nombre, tipo: n.lugar.tipo } : null,
    lat: n.lat,
    lng: n.lng,
    publicadaEn: n.publicadaEn.toISOString(),
  }))

  return NextResponse.json({ noticias: safe, total: safe.length })
}
