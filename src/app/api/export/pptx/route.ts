import { NextResponse } from "next/server"
import { getResumenDia } from "@/lib/resumen-dia"
import { generatePptx } from "@/lib/report-pptx"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const data = await getResumenDia()
    const buf = await generatePptx(data)
    const filename = `informe-diario-colaboradores-${new Date().toISOString().slice(0, 10)}.pptx`
    return new NextResponse(new Uint8Array(buf), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    })
  } catch (e) {
    console.error("export pptx error:", e)
    return NextResponse.json({ error: "Error al generar el PowerPoint" }, { status: 500 })
  }
}
