"use client"

import { useCallback, useEffect, useState } from "react"
import {
  AlertTriangle,
  Ban,
  Building2,
  Calendar,
  ExternalLink,
  Info,
  Instagram,
  MapPin,
  Newspaper,
  Radio,
  RefreshCw,
  Tv,
} from "lucide-react"

import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { TIPO_COLORS, type TipoLugar } from "@/lib/security"

type Fuente = "municipal" | "prensa" | "radio" | "redes" | "television"
type Categoria = "alerta" | "info" | "evento" | "cierre"
type LugarMini = { id: string; nombre: string; tipo: TipoLugar }

type Noticia = {
  id: string
  titulo: string
  resumen: string | null
  url: string | null
  fuente: Fuente
  medio: string | null
  categoria: Categoria
  lugar: LugarMini | null
  lat: number | null
  lng: number | null
  publicadaEn: string
}

type FiltroCategoria = "todos" | Categoria

type FuenteMeta = { label: string; classes: string; Icon: typeof Newspaper }
const FUENTE_STYLE: Record<Fuente, FuenteMeta> = {
  municipal: { label: "Municipal", classes: "bg-teal-100 text-teal-700 border-teal-200", Icon: Building2 },
  prensa: { label: "Prensa", classes: "bg-sky-100 text-sky-700 border-sky-200", Icon: Newspaper },
  radio: { label: "Radio", classes: "bg-violet-100 text-violet-700 border-violet-200", Icon: Radio },
  redes: { label: "Redes", classes: "bg-pink-100 text-pink-700 border-pink-200", Icon: Instagram },
  television: { label: "TV", classes: "bg-amber-100 text-amber-700 border-amber-200", Icon: Tv },
}

type CategoriaMeta = { label: string; classes: string; Icon: typeof Info }
const CATEGORIA_STYLE: Record<Categoria, CategoriaMeta> = {
  alerta: { label: "Alerta", classes: "bg-red-100 text-red-700 border-red-200", Icon: AlertTriangle },
  info: { label: "Info", classes: "bg-slate-100 text-slate-700 border-slate-200", Icon: Info },
  evento: { label: "Evento", classes: "bg-emerald-100 text-emerald-700 border-emerald-200", Icon: Calendar },
  cierre: { label: "Cierre", classes: "bg-orange-100 text-orange-700 border-orange-200", Icon: Ban },
}

const FILTROS_CAT: { key: FiltroCategoria; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "alerta", label: "Alertas" },
  { key: "evento", label: "Eventos" },
  { key: "info", label: "Info" },
]

/** Tiempo relativo simple en español ("hace X min" / "hace X h" / "hace X d"). */
function haceTiempo(iso: string): string {
  const date = new Date(iso)
  const diffMs = Date.now() - date.getTime()
  const sec = Math.floor(diffMs / 1000)
  if (sec < 45) return "hace un momento"
  const min = Math.floor(sec / 60)
  if (min < 60) return `hace ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `hace ${h} h`
  const d = Math.floor(h / 24)
  if (d < 7) return `hace ${d} d`
  return date.toLocaleDateString("es-CL", { day: "2-digit", month: "short" })
}

function formatHora(date: Date): string {
  return date.toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
}

/** CSS inyectado una sola vez por instancia: animación marquee + scrollbar teal. */
const TICKER_CSS = `
@keyframes vina-marquee {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.vina-marquee-track {
  animation: vina-marquee 34s linear infinite;
  will-change: transform;
}
.vina-marquee-wrap:hover .vina-marquee-track {
  animation-play-state: paused;
}
.vina-scroll::-webkit-scrollbar { width: 8px; }
.vina-scroll::-webkit-scrollbar-track { background: transparent; }
.vina-scroll::-webkit-scrollbar-thumb { background: rgba(15, 118, 110, 0.18); border-radius: 9999px; }
.vina-scroll::-webkit-scrollbar-thumb:hover { background: rgba(15, 118, 110, 0.32); }
.vina-scroll { scrollbar-width: thin; scrollbar-color: rgba(15, 118, 110, 0.18) transparent; }
`

export function NoticiasTicker() {
  const [noticias, setNoticias] = useState<Noticia[]>([])
  const [loading, setLoading] = useState(true)
  const [refetching, setRefetching] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [filtro, setFiltro] = useState<FiltroCategoria>("todos")
  const [error, setError] = useState<string | null>(null)

  const fetchNoticias = useCallback(async (initial: boolean) => {
    if (initial) setLoading(true)
    else setRefetching(true)
    setError(null)
    try {
      const res = await fetch("/api/noticias?limite=20", { cache: "no-store" })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: { noticias: Noticia[]; total: number } = await res.json()
      setNoticias(data.noticias ?? [])
      setLastUpdate(new Date())
    } catch {
      setError("No se pudieron cargar las noticias. Intente nuevamente.")
    } finally {
      if (initial) setLoading(false)
      else setRefetching(false)
    }
  }, [])

  useEffect(() => {
    fetchNoticias(true)
    const id = window.setInterval(() => fetchNoticias(false), 30_000)
    return () => window.clearInterval(id)
  }, [fetchNoticias])

  const headlines = noticias.slice(0, 5)
  const filtered = filtro === "todos" ? noticias : noticias.filter((n) => n.categoria === filtro)

  return (
    <Card className="relative overflow-hidden border-none bg-white/70 backdrop-blur shadow-sm p-5 sm:p-6 space-y-4">
      <style dangerouslySetInnerHTML={{ __html: TICKER_CSS }} />

      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 text-white shadow-md shadow-emerald-100">
          <Newspaper className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base sm:text-lg font-semibold text-slate-800">
              Noticias municipales en vivo
            </h3>
            <span
              className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-600"
              aria-label="Transmisión en vivo"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-600" />
              </span>
              EN VIVO
            </span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Últimas novedades de playas, piscinas y gimnasios de la comuna.
          </p>
        </div>
        <div className="hidden text-right sm:block">
          {refetching ? (
            <div className="flex items-center justify-end gap-1 text-[11px] text-muted-foreground">
              <RefreshCw className="h-3 w-3 animate-spin" />
              <span>actualizando…</span>
            </div>
          ) : lastUpdate ? (
            <div className="flex items-center justify-end gap-1 text-[11px] text-muted-foreground">
              <span>Actualizado:</span>
              <span className="font-medium tabular-nums text-slate-600">
                {formatHora(lastUpdate)}
              </span>
            </div>
          ) : (
            <span className="text-[11px] text-muted-foreground">—</span>
          )}
        </div>
      </div>

      {/* Marquee ticker */}
      <div className="vina-marquee-wrap relative overflow-hidden rounded-xl border border-white/70 bg-white/60">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-white/90 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-white/90 to-transparent" />
        {headlines.length > 0 ? (
          <div className="vina-marquee-track flex w-max">
            {[...headlines, ...headlines].map((n, idx) => {
              const f = FUENTE_STYLE[n.fuente]
              const Icon = f.Icon
              return (
                <a
                  key={`${n.id}-${idx}`}
                  href={n.url ?? "#"}
                  target={n.url ? "_blank" : undefined}
                  rel={n.url ? "noopener noreferrer" : undefined}
                  className="flex items-center gap-2 whitespace-nowrap px-4 py-2.5 text-xs transition-colors hover:bg-white/70"
                  aria-label={n.titulo}
                >
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold",
                      f.classes,
                    )}
                  >
                    <Icon className="h-3 w-3" />
                    {f.label}
                  </span>
                  <span className="text-slate-700">{n.titulo}</span>
                  <span className="text-slate-300" aria-hidden>
                    •
                  </span>
                </a>
              )
            })}
          </div>
        ) : (
          <div className="px-4 py-2.5 text-xs text-muted-foreground">
            Sin titulares disponibles.
          </div>
        )}
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-1.5">
        {FILTROS_CAT.map((f) => {
          const active = filtro === f.key
          const count =
            f.key === "todos"
              ? noticias.length
              : noticias.filter((n) => n.categoria === f.key).length
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setFiltro(f.key)}
              aria-pressed={active}
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
                active
                  ? "border-slate-800 bg-slate-800 text-white shadow-sm"
                  : "border-white/60 bg-white/70 text-slate-600 hover:bg-white",
              )}
            >
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

      {/* News list */}
      <div className="vina-scroll max-h-96 space-y-3 overflow-y-auto pr-1">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="space-y-2 rounded-xl border border-white/70 bg-white/60 p-3"
            >
              <div className="flex gap-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50/60 p-6 text-center text-sm text-red-700">
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white/50 p-8 text-center text-sm text-muted-foreground">
            No hay noticias en esta categoría.
          </div>
        ) : (
          filtered.map((n) => {
            const f = FUENTE_STYLE[n.fuente]
            const FIcon = f.Icon
            const c = CATEGORIA_STYLE[n.categoria]
            const CIcon = c.Icon
            const lugarColor = n.lugar ? TIPO_COLORS[n.lugar.tipo] : null
            return (
              <article
                key={n.id}
                className="rounded-xl border border-white/70 bg-white/60 p-3 transition-shadow hover:shadow-sm"
              >
                <div className="flex flex-wrap items-center gap-1.5">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold",
                      f.classes,
                    )}
                  >
                    <FIcon className="h-3 w-3" />
                    {f.label}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold",
                      c.classes,
                    )}
                  >
                    <CIcon className="h-3 w-3" />
                    {c.label}
                  </span>
                  {n.medio && (
                    <span className="text-[10px] text-muted-foreground">· {n.medio}</span>
                  )}
                  <span className="ml-auto text-[10px] tabular-nums text-muted-foreground">
                    {haceTiempo(n.publicadaEn)}
                  </span>
                </div>

                <h4 className="mt-1.5 text-sm font-semibold leading-snug text-slate-800">
                  {n.titulo}
                </h4>
                {n.resumen && (
                  <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                    {n.resumen}
                  </p>
                )}

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {n.lugar && (
                    <span
                      className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium"
                      style={
                        lugarColor
                          ? {
                              color: lugarColor,
                              borderColor: `${lugarColor}40`,
                              background: `${lugarColor}10`,
                            }
                          : undefined
                      }
                    >
                      <MapPin className="h-3 w-3" />
                      {n.lugar.nombre}
                    </span>
                  )}
                  {n.url && (
                    <a
                      href={n.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white/70 px-2 py-1 text-[11px] font-medium text-slate-600 transition-colors hover:bg-white hover:text-slate-800"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Ver fuente
                    </a>
                  )}
                </div>
              </article>
            )
          })
        )}
      </div>
    </Card>
  )
}
