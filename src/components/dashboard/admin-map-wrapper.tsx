"use client"

import { useEffect, useState, useCallback } from "react"
import { MapPin, RefreshCw, Radio } from "lucide-react"
import { LugaresMapWrapper } from "@/components/dashboard/lugares-map-wrapper"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { Lugar } from "@/components/dashboard/lugares-map"
import type { TipoLugar } from "@/lib/security"

type NoticiaGeo = {
  id: string
  titulo: string
  categoria: string
  lat?: number | null
  lng?: number | null
  lugar?: { nombre: string; tipo: string } | null
}

type LugarConNoticias = Lugar & { noticiasActivas?: number }

/**
 * Mapa en tiempo real del admin: auto-refresca lugares cada 30s y muestra
 * noticias activas como overlay markers sobre los lugares afectados.
 */
export function AdminMapWrapper({ lugaresInicia }: { lugaresInicia: Lugar[] }) {
  const [lugares, setLugares] = useState<LugarConNoticias[]>(lugaresInicia)
  const [noticias, setNoticias] = useState<NoticiaGeo[]>([])
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date>(new Date())
  const [refrescando, setRefrescando] = useState(false)

  const refrescar = useCallback(async () => {
    setRefrescando(true)
    try {
      const [resLugares, resNoticias] = await Promise.all([
        fetch("/api/lugares"),
        fetch("/api/noticias?limite=30"),
      ])
      if (resLugares.ok) {
        const data = await resLugares.json()
        const lugs: LugarConNoticias[] = (data.lugares ?? []).map((l: Record<string, unknown>) => ({
          id: l.id as string,
          nombre: l.nombre as string,
          tipo: l.tipo as TipoLugar,
          direccion: l.direccion as string,
          comuna: l.comuna as string,
          lat: l.lat as number,
          lng: l.lng as number,
          descripcion: (l.descripcion as string) ?? null,
          horario: (l.horario as string) ?? null,
          aforo: (l.aforo as number) ?? null,
        }))
        setLugares(lugs)
      }
      if (resNoticias.ok) {
        const data = await resNoticias.json()
        setNoticias((data.noticias ?? []) as NoticiaGeo[])
      }
      setUltimaActualizacion(new Date())
    } catch {
      // fallo silencioso — siguiente tick lo reintentará
    } finally {
      setTimeout(() => setRefrescando(false), 500)
    }
  }, [])

  // Auto-refresh cada 30 segundos
  useEffect(() => {
    refrescar()
    const id = setInterval(refrescar, 30000)
    return () => clearInterval(id)
  }, [refrescar])

  // Cruzar noticias con lugares para contar alertas activas por lugar
  const lugaresEnriquecidos: LugarConNoticias[] = lugares.map((l) => ({
    ...l,
    noticiasActivas: noticias.filter(
      (n) =>
        n.lat != null &&
        n.lng != null &&
        Math.abs(n.lat - l.lat) < 0.001 &&
        Math.abs(n.lng - l.lng) < 0.001,
    ).length,
  }))

  const alertasActivas = noticias.filter((n) => n.categoria === "alerta").length

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
            <Radio className="h-3.5 w-3.5" /> EN VIVO
          </span>
          <span className="text-xs text-muted-foreground">
            Actualizado: {ultimaActualizacion.toLocaleTimeString("es-CL")}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {alertasActivas > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 border border-red-200 px-2.5 py-1 text-[11px] font-medium text-red-700">
              <MapPin className="h-3 w-3" /> {alertasActivas} alerta(s) activa(s)
            </span>
          )}
          <button
            onClick={refrescar}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/60 bg-white/70 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-white transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refrescando ? "animate-spin" : ""}`} />
            {refrescando ? "Actualizando…" : "Actualizar"}
          </button>
        </div>
      </div>

      {lugares.length === 0 ? (
        <Card className="h-[420px] sm:h-[520px] w-full flex items-center justify-center border-none bg-white/70 backdrop-blur">
          <Skeleton className="h-full w-full" />
        </Card>
      ) : (
        <LugaresMapWrapper lugares={lugaresEnriquecidos} />
      )}

      <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
        <RefreshCw className="h-3 w-3" />
        Auto-actualización cada 30 segundos · {lugares.length} lugares monitoreados · {noticias.length} noticias activas
      </p>
    </div>
  )
}
