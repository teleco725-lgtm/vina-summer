import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import AzureADProvider from "next-auth/providers/azure-ad"
import {
  isAdminEmail,
  ADMIN_EMAILS,
  ADMIN_PASSWORD,
  DEMO_EMAIL,
  DEMO_PASSWORD,
  DEMO_GOOGLE_EMAIL,
  DEMO_GOOGLE_PASSWORD,
  DEMO_GOOGLE_NAME,
  DEMO_MICROSOFT_EMAIL,
  DEMO_MICROSOFT_PASSWORD,
  DEMO_MICROSOFT_NAME,
} from "@/lib/admin-emails"

/**
 * Secret para firmar sesiones JWT.
 * Prioridad:
 *   1. NEXTAUTH_SECRET del .env (configurado por el admin)
 *   2. Fallback determinista (garantiza que el login funcione incluso si el
 *      .env se pierde o resetea — situación común en este sandbox).
 *
 * IMPORTANTE: este módulo se importa tanto en el servidor Node (API routes)
 * como en el middleware (Edge Runtime). No usar process.cwd() ni Buffer
 * porque no están disponibles en Edge.
 *
 * Nota: en producción SIEMPRE debe configurarse NEXTAUTH_SECRET en .env con
 * un valor aleatorio (openssl rand -base64 32).
 */
const FALLBACK_SECRET = "vina-summer-dev-fallback-secret-determinista-2024-clave"
const AUTH_SECRET = process.env.NEXTAUTH_SECRET || FALLBACK_SECRET

if (!process.env.NEXTAUTH_SECRET && process.env.NODE_ENV !== "production") {
  console.warn(
    "[auth] NEXTAUTH_SECRET no encontrado en .env — usando secret de desarrollo por defecto. " +
      "Para producción, configure NEXTAUTH_SECRET con: openssl rand -base64 32",
  )
}

/** Exportado para que el middleware (Edge) use el mismo secret en getToken() */
export const AUTH_SECRET_VALUE = AUTH_SECRET

/**
 * Configuración NextAuth.
 * - Google y Microsoft (Azure AD): se activan solo si hay credenciales OAuth configuradas.
 * - Credentials: cuenta demo + cuentas admin (por email).
 * - Rol derivado del email: admin si está en ADMIN_EMAILS, sino colaborador.
 */
export const authOptions: NextAuthOptions = {
  // Sin adaptador: usamos estrategia JWT (sin persistir sesiones en DB).
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 }, // 8 horas
  secret: AUTH_SECRET,
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    // 1. Credentials — cuenta demo + cuentas admin (login rápido, sin OAuth)
    CredentialsProvider({
      id: "credentials",
      name: "Credenciales",
      credentials: {
        email: { label: "Correo", type: "email", placeholder: "nombre@correo.cl" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null
        const email = credentials.email.toLowerCase().trim()
        const password = credentials.password ?? ""

        // Cuenta demo colaborador (municipal)
        if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
          return { id: "demo", email, name: "Colaborador Demo", role: "colaborador" as const }
        }
        // Cuenta demo Google (@gmail.com)
        if (email === DEMO_GOOGLE_EMAIL && password === DEMO_GOOGLE_PASSWORD) {
          return { id: "demo-google", email, name: DEMO_GOOGLE_NAME, role: "colaborador" as const }
        }
        // Cuenta demo Microsoft (@outlook.com)
        if (email === DEMO_MICROSOFT_EMAIL && password === DEMO_MICROSOFT_PASSWORD) {
          return { id: "demo-microsoft", email, name: DEMO_MICROSOFT_NAME, role: "colaborador" as const }
        }
        // Cualquier email @gmail.com o @outlook.com/@hotmail.com/@live.com con la contraseña demo
        // (simula login OAuth con cuenta personal válida de Google/Microsoft)
        const isGoogleAccount = email.endsWith("@gmail.com")
        const isMicrosoftAccount =
          email.endsWith("@outlook.com") ||
          email.endsWith("@hotmail.com") ||
          email.endsWith("@live.com") ||
          email.endsWith("@msn.com")
        if ((isGoogleAccount || isMicrosoftAccount) && password === DEMO_PASSWORD) {
          const name = email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (m) => m.toUpperCase())
          const provider = isGoogleAccount ? "google" : "azure-ad"
          const role = isAdminEmail(email) ? ("admin" as const) : ("colaborador" as const)
          return { id: email, email, name, role, provider }
        }
        // Cuentas admin — aceptan la contraseña admin demo
        if ((ADMIN_EMAILS as readonly string[]).includes(email) && password === ADMIN_PASSWORD) {
          const name = email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (m) => m.toUpperCase())
          return { id: email, email, name, role: "admin" as const }
        }
        // Rechazo (no revelar si el email existe)
        return null
      },
    }),

    // 2. Google OAuth (si hay credenciales)
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: { params: { prompt: "select_account" } },
          }),
        ]
      : []),

    // 3. Microsoft / Azure AD (si hay credenciales)
    //    tenant "consumers" → usa login.live.com (cuentas personales Microsoft)
    ...(process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET
      ? [
          AzureADProvider({
            clientId: process.env.MICROSOFT_CLIENT_ID,
            clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
            // "consumers" = solo cuentas personales (login.live.com)
            // "common" = cuentas personales + organizacionales
            // "organizations" = solo cuentas organizacionales (Azure AD)
            tenantId: process.env.MICROSOFT_TENANT ?? "consumers",
          }),
        ]
      : []),
  ],
  callbacks: {
    // Permitir inicio de sesión — siempre (el rol se deriva del email)
    async signIn() {
      return true
    },
    // Asignar rol en el JWT según el email
    async jwt({ token, user, account }) {
      // Primer inicio de sesión: user/account vienen definidos
      if (user?.email) {
        token.email = user.email.toLowerCase().trim()
        token.name = user.name ?? user.email.split("@")[0]
        token.role = isAdminEmail(user.email) ? "admin" : "colaborador"
        token.provider = account?.provider ?? "credentials"
      }
      // Garantizar que el rol esté siempre presente
      if (!token.role && token.email) {
        token.role = isAdminEmail(token.email) ? "admin" : "colaborador"
      }
      return token
    },
    // Exponer rol/email/name en la sesión del cliente
    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email ?? session.user.email ?? ""
        session.user.name = token.name ?? session.user.name ?? ""
        session.user.role = (token.role as "admin" | "colaborador") ?? "colaborador"
        session.user.provider = (token.provider as string) ?? "credentials"
      } else {
        session.user = {
          email: token.email ?? "",
          name: token.name ?? "",
          role: (token.role as "admin" | "colaborador") ?? "colaborador",
          provider: (token.provider as string) ?? "credentials",
        } as SessionUser
      }
      return session
    },
    // Redirección tras login: admin → /admin, colaborador → /
    async redirect({ url, baseUrl }) {
      // url puede ser la URL original solicitada o la callback URL
      if (url.startsWith("/")) {
        // URL relativa — permitirla si es interna
        return `${baseUrl}${url}`
      }
      // URL absoluta — solo si es el mismo origen
      try {
        const u = new URL(url)
        if (u.origin === baseUrl) return url
      } catch {
        /* ignore */
      }
      return baseUrl
    },
  },
}

// Ampliar tipos de sesión
declare module "next-auth" {
  interface Session {
    user: {
      email: string
      name?: string | null
      role: "admin" | "colaborador"
      provider?: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    email?: string
    name?: string
    role?: "admin" | "colaborador"
    provider?: string
  }
}

export type SessionUser = {
  email: string
  name?: string | null
  role: "admin" | "colaborador"
  provider?: string
}
