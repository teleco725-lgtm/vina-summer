/**
 * Seed — datos de lugares reales de Viña del Mar y alrededores.
 * Fuentes: datos públicos aprox. GPS de OpenStreetMap.
 * Tipos: playa | piscina_municipal | gimnasio_con_piscina
 */
import { db } from "../src/lib/db"
import { formatRut } from "../src/lib/security"

type SeedLugar = {
  nombre: string
  tipo: "playa" | "piscina_municipal" | "gimnasio_con_piscina"
  direccion: string
  comuna: string
  lat: number
  lng: number
  descripcion?: string
  horario?: string
  aforo?: number
}

const lugares: SeedLugar[] = [
  // === PLAYAS (del Excel + reales de Viña del Mar) ===
  {
    nombre: "Playa El Sol",
    tipo: "playa",
    direccion: "Av. Perú, Viña del Mar",
    comuna: "Viña del Mar",
    lat: -33.0193,
    lng: -71.5539,
    descripcion: "Playa urbana céntrica, sector Av. Perú. Ideal para familias.",
    horario: "Acceso libre 08:00–20:00 (verano con salvavidas)",
    aforo: 5000,
  },
  {
    nombre: "Playa Deporte",
    tipo: "playa",
    direccion: "Muelle Vergara, Viña del Mar",
    comuna: "Viña del Mar",
    lat: -33.0241,
    lng: -71.5501,
    descripcion: "Playa junto al Muelle Vergara, zona deportiva.",
    horario: "Acceso libre 08:00–20:00",
    aforo: 3000,
  },
  {
    nombre: "Playa Las Salinas",
    tipo: "playa",
    direccion: "Frente Escuela de Armamento de la Marina, Viña del Mar",
    comuna: "Viña del Mar",
    lat: -33.0288,
    lng: -71.5438,
    descripcion: "Playa al norte de Viña, frente a la Escuela de Armamento.",
    horario: "Acceso libre 08:00–19:00",
    aforo: 2500,
  },
  {
    nombre: "Playa 5to Sector Reñaca",
    tipo: "playa",
    direccion: "Reñaca, Viña del Mar",
    comuna: "Viña del Mar",
    lat: -32.9843,
    lng: -71.5476,
    descripcion: "Quinto sector de Reñaca, arena amplia y oleaje moderado.",
    horario: "Acceso libre 08:00–20:00 (verano con salvavidas)",
    aforo: 8000,
  },
  {
    nombre: "Playa Acapulco",
    tipo: "playa",
    direccion: "Av. San Martín 800, Viña del Mar",
    comuna: "Viña del Mar",
    lat: -33.0165,
    lng: -71.5528,
    descripcion: "Playa céntrica frente al casino y hoteles.",
    horario: "Acceso libre 08:00–20:00",
    aforo: 4000,
  },
  {
    nombre: "Playa Caleta Abarca",
    tipo: "playa",
    direccion: "Av. San Martín 1500, Viña del Mar",
    comuna: "Viña del Mar",
    lat: -33.0112,
    lng: -71.5498,
    descripcion: "Caleta de pescadores con zona de baño habilitada.",
    horario: "Acceso libre 08:00–19:00",
    aforo: 2000,
  },

  // === PISCINAS MUNICIPALES ===
  {
    nombre: "Piscina Municipal Viña del Mar",
    tipo: "piscina_municipal",
    direccion: "Av. Valparaíso 1015, Viña del Mar",
    comuna: "Viña del Mar",
    lat: -33.0255,
    lng: -71.5536,
    descripcion: "Piscina municipal temperada, acceso público con inscripción.",
    horario: "Lun–Vie 06:30–21:00 · Sáb–Dom 09:00–18:00",
    aforo: 250,
  },
  {
    nombre: "Piscina Municipal Reñaca",
    tipo: "piscina_municipal",
    direccion: "Av. Borgoño 14.800, Reñaca, Viña del Mar",
    comuna: "Viña del Mar",
    lat: -32.9738,
    lng: -71.5348,
    descripcion: "Piscina municipal al aire libre en sector Reñaca alto.",
    horario: "Lun–Dom 09:00–19:00 (verano)",
    aforo: 180,
  },
  {
    nombre: "Piscina Municipal Valparaíso (Barón)",
    tipo: "piscina_municipal",
    direccion: "Av. España 2645, Valparaíso",
    comuna: "Valparaíso",
    lat: -33.0436,
    lng: -71.6283,
    descripcion: "Piscina municipal de la comuna vecina de Valparaíso.",
    horario: "Lun–Vie 07:00–20:00 · Sáb 09:00–14:00",
    aforo: 200,
  },

  // === GIMNASIOS MUNICIPALES CON PISCINA ===
  {
    nombre: "Gimnasio Municipal Sausalito",
    tipo: "gimnasio_con_piscina",
    direccion: "Av. Libertad 1341, Viña del Mar",
    comuna: "Viña del Mar",
    lat: -33.0312,
    lng: -71.5479,
    descripcion: "Complejo deportivo municipal con piscina temperada y gimnasio.",
    horario: "Lun–Vie 06:30–22:00 · Sáb–Dom 08:00–18:00",
    aforo: 400,
  },
  {
    nombre: "Centro Deportivo Municipal Miraflores",
    tipo: "gimnasio_con_piscina",
    direccion: "Av. Santa Marina 1250, Viña del Mar",
    comuna: "Viña del Mar",
    lat: -33.0389,
    lng: -71.5412,
    descripcion: "Gimnasio municipal con piscina semi-olímpica.",
    horario: "Lun–Vie 07:00–21:00 · Sáb 09:00–14:00",
    aforo: 300,
  },
]

const colaboradores = [
  { nombre: "Carolina Pérez", rut: "12.345.678-5", telefono: "+56987654321", rol: "supervisora" },
  { nombre: "Rodrigo Soto", rut: "9.876.543-2", telefono: "+56981122334", rol: "colaborador" },
  { nombre: "María González", rut: "15.555.000-K", telefono: "+56995550011", rol: "colaborador" },
  { nombre: "Javier Muñoz", rut: "18.222.333-4", telefono: "+56973322114", rol: "coordinador" },
]

async function main() {
  console.log("🌱 Sembrando datos...")

  // Limpiar
  await db.matricula.deleteMany()
  await db.lugarColaborador.deleteMany()
  await db.lugar.deleteMany()
  await db.colaborador.deleteMany()

  // Lugares
  const lugaresCreados = []
  for (const l of lugares) {
    const created = await db.lugar.create({ data: l })
    lugaresCreados.push(created)
  }
  console.log(`✅ ${lugaresCreados.length} lugares creados`)

  // Colaboradores
  const colsCreados = []
  for (const c of colaboradores) {
    const created = await db.colaborador.create({
      data: { ...c, rut: formatRut(c.rut) },
    })
    colsCreados.push(created)
  }
  console.log(`✅ ${colsCreados.length} colaboradores creados`)

  // Asignaciones colaborador <-> lugar (rotando)
  for (let i = 0; i < lugaresCreados.length; i++) {
    const lugar = lugaresCreados[i]
    const col = colsCreados[i % colsCreados.length]
    const col2 = colsCreados[(i + 1) % colsCreados.length]
    await db.lugarColaborador.create({ data: { lugarId: lugar.id, colaboradorId: col.id } })
    if (col2.id !== col.id) {
      await db.lugarColaborador.create({ data: { lugarId: lugar.id, colaboradorId: col2.id } })
    }
  }
  console.log("✅ Asignaciones creadas")

  // Matrículas de ejemplo
  const matriculas = [
    { nombre: "Ana Riquelme", rut: "17.123.456-7", direccion: "Av. San Martín 100", comuna: "Viña del Mar" },
    { nombre: "Pedro Fuentes", rut: "14.987.654-3", direccion: "Plaza Vergara 5", comuna: "Viña del Mar" },
    { nombre: "Camila Rojas", rut: "20.112.233-4", direccion: "Av. Borgoño 15000", comuna: "Viña del Mar" },
    { nombre: "Diego Bravo", rut: "11.445.667-8", direccion: "Calle Valparaíso 200", comuna: "Viña del Mar" },
  ]
  for (let i = 0; i < matriculas.length; i++) {
    const m = matriculas[i]
    const lugar = lugaresCreados[i % lugaresCreados.length]
    const col = colsCreados[i % colsCreados.length]
    await db.matricula.create({
      data: {
        ...m,
        rut: formatRut(m.rut),
        lugarId: lugar.id,
        colaboradorId: col.id,
      },
    })
  }
  console.log(`✅ ${matriculas.length} matrículas de ejemplo`)

  console.log("🌱 Seed completo.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
