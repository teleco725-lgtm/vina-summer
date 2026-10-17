"use client"

import { Waves, Droplets, Dumbbell, Users, ClipboardList, MapPin } from "lucide-react"
import { Card } from "@/components/ui/card"

type Stats = {
  totalLugares: number
  playas: number
  piscinas: number
  gimnasios: number
  totalColaboradores: number
  totalMatriculas: number
}

const items = (s: Stats) => [
  {
    label: "Total lugares",
    value: s.totalLugares,
    icon: MapPin,
    gradient: "from-slate-500 to-slate-600",
    sub: "georreferenciados",
  },
  {
    label: "Playas",
    value: s.playas,
    icon: Waves,
    gradient: "from-sky-500 to-cyan-500",
    sub: "de Viña del Mar",
  },
  {
    label: "Piscinas municipales",
    value: s.piscinas,
    icon: Droplets,
    gradient: "from-emerald-500 to-teal-500",
    sub: "acceso público",
  },
  {
    label: "Gimnasios c/ piscina",
    value: s.gimnasios,
    icon: Dumbbell,
    gradient: "from-amber-500 to-orange-500",
    sub: "complejos deportivos",
  },
  {
    label: "Colaboradores",
    value: s.totalColaboradores,
    icon: Users,
    gradient: "from-teal-500 to-emerald-600",
    sub: "asignados",
  },
  {
    label: "Matrículas",
    value: s.totalMatriculas,
    icon: ClipboardList,
    gradient: "from-rose-500 to-pink-500",
    sub: "registradas",
  },
]

export function StatsCards({ stats }: { stats: Stats }) {
  return (
    <section className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
      {items(stats).map((it) => (
        <Card
          key={it.label}
          className="relative overflow-hidden border-none bg-white/70 backdrop-blur p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className={`absolute -right-4 -top-4 h-16 w-16 rounded-full bg-gradient-to-br ${it.gradient} opacity-15`} />
          <div className={`mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${it.gradient} text-white shadow-sm`}>
            <it.icon className="h-4.5 w-4.5" />
          </div>
          <div className="text-2xl font-bold tabular-nums text-slate-800">{it.value}</div>
          <div className="text-xs font-medium text-slate-600 leading-tight">{it.label}</div>
          <div className="text-[10px] text-muted-foreground">{it.sub}</div>
        </Card>
      ))}
    </section>
  )
}
