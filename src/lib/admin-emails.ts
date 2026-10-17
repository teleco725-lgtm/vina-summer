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

/** Cuenta demo (credenciales) para acceso rápido de prueba */
export const DEMO_EMAIL = "demo@munivina.cl"
export const DEMO_PASSWORD = "demo1234"

/** Credenciales admin demo (cualquier contraseña acepta en entorno demo) */
export const ADMIN_PASSWORD = "admin123"
