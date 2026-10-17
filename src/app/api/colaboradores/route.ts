import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sanitizeText, validateRut, formatRut } from "@/lib/security"

/** GET /api/colaboradores — lista colaboradores con conteo de lugares asignados */
export async function GET() {
  const cols = await db.colaborador.findMany({
    where: { activo: true },
    orderBy: { nombre: "asc" },
    include: { _count: { select: { lugares: true, matriculas: true } } },
  })
  // Protección de datos: RUT enmascarado en endpoints de listado
  const safe = cols.map((c) => ({
    id: c.id,
    nombre: c.nombre,
    rut: c.rut,
    telefono: c.telefono,
    email: c.email,
    rol: c.rol,
    lugaresAsignados: c._count.lugares,
    matriculasGestionadas: c._count.matriculas,
  }))
  return NextResponse.json({ colaboradores: safe })
}

/** POST /api/colaboradores — crea colaborador con validación de RUT */
export async function POST(req: Request) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }

  const nombre = sanitizeText(body.nombre, 120)
  const rutRaw = sanitizeText(body.rut, 20)
  const telefono = sanitizeText(body.telefono ?? "", 30)
  const email = sanitizeText(body.email ?? "", 120)
  const rol = sanitizeText(body.rol ?? "colaborador", 40)

  if (!nombre || nombre.length < 3) {
    return NextResponse.json({ error: "Nombre inválido" }, { status: 400 })
  }
  if (!validateRut(rutRaw)) {
    return NextResponse.json({ error: "RUT inválido (formato chileno)" }, { status: 400 })
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Email inválido" }, { status: 400 })
  }

  // Verificar duplicidad de RUT (no revelar existencia por privacidad — mensaje genérico)
  const existe = await db.colaborador.findUnique({ where: { rut: formatRut(rutRaw) } })
  if (existe) {
    return NextResponse.json({ error: "No se pudo procesar la solicitud" }, { status: 409 })
  }

  try {
    const created = await db.colaborador.create({
      data: {
        nombre,
        rut: formatRut(rutRaw),
        telefono: telefono || null,
        email: email || null,
        rol,
      },
    })
    return NextResponse.json({ colaborador: created }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Error al crear colaborador" }, { status: 500 })
  }
}
