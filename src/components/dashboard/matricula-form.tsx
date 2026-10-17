"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, ShieldCheck, Send, UserPlus, Waves, Droplets, Dumbbell, MapPin } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

/** RUT chileno validado (módulo 11) en el lado cliente */
const rutSchema = z
  .string()
  .min(8, "RUT demasiado corto")
  .refine(
    (v) => {
      const clean = v.replace(/[^0-9kK]/g, "").toUpperCase()
      if (clean.length < 8) return false
      const body = clean.slice(0, -1)
      const dv = clean.slice(-1)
      let sum = 0, mul = 2
      for (let i = body.length - 1; i >= 0; i--) {
        sum += parseInt(body[i], 10) * mul
        mul = mul === 7 ? 2 : mul + 1
      }
      const mod = 11 - (sum % 11)
      const expected = mod === 11 ? "0" : mod === 10 ? "K" : String(mod)
      return dv === expected
    },
    { message: "RUT inválido (verifique dígito verificador)" },
  )

const formSchema = z.object({
  nombre: z.string().min(3, "Nombre muy corto").max(120),
  rut: rutSchema,
  direccion: z.string().min(5, "Dirección muy corta").max(200),
  comuna: z.string().min(2, "Seleccione comuna").max(80),
  lugarId: z.string().min(1, "Seleccione un lugar"),
  colaboradorId: z.string().min(1, "Seleccione un colaborador"),
  observaciones: z.string().max(300).optional(),
})

type FormValues = z.infer<typeof formSchema>

type LugarOption = {
  id: string
  nombre: string
  tipo: "playa" | "piscina_municipal" | "gimnasio_con_piscina"
  direccion: string
}
type ColaboradorOption = { id: string; nombre: string; rol: string }

const TIPO_BADGE: Record<string, { label: string; cls: string }> = {
  playa: { label: "Playa", cls: "bg-sky-100 text-sky-700 border-sky-200" },
  piscina_municipal: { label: "Piscina Municipal", cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  gimnasio_con_piscina: { label: "Gimnasio c/ Piscina", cls: "bg-amber-100 text-amber-700 border-amber-200" },
}

type FiltroLugar = "todos" | "playa" | "piscina_municipal" | "gimnasio_con_piscina"

const FILTROS_LUGAR: { key: FiltroLugar; label: string; icon: typeof Waves }[] = [
  { key: "todos", label: "Todos", icon: MapPin },
  { key: "playa", label: "Playas", icon: Waves },
  { key: "piscina_municipal", label: "Piscinas", icon: Droplets },
  { key: "gimnasio_con_piscina", label: "Gimnasios c/ piscina", icon: Dumbbell },
]

function formatRutLive(v: string): string {
  const clean = v.replace(/[^0-9kK]/g, "").toUpperCase()
  if (clean.length < 2) return clean
  const body = clean.slice(0, -1)
  const dv = clean.slice(-1)
  const groups = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  return `${groups}-${dv}`
}

export function MatriculaForm({
  lugares,
  colaboradores,
}: {
  lugares: LugarOption[]
  colaboradores: ColaboradorOption[]
}) {
  const [submitting, setSubmitting] = useState(false)
  const [filtroLugar, setFiltroLugar] = useState<FiltroLugar>("todos")
  const router = useRouter()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: "",
      rut: "",
      direccion: "",
      comuna: "Viña del Mar",
      lugarId: "",
      colaboradorId: "",
      observaciones: "",
    },
  })

  // Lugares filtrados según el filtro activo (playa / piscina / gimnasio / todos)
  const lugaresFiltrados =
    filtroLugar === "todos" ? lugares : lugares.filter((l) => l.tipo === filtroLugar)

  // Si el lugar seleccionado no pertenece al filtro activo, se limpia la selección
  function cambiarFiltroLugar(f: FiltroLugar) {
    setFiltroLugar(f)
    const actual = form.getValues("lugarId")
    if (actual) {
      const lugarActual = lugares.find((l) => l.id === actual)
      if (lugarActual && f !== "todos" && lugarActual.tipo !== f) {
        form.setValue("lugarId", "")
      }
    }
  }

  async function onSubmit(values: FormValues) {
    setSubmitting(true)
    try {
      const res = await fetch("/api/matriculas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? "No se pudo registrar la matrícula")
        return
      }
      toast.success("Matrícula registrada", {
        description: `${values.nombre} → ${data.matricula?.lugar ?? "lugar"} (${data.matricula?.colaborador ?? "sin asignar"})`,
      })
      form.reset()
      router.refresh()
    } catch {
      toast.error("Error de red. Intente nuevamente.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="border-none shadow-lg shadow-emerald-100/50 bg-white/80 backdrop-blur">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-emerald-600" />
          <CardTitle className="text-lg">Formulario de Matrícula</CardTitle>
        </div>
        <CardDescription className="flex items-center gap-1.5 text-xs">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          Datos protegidos · Validación de identidad (RUT) · Cumplimiento de protección de datos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Nombre completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. María González Pérez" autoComplete="name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rut"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RUT</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="12.345.678-5"
                      inputMode="numeric"
                      autoComplete="off"
                      value={field.value}
                      onChange={(e) => field.onChange(formatRutLive(e.target.value))}
                      onBlur={field.onBlur}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="comuna"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comuna</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Comuna" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Viña del Mar">Viña del Mar</SelectItem>
                      <SelectItem value="Valparaíso">Valparaíso</SelectItem>
                      <SelectItem value="Concón">Concón</SelectItem>
                      <SelectItem value="Quilpué">Quilpué</SelectItem>
                      <SelectItem value="Villa Alemana">Villa Alemana</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="direccion"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Dirección</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. Av. San Martín 100, Viña del Mar" autoComplete="street-address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lugarId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lugar asignado</FormLabel>
                  {/* Filtro rápido por tipo: Playas / Piscinas / Gimnasios */}
                  <div className="flex flex-wrap gap-1.5">
                    {FILTROS_LUGAR.map((f) => {
                      const active = filtroLugar === f.key
                      const Icon = f.icon
                      const count =
                        f.key === "todos"
                          ? lugares.length
                          : lugares.filter((l) => l.tipo === f.key).length
                      return (
                        <button
                          key={f.key}
                          type="button"
                          onClick={() => cambiarFiltroLugar(f.key)}
                          aria-pressed={active}
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
                            active
                              ? "bg-slate-800 text-white border-slate-800 shadow-sm"
                              : "bg-white/70 border-white/60 text-slate-600 hover:bg-white",
                          )}
                        >
                          <Icon className="h-3 w-3" />
                          {f.label}
                          <span
                            className={cn(
                              "ml-0.5 rounded-full px-1 text-[10px] tabular-nums",
                              active ? "bg-white/20" : "bg-slate-100 text-slate-500",
                            )}
                          >
                            {count}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione lugar" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-72">
                      {lugaresFiltrados.length === 0 ? (
                        <div className="px-3 py-4 text-center text-xs text-muted-foreground">
                          No hay lugares en esta categoría.
                        </div>
                      ) : (
                        lugaresFiltrados.map((l) => (
                          <SelectItem key={l.id} value={l.id}>
                            <span className="flex items-center gap-2">
                              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${TIPO_BADGE[l.tipo]?.cls ?? ""}`}>
                                {TIPO_BADGE[l.tipo]?.label ?? l.tipo}
                              </Badge>
                              <span className="truncate">{l.nombre}</span>
                            </span>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="colaboradorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Colaborador responsable</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione colaborador" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {colaboradores.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.nombre} · <span className="text-muted-foreground text-xs">{c.rol}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="observaciones"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Observaciones (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Información adicional para la asignación…"
                      className="resize-none"
                      rows={2}
                      maxLength={300}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="sm:col-span-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
              <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                Sus datos se almacenan cifrados y con firma de integridad.
              </p>
              <Button type="submit" disabled={submitting} className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white">
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Enviando…
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" /> Registrar matrícula
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
