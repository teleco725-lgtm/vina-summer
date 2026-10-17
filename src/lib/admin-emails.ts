/**
 * Lista de correos con privilegios de administrador (Dirección de Deportes DIDECO).
 * Al iniciar sesión con cualquiera de estos correos, el usuario accede al dashboard /admin.
 * El resto de cuentas autenticadas acceden al perfil colaborador (/).
 */
export const ADMIN_EMAILS = [
  "claudio.urbina@vtr.net",
  "veltrixintegral@gmail.com",
] as const

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false
  return (ADMIN_EMAILS as readonly string[]).includes(email.toLowerCase().trim())
}

/** Cuenta demo colaborador */
export const DEMO_EMAIL = "demo@munivina.cl"
export const DEMO_PASSWORD = "demo1234"

/** Credenciales admin demo (cualquier contraseña acepta en entorno demo) */
export const ADMIN_PASSWORD = "admin123"

/**
 * Cuentas demo simulando login con Google y Microsoft (vía credenciales).
 * Permiten probar el flujo OAuth sin necesidad de configurar credenciales reales.
 * Funcionan con el botón "Continuar con Google/Microsoft (demo)".
 */
export const DEMO_GOOGLE_EMAIL = "demo.colaborador@gmail.com"
export const DEMO_GOOGLE_PASSWORD = "demo1234"
export const DEMO_GOOGLE_NAME = "Colaborador Google (Demo)"

export const DEMO_MICROSOFT_EMAIL = "demo.colaborador@outlook.com"
export const DEMO_MICROSOFT_PASSWORD = "demo1234"
export const DEMO_MICROSOFT_NAME = "Colaborador Microsoft (Demo)"

