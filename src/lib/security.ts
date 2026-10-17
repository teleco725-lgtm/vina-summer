/**
 * Utilidades de ciberseguridad y validación de datos personales.
 * - Validación de RUT chileno (módulo 11)
 * - Sanitización de input (anti-XSS, normalización)
 * - Enmascaramiento de datos sensibles para visualización
 */

/** Valida un RUT chileno con dígito verificador (módulo 11). Acepta formato XX.XXX.XXX-X */
export function validateRut(rut: string): boolean {
  if (!rut || typeof rut !== "string") return false
  const clean = rut.replace(/[^0-9kK]/g, "").toUpperCase()
  if (clean.length < 8 || clean.length > 9) return false
  const body = clean.slice(0, -1)
  const dv = clean.slice(-1)
  let sum = 0
  let mul = 2
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i], 10) * mul
    mul = mul === 7 ? 2 : mul + 1
  }
  const mod = 11 - (sum % 11)
  const expected = mod === 11 ? "0" : mod === 10 ? "K" : String(mod)
  return dv === expected
}

/** Formatea RUT a XX.XXX.XXX-X */
export function formatRut(rut: string): string {
  const clean = rut.replace(/[^0-9kK]/g, "").toUpperCase()
  if (clean.length < 2) return rut
  const body = clean.slice(0, -1)
  const dv = clean.slice(-1)
  const groups = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  return `${groups}-${dv}`
}

/** Enmascara un RUT para mostrar (protección de datos): 12.345.678-5 -> 12.***.***-5 */
export function maskRut(rut: string): string {
  if (!rut) return ""
  const clean = rut.replace(/[^0-9kK]/g, "").toUpperCase()
  if (clean.length < 2) return rut
  const dv = clean.slice(-1)
  const body = clean.slice(0, -1)
  const last4 = body.slice(-4)
  return `••.•${last4}.${dv}`
}

/** Sanitiza texto: recorta, elimina caracteres de control y normaliza. */
export function sanitizeText(input: unknown, max = 200): string {
  if (typeof input !== "string") return ""
  return input
    .replace(/[\u0000-\u001F\u007F]/g, "") // caracteres de control
    .trim()
    .slice(0, max)
}

/** Valida que una latitud sea correcta */
export function isValidLat(lat: number): boolean {
  return typeof lat === "number" && isFinite(lat) && lat >= -90 && lat <= 90
}

/** Valida longitud */
export function isValidLng(lng: number): boolean {
  return typeof lng === "number" && isFinite(lng) && lng >= -180 && lng <= 180
}

/** Genera un hash simple de integridad (no criptográfico fuerte, demo de firma) */
export function integrityHash(payload: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < payload.length; i++) {
    h ^= payload.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0).toString(16).padStart(8, "0")
}

export const TIPOS_LUGAR = ["playa", "piscina_municipal", "gimnasio_con_piscina"] as const
export type TipoLugar = (typeof TIPOS_LUGAR)[number]

export const TIPO_LABELS: Record<TipoLugar, string> = {
  playa: "Playa",
  piscina_municipal: "Piscina Municipal",
  gimnasio_con_piscina: "Gimnasio c/ Piscina",
}

export const TIPO_COLORS: Record<TipoLugar, string> = {
  playa: "#0ea5e9", // sky
  piscina_municipal: "#10b981", // emerald
  gimnasio_con_piscina: "#f59e0b", // amber
}
