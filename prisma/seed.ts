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
  { nombre: "Carolina Pérez", rut: "12.345.678-5", telefono: "+56987654321", rol: "supervisora", metaDiaria: 30 },
  { nombre: "Rodrigo Soto", rut: "9.876.543-2", telefono: "+56981122334", rol: "colaborador", metaDiaria: 20 },
  { nombre: "María González", rut: "15.555.000-K", telefono: "+56995550011", rol: "colaborador", metaDiaria: 20 },
  { nombre: "Javier Muñoz", rut: "18.222.333-4", telefono: "+56973322114", rol: "coordinador", metaDiaria: 25 },
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

  // Matrículas de ejemplo — varias del día de hoy (distribuidas en horario)
  const ahora0 = new Date()
  const hoy = (h: number, m: number) => {
    const d = new Date(ahora0)
    d.setHours(h, m, 0, 0)
    return d
  }
  const matriculas = [
    { nombre: "Ana Riquelme", rut: "17.123.456-7", direccion: "Av. San Martín 100", comuna: "Viña del Mar", fecha: hoy(9, 12) },
    { nombre: "Pedro Fuentes", rut: "14.987.654-3", direccion: "Plaza Vergara 5", comuna: "Viña del Mar", fecha: hoy(9, 48) },
    { nombre: "Camila Rojas", rut: "20.112.233-4", direccion: "Av. Borgoño 15000", comuna: "Viña del Mar", fecha: hoy(10, 30) },
    { nombre: "Diego Bravo", rut: "11.445.667-8", direccion: "Calle Valparaíso 200", comuna: "Viña del Mar", fecha: hoy(11, 5) },
    { nombre: "Lucía Mendez", rut: "16.234.567-K", direccion: "Av. San Martín 1200", comuna: "Viña del Mar", fecha: hoy(11, 40) },
    { nombre: "Tomás Vidal", rut: "18.765.432-1", direccion: "Plaza México 10", comuna: "Viña del Mar", fecha: hoy(12, 15) },
    { nombre: "Sofía Cárdenas", rut: "19.876.543-2", direccion: "Av. Borgoño 14000", comuna: "Viña del Mar", fecha: hoy(13, 22) },
    { nombre: "Matías Roa", rut: "15.111.222-3", direccion: "Calle Quillota 300", comuna: "Viña del Mar", fecha: hoy(14, 10) },
    { nombre: "Valentina Díaz", rut: "20.333.444-5", direccion: "Av. Valparaíso 800", comuna: "Viña del Mar", fecha: hoy(14, 55) },
    { nombre: "Ignacio Tapia", rut: "17.444.555-6", direccion: "Calle Limache 45", comuna: "Viña del Mar", fecha: hoy(15, 30) },
    { nombre: "Francisca Vera", rut: "16.555.666-7", direccion: "Av. San Martín 1500", comuna: "Viña del Mar", fecha: hoy(16, 5) },
    { nombre: "Cristóbal Núñez", rut: "18.666.777-8", direccion: "Plaza Vergara 50", comuna: "Viña del Mar", fecha: hoy(16, 40) },
  ]
  for (let i = 0; i < matriculas.length; i++) {
    const m = matriculas[i]
    const lugar = lugaresCreados[i % lugaresCreados.length]
    const col = colsCreados[i % colsCreados.length]
    await db.matricula.create({
      data: {
        nombre: m.nombre,
        rut: formatRut(m.rut),
        direccion: m.direccion,
        comuna: m.comuna,
        lugarId: lugar.id,
        colaboradorId: col.id,
        createdAt: m.fecha,
      },
    })
  }
  console.log(`✅ ${matriculas.length} matrículas de ejemplo (del día)`)

  // === NOTICIAS MUNICIPALES (agregadas de múltiples medios) ===
  await db.noticia.deleteMany()
  const ahora = new Date()
  const horas = (h: number) => new Date(ahora.getTime() - h * 3600 * 1000)

  // Asignar algunas noticias a lugares específicos
  const playaElSol = lugaresCreados.find((l) => l.nombre === "Playa El Sol")
  const piscinaVina = lugaresCreados.find((l) => l.nombre === "Piscina Municipal Viña del Mar")
  const sausalito = lugaresCreados.find((l) => l.nombre === "Gimnasio Municipal Sausalito")
  const renaca = lugaresCreados.find((l) => l.nombre === "Playa 5to Sector Reñaca")

  const noticias = [
    {
      titulo: "Municipalidad abre temporada de verano con plan de salvavidas en playas de Viña",
      resumen: "La Dirección de Deportes DIDECO confirma despliegue de 60 salvavidas en playas El Sol, Acapulco y Reñaca desde este fin de semana.",
      fuente: "municipal", medio: "Municipalidad de Viña del Mar", categoria: "evento",
      lugarId: playaElSol?.id, lat: playaElSol?.lat, lng: playaElSol?.lng, publicadaEn: horas(2),
    },
    {
      titulo: "Piscina Municipal de Viña del Mar reabre tras mantención",
      resumen: "Tras dos semanas de trabajos, la piscina temperada retoma atención al público con cupos limitados por aforo.",
      fuente: "prensa", medio: "El Mercurio Valparaíso", categoria: "info",
      lugarId: piscinaVina?.id, lat: piscinaVina?.lat, lng: piscinaVina?.lng, publicadaEn: horas(5),
    },
    {
      titulo: "Alerta de oleaje anómalo en costa de la Región de Valparaíso",
      resumen: "ONEMI recomienda precaución en playas del litoral central. Se mantiene bandera amarilla en Reñaca.",
      fuente: "television", medio: "TVN 24 Horas", categoria: "alerta",
      lugarId: renaca?.id, lat: renaca?.lat, lng: renaca?.lng, publicadaEn: horas(1),
    },
    {
      titulo: "Gimnasio Sausalito amplía horario de piscina temperada",
      resumen: "Nuevo bloque vespertino de 16:00 a 18:00 hrs para natación libre, gratuito con inscripción municipal.",
      fuente: "radio", medio: "Radio Valparaíso", categoria: "info",
      lugarId: sausalito?.id, lat: sausalito?.lat, lng: sausalito?.lng, publicadaEn: horas(8),
    },
    {
      titulo: "Exitosa jornada de natación escolar en piscina municipal",
      resumen: "Más de 200 estudiantes participaron del encuentro deportivo organizado por DIDECO.",
      fuente: "redes", medio: "Instagram @deportesvina", categoria: "evento",
      lugarId: piscinaVina?.id, lat: piscinaVina?.lat, lng: piscinaVina?.lng, publicadaEn: horas(14),
    },
    {
      titulo: "Municipio convoca a colaboradores deportivos para temporada estival",
      resumen: "DIDECO llama a inscribirse como colaborador en playas y piscinas. Cupos en el dashboard municipal.",
      fuente: "municipal", medio: "Municipalidad de Viña del Mar", categoria: "info",
      publicadaEn: horas(20),
    },
    {
      titulo: "Reportan alta afluencia en Playa El Sol durante fin de semana",
      resumen: "Aforo alcanzó el 75% según reporte de salvavidas. Se recomienda llegar temprano.",
      fuente: "prensa", medio: "La Estrella de Valparaíso", categoria: "info",
      lugarId: playaElSol?.id, lat: playaElSol?.lat, lng: playaElSol?.lng, publicadaEn: horas(26),
    },
    {
      titulo: "Programa 'Verano Sano' activa puntos de hidratación en playas",
      resumen: "La Municipalidad instala puntos de agua gratuita en Acapulco, Caleta Abarca y Reñaca.",
      fuente: "municipal", medio: "Municipalidad de Viña del Mar", categoria: "evento",
      publicadaEn: horas(30),
    },
  ]

  for (const n of noticias) {
    await db.noticia.create({ data: n })
  }
  console.log(`✅ ${noticias.length} noticias municipales`)

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
