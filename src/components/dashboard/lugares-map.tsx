"use client"

/**
 * Mapa interactivo de lugares de Viña del Mar.
 * - react-leaflet + OpenStreetMap (sin API key)
 * - Marcadores categorizados (playa / piscina_municipal / gimnasio_con_piscina)
 * - Botón GPS "Mi ubicación" que ubica al usuario y vuela hacia su posición.
 *
 * Este componente es un Client Component (leaflet requiere el navegador).
 * Debe ser importado dinámicamente con `ssr: false` desde el padre
 * (ver `lugares-map-wrapper.tsx`).
 */

import "leaflet/dist/leaflet.css"

import * as L from "leaflet"
import { LocateFixed, MapPin, Waves, Droplet, Dumbbell } from "lucide-react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TIPO_COLORS, TIPO_LABELS, type TipoLugar } from "@/lib/security"
import { cn } from "@/lib/utils"

/** Forma de un lugar mostrado en el mapa. */
export type Lugar = {
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
}

type LugaresMapProps = {
  lugares: Lugar[]
  className?: string
}

const VINA_CENTER: [number, number] = [-33.0193, -71.5539]
const DEFAULT_ZOOM = 13
const USER_ZOOM = 15

/** Construye un divIcon de leaflet con un SVG coloreado según el tipo de lugar. */
function buildTipoIcon(tipo: TipoLugar): L.DivIcon {
  const color = TIPO_COLORS[tipo]
  const label = TIPO_LABELS[tipo]

  const svgByTipo: Record<TipoLugar, string> = {
    playa: `<path d="M3 18c1.6 0 1.6-1.2 3.2-1.2S8.2 18 9.8 18s1.6-1.2 3.2-1.2S14.6 18 16.2 18s1.6-1.2 3.2-1.2S20.6 18 22 18" stroke="white" stroke-width="1.6" stroke-linecap="round" fill="none"/><circle cx="17.5" cy="7" r="2.2" fill="white"/><path d="M3 22h18" stroke="white" stroke-width="1.6" stroke-linecap="round"/>`,
    piscina_municipal: `<path d="M12 3.2c-2.4 3-4.6 5.4-4.6 8.1A4.6 4.6 0 0 0 12 16a4.6 4.6 0 0 0 4.6-4.7c0-2.7-2.2-5.1-4.6-8.1Z" fill="white"/><path d="M7 20c1.6 0 1.6-1 3.2-1S11.8 20 13.4 20s1.6-1 3.2-1S18.2 20 19.8 20" stroke="white" stroke-width="1.4" stroke-linecap="round" fill="none"/>`,
    gimnasio_con_piscina: `<path d="M6.5 6.5 17.5 17.5M3 8l1.5-1.5L6 8M18 8l1.5-1.5L21 8M3 16l1.5 1.5L6 16M18 16l1.5 1.5L21 16M9 12h6" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
  }

  const svg = svgByTipo[tipo]
  const html = `
    <div style="position:relative;width:32px;height:40px;">
      <svg width="32" height="40" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M12 0C5.4 0 0 5.4 0 12c0 7.5 9 16.4 11.3 18.7a1 1 0 0 0 1.4 0C15 28.4 24 19.5 24 12 24 5.4 18.6 0 12 0Z" fill="${color}" stroke="white" stroke-width="1.5"/>
        <g transform="translate(0 2) scale(1)">
          ${svg}
        </g>
      </svg>
    </div>
  `

  return L.divIcon({
    html,
    className: "lugares-tipo-marker",
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -36],
  })
}

/** Icono de usuario (punto azul) para la ubicación GPS. */
function buildUserIcon(): L.DivIcon {
  const html = `
    <div style="position:relative;width:24px;height:24px;">
      <span style="position:absolute;inset:0;border-radius:9999px;background:#3b82f6;opacity:0.25;animation:lugares-pulse 1.8s ease-out infinite;"></span>
      <span style="position:absolute;left:6px;top:6px;width:12px;height:12px;border-radius:9999px;background:#3b82f6;border:2px solid white;box-shadow:0 0 6px rgba(0,0,0,0.35);"></span>
    </div>
  `
  return L.divIcon({
    html,
    className: "lugares-user-marker",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  })
}

/**
 * Captura la instancia del mapa (react-leaflet v5 ya no expone `whenCreated`).
 * Se monta como hijo de MapContainer y guarda el mapa en un ref externo.
 */
function MapInstanceCapture({
  onReady,
}: {
  onReady: (map: L.Map) => void
}) {
  const map = useMap()
  useEffect(() => {
    if (map) onReady(map)
  }, [map, onReady])
  return null
}

export function LugaresMap({ lugares, className }: LugaresMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const [userPos, setUserPos] = useState<[number, number] | null>(null)
  const [locating, setLocating] = useState(false)

  // Inyecta estilos de animación del marcador de usuario (solo una vez).
  useEffect(() => {
    const styleId = "lugares-map-pulse-style"
    if (document.getElementById(styleId)) return
    const style = document.createElement("style")
    style.id = styleId
    style.textContent = `
      @keyframes lugares-pulse {
        0% { transform: scale(0.6); opacity: 0.5; }
        70% { transform: scale(2.2); opacity: 0; }
        100% { transform: scale(2.2); opacity: 0; }
      }
      .lugares-tipo-marker { background: transparent !important; border: none !important; }
      .lugares-user-marker { background: transparent !important; border: none !important; }
      .leaflet-container { font-family: inherit; }
    `
    document.head.appendChild(style)
  }, [])

  const handleMapReady = useCallback((map: L.Map) => {
    mapRef.current = map
  }, [])

  // Pre-construye un icono por tipo (cacheado).
  const iconsByTipo = useMemo(() => {
    const cache: Partial<Record<TipoLugar, L.DivIcon>> = {}
    ;(Object.keys(TIPO_COLORS) as TipoLugar[]).forEach((tipo) => {
      cache[tipo] = buildTipoIcon(tipo)
    })
    return cache as Record<TipoLugar, L.DivIcon>
  }, [])

  const userIcon = useMemo(() => buildUserIcon(), [])

  const handleLocate = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error("Geolocalización no disponible", {
        description: "Tu navegador no soporta geolocalización.",
      })
      return
    }

    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const latlng: [number, number] = [latitude, longitude]
        setUserPos(latlng)
        const map = mapRef.current
        if (map) {
          map.flyTo(latlng, USER_ZOOM, { duration: 1.2 })
        }
        setLocating(false)
        toast.success("Ubicación encontrada", {
          description: "Centrando el mapa en tu posición actual.",
        })
      },
      (err) => {
        setLocating(false)
        const messages: Record<number, string> = {
          [err.PERMISSION_DENIED]: "Permiso denegado para acceder a tu ubicación.",
          [err.POSITION_UNAVAILABLE]: "No se pudo determinar tu ubicación.",
          [err.TIMEOUT]: "Se agotó el tiempo para obtener tu ubicación.",
        }
        toast.error("No se pudo obtener tu ubicación", {
          description: messages[err.code] ?? err.message,
        })
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }, [])

  const hasLugares = lugares.length > 0

  return (
    <div
      className={cn(
        "relative h-[420px] w-full overflow-hidden rounded-xl border sm:h-[520px]",
        className
      )}
    >
      <MapContainer
        center={VINA_CENTER}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom
        className="h-full w-full"
        aria-label="Mapa de lugares de Viña del Mar"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapInstanceCapture onReady={handleMapReady} />

        {hasLugares &&
          lugares.map((lugar) => (
            <Marker
              key={lugar.id}
              position={[lugar.lat, lugar.lng]}
              icon={iconsByTipo[lugar.tipo]}
            >
              <Popup>
                <div className="min-w-[200px] space-y-1.5">
                  <div className="font-semibold leading-tight">{lugar.nombre}</div>
                  <div>
                    <Badge
                      style={{
                        backgroundColor: TIPO_COLORS[lugar.tipo],
                        color: "white",
                        borderColor: "transparent",
                      }}
                    >
                      {TIPO_LABELS[lugar.tipo]}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {lugar.direccion}
                    {lugar.comuna ? ` — ${lugar.comuna}` : ""}
                  </div>
                  {lugar.horario ? (
                    <div className="text-xs">
                      <span className="font-medium">Horario:</span>{" "}
                      {lugar.horario}
                    </div>
                  ) : null}
                  {typeof lugar.aforo === "number" && lugar.aforo > 0 ? (
                    <div className="text-xs">
                      <span className="font-medium">Aforo:</span> {lugar.aforo}{" "}
                      personas
                    </div>
                  ) : null}
                  {lugar.descripcion ? (
                    <div className="pt-1 text-xs text-muted-foreground">
                      {lugar.descripcion}
                    </div>
                  ) : null}
                </div>
              </Popup>
            </Marker>
          ))}

        {userPos ? (
          <Marker position={userPos} icon={userIcon}>
            <Popup>
              <div className="text-sm font-medium">Estás aquí</div>
              <div className="text-xs text-muted-foreground">
                {userPos[0].toFixed(5)}, {userPos[1].toFixed(5)}
              </div>
            </Popup>
          </Marker>
        ) : null}
      </MapContainer>

      {/* Botón flotante: GPS "Mi ubicación" */}
      <Button
        type="button"
        variant="default"
        size="sm"
        onClick={handleLocate}
        disabled={locating}
        className="absolute right-3 top-3 z-[1000] gap-1.5 shadow-md"
        aria-label="Buscar mi ubicación actual"
      >
        <LocateFixed className={cn("size-4", locating && "animate-spin")} />
        Mi ubicación
      </Button>

      {/* Leyenda */}
      <div className="pointer-events-none absolute bottom-3 left-3 z-[1000] rounded-md border bg-background/90 px-3 py-2 text-xs shadow-md backdrop-blur">
        <div className="mb-1 font-semibold">Leyenda</div>
        <ul className="space-y-1">
          <li className="flex items-center gap-2">
            <Waves className="size-3.5" style={{ color: TIPO_COLORS.playa }} />
            <span>{TIPO_LABELS.playa}</span>
          </li>
          <li className="flex items-center gap-2">
            <Droplet
              className="size-3.5"
              style={{ color: TIPO_COLORS.piscina_municipal }}
            />
            <span>{TIPO_LABELS.piscina_municipal}</span>
          </li>
          <li className="flex items-center gap-2">
            <Dumbbell
              className="size-3.5"
              style={{ color: TIPO_COLORS.gimnasio_con_piscina }}
            />
            <span>{TIPO_LABELS.gimnasio_con_piscina}</span>
          </li>
          <li className="mt-1 flex items-center gap-2 border-t pt-1">
            <MapPin className="size-3.5 text-blue-500" />
            <span>Mi ubicación</span>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default LugaresMap
