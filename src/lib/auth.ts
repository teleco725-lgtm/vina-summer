import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import AzureADProvider from "next-auth/providers/azure-ad"
import { isAdminEmail, DEMO_EMAIL, DEMO_PASSWORD, ADMIN_PASSWORD, ADMIN_EMAILS } from "@/lib/admin-emails"

/**
 * Configuración NextAuth.
 * - Google y Microsoft (Azure AD): se activan solo si hay credenciales OAuth configuradas.
 * - Credentials: cuenta demo + cuentas admin (por email).
 * - Rol derivado del email: admin si está en ADMIN_EMAILS, sino colaborador.
 */
export const authOptions: NextAuthOptions = {
  // Sin adaptador: usamos estrategia JWT (sin persistir sesiones en DB).
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 }, // 8 horas
  secret: process.env.NEXTAUTH_SECRET,
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

        // Cuenta demo (colaborador)
        if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
          return { id: "demo", email, name: "Colaborador Demo", role: "colaborador" as const }
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
    ...(process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET
      ? [
          AzureADProvider({
            clientId: process.env.MICROSOFT_CLIENT_ID,
            clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
            tenantId: process.env.MICROSOFT_TENANT ?? "common",
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
