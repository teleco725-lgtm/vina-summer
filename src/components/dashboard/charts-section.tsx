"use client"

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart as PieIcon, Trophy } from "lucide-react"

type PorTipo = { tipo: string; label: string; count: number; color: string }[]
type TopLugares = { nombre: string; tipo: string; matriculas: number }[]

const TIPO_LABEL: Record<string, string> = {
  playa: "Playa",
  piscina_municipal: "Piscina",
  gimnasio_con_piscina: "Gimnasio",
}

export function ChartsSection({
  porTipo,
  topLugares,
}: {
  porTipo: PorTipo
  topLugares: TopLugares
}) {
  const barData = topLugares.map((l) => ({
    nombre: l.nombre.length > 18 ? l.nombre.slice(0, 17) + "…" : l.nombre,
    matriculas: l.matriculas,
    tipo: TIPO_LABEL[l.tipo] ?? l.tipo,
  }))

  return (
    <section className="grid gap-4 md:grid-cols-2">
      <Card className="border-none bg-white/70 backdrop-blur shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <PieIcon className="h-4.5 w-4.5 text-teal-600" />
            <CardTitle className="text-base">Distribución por tipo</CardTitle>
          </div>
          <CardDescription className="text-xs">Playas, piscinas y gimnasios con piscina</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={porTipo}
                  dataKey="count"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={3}
                  stroke="none"
                >
                  {porTipo.map((e) => (
                    <Cell key={e.tipo} fill={e.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    fontSize: 12,
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={32}
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none bg-white/70 backdrop-blur shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Trophy className="h-4.5 w-4.5 text-amber-600" />
            <CardTitle className="text-base">Lugares con más matrículas</CardTitle>
          </div>
          <CardDescription className="text-xs">Top 6 lugares por número de matrículas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis
                  type="category"
                  dataKey="nombre"
                  width={120}
                  tick={{ fontSize: 11 }}
                  stroke="#64748b"
                />
                <Tooltip
                  cursor={{ fill: "#f1f5f9" }}
                  contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
                />
                <Bar dataKey="matriculas" radius={[0, 6, 6, 0]} fill="#14b8a6" barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
