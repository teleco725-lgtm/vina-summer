"use client"

import Link from "next/link"
import { Waves, ShieldCheck, Lock, MapPin, UserCircle2, Settings2 } from "lucide-react"
import { cn } from "@/lib/utils"

type Role = "colaborador" | "admin"

export function RoleHeader({
  role,
  colaboradorNombre,
  colaboradorRol,
}: {
  role: Role
  colaboradorNombre?: string
  colaboradorRol?: string
}) {
  const isAdmin = role === "admin"
  return (
    <header className="relative z-20 border-b border-white/40 bg-white/60 backdrop-blur-md sticky top-0">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl text-white shadow-lg",
                isAdmin
                  ? "bg-gradient-to-br from-slate-700 to-teal-600 shadow-slate-300"
                  : "bg-gradient-to-br from-sky-500 to-emerald-500 shadow-sky-200",
              )}
            >
              <Waves className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-800">
                Viña Playas & Piscinas
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-500">
                {isAdmin
                  ? "Dashboard Administrador · Deportes DIDECO"
                  : "Perfil Colaborador · Gestión deportiva municipal"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Selector de rol / vista */}
            <div className="inline-flex rounded-full border border-white/60 bg-white/70 p-0.5 shadow-sm">
              <Link
                href="/"
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  role === "colaborador"
                    ? "bg-sky-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-white",
                )}
              >
                <UserCircle2 className="h-3.5 w-3.5" /> Colaborador
              </Link>
              <Link
                href="/admin"
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  role === "admin"
                    ? "bg-slate-800 text-white shadow-sm"
                    : "text-slate-600 hover:bg-white",
                )}
              >
                <Settings2 className="h-3.5 w-3.5" /> Admin DIDECO
              </Link>
            </div>

            {/* Badge de sesión */}
            {colaboradorNombre && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                <UserCircle2 className="h-3.5 w-3.5" /> {colaboradorNombre}
                {colaboradorRol && <span className="text-emerald-500">· {colaboradorRol}</span>}
              </span>
            )}

            {isAdmin && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700">
                <Lock className="h-3.5 w-3.5" /> Privilegios admin
              </span>
            )}
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
              <MapPin className="h-3.5 w-3.5" /> GPS
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
