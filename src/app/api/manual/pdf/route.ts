import { NextResponse } from "next/server"
import { jsPDF } from "jspdf"

export const dynamic = "force-dynamic"

/**
 * GET /api/manual/pdf — genera el Manual de Uso como PDF descargable.
 * No requiere sesión (es público). Contenido humanizado, sin tecnicismos.
 */
export async function GET() {
  try {
    const doc = new jsPDF({ unit: "pt", format: "a4" })
    const pageW = doc.internal.pageSize.getWidth()
    const pageH = doc.internal.pageSize.getHeight()
    const margin = 50
    const contentW = pageW - margin * 2

    // Paleta
    const PRIMARY = [15, 118, 110] as [number, number, number] // teal-700
    const PRIMARY_DARK = [19, 78, 74] as [number, number, number]
    const TEXT = [31, 41, 55] as [number, number, number]
    const MUTED = [100, 116, 139] as [number, number, number]
    const AMBER = [180, 83, 9] as [number, number, number]
    const LIGHT = [240, 253, 250] as [number, number, number]

    let y = margin

    // ============ PORTADA ============
    doc.setFillColor(...PRIMARY)
    doc.rect(0, 0, pageW, 280, "F")
    doc.setFillColor(...PRIMARY_DARK)
    doc.rect(0, 270, pageW, 12, "F")

    doc.setTextColor(255, 255, 255)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    doc.text("MUNICIPALIDAD DE VIÑA DEL MAR · DIDECO", margin, 60)

    doc.setFontSize(32)
    doc.text("Manual de Uso", margin, 120)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(15)
    doc.text("Viña Summer — Playas, Piscinas y Colaboradores", margin, 155)

    doc.setFontSize(12)
    doc.text("Una guía sencilla, paso a paso, para todas las edades 🌊", margin, 180)

    // KPIs portada
    const cards = [
      { t: "9 secciones", c: PRIMARY },
      { t: "Paso a paso", c: [3, 105, 161] as [number, number, number] },
      { t: "Sin tecnicismos", c: AMBER },
    ]
    const cw = (contentW - 20) / 3
    cards.forEach((c, i) => {
      const x = margin + i * (cw + 10)
      doc.setFillColor(255, 255, 255)
      doc.roundedRect(x, 200, cw, 50, 6, 6, "F")
      doc.setFillColor(...c.c)
      doc.roundedRect(x, 200, 5, 50, 2, 2, "F")
      doc.setTextColor(...c.c)
      doc.setFont("helvetica", "bold")
      doc.setFontSize(14)
      doc.text(c.t, x + 14, 230)
    })

    // Introducción
    y = 330
    doc.setTextColor(...PRIMARY_DARK)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(18)
    doc.text("¡Hola! Bienvenido/a 👋", margin, y)
    y += 24

    doc.setTextColor(...TEXT)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(11)
    y = addParagraph(
      doc,
      "Este sistema le ayuda a la Municipalidad de Viña del Mar a llevar un orden de las playas, piscinas y gimnasios de la comuna. Aquí puede ver los lugares en un mapa, registrar a las personas que asisten, asignar colaboradores y sacar informes.",
      margin,
      y,
      contentW,
    )
    y += 8
    y = addParagraph(
      doc,
      "No se preocupe si no sabe mucho de computadores. Esta guía le explica todo con palabras sencillas, como si se lo contara un familiar. Vamos paso a paso. 💚",
      margin,
      y,
      contentW,
    )

    // Índice
    y += 30
    doc.setTextColor(...PRIMARY_DARK)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(14)
    doc.text("Lo que vamos a ver:", margin, y)
    y += 18
    const indice = [
      "1. Cómo entrar a la página (iniciar sesión)",
      "2. La página del Colaborador",
      "3. La página del Administrador (DIDECO)",
      "4. Cómo registrar a una persona (matrícula)",
      "5. Cómo ver el mapa y las noticias",
      "6. Cómo asignar colaboradores a un lugar",
      "7. Cómo sacar un informe (Excel, Word, PDF, PowerPoint)",
      "8. Cómo enviar un correo a la Dirección de Deportes",
      "9. Preguntas frecuentes",
    ]
    doc.setFont("helvetica", "normal")
    doc.setFontSize(11)
    doc.setTextColor(...TEXT)
    indice.forEach((item) => {
      if (y > pageH - margin) {
        doc.addPage()
        y = margin
      }
      doc.text(`• ${item}`, margin + 10, y)
      y += 18
    })

    // ============ CONTENIDO ============
    const secciones = [
      {
        num: "1",
        titulo: "Cómo entrar a la página (iniciar sesión)",
        parrafos: [
          "Cuando abre la página por primera vez, verá una pantalla con el logo de Viña Summer y un formulario que dice \"Iniciar sesión\". Para entrar necesita un correo y una contraseña.",
          "Debajo del formulario hay botones de colores que rellenan los datos solos. Solo tiene que hacer clic y luego presionar el botón verde \"Ingresar\":",
          "• Cuenta Google (rojo): para colaboradores con correo @gmail.com\n• Cuenta Microsoft (azul): para colaboradores con @outlook.com o @hotmail.com\n• Colaborador municipal (verde): para el personal de la municipalidad\n• Admin DIDECO (violeta): para el jefe de la Dirección de Deportes",
          "También puede hacer clic en los botones grandes \"Continuar con Google\" o \"Continuar con Microsoft\" si tiene una cuenta de esos correos.",
          "💡 Consejo: ¿Se le olvidó cerrar sesión? Arriba a la derecha siempre hay un botón que dice \"Salir\". Úselo cuando termine, sobre todo si está en un computador compartido.",
        ],
      },
      {
        num: "2",
        titulo: "La página del Colaborador",
        parrafos: [
          "Si entra como colaborador, verá una página con su nombre y un saludo (\"Hola, Carolina\" por ejemplo). Esta es su página de trabajo.",
          "Aquí puede:\n• Ver sus números: cuántos lugares tiene a cargo y cuántas personas ha registrado.\n• Ver un mapa con los lugares que le toca atender.\n• Registrar a las personas que llegan (ver sección 4).\n• Ver las noticias del municipio para estar al día.\n• Ver las últimas personas que usted registró.",
          "💡 El colaborador NO puede entrar a la página del administrador. Si intenta ir a /admin, el sistema lo devuelve a su página. Es por seguridad.",
        ],
      },
      {
        num: "3",
        titulo: "La página del Administrador (DIDECO)",
        parrafos: [
          "Si entra como administrador (con los correos del jefe de Deportes), verá un panel más completo. Es como el \"cuadro de mando\" de toda la comuna.",
          "Aquí puede:\n• Ver las noticias en vivo de todos los medios (prensa, radio, TV, redes).\n• Ver un mapa en tiempo real que se actualiza solo cada 30 segundos.\n• Ver el resumen del día: cuántas personas registró cada colaborador y si cumplió su meta.\n• Asignar colaboradores a distintos lugares (playas, piscinas, gimnasios).\n• Ver gráficos y estadísticas.\n• Sacar informes en Excel, Word, PDF o PowerPoint.\n• Enviar un correo a la Dirección de Deportes.",
          "💡 Para cambiar entre la vista de colaborador y la de administrador, use los botones que dicen \"Colaborador\" y \"Admin DIDECO\" arriba a la derecha.",
        ],
      },
      {
        num: "4",
        titulo: "Cómo registrar a una persona (matrícula)",
        parrafos: [
          "Cuando llega una persona a una playa o piscina, el colaborador la registra así:",
          "1. Busque el recuadro que dice \"Formulario de Matrícula\".\n2. Escriba el nombre completo de la persona.\n3. Escriba el RUT. El sistema lo formatea solo. Si está mal, le avisará.\n4. Elija la comuna (Viña del Mar, Valparaíso, etc.).\n5. Escriba la dirección de la persona.\n6. Arriba del campo \"Lugar asignado\" hay botones para filtrar: Todos, Playas, Piscinas o Gimnasios.\n7. Elija el lugar y el colaborador responsable en las listas desplegables.\n8. Presione el botón verde \"Registrar matrícula\". ¡Listo!",
          "💡 Los datos de las personas están protegidos. El RUT se muestra enmascarado (parcialmente oculto) para cuidar la privacidad. 🔒",
        ],
      },
      {
        num: "5",
        titulo: "Cómo ver el mapa y las noticias",
        parrafos: [
          "EL MAPA: muestra todos los lugares de Viña del Mar como puntitos de colores:\n• Azul = Playas\n• Verde = Piscinas municipales\n• Naranjo = Gimnasios con piscina",
          "Si hace clic en un puntito, verá el nombre del lugar, su dirección y su horario. Si presiona el botón \"Mi ubicación\", el mapa le mostrará dónde está usted ahora (necesita dar permiso al navegador).",
          "LAS NOTICIAS: arriba del mapa hay un recuadro con \"Noticias municipales en vivo\". Se actualiza solo cada 30 segundos. Muestra noticias de periódicos, radios, televisión y redes sociales sobre Viña del Mar. Puede filtrarlas: Todos, Alertas, Eventos o Info.",
          "💡 Las noticias le ayudan a saber si hay alertas (como oleaje fuerte) antes de registrar a las personas. ¡Manténgase informado! 📻",
        ],
      },
      {
        num: "6",
        titulo: "Cómo asignar colaboradores a un lugar",
        parrafos: [
          "Esto lo hace solo el administrador. Sirve para decir qué colaborador atiende qué playa o piscina.",
          "1. En la página del administrador, busque la sección \"Asignación de colaboradores\".\n2. Use los botones de arriba para ver solo playas, solo piscinas o solo gimnasios.\n3. Elija un colaborador en la lista \"Filtrar por colaborador\" para ver dónde está asignado.\n4. En cada lugar verá un botón \"＋ Asignar\". Haga clic ahí para asignar ese colaborador. Aparecerá una marca verde \"✓ Asignado\".",
          "💡 Si se equivoca, puede quitar la asignación igual de fácil. Nada se rompe. 😊",
        ],
      },
      {
        num: "7",
        titulo: "Cómo sacar un informe (Excel, Word, PDF, PowerPoint)",
        parrafos: [
          "En la página del administrador hay una sección que dice \"Exportar informe\". Tiene 4 botones:",
          "• Excel (verde): una hoja de cálculo con todas las tablas. Ideal para ordenar y sumar.\n• Word (azul): un documento que puede editar. Bueno para agregar comentarios.\n• PDF (verde-azul): listo para imprimir o enviar por correo. No se puede editar.\n• PowerPoint (naranjo): una presentación con diapositivas. Ideal para reuniones.",
          "Haga clic en el botón \"Descargar\" del formato que quiera. El archivo se guardará en su computador (en la carpeta de Descargas).",
          "💡 El informe muestra el lugar asignado de cada colaborador, cuántas personas registró, su meta del día y si la cumplió. Todo con fecha y hora. 📅",
        ],
      },
      {
        num: "8",
        titulo: "Cómo enviar un correo a la Dirección de Deportes",
        parrafos: [
          "En la página del administrador hay una sección que dice \"Envío por correo electrónico\". Sirve para enviar el informe por correo a la Dirección de Deportes.",
          "1. El destinatario ya está escrito: deportes.dideco@munivina.cl. No se puede cambiar.\n2. Escriba su nombre y, si quiere, su correo.\n3. El asunto ya viene rellenado, pero puede cambiarlo.\n4. Escriba un mensaje si quiere decir algo.\n5. Elija si quiere adjuntar un archivo (PDF, PowerPoint, Excel o Word) o ninguno.\n6. Presione el botón verde \"Enviar correo\".",
          "💡 Si el sistema no tiene configurado el correo saliente, abrirá su propio programa de correo (Outlook, Gmail, etc.) con todo listo para enviar. Solo tiene que adjuntar el archivo descargado. 📧",
        ],
      },
      {
        num: "9",
        titulo: "Preguntas frecuentes",
        parrafos: [
          "¿Puedo entrar desde el celular?\n¡Sí! La página funciona en celular, tablet y computador. Se adapta al tamaño de la pantalla. 📱",
          "¿Qué hago si se me olvida la contraseña?\nPregúntele al administrador del sistema. Él puede darle una nueva o recordarle la cuenta de acceso rápido.",
          "¿Mis datos están seguros?\nSí. El sistema protege los datos personales: los RUT se muestran enmascarados, las contraseñas no se ven, y hay medidas de ciberseguridad activas. 🔒",
          "¿Por qué no puedo entrar a la página del administrador?\nPorque su cuenta es de colaborador. Solo los correos autorizados (del jefe de Deportes) pueden ver esa página. Es para proteger la información.",
          "¿El mapa funciona sin internet?\nEl mapa necesita internet para cargar los puntitos. Si no hay conexión, espere a tener señal. 📶",
          "¿Puedo borrar un lugar o un colaborador?\nSolo el administrador puede hacerlo, y es una eliminación \"suave\": el dato se oculta pero no se borra del todo, por si se necesita después.",
        ],
      },
    ]

    secciones.forEach((sec) => {
      // Nueva página por sección
      doc.addPage()
      y = margin

      // Banda de título
      doc.setFillColor(...PRIMARY)
      doc.rect(0, 0, pageW, 70, "F")
      doc.setTextColor(255, 255, 255)
      doc.setFont("helvetica", "bold")
      doc.setFontSize(11)
      doc.text(`Sección ${sec.num}`, margin, 30)
      doc.setFontSize(18)
      doc.text(sec.titulo, margin, 55)

      y = 100
      doc.setTextColor(...TEXT)
      doc.setFont("helvetica", "normal")
      doc.setFontSize(11)

      sec.parrafos.forEach((p) => {
        const isTip = p.startsWith("💡")
        if (isTip) {
          // Caja de consejo
          const lines = doc.splitTextToSize(p, contentW - 20)
          const boxH = lines.length * 15 + 20
          if (y + boxH > pageH - margin) {
            doc.addPage()
            y = margin
          }
          doc.setFillColor(254, 243, 199) // amber-100
          doc.roundedRect(margin, y, contentW, boxH, 6, 6, "F")
          doc.setTextColor(...AMBER)
          doc.setFontSize(10)
          doc.text(lines, margin + 10, y + 16)
          y += boxH + 12
          doc.setFontSize(11)
          doc.setTextColor(...TEXT)
        } else {
          const lines = doc.splitTextToSize(p, contentW)
          lines.forEach((line: string) => {
            if (y > pageH - margin) {
              doc.addPage()
              y = margin
            }
            doc.text(line, margin, y)
            y += 15
          })
          y += 8
        }
      })
    })

    // ============ CIERRE ============
    doc.addPage()
    y = pageH / 2 - 80
    doc.setFillColor(...LIGHT)
    doc.roundedRect(margin, y, contentW, 160, 10, 10, "F")
    doc.setTextColor(...PRIMARY_DARK)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(22)
    doc.text("¡Eso es todo! 🎉", pageW / 2, y + 40, { align: "center" })
    doc.setFont("helvetica", "normal")
    doc.setFontSize(12)
    doc.setTextColor(...TEXT)
    const cierre = doc.splitTextToSize(
      "Esperamos que esta guía le haya servido. Si tiene alguna duda, escríbale a la Dirección de Deportes:",
      contentW - 40,
    )
    doc.text(cierre, pageW / 2, y + 75, { align: "center" })
    doc.setTextColor(3, 105, 161)
    doc.setFont("helvetica", "bold")
    doc.text("deportes.dideco@munivina.cl", pageW / 2, y + 105, { align: "center" })
    doc.setTextColor(...MUTED)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.text("Municipalidad de Viña del Mar · Dirección de Deportes DIDECO", pageW / 2, y + 135, {
      align: "center",
    })

    // Pie de página en todas las páginas
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setDrawColor(226, 232, 240)
      doc.setLineWidth(0.5)
      doc.line(margin, pageH - 30, pageW - margin, pageH - 30)
      doc.setFont("helvetica", "normal")
      doc.setFontSize(8)
      doc.setTextColor(...MUTED)
      doc.text("Manual de Uso · Viña Summer", margin, pageH - 16)
      doc.text(`Página ${i} de ${pageCount}`, pageW - margin, pageH - 16, { align: "right" })
    }

    doc.setProperties({
      title: "Manual de Uso — Viña Summer",
      subject: "Guía sencilla de uso del sistema para todas las edades",
      author: "Municipalidad de Viña del Mar · DIDECO",
      keywords: "manual, uso, viña summer, playas, piscinas, colaboradores, didieco",
    })

    const buf = Buffer.from(doc.output("arraybuffer"))
    return new NextResponse(new Uint8Array(buf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="manual-uso-vina-summer.pdf"',
        "Cache-Control": "public, max-age=3600",
      },
    })
  } catch (e) {
    console.error("manual pdf error:", e)
    return NextResponse.json({ error: "Error al generar el manual PDF" }, { status: 500 })
  }
}

/** Añade un párrafo con salto de línea automático y paginación */
function addParagraph(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
): number {
  const lines = doc.splitTextToSize(text, maxWidth)
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 50
  lines.forEach((line: string) => {
    if (y > pageH - margin) {
      doc.addPage()
      y = margin
    }
    doc.text(line, x, y)
    y += 15
  })
  return y
}
