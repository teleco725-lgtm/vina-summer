import { NextResponse } from "next/server"
import { getResumenDia } from "@/lib/resumen-dia"
import { generateExcel } from "@/lib/report-excel"
import { safeQuery, DEMO_RESUMEN_DIA } from "@/lib/db-safe"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // safeQuery: si la DB no está disponible (Vercel), usa datos demo
    const data = await safeQuery(() => getResumenDia(), DEMO_RESUMEN_DIA as any)
    const buf = await generateExcel(data)
    const filename = `informe-diario-colaboradores-${data.fecha.slice(0, 10)}.xlsx`
    return new NextResponse(new Uint8Array(buf), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    })
  } catch (e) {
    console.error("export excel error:", e)
    return NextResponse.json({ error: "Error al generar el Excel" }, { status: 500 })
  }
}
