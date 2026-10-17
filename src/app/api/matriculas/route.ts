import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sanitizeText, validateRut, formatRut, integrityHash } from "@/lib/security"

/** GET /api/matriculas — lista matrículas (con datos sensibles protegidos) */
export async function GET() {
  const mats = await db.matricula.findMany({
    orderBy: { createdAt: "desc" },
    include: { lugar: true, colaborador: true },
    take: 200,
  })
  const safe = mats.map((m) => ({
    id: m.id,
    nombre: m.nombre,
    // RUT enmascarado para protección de datos en listados
    rutMasked: m.rut.replace(/^.*?(.{4})$/, "••.••.••.$1"),
    comuna: m.comuna,
    direccion: m.direccion,
    lugar: m.lugar ? { id: m.lugar.id, nombre: m.lugar.nombre, tipo: m.lugar.tipo } : null,
    colaborador: m.colaborador ? { id: m.colaborador.id, nombre: m.colaborador.nombre } : null,
    createdAt: m.createdAt,
  }))
  return NextResponse.json({ matriculas: safe })
}

/** POST /api/matriculas — registra una nueva matrícula (formulario público) */
export async function POST(req: Request) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }

  const nombre = sanitizeText(body.nombre, 120)
  const rutRaw = sanitizeText(body.rut, 20)
  const direccion = sanitizeText(body.direccion, 200)
  const comuna = sanitizeText(body.comuna, 80)
  const lugarId = body.lugarId ? String(body.lugarId) : null
  const colaboradorId = body.colaboradorId ? String(body.colaboradorId) : null

  if (!nombre || nombre.length < 3) {
    return NextResponse.json({ error: "Nombre inválido (mín. 3 caracteres)" }, { status: 400 })
  }
  if (!validateRut(rutRaw)) {
    return NextResponse.json({ error: "RUT inválido. Verifique formato y dígito verificador." }, { status: 400 })
  }
  if (!direccion || direccion.length < 5) {
    return NextResponse.json({ error: "Dirección inválida" }, { status: 400 })
  }
  if (!comuna) return NextResponse.json({ error: "Comuna requerida" }, { status: 400 })

  // Firma de integridad (demo de ciberseguridad)
  const firma = integrityHash(`${nombre}|${formatRut(rutRaw)}|${direccion}|${comuna}`)

  try {
    const created = await db.matricula.create({
      data: {
        nombre,
        rut: formatRut(rutRaw),
        direccion,
        comuna,
        lugarId,
        colaboradorId,
        firma,
      },
      include: { lugar: true, colaborador: true },
    })
    return NextResponse.json(
      {
        matricula: {
          id: created.id,
          nombre: created.nombre,
          lugar: created.lugar?.nombre ?? null,
          colaborador: created.colaborador?.nombre ?? null,
        },
      },
      { status: 201 },
    )
  } catch {
    return NextResponse.json({ error: "No se pudo registrar la matrícula" }, { status: 500 })
  }
}
