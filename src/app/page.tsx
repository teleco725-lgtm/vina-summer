import { db } from "@/lib/db"
import { TIPO_LABELS, TIPO_COLORS, type TipoLugar } from "@/lib/security"
import { LugaresMapWrapper } from "@/components/dashboard/lugares-map-wrapper"
import { MatriculaForm } from "@/components/dashboard/matricula-form"
import { LugaresList } from "@/components/dashboard/lugares-list"
import { ColaboradoresSection } from "@/components/dashboard/colaboradores-section"
import { MatriculasTable } from "@/components/dashboard/matriculas-table"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { ChartsSection } from "@/components/dashboard/charts-section"
import {
  Waves,
  ShieldCheck,
  MapPin,
  Users,
  Droplets,
  Dumbbell,
  Sun,
  Lock,
  Footprints,
} from "lucide-react"

export const dynamic = "force-dynamic"

export default async function Home() {
  const [lugares, colaboradores, matriculas] = await Promise.all([
    db.lugar.findMany({
      where: { activo: true },
      orderBy: [{ tipo: "asc" }, { nombre: "asc" }],
      include: {
        colaboradores: { include: { colaborador: true } },
        _count: { select: { matriculas: true } },
      },
    }),
    db.colaborador.findMany({
      where: { activo: true },
      orderBy: { nombre: "asc" },
      include: { _count: { select: { lugares: true, matriculas: true } } },
    }),
    db.matricula.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { lugar: true, colaborador: true },
    }),
  ])

  const stats = {
    totalLugares: lugares.length,
    playas: lugares.filter((l) => l.tipo === "playa").length,
    piscinas: lugares.filter((l) => l.tipo === "piscina_municipal").length,
    gimnasios: lugares.filter((l) => l.tipo === "gimnasio_con_piscina").length,
    totalColaboradores: colaboradores.length,
    totalMatriculas: matriculas.length,
  }

  const porTipo = (["playa", "piscina_municipal", "gimnasio_con_piscina"] as TipoLugar[]).map(
    (tipo) => ({
      tipo,
      label: TIPO_LABELS[tipo],
      count: lugares.filter((l) => l.tipo === tipo).length,
      color: TIPO_COLORS[tipo],
    }),
  )

  const topLugares = [...lugares]
    .sort((a, b) => b._count.matriculas - a._count.matriculas)
    .slice(0, 6)
    .map((l) => ({ nombre: l.nombre, tipo: l.tipo, matriculas: l._count.matriculas }))

  const lugaresParaMapa = lugares.map((l) => ({
    id: l.id,
    nombre: l.nombre,
    tipo: l.tipo as TipoLugar,
    direccion: l.direccion,
    comuna: l.comuna,
    lat: l.lat,
    lng: l.lng,
    descripcion: l.descripcion,
    horario: l.horario,
    aforo: l.aforo,
  }))

  const lugaresParaForm = lugares.map((l) => ({
    id: l.id,
    nombre: l.nombre,
    tipo: l.tipo as TipoLugar,
    direccion: l.direccion,
  }))

  const colaboradoresParaForm = colaboradores.map((c) => ({
    id: c.id,
    nombre: c.nombre,
    rol: c.rol,
  }))

  const lugaresConColabs = lugares.map((l) => ({
    id: l.id,
    nombre: l.nombre,
    tipo: l.tipo as TipoLugar,
    direccion: l.direccion,
    comuna: l.comuna,
    lat: l.lat,
    lng: l.lng,
    descripcion: l.descripcion,
    horario: l.horario,
    aforo: l.aforo,
    matriculas: l._count.matriculas,
    colaboradores: l.colaboradores.map((c) => ({
      id: c.colaborador.id,
      nombre: c.colaborador.nombre,
      rol: c.colaborador.rol,
    })),
  }))

  const colaboradoresConDatos = colaboradores.map((c) => ({
    id: c.id,
    nombre: c.nombre,
    rut: c.rut,
    telefono: c.telefono,
    email: c.email,
    rol: c.rol,
    lugaresAsignados: c._count.lugares,
    matriculasGestionadas: c._count.matriculas,
  }))

  const matriculasSeguras = matriculas.map((m) => ({
    id: m.id,
    nombre: m.nombre,
    rutMasked: m.rut.replace(/^.*?(.{4})$/, "••.••.••.$1"),
    comuna: m.comuna,
    direccion: m.direccion,
    lugar: m.lugar ? { nombre: m.lugar.nombre, tipo: m.lugar.tipo as TipoLugar } : null,
    colaborador: m.colaborador ? { nombre: m.colaborador.nombre } : null,
    createdAt: m.createdAt,
  }))

  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-br from-sky-50 via-teal-50 to-emerald-50 text-foreground">
      {/* Decoración de fondo suave */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-sky-200/30 blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-teal-200/20 blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/40 bg-white/50 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-emerald-500 text-white shadow-lg shadow-sky-200">
                <Waves className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-800">
                  Viña Playas & Piscinas
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  Dashboard municipal · Gestión de lugares, matrículas y colaboradores
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                <ShieldCheck className="h-3.5 w-3.5" /> Datos protegidos
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
                <Lock className="h-3.5 w-3.5" /> Ciberseguridad
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
                <MapPin className="h-3.5 w-3.5" /> GPS · OpenStreetMap
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero gradient banner */}
      <section className="relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-500 via-teal-500 to-emerald-500 p-6 sm:p-8 text-white shadow-xl shadow-teal-200/50">
            <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Playas, piscinas y gimnasios de Viña del Mar
                </h2>
                <p className="mt-2 max-w-2xl text-sm sm:text-base text-white/90">
                  Consulta los lugares habilitados, ubícalos en el mapa con GPS y completa tu matrícula
                  con un colaborador asignado. Información oficial con estándares de protección de datos.
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <Sun className="h-10 w-10 text-yellow-200" />
                <Footprints className="h-10 w-10 text-white/80" />
              </div>
            </div>
            <div aria-hidden className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
            <div aria-hidden className="absolute -bottom-10 right-1/3 h-32 w-32 rounded-full bg-white/10" />
          </div>
        </div>
      </section>

      {/* Main content */}
      <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Stats */}
        <StatsCards stats={stats} />

        {/* Charts */}
        <ChartsSection porTipo={porTipo} topLugares={topLugares} />

        {/* Mapa + Formulario */}
        <section className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-sky-600" />
                <h3 className="text-base font-semibold text-slate-800">Mapa con GPS</h3>
              </div>
              <span className="text-xs text-muted-foreground">
                {lugares.length} lugares georreferenciados
              </span>
            </div>
            <LugaresMapWrapper lugares={lugaresParaMapa} />
            <div className="flex flex-wrap gap-3 text-xs">
              {(Object.keys(TIPO_LABELS) as TipoLugar[]).map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-2.5 py-1 border border-white/60">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: TIPO_COLORS[t] }} />
                  {TIPO_LABELS[t]}
                </span>
              ))}
            </div>
          </div>
          <div className="lg:col-span-2">
            <MatriculaForm lugares={lugaresParaForm} colaboradores={colaboradoresParaForm} />
          </div>
        </section>

        {/* Lugares (con diferencia playas/piscinas/gimnasios) */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Droplets className="h-5 w-5 text-teal-600" />
            <h3 className="text-base font-semibold text-slate-800">Lugares y direcciones</h3>
            <span className="text-xs text-muted-foreground">
              · playas, piscinas municipales y gimnasios con piscina
            </span>
          </div>
          <LugaresList lugares={lugaresConColabs} />
        </section>

        {/* Colaboradores */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-600" />
            <h3 className="text-base font-semibold text-slate-800">Colaboradores asignados</h3>
          </div>
          <ColaboradoresSection colaboradores={colaboradoresConDatos} />
        </section>

        {/* Matrículas recientes */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-amber-600" />
            <h3 className="text-base font-semibold text-slate-800">Matrículas recientes</h3>
            <span className="text-xs text-muted-foreground">· RUT enmascarado por protección de datos</span>
          </div>
          <MatriculasTable matriculas={matriculasSeguras} />
        </section>
      </main>

      {/* Footer sticky */}
      <footer className="relative z-10 mt-auto border-t border-white/40 bg-white/60 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-5">
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Waves className="h-4 w-4 text-teal-600" />
              <span className="font-medium">Viña Playas & Piscinas</span>
              <span className="text-slate-400">·</span>
              <span className="text-xs">Dashboard municipal</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Protección de datos
              </span>
              <span className="inline-flex items-center gap-1">
                <Lock className="h-3.5 w-3.5 text-sky-600" /> Cabeceras de seguridad
              </span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-teal-600" /> Mapa © OpenStreetMap
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
