"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  AlertCircle,
  CheckCircle2,
  Info,
  Loader2,
  Mail,
  Send,
  ShieldCheck,
} from "lucide-react"
import { toast } from "sonner"

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const DESTINATARIO = "deportes.dideco@munivina.cl"

const formSchema = z.object({
  remitenteNombre: z
    .string()
    .min(3, "Ingrese su nombre (mínimo 3 caracteres)")
    .max(120, "Nombre demasiado largo"),
  remitenteEmail: z
    .string()
    .max(120, "Email demasiado largo")
    .optional()
    .or(z.literal(""))
    .refine(
      (v) => v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      "Formato de correo inválido",
    ),
  asunto: z
    .string()
    .min(5, "El asunto es obligatorio")
    .max(200, "Asunto demasiado largo"),
  mensaje: z.string().max(3000, "Mensaje demasiado largo").optional(),
  formatoAdjunto: z.enum(["pdf", "excel", "word", "pptx", "ninguno"]),
})

type FormValues = z.infer<typeof formSchema>

type EmailResult =
  | {
      kind: "success"
      title: string
      description: string
    }
  | {
      kind: "info"
      title: string
      description: string
    }
  | {
      kind: "error"
      title: string
      description: string
    }

const FORMATO_OPTIONS: {
  value: "pdf" | "excel" | "word" | "pptx" | "ninguno"
  label: string
}[] = [
  { value: "pdf", label: "PDF (informe profesional)" },
  { value: "pptx", label: "PowerPoint (presentación)" },
  { value: "excel", label: "Excel (hoja de cálculo)" },
  { value: "word", label: "Word (documento)" },
  { value: "ninguno", label: "Sin adjunto" },
]

export function EmailSection() {
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<EmailResult | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      remitenteNombre: "",
      remitenteEmail: "",
      asunto: "Informe Gestión Deportiva - Viña del Mar",
      mensaje: "",
      formatoAdjunto: "pdf",
    },
  })

  async function onSubmit(values: FormValues) {
    setSubmitting(true)
    setResult(null)
    try {
      const res = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          asunto: values.asunto,
          mensaje: values.mensaje ?? "",
          remitenteNombre: values.remitenteNombre,
          remitenteEmail: values.remitenteEmail ?? "",
          formatoAdjunto: values.formatoAdjunto,
        }),
      })
      const data: {
        ok?: boolean
        enviado?: boolean
        fallback?: string
        destinatario?: string
        mailto?: string
        adjuntoGenerado?: boolean
        mensaje?: string
        error?: string
      } = await res.json()

      if (!res.ok) {
        const msg = data.error ?? "No se pudo enviar el correo."
        setResult({ kind: "error", title: "Error al enviar", description: msg })
        toast.error(msg)
        return
      }

      if (data.enviado) {
        const dest = data.destinatario ?? DESTINATARIO
        setResult({
          kind: "success",
          title: "Correo enviado",
          description: `El informe fue enviado a ${dest}.`,
        })
        toast.success(`Correo enviado a ${dest}`, {
          description: "La Dirección de Deportes recibió el informe.",
        })
        form.reset({
          remitenteNombre: "",
          remitenteEmail: "",
          asunto: "Informe Gestión Deportiva - Viña del Mar",
          mensaje: "",
          formatoAdjunto: "pdf",
        })
        return
      }

      if (data.fallback === "mailto") {
        const msg =
          data.mensaje ??
          "SMTP no configurado. Se abrió su cliente de correo."
        setResult({
          kind: "info",
          title: "SMTP no configurado",
          description:
            "Se abrió su cliente de correo. Descargue el adjunto con los botones de exportación.",
        })
        toast.info("SMTP no configurado", {
          description:
            "Se abrió su cliente de correo. Descargue el adjunto con el botón de abajo.",
        })
        if (data.mailto) {
          window.open(data.mailto, "_blank", "noopener,noreferrer")
        }
        return
      }

      // Caso inesperado
      setResult({
        kind: "error",
        title: "Respuesta inesperada",
        description: data.mensaje ?? "Intente nuevamente.",
      })
      toast.error(data.mensaje ?? "Respuesta inesperada del servidor.")
    } catch {
      const msg = "Error de red. Intente nuevamente."
      setResult({ kind: "error", title: "Error de red", description: msg })
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="border-none bg-white/70 backdrop-blur shadow-sm p-5 sm:p-6 gap-5">
      <CardHeader className="p-0">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 text-white shadow-md shadow-emerald-100">
            <Mail className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <CardTitle className="text-lg sm:text-xl text-slate-800">
              Envío por correo electrónico
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Envía el informe a la Dirección de Deportes.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 space-y-4">
        {/* Alert inline con el resultado */}
        {result?.kind === "success" && (
          <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <AlertTitle className="text-emerald-800">{result.title}</AlertTitle>
            <AlertDescription className="text-emerald-700">
              {result.description}
            </AlertDescription>
          </Alert>
        )}
        {result?.kind === "info" && (
          <Alert className="border-sky-200 bg-sky-50 text-sky-800">
            <Info className="h-4 w-4 text-sky-600" />
            <AlertTitle className="text-sky-800">{result.title}</AlertTitle>
            <AlertDescription className="text-sky-700">
              {result.description}
            </AlertDescription>
          </Alert>
        )}
        {result?.kind === "error" && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{result.title}</AlertTitle>
            <AlertDescription>{result.description}</AlertDescription>
          </Alert>
        )}

        {/* Destinatario fijo */}
        <div className="rounded-xl border border-white/70 bg-white/60 p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <label
                  htmlFor="destinatario-fijo"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Destinatario
                </label>
                <Badge
                  variant="outline"
                  className="border-emerald-200 bg-emerald-50 text-[10px] font-medium text-emerald-700"
                >
                  Destinatario fijo
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-emerald-600" />
                <span
                  id="destinatario-fijo"
                  className="text-sm font-semibold text-slate-800"
                >
                  {DESTINATARIO}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Dirección municipal oficial de la Dirección de Deportes.
              </p>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-4 sm:grid-cols-2"
          >
            <FormField
              control={form.control}
              name="remitenteNombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Su nombre <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Su nombre"
                      autoComplete="name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="remitenteEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Su correo (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="su@correo.cl"
                      autoComplete="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="asunto"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>
                    Asunto <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mensaje"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Mensaje</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="Mensaje para la Dirección de Deportes…"
                      className="resize-none"
                      maxLength={3000}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="formatoAdjunto"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Formato del adjunto</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccione un formato" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {FORMATO_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="sm:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-1">
              <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                El correo se envía cifrado y los datos sensibles van enmascarados.
              </p>
              <Button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Enviando…
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" /> Enviar correo
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
