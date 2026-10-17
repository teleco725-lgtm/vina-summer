"use client"

import { useState, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import {
  Waves,
  Mail,
  Lock,
  Loader2,
  ShieldCheck,
  UserCircle2,
  AlertCircle,
  KeyRound,
  Info,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ADMIN_EMAILS,
  DEMO_EMAIL,
  DEMO_PASSWORD,
  ADMIN_PASSWORD,
  DEMO_GOOGLE_EMAIL,
  DEMO_GOOGLE_PASSWORD,
  DEMO_MICROSOFT_EMAIL,
  DEMO_MICROSOFT_PASSWORD,
} from "@/lib/admin-emails"

function LoginFormInner() {
  const params = useSearchParams()
  const urlError = params.get("error")
  const callbackUrl = params.get("callbackUrl") ?? "/"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loadingCreds, setLoadingCreds] = useState(false)
  const [loadingGoogle, setLoadingGoogle] = useState(false)
  const [loadingMs, setLoadingMs] = useState(false)
  // Mostrar error de NextAuth si viene por query param (credenciales inválidas, etc.)
  const errorMap: Record<string, string> = {
    CredentialsSignin: "Credenciales inválidas. Verifique el correo y la contraseña.",
    OAuthSignin: "No se pudo conectar con el proveedor. Configure las credenciales OAuth en .env",
    OAuthCallback: "El proveedor rechazó la sesión. Verifique la configuración OAuth.",
    OAuthCreateAccount: "No se pudo crear la cuenta OAuth.",
    EmailCreateAccount: "No se pudo crear la cuenta.",
    Callback: "Error en el callback de autenticación.",
    AccessDenied: "Acceso denegado.",
    Configuration: "Error de configuración del servidor. Contacte al administrador.",
    Verification: "El token de verificación expiró o es inválido.",
  }
  const [error, setError] = useState<string | null>(urlError ? (errorMap[urlError] ?? `Error de autenticación: ${urlError}`) : null)

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!email || !password) {
      setError("Ingrese correo y contraseña")
      return
    }
    setLoadingCreds(true)
    try {
      // Determinar rol por email para redirigir al dashboard correcto
      const isAdmin = (ADMIN_EMAILS as readonly string[]).includes(email.toLowerCase().trim())
      const dest = isAdmin ? "/admin" : "/"
      // signIn con redirect=true deja que NextAuth haga la redirección nativa
      // (más robusto que redirect=false + router.push)
      await signIn("credentials", {
        email,
        password,
        callbackUrl: dest,
        redirect: true,
      })
      // signIn con redirect=true hace una navegación completa del navegador.
      // Si las credenciales son inválidas, NextAuth redirige a /login?error=CredentialsSignin
      // y el componente lee ese error desde la URL (ver errorMap arriba).
    } catch {
      setError("Error de red. Intente nuevamente.")
      toast.error("Error de red")
      setLoadingCreds(false)
    }
  }

  async function handleOAuth(provider: "google" | "azure-ad") {
    setError(null)
    if (provider === "google") setLoadingGoogle(true)
    else setLoadingMs(true)
    try {
      // Verificar si el proveedor OAuth real está configurado consultando /api/auth/providers
      const res = await fetch("/api/auth/providers")
      const providers = (await res.json()) as Record<string, { id: string }>
      const isConfigured = Object.values(providers).some((p) => p.id === provider)

      if (isConfigured) {
        // OAuth real configurado → redirige a Google/Microsoft
        await signIn(provider, { callbackUrl })
      } else {
        // OAuth no configurado → usar cuenta demo vía credenciales
        const demoEmail = provider === "google" ? DEMO_GOOGLE_EMAIL : DEMO_MICROSOFT_EMAIL
        const demoPass = provider === "google" ? DEMO_GOOGLE_PASSWORD : DEMO_MICROSOFT_PASSWORD
        const isAdmin = (ADMIN_EMAILS as readonly string[]).includes(demoEmail.toLowerCase().trim())
        const dest = isAdmin ? "/admin" : "/"
        await signIn("credentials", {
          email: demoEmail,
          password: demoPass,
          callbackUrl: dest,
          redirect: true,
        })
      }
    } catch {
      setError("No se pudo iniciar sesión con el proveedor.")
      setLoadingGoogle(false)
      setLoadingMs(false)
    }
  }

  function llenarDemo() {
    setEmail(DEMO_EMAIL)
    setPassword(DEMO_PASSWORD)
  }
  function llenarAdmin() {
    setEmail(ADMIN_EMAILS[0])
    setPassword(ADMIN_PASSWORD)
  }
  function llenarGoogle() {
    setEmail(DEMO_GOOGLE_EMAIL)
    setPassword(DEMO_GOOGLE_PASSWORD)
  }
  function llenarMicrosoft() {
    setEmail(DEMO_MICROSOFT_EMAIL)
    setPassword(DEMO_MICROSOFT_PASSWORD)
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-sky-100 via-teal-100 to-emerald-100 p-4">
      {/* Decoración de fondo */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-sky-300/30 blur-3xl" />
        <div className="absolute top-1/4 -right-40 h-[28rem] w-[28rem] rounded-full bg-emerald-300/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-teal-300/20 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo + título */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-emerald-500 text-white shadow-xl shadow-sky-200">
            <Waves className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Viña Summer</h1>
          <p className="mt-1 text-sm text-slate-600">Dashboard Municipal · Deportes DIDECO</p>
        </div>

        <Card className="border-none bg-white/80 backdrop-blur-xl shadow-2xl shadow-teal-200/40">
          <CardContent className="p-6 sm:p-7 space-y-5">
            <div className="flex items-center gap-2">
              <UserCircle2 className="h-5 w-5 text-emerald-600" />
              <h2 className="text-lg font-semibold text-slate-800">Iniciar sesión</h2>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* OAuth buttons */}
            <div className="grid gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOAuth("google")}
                disabled={loadingGoogle || loadingMs}
                className="w-full bg-white/70 border-slate-200 text-slate-700 hover:bg-white"
              >
                {loadingGoogle ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <GoogleIcon className="h-4 w-4 mr-2" />
                )}
                Continuar con Google
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOAuth("azure-ad")}
                disabled={loadingGoogle || loadingMs}
                className="w-full bg-white/70 border-slate-200 text-slate-700 hover:bg-white"
              >
                {loadingMs ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <MicrosoftIcon className="h-4 w-4 mr-2" />
                )}
                Continuar con Microsoft
              </Button>
            </div>

            {/* Separador */}
            <div className="relative flex items-center py-1">
              <div className="flex-grow border-t border-slate-200" />
              <span className="mx-3 text-xs text-muted-foreground">o con credenciales</span>
              <div className="flex-grow border-t border-slate-200" />
            </div>

            {/* Credenciales */}
            <form onSubmit={handleCredentials} className="space-y-3">
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-xs font-medium text-slate-600">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nombre@correo.cl"
                    autoComplete="email"
                    className="pl-9"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="password" className="text-xs font-medium text-slate-600">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="pl-9"
                    required
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={loadingCreds}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700"
              >
                {loadingCreds ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Ingresando…
                  </>
                ) : (
                  <>
                    <KeyRound className="h-4 w-4" /> Ingresar
                  </>
                )}
              </Button>
            </form>

            {/* Cuentas demo rápidas */}
            <div className="rounded-xl border border-sky-100 bg-sky-50/60 p-3 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-sky-800">
                <Info className="h-3.5 w-3.5" /> Cuentas de acceso rápido (demo)
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={llenarGoogle}
                  className="rounded-lg border border-red-200 bg-white/70 px-2.5 py-1.5 text-left text-[11px] text-slate-700 hover:bg-white transition-colors"
                >
                  <span className="block font-semibold text-red-600">Cuenta Google</span>
                  <span className="block truncate">{DEMO_GOOGLE_EMAIL}</span>
                  <span className="block text-muted-foreground">{DEMO_GOOGLE_PASSWORD}</span>
                </button>
                <button
                  type="button"
                  onClick={llenarMicrosoft}
                  className="rounded-lg border border-blue-200 bg-white/70 px-2.5 py-1.5 text-left text-[11px] text-slate-700 hover:bg-white transition-colors"
                >
                  <span className="block font-semibold text-blue-600">Cuenta Microsoft</span>
                  <span className="block truncate">{DEMO_MICROSOFT_EMAIL}</span>
                  <span className="block text-muted-foreground">{DEMO_MICROSOFT_PASSWORD}</span>
                </button>
                <button
                  type="button"
                  onClick={llenarDemo}
                  className="rounded-lg border border-sky-200 bg-white/70 px-2.5 py-1.5 text-left text-[11px] text-slate-700 hover:bg-white transition-colors"
                >
                  <span className="block font-semibold text-sky-700">Colaborador municipal</span>
                  <span className="block truncate">{DEMO_EMAIL}</span>
                  <span className="block text-muted-foreground">{DEMO_PASSWORD}</span>
                </button>
                <button
                  type="button"
                  onClick={llenarAdmin}
                  className="rounded-lg border border-violet-200 bg-white/70 px-2.5 py-1.5 text-left text-[11px] text-slate-700 hover:bg-white transition-colors"
                >
                  <span className="block font-semibold text-violet-700">Admin DIDECO</span>
                  <span className="block truncate">{ADMIN_EMAILS[0]}</span>
                  <span className="block text-muted-foreground">{ADMIN_PASSWORD}</span>
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground pt-1">
                También puede iniciar sesión con cualquier email <span className="font-semibold">@gmail.com</span>, <span className="font-semibold">@outlook.com</span>, <span className="font-semibold">@hotmail.com</span> o <span className="font-semibold">@live.com</span> usando la contraseña <code className="rounded bg-slate-100 px-1">{DEMO_PASSWORD}</code>.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer de la portada */}
        <div className="mt-6 flex flex-col items-center gap-2 text-center">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Datos protegidos
            </span>
            <span className="inline-flex items-center gap-1">
              <Lock className="h-3.5 w-3.5 text-sky-600" /> Ciberseguridad
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Municipalidad de Viña del Mar · Dirección de Deportes DIDECO
          </p>
          {!process.env.GOOGLE_CLIENT_ID && (
            <Badge variant="outline" className="text-[10px] border-amber-200 bg-amber-50 text-amber-700">
              OAuth Google/Microsoft: configure credenciales para habilitar
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}

export function LoginForm() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>}>
      <LoginFormInner />
    </Suspense>
  )
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

function MicrosoftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 23 23" aria-hidden>
      <rect x="1" y="1" width="10" height="10" fill="#F25022" />
      <rect x="12" y="1" width="10" height="10" fill="#7FBA00" />
      <rect x="1" y="12" width="10" height="10" fill="#00A4EF" />
      <rect x="12" y="12" width="10" height="10" fill="#FFB900" />
    </svg>
  )
}
