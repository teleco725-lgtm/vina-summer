import { NextResponse } from "next/server"
import { getResumenDia } from "@/lib/resumen-dia"
import { generateWord } from "@/lib/report-word"
import { safeQuery, DEMO_RESUMEN_DIA } from "@/lib/db-safe"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // safeQuery: si la DB no está disponible (Vercel), usa datos demo
    const data = await safeQuery(() => getResumenDia(), DEMO_RESUMEN_DIA as any)
    const buf = await generateWord(data)
    const filename = `informe-diario-colaboradores-${data.fecha.slice(0, 10)}.docx`
    return new NextResponse(new Uint8Array(buf), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    })
  } catch (e) {
    console.error("export word error:", e)
    return NextResponse.json({ error: "Error al generar el Word" }, { status: 500 })
  }
}
