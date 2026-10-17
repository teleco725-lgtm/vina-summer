import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sanitizeText, validateRut, formatRut } from "@/lib/security"
import { getServerRole, requireAdmin } from "@/lib/authz"
import { safeQuery, DEMO_COLABORADORES } from "@/lib/db-safe"

/** Enmascara RUT para no-admin: 12.345.678-5 → ••.••.678-5 */
function maskRutForNonAdmin(rut: string, isAdmin: boolean): string {
  if (isAdmin) return rut
  const parts = rut.split("-")
  if (parts.length !== 2) return rut
  return `••.••.${parts[0].slice(-3)}.${parts[1]}`
}

/** GET /api/colaboradores — lista colaboradores con conteo de lugares asignados.
 *  Los RUT se enmascaran para usuarios no-admin (protección de datos).
 *  Si la DB no está disponible, devuelve colaboradores demo. */
export async function GET() {
  const { isAdmin } = await getServerRole()
  const cols = await safeQuery(
    () =>
      db.colaborador.findMany({
        where: { activo: true },
        orderBy: { nombre: "asc" },
        include: { _count: { select: { lugares: true, matriculas: true } } },
      }),
    DEMO_COLABORADORES as Awaited<ReturnType<typeof db.colaborador.findMany>>,
  )
  // Protección de datos: RUT enmascarado para no-admin
  const safe = cols.map((c) => ({
    id: c.id,
    nombre: c.nombre,
    rut: maskRutForNonAdmin(c.rut, isAdmin),
    telefono: isAdmin ? c.telefono : null,
    email: c.email,
    rol: c.rol,
    lugaresAsignados: c._count.lugares,
    matriculasGestionadas: c._count.matriculas,
  }))
  return NextResponse.json({ colaboradores: safe })
}

/** POST /api/colaboradores — crea colaborador con validación de RUT.
 *  Requiere privilegios de administrador. */
export async function POST(req: Request) {
  const authz = await requireAdmin()
  if (!authz.ok) {
    return NextResponse.json({ error: authz.error }, { status: authz.status })
  }

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
