"use client"

import { useState } from "react"
import { Waves, Droplets, Dumbbell, MapPin, Users, Clock, Maximize2, Search } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { TIPO_LABELS, TIPO_COLORS, type TipoLugar } from "@/lib/security"

type ColabMini = { id: string; nombre: string; rol: string }
type LugarItem = {
  id: string
  nombre: string
  tipo: TipoLugar
  direccion: string
  comuna: string
  lat: number
  lng: number
  descripcion?: string | null
  horario?: string | null
  aforo?: number | null
  matriculas: number
  colaboradores: ColabMini[]
}

const FILTROS: { key: TipoLugar | "todos"; label: string; icon: typeof Waves }[] = [
  { key: "todos", label: "Todos", icon: MapPin },
  { key: "playa", label: "Playas", icon: Waves },
  { key: "piscina_municipal", label: "Piscinas municipales", icon: Droplets },
  { key: "gimnasio_con_piscina", label: "Gimnasios c/ piscina", icon: Dumbbell },
]

const ICON_FOR_TIPO: Record<TipoLugar, typeof Waves> = {
  playa: Waves,
  piscina_municipal: Droplets,
  gimnasio_con_piscina: Dumbbell,
}

export function LugaresList({ lugares }: { lugares: LugarItem[] }) {
  const [filtro, setFiltro] = useState<TipoLugar | "todos">("todos")
  const [q, setQ] = useState("")

  const filtered = lugares.filter((l) => {
    const matchTipo = filtro === "todos" || l.tipo === filtro
    const matchQ =
      q.trim() === "" ||
      l.nombre.toLowerCase().includes(q.toLowerCase()) ||
      l.direccion.toLowerCase().includes(q.toLowerCase())
    return matchTipo && matchQ
  })

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {FILTROS.map((f) => {
            const active = filtro === f.key
            const Icon = f.icon
            return (
              <button
                key={f.key}
                onClick={() => setFiltro(f.key)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "bg-slate-800 text-white border-slate-800 shadow-sm"
                    : "bg-white/70 border-white/60 text-slate-600 hover:bg-white",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {f.label}
                <span
                  className={cn(
                    "ml-1 rounded-full px-1.5 py-0 text-[10px] tabular-nums",
                    active ? "bg-white/20" : "bg-slate-100 text-slate-500",
                  )}
                >
                  {f.key === "todos" ? lugares.length : lugares.filter((l) => l.tipo === f.key).length}
                </span>
              </button>
            )
          })}
        </div>
        <div className="relative sm:w-64">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar lugar o dirección…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-8 h-9 bg-white/70 border-white/60"
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((l) => {
          const Icon = ICON_FOR_TIPO[l.tipo]
          const color = TIPO_COLORS[l.tipo]
          return (
            <Card
              key={l.id}
              className="group relative overflow-hidden border-none bg-white/70 backdrop-blur p-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
            >
              <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-full opacity-10" style={{ background: color }} />
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-sm"
                    style={{ background: color }}
                  >
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800 leading-tight">{l.nombre}</h4>
                    <Badge
                      variant="outline"
                      className="mt-0.5 text-[10px] px-1.5 py-0"
                      style={{ color, borderColor: `${color}40`, background: `${color}10` }}
                    >
                      {TIPO_LABELS[l.tipo]}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                <p className="flex items-start gap-1.5">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span>{l.direccion}, {l.comuna}</span>
                </p>
                {l.horario && (
                  <p className="flex items-start gap-1.5">
                    <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="line-clamp-1">{l.horario}</span>
                  </p>
                )}
                {l.aforo != null && (
                  <p className="flex items-start gap-1.5">
                    <Maximize2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span>Aforo: <span className="font-medium tabular-nums">{l.aforo.toLocaleString("es-CL")}</span></span>
                  </p>
                )}
                {l.descripcion && (
                  <p className="text-muted-foreground line-clamp-2 pt-1">{l.descripcion}</p>
                )}
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
                <div className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-muted-foreground" />
                  {l.colaboradores.length > 0 ? (
                    <div className="flex -space-x-1.5">
                      {l.colaboradores.slice(0, 3).map((c) => (
                        <span
                          key={c.id}
                          title={`${c.nombre} · ${c.rol}`}
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 text-[10px] font-semibold text-white ring-2 ring-white"
                        >
                          {c.nombre.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                        </span>
                      ))}
                      {l.colaboradores.length > 3 && (
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-[10px] font-semibold text-slate-600 ring-2 ring-white">
                          +{l.colaboradores.length - 3}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-[11px] text-muted-foreground">Sin asignar</span>
                  )}
                </div>
                <span className="text-[11px] text-muted-foreground">
                  <span className="font-semibold tabular-nums text-slate-700">{l.matriculas}</span> matrículas
                </span>
              </div>

              <a
                href={`https://www.openstreetmap.org/?mlat=${l.lat}&mlon=${l.lng}#map=17/${l.lat}/${l.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-sky-600 hover:text-sky-700"
              >
                <MapPin className="h-3 w-3" /> Ver en mapa GPS
              </a>
            </Card>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white/50 p-10 text-center text-sm text-muted-foreground">
          No se encontraron lugares con ese filtro.
        </div>
      )}
    </div>
  )
}
