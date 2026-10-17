import { NextResponse } from "next/server"
import { getResumenDia } from "@/lib/resumen-dia"

/**
 * GET /api/resumen-dia — Resumen del día por colaborador.
 * Devuelve, para cada colaborador activo:
 *   - meta diaria
 *   - matrículas registradas hoy
 *   - % cumplimiento (realizado / meta)
 *   - lugares asignados (nombres + tipos + direccion + comuna)
 *   - detalle de registros del día (beneficiario, lugar, hora, fecha)
 *
 * Query: ?fecha=YYYY-MM-DD (opcional, default = hoy en tz local)
 *
 * La lógica de consulta vive en `src/lib/resumen-dia.ts` (single source of truth)
 * y también la consumen los generadores de reporte (Excel / Word / PDF) y el
 * pipeline de envío por correo (`/api/email`).
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const fechaParam = searchParams.get("fecha") ?? undefined
  const data = await getResumenDia(fechaParam)
  return NextResponse.json(data)
}
