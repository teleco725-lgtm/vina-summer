"use client"

import { useState } from "react"
import {
  Download,
  FileDown,
  FileSpreadsheet,
  FileText,
  Loader2,
  ShieldCheck,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { toast } from "sonner"

type ExportFormat = "excel" | "word" | "pdf"

type ExportOption = {
  id: ExportFormat
  title: string
  description: string
  badge: string
  icon: typeof FileSpreadsheet
  url: string
  /** Color de acento del ícono */
  accent: string
  /** Clases del fondo del badge del icono */
  iconWrap: string
}

const OPTIONS: ExportOption[] = [
  {
    id: "excel",
    title: "Excel",
    description:
      "Libro de cálculo con 4 hojas: resumen, lugares, colaboradores y matrículas.",
    badge: "con fórmulas",
    icon: FileSpreadsheet,
    url: "/api/export/excel",
    accent: "text-emerald-700",
    iconWrap: "bg-emerald-100 text-emerald-700",
  },
  {
    id: "word",
    title: "Word",
    description:
      "Documento editable con portada, secciones temáticas y tablas formateadas.",
    badge: "con portada y secciones",
    icon: FileText,
    url: "/api/export/word",
    accent: "text-sky-700",
    iconWrap: "bg-sky-100 text-sky-700",
  },
  {
    id: "pdf",
    title: "PDF",
    description:
      "Informe multi-página vectorial listo para imprimir o adjuntar al correo.",
    badge: "multi-página vector",
    icon: FileDown,
    url: "/api/export/pdf",
    accent: "text-teal-700",
    iconWrap: "bg-teal-100 text-teal-700",
  },
]

export function ExportSection() {
  const [loading, setLoading] = useState<Record<ExportFormat, boolean>>({
    excel: false,
    word: false,
    pdf: false,
  })

  function handleDownload(opt: ExportOption) {
    if (loading[opt.id]) return
    setLoading((prev) => ({ ...prev, [opt.id]: true }))
    toast.info(`Generando ${opt.title}…`, {
      description: "Se iniciará la descarga en breve.",
    })
    try {
      // El endpoint devuelve el archivo directamente con Content-Disposition.
      // Usamos un <a> programático para no interferir con la navegación SPA.
      const a = document.createElement("a")
      a.href = opt.url
      a.rel = "noopener"
      a.style.display = "none"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch {
      toast.error("No se pudo iniciar la descarga.")
      setLoading((prev) => ({ ...prev, [opt.id]: false }))
      return
    }
    // Limpiar el estado de carga tras un margen razonable.
    window.setTimeout(() => {
      setLoading((prev) => ({ ...prev, [opt.id]: false }))
      toast.success(`Descarga de ${opt.title} iniciada`)
    }, 1500)
  }

  return (
    <Card className="border-none bg-white/70 backdrop-blur shadow-sm p-5 sm:p-6 gap-5">
      <CardHeader className="p-0">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500 text-white shadow-md shadow-emerald-100">
            <Download className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <CardTitle className="text-lg sm:text-xl text-slate-800">
              Exportar informe
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Descarga los datos del dashboard como informe profesional.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="grid gap-4 sm:grid-cols-3">
          {OPTIONS.map((opt) => {
            const Icon = opt.icon
            const isLoading = loading[opt.id]
            return (
              <div
                key={opt.id}
                className="flex flex-col gap-3 rounded-xl border border-white/70 bg-white/60 p-4 transition-shadow hover:shadow-md hover:shadow-emerald-100/40"
              >
                <div className="flex items-center justify-between gap-2">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${opt.iconWrap}`}
                    aria-hidden
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <Badge
                    variant="outline"
                    className="border-emerald-200 bg-emerald-50 text-[10px] font-medium text-emerald-700"
                  >
                    {opt.badge}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <h4 className={`text-sm font-semibold ${opt.accent}`}>
                    {opt.title}
                  </h4>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {opt.description}
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={() => handleDownload(opt)}
                  disabled={isLoading}
                  className="mt-auto w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700"
                  aria-label={`Descargar informe en ${opt.title}`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Generando…
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" /> Descargar
                    </>
                  )}
                </Button>
              </div>
            )
          })}
        </div>

        <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          Los RUT se exportan enmascarados por protección de datos.
        </p>
      </CardContent>
    </Card>
  )
}
