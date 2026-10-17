import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { safeQuery } from "@/lib/db-safe"

/** Noticias demo en memoria para cuando la DB no está disponible */
const NOTICIAS_DEMO = [
  {
    id: "demo-n1",
    titulo: "Municipalidad abre temporada de verano con plan de salvavidas en playas de Viña",
    resumen: "La Dirección de Deportes DIDECO confirma despliegue de salvavidas en playas El Sol, Acapulco y Reñaca.",
    url: null,
    fuente: "municipal",
    medio: "Municipalidad de Viña del Mar",
    categoria: "evento",
    lugar: null,
    lat: null,
    lng: null,
    publicadaEn: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: "demo-n2",
    titulo: "Alerta de oleaje anómalo en costa de la Región de Valparaíso",
    resumen: "ONEMI recomienda precaución en playas del litoral central. Se mantiene bandera amarilla en Reñaca.",
    url: null,
    fuente: "television",
    medio: "TVN 24 Horas",
    categoria: "alerta",
    lugar: null,
    lat: null,
    lng: null,
    publicadaEn: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
  },
  {
    id: "demo-n3",
    titulo: "Piscina Municipal de Viña del Mar reabre tras mantención",
    resumen: "Tras dos semanas de trabajos, la piscina temperada retoma atención al público.",
    url: null,
    fuente: "prensa",
    medio: "El Mercurio Valparaíso",
    categoria: "info",
    lugar: null,
    lat: null,
    lng: null,
    publicadaEn: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
  },
]

/**
 * GET /api/noticias — lista noticias municipales agregadas de múltiples medios.
 * Si la DB no está disponible, devuelve noticias demo.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const categoria = searchParams.get("categoria")
  const fuente = searchParams.get("fuente")
  const limite = Math.min(50, Math.max(1, Number(searchParams.get("limite") ?? "20")))

  const where: Record<string, unknown> = { activa: true }
  if (categoria) where.categoria = categoria
  if (fuente) where.fuente = fuente

  const noticias = await safeQuery(
    () =>
      db.noticia.findMany({
        where,
        orderBy: { publicadaEn: "desc" },
        take: limite,
        include: { lugar: true },
      }),
    [],
  )

  // Si no hay noticias en la DB (o DB no disponible), usar demo
  let lista = noticias
  if (lista.length === 0) {
    lista = NOTICIAS_DEMO as unknown as typeof noticias
  }

  const safe = lista.map((n) => ({
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
    publicadaEn: typeof n.publicadaEn === "string" ? n.publicadaEn : n.publicadaEn.toISOString(),
  }))

  return NextResponse.json({ noticias: safe, total: safe.length })
}
