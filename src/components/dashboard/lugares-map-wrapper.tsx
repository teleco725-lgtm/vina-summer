"use client"

/**
 * Wrapper que importa dinámicamente el mapa (leaflet) con `ssr: false`.
 * Muestra un skeleton mientras carga. Este es el componente que la página
 * debe importar: `<LugaresMapWrapper lugares={lugares} />`.
 */

import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

import type { Lugar } from "./lugares-map"

const LugaresMap = dynamic(() => import("./lugares-map").then((m) => m.LugaresMap), {
  ssr: false,
  loading: () => (
    <div
      className={cn(
        "relative h-[420px] w-full overflow-hidden rounded-xl border sm:h-[520px]"
      )}
      aria-busy="true"
      aria-label="Cargando mapa…"
    >
      <Skeleton className="absolute inset-0 h-full w-full rounded-xl" />
      <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
        Cargando mapa…
      </div>
    </div>
  ),
})

type LugaresMapWrapperProps = {
  lugares: Lugar[]
  className?: string
}

export function LugaresMapWrapper({ lugares, className }: LugaresMapWrapperProps) {
  return <LugaresMap lugares={lugares} className={className} />
}

export default LugaresMapWrapper
