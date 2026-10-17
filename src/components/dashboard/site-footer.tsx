import { Waves, ShieldCheck, Lock, MapPin } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="relative z-10 mt-auto border-t border-white/40 bg-white/60 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-5">
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Waves className="h-4 w-4 text-teal-600" />
            <span className="font-medium">Viña Playas & Piscinas</span>
            <span className="text-slate-400">·</span>
            <span className="text-xs">Municipalidad de Viña del Mar · Deportes DIDECO</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Protección de datos
            </span>
            <span className="inline-flex items-center gap-1">
              <Lock className="h-3.5 w-3.5 text-sky-600" /> Ciberseguridad
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-teal-600" /> © OpenStreetMap
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
