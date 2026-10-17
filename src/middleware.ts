import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import { ADMIN_EMAILS } from "@/lib/admin-emails"

/**
 * Middleware — combina:
 *  1. Cabeceras de ciberseguridad (CSP, HSTS, X-Frame-Options, etc.)
 *  2. Gate de autenticación por ruta:
 *     - /admin        → requiere sesión + rol admin
 *     - /             → requiere sesión (cualquier rol)
 *     - /login, /api/auth/*  → públicos
 *     - /api/*        → requiere sesión (salvo auth)
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const res = NextResponse.next()

  // --- 1. Cabeceras de seguridad (siempre) ---
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data:",
    "img-src 'self' data: blob: https://*.tile.openstreetmap.org https://z-cdn.chatglm.cn https://lh3.googleusercontent.com https://graph.microsoft.com",
    "connect-src 'self' https://*.tile.openstreetmap.org https://accounts.google.com https://login.microsoftonline.com https://graph.microsoft.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self' https://accounts.google.com https://login.microsoftonline.com",
  ].join("; ")

  res.headers.set("Content-Security-Policy", csp)
  res.headers.set("X-Frame-Options", "DENY")
  res.headers.set("X-Content-Type-Options", "nosniff")
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  res.headers.set("Permissions-Policy", "geolocation=(self), camera=(), microphone=(), payment=()")
  res.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload")
  res.headers.set("X-DNS-Prefetch-Control", "off")

  // --- 2. Rutas públicas (no requieren auth) ---
  const isPublic =
    pathname === "/login" ||
    pathname.startsWith("/api/auth/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")

  if (isPublic) return res

  // --- 3. Verificar sesión ---
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const loginUrl = new URL("/login", req.url)
  // Conservar la URL original para redirigir tras login
  loginUrl.searchParams.set("callbackUrl", encodeURIComponent(pathname))

  // Sin sesión → redirigir a login
  if (!token || !token.email) {
    return NextResponse.redirect(loginUrl)
  }

  const isAdmin = (ADMIN_EMAILS as readonly string[]).includes(
    (token.email as string).toLowerCase().trim(),
  )

  // /admin requiere rol admin
  if (pathname === "/admin" && !isAdmin) {
    // Colaborador intentando entrar a /admin → redirigir a /
    return NextResponse.redirect(new URL("/", req.url))
  }

  return res
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
