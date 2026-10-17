"use client"

import { useCallback, useEffect, useState } from "react"
import {
  Check,
  Dumbbell,
  Droplets,
  Loader2,
  MapPin,
  Plus,
  UserCog,
  Users,
  Waves,
} from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { TIPO_COLORS, TIPO_LABELS, type TipoLugar } from "@/lib/security"

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

type Colaborador = {
  id: string
  nombre: string
  rut: string
  telefono: string | null
  email: string | null
  rol: string
  lugaresAsignados: number
  matriculasGestionadas: number
}

type FiltroTipo = TipoLugar | "todos"

const COLAB_TODOS = "todos"

const FILTROS: { key: FiltroTipo; label: string; Icon: typeof Waves }[] = [
  { key: "todos", label: "Todos", Icon: MapPin },
  { key: "playa", label: "Playas", Icon: Waves },
  { key: "piscina_municipal", label: "Piscinas", Icon: Droplets },
  { key: "gimnasio_con_piscina", label: "Gimnasios", Icon: Dumbbell },
]

const ICON_FOR_TIPO: Record<TipoLugar, typeof Waves> = {
  playa: Waves,
  piscina_municipal: Droplets,
  gimnasio_con_piscina: Dumbbell,
}

const SCROLLBAR_CSS = `
.vina-scroll::-webkit-scrollbar { width: 8px; }
.vina-scroll::-webkit-scrollbar-track { background: transparent; }
.vina-scroll::-webkit-scrollbar-thumb { background: rgba(15, 118, 110, 0.18); border-radius: 9999px; }
.vina-scroll::-webkit-scrollbar-thumb:hover { background: rgba(15, 118, 110, 0.32); }
.vina-scroll { scrollbar-width: thin; scrollbar-color: rgba(15, 118, 110, 0.18) transparent; }
`

function initials(nombre: string): string {
  return nombre
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

function firstName(nombre: string): string {
  return nombre.split(" ")[0] ?? nombre
}

export function AsignarColaborador() {
  const [lugares, setLugares] = useState<LugarItem[]>([])
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>("todos")
  const [colabFiltro, setColabFiltro] = useState<string>(COLAB_TODOS)
  const [pending, setPending] = useState<Record<string, boolean>>({})
  // Llave de remount por tarjeta: al asignar incrementamos para resetear el Select inline.
  const [inlineReset, setInlineReset] = useState<Record<string, number>>({})

  const fetchLugares = useCallback(async () => {
    try {
      const res = await fetch("/api/lugares", { cache: "no-store" })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: { lugares: LugarItem[] } = await res.json()
      setLugares(data.lugares ?? [])
    } catch {
      toast.error("No se pudieron cargar los lugares.")
    }
  }, [])

  const fetchColaboradores = useCallback(async () => {
    try {
      const res = await fetch("/api/colaboradores", { cache: "no-store" })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: { colaboradores: Colaborador[] } = await res.json()
      setColaboradores(data.colaboradores ?? [])
    } catch {
      toast.error("No se pudieron cargar los colaboradores.")
    }
  }, [])

  useEffect(() => {
    let active = true
    void (async () => {
      setLoading(true)
      await Promise.all([fetchLugares(), fetchColaboradores()])
      if (active) setLoading(false)
    })()
    return () => {
      active = false
    }
  }, [fetchLugares, fetchColaboradores])

  const filtered = lugares.filter(
    (l) => filtroTipo === "todos" || l.tipo === filtroTipo,
  )
  const colabSeleccionado =
    colabFiltro === COLAB_TODOS
      ? null
      : (colaboradores.find((c) => c.id === colabFiltro) ?? null)

  async function handleAssign(lugarId: string, colaboradorId: string) {
    if (pending[lugarId]) return
    const colabObj = colaboradores.find((c) => c.id === colaboradorId)
    if (!colabObj) {
      toast.error("Colaborador no encontrado.")
      return
    }
    setPending((p) => ({ ...p, [lugarId]: true }))

    // Actualización optimista: agrega al colaborador inmediatamente.
    setLugares((prev) =>
      prev.map((l) =>
        l.id === lugarId && !l.colaboradores.some((c) => c.id === colaboradorId)
          ? {
              ...l,
              colaboradores: [
                ...l.colaboradores,
                { id: colabObj.id, nombre: colabObj.nombre, rol: colabObj.rol },
              ],
            }
          : l,
      ),
    )

    try {
      const res = await fetch(`/api/lugares/${lugarId}/colaboradores`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ colaboradorId }),
      })
      const data: { ok?: boolean; message?: string } = await res.json()
      if (!res.ok) throw new Error(data.message ?? "Error al asignar")

      if (data.message === "Ya asignado") {
        toast.info("Ya estaba asignado", {
          description: `${colabObj.nombre} ya figura en este lugar.`,
        })
      } else {
        toast.success("Colaborador asignado", {
          description: `${colabObj.nombre} → ${lugares.find((l) => l.id === lugarId)?.nombre ?? "lugar"}`,
        })
      }
      // Refetch para confirmar consistencia con el backend.
      await fetchLugares()
    } catch {
      toast.error("No se pudo asignar al colaborador. Reintente.")
      // Rollback: refetch para restaurar el estado real.
      await fetchLugares()
    } finally {
      setPending((p) => {
        const next = { ...p }
        delete next[lugarId]
        return next
      })
      // Remonta el Select inline para volver al placeholder.
      setInlineReset((p) => ({ ...p, [lugarId]: (p[lugarId] ?? 0) + 1 }))
    }
  }

  return (
    <Card className="space-y-4 border-none bg-white/70 p-5 shadow-sm backdrop-blur sm:p-6">
      <style dangerouslySetInnerHTML={{ __html: SCROLLBAR_CSS }} />

      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 text-white shadow-md shadow-emerald-100">
          <UserCog className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-slate-800 sm:text-lg">
            Asignación de colaboradores
          </h3>
          <p className="text-xs text-muted-foreground">
            Asigne colaboradores a lugares de la comuna.
          </p>
        </div>
      </div>

      {/* Row 1: filtro por tipo (pills) */}
      <div className="flex flex-wrap gap-1.5">
        {FILTROS.map((f) => {
          const active = filtroTipo === f.key
          const Icon = f.Icon
          const count =
            f.key === "todos"
              ? lugares.length
              : lugares.filter((l) => l.tipo === f.key).length
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setFiltroTipo(f.key)}
              aria-pressed={active}
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
                active
                  ? "border-slate-800 bg-slate-800 text-white shadow-sm"
                  : "border-white/60 bg-white/70 text-slate-600 hover:bg-white",
              )}
            >
              <Icon className="h-3 w-3" />
              {f.label}
              <span
                className={cn(
                  "ml-0.5 rounded-full px-1 text-[10px] tabular-nums",
                  active ? "bg-white/20" : "bg-slate-100 text-slate-500",
                )}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Row 2: filtro por colaborador (Select) */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">
            Filtrar por colaborador
          </span>
        </div>
        <Select value={colabFiltro} onValueChange={setColabFiltro}>
          <SelectTrigger className="h-9 w-full bg-white/70 sm:w-72">
            <SelectValue placeholder="Todos los colaboradores" />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectItem value={COLAB_TODOS}>Todos los colaboradores</SelectItem>
            {colaboradores.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.nombre} ·{" "}
                <span className="text-xs text-muted-foreground">{c.rol}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Lista de lugares */}
      <div className="vina-scroll max-h-[520px] overflow-y-auto pr-1">
        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="space-y-2 rounded-xl border border-white/70 bg-white/60 p-4"
              >
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white/50 p-8 text-center text-sm text-muted-foreground">
            No hay lugares con este filtro.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {filtered.map((l) => {
              const Icon = ICON_FOR_TIPO[l.tipo]
              const color = TIPO_COLORS[l.tipo]
              const isAssigned = colabSeleccionado
                ? l.colaboradores.some((c) => c.id === colabSeleccionado.id)
                : false
              const isPending = !!pending[l.id]
              return (
                <div
                  key={l.id}
                  className={cn(
                    "group relative overflow-hidden rounded-xl border bg-white/70 p-4 shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:shadow-md",
                    colabSeleccionado && isAssigned
                      ? "border-emerald-300 ring-1 ring-emerald-200"
                      : "border-white/70",
                  )}
                >
                  <div
                    className="absolute right-0 top-0 h-20 w-20 rounded-bl-full opacity-10"
                    style={{ background: color }}
                    aria-hidden
                  />

                  <div className="flex items-start gap-2">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-sm"
                      style={{ background: color }}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate text-sm font-semibold leading-tight text-slate-800">
                        {l.nombre}
                      </h4>
                      <div className="mt-0.5 flex items-center gap-1.5">
                        <Badge
                          variant="outline"
                          className="px-1.5 py-0 text-[10px]"
                          style={{
                            color,
                            borderColor: `${color}40`,
                            background: `${color}10`,
                          }}
                        >
                          {TIPO_LABELS[l.tipo]}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <p className="mt-2 flex items-start gap-1.5 text-xs text-slate-600">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span>
                      {l.direccion}, {l.comuna}
                    </span>
                  </p>

                  {/* Colaboradores actuales */}
                  <div className="mt-2 flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    {l.colaboradores.length > 0 ? (
                      <div className="flex -space-x-1.5">
                        {l.colaboradores.slice(0, 4).map((c) => (
                          <span
                            key={c.id}
                            title={`${c.nombre} · ${c.rol}`}
                            className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 text-[10px] font-semibold text-white ring-2 ring-white"
                          >
                            {initials(c.nombre)}
                          </span>
                        ))}
                        {l.colaboradores.length > 4 && (
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-[10px] font-semibold text-slate-600 ring-2 ring-white">
                            +{l.colaboradores.length - 4}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">
                        Sin asignar
                      </span>
                    )}
                  </div>

                  {/* Acción de asignación */}
                  <div className="mt-3 border-t border-slate-100 pt-2.5">
                    {colabSeleccionado ? (
                      isAssigned ? (
                        <div className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700">
                          <Check className="h-3.5 w-3.5" />
                          Asignado a {firstName(colabSeleccionado.nombre)}
                        </div>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() =>
                            handleAssign(l.id, colabSeleccionado.id)
                          }
                          disabled={isPending}
                          className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700"
                        >
                          {isPending ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              Asignando…
                            </>
                          ) : (
                            <>
                              <Plus className="h-3.5 w-3.5" />
                              Asignar a {firstName(colabSeleccionado.nombre)}
                            </>
                          )}
                        </Button>
                      )
                    ) : isPending ? (
                      <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Asignando…
                      </div>
                    ) : (
                      <Select
                        key={`${l.id}-reset-${inlineReset[l.id] ?? 0}`}
                        onValueChange={(cid) => handleAssign(l.id, cid)}
                      >
                        <SelectTrigger
                          size="sm"
                          className="h-8 w-full border-white/60 bg-white/70"
                        >
                          <SelectValue placeholder="＋ Asignar colaborador…" />
                        </SelectTrigger>
                        <SelectContent className="max-h-72">
                          {colaboradores.length === 0 ? (
                            <div className="px-3 py-4 text-center text-xs text-muted-foreground">
                              No hay colaboradores disponibles.
                            </div>
                          ) : (
                            colaboradores.map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.nombre} ·{" "}
                                <span className="text-xs text-muted-foreground">
                                  {c.rol}
                                </span>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Card>
  )
}
