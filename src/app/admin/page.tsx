import { db } from "@/lib/db"
import { TIPO_LABELS, TIPO_COLORS, type TipoLugar } from "@/lib/security"
import { RoleHeader } from "@/components/dashboard/role-header"
import { SiteFooter } from "@/components/dashboard/site-footer"
import { AdminMapWrapper } from "@/components/dashboard/admin-map-wrapper"
import { NoticiasTicker } from "@/components/dashboard/noticias-ticker"
import { AsignarColaborador } from "@/components/dashboard/asignar-colaborador"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { ChartsSection } from "@/components/dashboard/charts-section"
import { ExportSection } from "@/components/dashboard/export-section"
import { EmailSection } from "@/components/dashboard/email-section"
import {
  ShieldAlert,
  Radio,
  UserCog,
  LayoutDashboard,
  Download,
  Mail,
  BarChart3,
} from "lucide-react"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
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
    db.matricula.count(),
  ])

  const stats = {
    totalLugares: lugares.length,
    playas: lugares.filter((l) => l.tipo === "playa").length,
    piscinas: lugares.filter((l) => l.tipo === "piscina_municipal").length,
    gimnasios: lugares.filter((l) => l.tipo === "gimnasio_con_piscina").length,
    totalColaboradores: colaboradores.length,
    totalMatriculas: matriculas,
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

  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-teal-50 to-emerald-50 text-foreground">
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-teal-200/30 blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-slate-200/30 blur-3xl" />
      </div>

      <RoleHeader role="admin" />

      {/* Hero admin */}
      <section className="relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-700 via-teal-700 to-emerald-700 p-6 sm:p-8 text-white shadow-xl shadow-teal-200/50">
            <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium mb-2">
                  <ShieldAlert className="h-3.5 w-3.5" /> Acceso restringido · Dirección de Deportes DIDECO
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard Administrativo</h2>
                <p className="mt-2 max-w-2xl text-sm sm:text-base text-white/90">
                  Monitoreo en tiempo real, noticias municipales y gestión de colaboradores en playas, piscinas y gimnasios de la comuna.
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <LayoutDashboard className="h-10 w-10 text-white/80" />
                <Radio className="h-10 w-10 text-emerald-200" />
              </div>
            </div>
            <div aria-hidden className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
            <div aria-hidden className="absolute -bottom-10 right-1/3 h-32 w-32 rounded-full bg-white/10" />
          </div>
        </div>
      </section>

      <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Stats */}
        <StatsCards stats={stats} />

        {/* Noticias en vivo (ticker) */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-emerald-600" />
            <h3 className="text-base font-semibold text-slate-800">Noticias municipales en vivo</h3>
            <span className="text-xs text-muted-foreground">· agregadas de prensa, radio, TV y redes</span>
          </div>
          <NoticiasTicker />
        </section>

        {/* Mapa en tiempo real */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 text-teal-600" />
            <h3 className="text-base font-semibold text-slate-800">Mapa en tiempo real</h3>
            <span className="text-xs text-muted-foreground">· monitoreo GPS con auto-actualización</span>
          </div>
          <AdminMapWrapper lugaresInicia={lugaresParaMapa} />
        </section>

        {/* Asignación de colaboradores */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <UserCog className="h-5 w-5 text-violet-600" />
            <h3 className="text-base font-semibold text-slate-800">Asignación de colaboradores</h3>
            <span className="text-xs text-muted-foreground">· filtre por playa/piscina/gimnasio y asigne por nombre</span>
          </div>
          <AsignarColaborador />
        </section>

        {/* Charts */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-sky-600" />
            <h3 className="text-base font-semibold text-slate-800">Indicadores</h3>
          </div>
          <ChartsSection porTipo={porTipo} topLugares={topLugares} />
        </section>

        {/* Exportar informe */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5 text-teal-600" />
            <h3 className="text-base font-semibold text-slate-800">Exportar informe</h3>
            <span className="text-xs text-muted-foreground">· Excel, Word y PDF como informe profesional</span>
          </div>
          <ExportSection />
        </section>

        {/* Envío por correo */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-emerald-600" />
            <h3 className="text-base font-semibold text-slate-800">Envío por correo electrónico</h3>
            <span className="text-xs text-muted-foreground">· Dirección de Deportes</span>
          </div>
          <EmailSection />
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
