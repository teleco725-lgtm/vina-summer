"use client"

import { Users, Phone, Mail, ShieldCheck, ClipboardList } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type Colab = {
  id: string
  nombre: string
  rut: string
  telefono?: string | null
  email?: string | null
  rol: string
  lugaresAsignados: number
  matriculasGestionadas: number
}

const ROL_CLS: Record<string, string> = {
  supervisora: "bg-rose-100 text-rose-700 border-rose-200",
  coordinador: "bg-violet-100 text-violet-700 border-violet-200",
  colaborador: "bg-teal-100 text-teal-700 border-teal-200",
}

function maskRut(rut: string): string {
  if (!rut) return ""
  // Mantener el dígito verificador visible, ocultar el cuerpo
  const parts = rut.split("-")
  if (parts.length !== 2) return rut
  return `••.••.${parts[0].slice(-3)}.${parts[1]}`
}

export function ColaboradoresSection({ colaboradores }: { colaboradores: Colab[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {colaboradores.map((c) => (
        <Card key={c.id} className="relative overflow-hidden border-none bg-white/70 backdrop-blur p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 text-sm font-bold text-white shadow-sm">
              {c.nombre.split(" ").map((n) => n[0]).slice(0, 2).join("")}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="truncate text-sm font-semibold text-slate-800">{c.nombre}</h4>
              <div className="mt-0.5 flex items-center gap-1.5">
                <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${ROL_CLS[c.rol] ?? "bg-slate-100 text-slate-700 border-slate-200"}`}>
                  {c.rol}
                </Badge>
              </div>
            </div>
          </div>

          <div className="mt-3 space-y-1 text-xs text-slate-600">
            <p className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span className="tabular-nums">{maskRut(c.rut)}</span>
              <span className="text-[10px] text-muted-foreground">RUT protegido</span>
            </p>
            {c.telefono && (
              <p className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="tabular-nums">{c.telefono}</span>
              </p>
            )}
            {c.email && (
              <p className="flex items-center gap-1.5 truncate">
                <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="truncate">{c.email}</span>
              </p>
            )}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-2.5">
            <div className="rounded-lg bg-sky-50 p-2 text-center">
              <div className="flex items-center justify-center gap-1 text-[10px] text-sky-700">
                <Users className="h-3 w-3" /> Lugares
              </div>
              <div className="text-base font-bold tabular-nums text-slate-800">{c.lugaresAsignados}</div>
            </div>
            <div className="rounded-lg bg-emerald-50 p-2 text-center">
              <div className="flex items-center justify-center gap-1 text-[10px] text-emerald-700">
                <ClipboardList className="h-3 w-3" /> Matrículas
              </div>
              <div className="text-base font-bold tabular-nums text-slate-800">{c.matriculasGestionadas}</div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
