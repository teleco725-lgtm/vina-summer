import { NextResponse } from "next/server"
import { getResumenDia } from "@/lib/resumen-dia"
import { generatePdf } from "@/lib/report-pdf"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const data = await getResumenDia()
    const buf = await generatePdf(data)
    const filename = `informe-diario-colaboradores-${data.fecha.slice(0, 10)}.pdf`
    return new NextResponse(new Uint8Array(buf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    })
  } catch (e) {
    console.error("export pdf error:", e)
    return NextResponse.json({ error: "Error al generar el PDF" }, { status: 500 })
  }
}
