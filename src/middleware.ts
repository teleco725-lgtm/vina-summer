import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Middleware de ciberseguridad — agrega cabeceras de protección de datos.
 * - CSP estricta (permite OpenStreetMap tiles y estilos inline de Leaflet)
 * - X-Frame-Options: previene clickjacking
 * - X-Content-Type-Options: previene MIME sniffing
 * - Referrer-Policy: limita fuga de datos por referrer
 * - Permissions-Policy: restringe APIs sensibles (geo sólo donde se necesita)
 */
export function middleware(_req: NextRequest) {
  const res = NextResponse.next()
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data:",
    "img-src 'self' data: blob: https://*.tile.openstreetmap.org https://z-cdn.chatglm.cn",
    "connect-src 'self' https://*.tile.openstreetmap.org",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ")

  res.headers.set("Content-Security-Policy", csp)
  res.headers.set("X-Frame-Options", "DENY")
  res.headers.set("X-Content-Type-Options", "nosniff")
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  res.headers.set("Permissions-Policy", "geolocation=(self), camera=(), microphone=(), payment=()")
  res.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload")
  res.headers.set("X-DNS-Prefetch-Control", "off")
  return res
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
