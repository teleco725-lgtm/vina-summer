import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { isAdminEmail } from "@/lib/admin-emails"

/**
 * Obtiene la sesión del servidor y el rol.
 * Retorna { session, isAdmin, email }.
 */
export async function getServerRole() {
  const session = await getServerSession(authOptions)
  const email = session?.user?.email ?? undefined
  const isAdmin = isAdminEmail(email)
  return { session, isAdmin, email }
}

/**
 * Verifica si el usuario actual es admin.
 * Útil para proteger endpoints de escritura.
 */
export async function requireAdmin(): Promise<{ ok: true; email: string } | { ok: false; status: number; error: string }> {
  const { isAdmin, email } = await getServerRole()
  if (!email) {
    return { ok: false, status: 401, error: "No autenticado" }
  }
  if (!isAdmin) {
    return { ok: false, status: 403, error: "Acceso denegado: se requieren privilegios de administrador" }
  }
  return { ok: true, email }
}
