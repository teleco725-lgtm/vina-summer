import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/authz"

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authz = await requireAdmin()
  if (!authz.ok) {
    return NextResponse.json({ error: authz.error }, { status: authz.status })
  }

  const { id } = await params
  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 })
  // Soft-delete para preservar integridad referencial y trazabilidad
  await db.lugar.update({ where: { id }, data: { activo: false } })
  return NextResponse.json({ ok: true })
}
