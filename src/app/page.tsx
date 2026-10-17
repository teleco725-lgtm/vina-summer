import { db } from "@/lib/db"
import { TIPO_LABELS, TIPO_COLORS, type TipoLugar } from "@/lib/security"
import { safeQuery, DEMO_LUGARES, DEMO_COLABORADORES } from "@/lib/db-safe"
import { RoleHeader } from "@/components/dashboard/role-header"
import { SiteFooter } from "@/components/dashboard/site-footer"
import { LugaresMapWrapper } from "@/components/dashboard/lugares-map-wrapper"
import { MatriculaForm } from "@/components/dashboard/matricula-form"
import { MatriculasTable } from "@/components/dashboard/matriculas-table"
import { NoticiasTicker } from "@/components/dashboard/noticias-ticker"
import {
  Waves,
  Sun,
  Footprints,
  MapPin,
  UserCircle2,
  ClipboardList,
  Send,
  Mail,
  Building2,
  Phone,
  Mail as MailIcon,
  Newspaper,
} from "lucide-react"

export const dynamic = "force-dynamic"

export default async function Home() {
  // "Sesión" del colaborador logueado (demo): el primer colaborador activo.
  // safeQuery: si la DB no está disponible (ej. Vercel serverless), usa datos demo.
  const yo = await safeQuery(
    () =>
      db.colaborador.findFirst({
        where: { activo: true },
        orderBy: { nombre: "asc" },
        include: {
          lugares: { include: { lugar: { include: { _count: { select: { matriculas: true } } } } } },
          matriculas: { take: 10, orderBy: { createdAt: "desc" }, include: { lugar: true } },
          _count: { select: { lugares: true, matriculas: true } },
        },
      }),
    // Fallback demo: simula un colaborador con datos en memoria
    DEMO_COLABORADORES[0] as Awaited<ReturnType<typeof db.colaborador.findFirst>>,
  )

  if (!yo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-teal-50 to-emerald-50">
        <p className="text-slate-500">No hay colaboradores activos.</p>
      </div>
    )
  }

  // Lugares asignados a este colaborador
  const misLugares = yo.lugares.map((l) => l.lugar)
  const misMatriculas = yo.matriculas

  const stats = {
    lugares: yo._count.lugares,
    matriculas: yo._count.matriculas,
    playas: misLugares.filter((l) => l.tipo === "playa").length,
    piscinas: misLugares.filter((l) => l.tipo === "piscina_municipal").length,
    gimnasios: misLugares.filter((l) => l.tipo === "gimnasio_con_piscina").length,
  }

  const lugaresParaMapa = misLugares.map((l) => ({
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

  // Lugares disponibles para el formulario: los asignados a este colaborador
  const lugaresParaForm = misLugares.map((l) => ({
    id: l.id,
    nombre: l.nombre,
    tipo: l.tipo as TipoLugar,
    direccion: l.direccion,
  }))

  const matriculasSeguras = misMatriculas.map((m) => ({
    id: m.id,
    nombre: m.nombre,
    rutMasked: m.rut.replace(/^.*?(.{4})$/, "••.••.••.$1"),
    comuna: m.comuna,
    direccion: m.direccion,
    lugar: m.lugar ? { nombre: m.lugar.nombre, tipo: m.lugar.tipo as TipoLugar } : null,
    colaborador: { nombre: yo.nombre },
    createdAt: m.createdAt,
  }))

  const kpis = [
    { label: "Lugares asignados", value: stats.lugares, icon: MapPin, color: "from-sky-500 to-cyan-500" },
    { label: "Playas a cargo", value: stats.playas, icon: Waves, color: "from-sky-500 to-cyan-500" },
    { label: "Piscinas a cargo", value: stats.piscinas, icon: Waves, color: "from-emerald-500 to-teal-500" },
    { label: "Matrículas gestionadas", value: stats.matriculas, icon: ClipboardList, color: "from-rose-500 to-pink-500" },
  ]

  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-br from-sky-50 via-teal-50 to-emerald-50 text-foreground">
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-sky-200/30 blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-teal-200/20 blur-3xl" />
      </div>

      <RoleHeader role="colaborador" colaboradorNombre={yo.nombre} colaboradorRol={yo.rol} />

      {/* Hero colaborador */}
      <section className="relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-500 via-teal-500 to-emerald-500 p-6 sm:p-8 text-white shadow-xl shadow-teal-200/50">
            <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium mb-2">
                  <UserCircle2 className="h-3.5 w-3.5" /> Sesión de colaborador
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Hola, {yo.nombre.split(" ")[0]}</h2>
                <p className="mt-2 max-w-2xl text-sm sm:text-base text-white/90">
                  Gestiona tus lugares asignados, registra matrículas y mantén al día tu gestión deportiva en la comuna.
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

      <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* KPIs del colaborador */}
        <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {kpis.map((k) => (
            <div key={k.label} className="relative overflow-hidden rounded-xl border-none bg-white/70 backdrop-blur p-4 shadow-sm">
              <div className={`absolute -right-4 -top-4 h-16 w-16 rounded-full bg-gradient-to-br ${k.color} opacity-15`} />
              <div className={`mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${k.color} text-white shadow-sm`}>
                <k.icon className="h-4 w-4" />
              </div>
              <div className="text-2xl font-bold tabular-nums text-slate-800">{k.value}</div>
              <div className="text-xs font-medium text-slate-600 leading-tight">{k.label}</div>
            </div>
          ))}
        </section>

        {/* Noticias municipales en vivo — para que el colaborador esté informado */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-emerald-600" />
            <h3 className="text-base font-semibold text-slate-800">Noticias municipales en vivo</h3>
            <span className="text-xs text-muted-foreground">· mantente informado antes de registrar</span>
          </div>
          <NoticiasTicker />
        </section>

        {/* Ficha del colaborador */}
        <section className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-1 rounded-xl border-none bg-white/70 backdrop-blur p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 text-lg font-bold text-white shadow-sm">
                {yo.nombre.split(" ").map((n) => n[0]).slice(0, 2).join("")}
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-800">{yo.nombre}</h3>
                <p className="text-xs text-muted-foreground capitalize">{yo.rol}</p>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-xs text-slate-600">
              <p className="flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                Dirección de Deportes DIDECO
              </p>
              {yo.telefono && (
                <p className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="tabular-nums">{yo.telefono}</span>
                </p>
              )}
              {yo.email && (
                <p className="flex items-center gap-2">
                  <MailIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="truncate">{yo.email}</span>
                </p>
              )}
              <p className="flex items-center gap-2 pt-1">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] text-emerald-700">
                  <ClipboardList className="h-3 w-3" /> {yo._count.matriculas} matrículas gestionadas
                </span>
              </p>
            </div>
          </div>

          {/* Mis lugares asignados (compacto) */}
          <div className="md:col-span-2 rounded-xl border-none bg-white/70 backdrop-blur p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-4.5 w-4.5 text-sky-600" />
              <h3 className="text-sm font-semibold text-slate-800">Mis lugares asignados</h3>
              <span className="text-xs text-muted-foreground">· {misLugares.length} lugares</span>
            </div>
            {misLugares.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">No tienes lugares asignados todavía.</p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2 max-h-64 overflow-y-auto pr-1">
                {misLugares.map((l) => (
                  <div key={l.id} className="flex items-start gap-2 rounded-lg border border-slate-100 bg-white/60 p-2.5">
                    <span
                      className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ background: TIPO_COLORS[l.tipo as TipoLugar] }}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{l.nombre}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{l.direccion}</p>
                      <span className="inline-block mt-0.5 text-[10px] text-slate-500">
                        {TIPO_LABELS[l.tipo as TipoLugar]} · {l._count.matriculas} matrículas
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Mapa de mis lugares + Formulario */}
        <section className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-sky-600" />
                <h3 className="text-base font-semibold text-slate-800">Mis lugares en el mapa</h3>
              </div>
              <span className="text-xs text-muted-foreground">{misLugares.length} lugares</span>
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
            <MatriculaForm lugares={lugaresParaForm} colaboradores={[{ id: yo.id, nombre: yo.nombre, rol: yo.rol }]} />
          </div>
        </section>

        {/* Mis matrículas recientes */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-amber-600" />
            <h3 className="text-base font-semibold text-slate-800">Mis matrículas recientes</h3>
            <span className="text-xs text-muted-foreground">· RUT enmascarado por protección de datos</span>
          </div>
          <MatriculasTable matriculas={matriculasSeguras} />
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
