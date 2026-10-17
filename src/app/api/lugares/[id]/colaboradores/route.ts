import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/authz"

/** Asigna un colaborador a un lugar — requiere admin */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authz = await requireAdmin()
  if (!authz.ok) {
    return NextResponse.json({ error: authz.error }, { status: authz.status })
  }

  const { id } = await params
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }
  const colaboradorId = String(body.colaboradorId ?? "")
  if (!id || !colaboradorId) {
    return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 })
  }
  const existing = await db.lugarColaborador.findUnique({
    where: { lugarId_colaboradorId: { lugarId: id, colaboradorId } },
  })
  if (existing) {
    return NextResponse.json({ ok: true, message: "Ya asignado" })
  }
  await db.lugarColaborador.create({ data: { lugarId: id, colaboradorId } })
  return NextResponse.json({ ok: true }, { status: 201 })
}

/** Desasigna un colaborador de un lugar — requiere admin */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authz = await requireAdmin()
  if (!authz.ok) {
    return NextResponse.json({ error: authz.error }, { status: authz.status })
  }

  const { id } = await params
  const { searchParams } = new URL(req.url)
  const colaboradorId = searchParams.get("colaboradorId")
  if (!id || !colaboradorId) {
    return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 })
  }
  await db.lugarColaborador.deleteMany({ where: { lugarId: id, colaboradorId } })
  return NextResponse.json({ ok: true })
}
