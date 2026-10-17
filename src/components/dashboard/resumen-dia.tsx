"use client"

import { useEffect, useState } from "react"
import {
  CalendarDays,
  Target,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Users,
  ClipboardList,
  RefreshCw,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

type Registro = {
  id: string
  beneficiario: string
  lugar: string
  tipoLugar: string
  hora: string
  fecha: string
}
type LugarAsig = { id: string; nombre: string; tipo: string; tipoLabel: string; direccion: string; comuna: string }
type Colab = {
  id: string
  nombre: string
  rol: string
  meta: number
  realizado: number
  cumplimiento: number
  lugaresAsignados: LugarAsig[]
  registros: Registro[]
}
type Resumen = {
  fecha: string
  fechaLabel: string
  totalMetaDia: number
  totalRealizado: number
  cumplimientoGlobal: number
  colaboradores: Colab[]
}

function estadoIcon(p: number) {
  if (p >= 100) return { Icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200", label: "Meta cumplida" }
  if (p >= 50) return { Icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50 border-amber-200", label: "En progreso" }
  return { Icon: XCircle, color: "text-red-600", bg: "bg-red-50 border-red-200", label: "Bajo umbral" }
}

function barraColor(p: number) {
  if (p >= 100) return "[&>div]:bg-emerald-500"
  if (p >= 50) return "[&>div]:bg-amber-500"
  return "[&>div]:bg-red-500"
}

export function ResumenDelDia() {
  const [data, setData] = useState<Resumen | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandido, setExpandido] = useState<string | null>(null)
  const [refrescando, setRefrescando] = useState(false)

  async function cargar() {
    setRefrescando(true)
    try {
      const res = await fetch("/api/resumen-dia")
      if (!res.ok) throw new Error()
      const d: Resumen = await res.json()
      setData(d)
    } catch {
      toast.error("No se pudo cargar el resumen del día")
    } finally {
      setLoading(false)
      setTimeout(() => setRefrescando(false), 400)
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  if (loading || !data) {
    return (
      <Card className="border-none bg-white/70 backdrop-blur p-5 shadow-sm">
        <div className="h-6 w-48 animate-pulse rounded bg-slate-200" />
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
        <div className="mt-4 h-64 animate-pulse rounded-xl bg-slate-100" />
      </Card>
    )
  }

  const kpis = [
    { label: "Meta total del día", value: data.totalMetaDia, icon: Target, color: "from-slate-600 to-slate-700" },
    { label: "Registros del día", value: data.totalRealizado, icon: ClipboardList, color: "from-sky-500 to-cyan-500" },
    { label: "Cumplimiento global", value: `${data.cumplimientoGlobal}%`, icon: TrendingUp, color: "from-emerald-500 to-teal-500" },
    { label: "Colaboradores activos", value: data.colaboradores.length, icon: Users, color: "from-amber-500 to-orange-500" },
  ]

  return (
    <div className="space-y-4">
      {/* Header del resumen */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-teal-600" />
          <div>
            <h4 className="text-sm font-semibold capitalize text-slate-800">{data.fechaLabel}</h4>
            <p className="text-[11px] text-muted-foreground">Resumen completo del día por colaborador</p>
          </div>
        </div>
        <button
          onClick={cargar}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/60 bg-white/70 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-white transition-colors"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", refrescando && "animate-spin")} />
          {refrescando ? "Actualizando…" : "Actualizar"}
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label} className="relative overflow-hidden border-none bg-white/70 backdrop-blur p-4 shadow-sm">
            <div className={cn("absolute -right-3 -top-3 h-12 w-12 rounded-full bg-gradient-to-br opacity-15", k.color)} />
            <div className={cn("mb-1.5 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-sm", k.color)}>
              <k.icon className="h-4 w-4" />
            </div>
            <div className="text-xl font-bold tabular-nums text-slate-800">{k.value}</div>
            <div className="text-[11px] font-medium text-slate-600 leading-tight">{k.label}</div>
          </Card>
        ))}
      </div>

      {/* Tabla principal: meta vs realizado */}
      <Card className="border-none bg-white/70 backdrop-blur shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 px-4 py-3 sm:px-5">
          <h4 className="text-sm font-semibold text-slate-800">Cumplimiento por colaborador · Meta vs Realizado</h4>
          <p className="text-[11px] text-muted-foreground">Toque un colaborador para ver el detalle de registros del día</p>
        </div>
        <div className="max-h-[560px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur">
              <tr className="text-left text-[11px] uppercase tracking-wide text-slate-500">
                <th className="px-4 py-2.5 font-medium sm:px-5">Colaborador</th>
                <th className="hidden px-3 py-2.5 font-medium md:table-cell">Lugar(es) asignado(s)</th>
                <th className="px-3 py-2.5 text-center font-medium">Meta</th>
                <th className="px-3 py-2.5 text-center font-medium">Realizado</th>
                <th className="px-3 py-2.5 font-medium">Cumplimiento</th>
                <th className="px-3 py-2.5 text-center font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {data.colaboradores.map((c) => {
                const est = estadoIcon(c.cumplimiento)
                const open = expandido === c.id
                return (
                  <>
                    <tr
                      key={c.id}
                      onClick={() => setExpandido(open ? null : c.id)}
                      className="cursor-pointer border-b border-slate-100 hover:bg-sky-50/40 transition-colors"
                    >
                      <td className="px-4 py-3 sm:px-5">
                        <div className="flex items-center gap-2">
                          {open ? (
                            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                          <div>
                            <div className="font-medium text-slate-800">{c.nombre}</div>
                            <div className="text-[10px] capitalize text-muted-foreground">{c.rol}</div>
                          </div>
                        </div>
                      </td>
                      <td className="hidden px-3 py-3 md:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {c.lugaresAsignados.slice(0, 2).map((l) => (
                            <span key={l.id} className="inline-block max-w-[140px] truncate rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600" title={l.nombre}>
                              {l.nombre}
                            </span>
                          ))}
                          {c.lugaresAsignados.length > 2 && (
                            <span className="rounded-md bg-slate-200 px-1.5 py-0.5 text-[10px] text-slate-500">
                              +{c.lugaresAsignados.length - 2}
                            </span>
                          )}
                          {c.lugaresAsignados.length === 0 && (
                            <span className="text-[10px] text-muted-foreground">Sin asignar</span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center tabular-nums text-slate-600">{c.meta}</td>
                      <td className="px-3 py-3 text-center">
                        <span className="font-bold tabular-nums text-slate-800">{c.realizado}</span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <Progress value={Math.min(100, c.cumplimiento)} className={cn("h-2 flex-1", barraColor(c.cumplimiento))} />
                          <span className="w-10 text-right text-xs font-semibold tabular-nums text-slate-700">
                            {c.cumplimiento}%
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium", est.bg, est.color)}>
                          <est.Icon className="h-3 w-3" />
                          {c.cumplimiento >= 100 ? "OK" : c.cumplimiento >= 50 ? "Prog" : "Bajo"}
                        </span>
                      </td>
                    </tr>
                    {open && (
                      <tr className="bg-slate-50/60 border-b border-slate-100">
                        <td colSpan={6} className="px-4 py-3 sm:px-5">
                          <div className="rounded-lg border border-slate-200 bg-white/70 p-3">
                            <div className="mb-2 flex items-center justify-between">
                              <h5 className="text-xs font-semibold text-slate-700">
                                Registros del día · {c.registros.length} captados
                              </h5>
                              <span className="text-[10px] text-muted-foreground">
                                {c.lugaresAsignados.length} lugar(es) asignado(s)
                              </span>
                            </div>
                            {/* Lugares asignados */}
                            {c.lugaresAsignados.length > 0 && (
                              <div className="mb-3 flex flex-wrap gap-1.5">
                                {c.lugaresAsignados.map((l) => (
                                  <Badge key={l.id} variant="outline" className="text-[10px] px-1.5 py-0">
                                    {l.tipoLabel}: {l.nombre}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            {/* Detalle de registros */}
                            {c.registros.length === 0 ? (
                              <p className="py-4 text-center text-xs text-muted-foreground">
                                Sin registros capturados hoy.
                              </p>
                            ) : (
                              <div className="max-h-56 overflow-y-auto rounded-md border border-slate-100">
                                <table className="w-full text-xs">
                                  <thead className="sticky top-0 bg-slate-100">
                                    <tr className="text-left text-[10px] uppercase text-slate-500">
                                      <th className="px-2.5 py-1.5 font-medium">Hora</th>
                                      <th className="px-2.5 py-1.5 font-medium">Fecha</th>
                                      <th className="px-2.5 py-1.5 font-medium">Beneficiario</th>
                                      <th className="px-2.5 py-1.5 font-medium">Lugar asignado</th>
                                      <th className="px-2.5 py-1.5 font-medium">Tipo</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {c.registros.map((r) => (
                                      <tr key={r.id} className="border-t border-slate-100">
                                        <td className="px-2.5 py-1.5 tabular-nums text-slate-700 font-medium">{r.hora}</td>
                                        <td className="px-2.5 py-1.5 tabular-nums text-slate-500">{r.fecha}</td>
                                        <td className="px-2.5 py-1.5 text-slate-800">{r.beneficiario}</td>
                                        <td className="px-2.5 py-1.5 text-slate-600">{r.lugar}</td>
                                        <td className="px-2.5 py-1.5 text-slate-500">{r.tipoLugar}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
