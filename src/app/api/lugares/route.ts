import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sanitizeText, TIPOS_LUGAR, isValidLat, isValidLng, type TipoLugar } from "@/lib/security"

/**
 * GET /api/lugares — lista lugares (con colaboradores y conteo de matrículas).
 * Query: ?tipo=playa|piscina_municipal|gimnasio_con_piscina & comuna=...
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const tipo = searchParams.get("tipo")
  const comuna = searchParams.get("comuna")

  const where: Record<string, unknown> = { activo: true }
  if (tipo && (TIPOS_LUGAR as readonly string[]).includes(tipo)) where.tipo = tipo
  if (comuna) where.comuna = { contains: comuna }

  const lugares = await db.lugar.findMany({
    where,
    orderBy: { tipo: "asc" },
    include: {
      colaboradores: { include: { colaborador: true } },
      _count: { select: { matriculas: true } },
    },
  })

  // Protección de datos: no exponer RUT de colaboradores en el listado público
  const safe = lugares.map((l) => ({
    id: l.id,
    nombre: l.nombre,
    tipo: l.tipo,
    direccion: l.direccion,
    comuna: l.comuna,
    lat: l.lat,
    lng: l.lng,
    descripcion: l.descripcion,
    horario: l.horario,
    aforo: l.aforo,
    matriculas: l._count.matriculas,
    colaboradores: l.colaboradores.map((c) => ({
      id: c.colaborador.id,
      nombre: c.colaborador.nombre,
      rol: c.colaborador.rol,
    })),
  }))

  return NextResponse.json({ lugares: safe })
}

/**
 * POST /api/lugares — crea un lugar (validación estricta).
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }

  const nombre = sanitizeText(body.nombre, 120)
  const direccion = sanitizeText(body.direccion, 200)
  const comuna = sanitizeText(body.comuna, 80)
  const descripcion = sanitizeText(body.descripcion ?? "", 400)
  const horario = sanitizeText(body.horario ?? "", 80)
  const tipo = sanitizeText(body.tipo, 40) as TipoLugar
  const lat = Number(body.lat)
  const lng = Number(body.lng)
  const aforo = body.aforo !== undefined && body.aforo !== null && body.aforo !== ""
    ? Math.max(0, Math.min(100000, Math.floor(Number(body.aforo))))
    : null

  if (!nombre || nombre.length < 3) {
    return NextResponse.json({ error: "Nombre inválido (mín. 3 caracteres)" }, { status: 400 })
  }
  if (!direccion || direccion.length < 5) {
    return NextResponse.json({ error: "Dirección inválida" }, { status: 400 })
  }
  if (!comuna) return NextResponse.json({ error: "Comuna requerida" }, { status: 400 })
  if (!(TIPOS_LUGAR as readonly string[]).includes(tipo)) {
    return NextResponse.json({ error: "Tipo de lugar inválido" }, { status: 400 })
  }
  if (!isValidLat(lat) || !isValidLng(lng)) {
    return NextResponse.json({ error: "Coordenadas GPS inválidas" }, { status: 400 })
  }

  const created = await db.lugar.create({
    data: { nombre, tipo, direccion, comuna, lat, lng, descripcion: descripcion || null, horario: horario || null, aforo },
  })
  return NextResponse.json({ lugar: created }, { status: 201 })
}
