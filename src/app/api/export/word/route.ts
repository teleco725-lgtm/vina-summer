import { NextResponse } from "next/server"
import { getReportData } from "@/lib/report-data"
import { generateWord } from "@/lib/report-word"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const data = await getReportData()
    const buf = await generateWord(data)
    const filename = `informe-deportivo-vina-${new Date().toISOString().slice(0, 10)}.docx`
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
