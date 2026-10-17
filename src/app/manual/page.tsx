import { Waves, ArrowLeft, Download, Heart } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default function ManualPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-sky-50 via-teal-50 to-emerald-50 text-foreground">
      {/* Decoración */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-sky-200/30 blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-teal-200/20 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-12">
        {/* Encabezado */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Volver
          </Link>
          <a
            href="/api/manual/pdf"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-sm font-medium text-white shadow-md hover:from-emerald-700 hover:to-teal-700 transition-colors"
          >
            <Download className="h-4 w-4" /> Descargar PDF
          </a>
        </div>

        {/* Portada del manual */}
        <div className="mb-10 rounded-3xl bg-gradient-to-r from-sky-500 via-teal-500 to-emerald-500 p-8 sm:p-10 text-center text-white shadow-xl shadow-teal-200/50">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
            <Waves className="h-8 w-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Manual de Uso
          </h1>
          <p className="mt-3 text-lg text-white/90">
            Viña Summer — Playas, Piscinas y Colaboradores
          </p>
          <p className="mt-2 text-sm text-white/80">
            Una guía sencilla, paso a paso, para todas las edades 🌊
          </p>
        </div>

        {/* Introducción */}
        <section className="mb-10 rounded-2xl border-none bg-white/70 backdrop-blur p-6 sm:p-8 shadow-sm">
          <h2 className="mb-3 text-xl font-bold text-slate-800">👋 ¡Hola! Bienvenido/a</h2>
          <p className="text-slate-700 leading-relaxed">
            Este sistema le ayuda a la <strong>Municipalidad de Viña del Mar</strong> a llevar un
            orden de las playas, piscinas y gimnasios de la comuna. Aquí puede ver los lugares en un
            mapa, registrar a las personas que asisten, asignar colaboradores y sacar informes.
          </p>
          <p className="mt-3 text-slate-700 leading-relaxed">
            No se preocupe si no sabe mucho de computadores. Esta guía le explica todo con palabras
            sencillas, como si se lo contara un familiar. Vamos paso a paso. 💚
          </p>
        </section>

        {/* Índice */}
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-bold text-slate-800">📋 Lo que vamos a ver</h2>
          <ol className="space-y-2">
            {[
              { num: "1", t: "Cómo entrar a la página (iniciar sesión)" },
              { num: "2", t: "La página del Colaborador (lo que ve quien atiende)" },
              { num: "3", t: "La página del Administrador (lo que ve el jefe)" },
              { num: "4", t: "Cómo registrar a una persona (matrícula)" },
              { num: "5", t: "Cómo ver el mapa y las noticias" },
              { num: "6", t: "Cómo asignar colaboradores a un lugar" },
              { num: "7", t: "Cómo sacar un informe (Excel, Word, PDF, PowerPoint)" },
              { num: "8", t: "Cómo enviar un correo a la Dirección de Deportes" },
              { num: "9", t: "Preguntas frecuentes" },
            ].map((item) => (
              <li
                key={item.num}
                className="flex items-center gap-3 rounded-xl border border-white/60 bg-white/60 p-3"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-600 text-sm font-bold text-white">
                  {item.num}
                </span>
                <span className="text-sm text-slate-700">{item.t}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* Sección 1: Iniciar sesión */}
        <Section num="1" title="Cómo entrar a la página (iniciar sesión)">
          <p>
            Cuando abre la página por primera vez, verá una pantalla con el logo de Viña Summer y
            un formulario que dice <em>“Iniciar sesión”</em>. Para entrar necesita un correo y una
            contraseña.
          </p>
          <div className="my-4 rounded-xl border border-sky-100 bg-sky-50/60 p-4">
            <p className="font-semibold text-sky-800">📋 Cuentas de acceso rápido</p>
            <p className="mt-2 text-sm text-slate-700">
              Debajo del formulario hay botones de colores que rellenan los datos solos. Solo tiene
              que hacer clic y luego presionar el botón verde <strong>“Ingresar”</strong>:
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span>🔴</span>
                <span>
                  <strong>Cuenta Google</strong> — para colaboradores con correo @gmail.com
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span>🔵</span>
                <span>
                  <strong>Cuenta Microsoft</strong> — para colaboradores con correo @outlook.com o
                  @hotmail.com
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span>🟢</span>
                <span>
                  <strong>Colaborador municipal</strong> — para el personal de la municipalidad
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span>🟣</span>
                <span>
                  <strong>Admin DIDECO</strong> — para el jefe de la Dirección de Deportes
                </span>
              </li>
            </ul>
          </div>
          <p>
            También puede hacer clic en los botones grandes <strong>“Continuar con Google”</strong>{" "}
            o <strong>“Continuar con Microsoft”</strong> si tiene una cuenta de esos correos.
          </p>
          <Tip>
            ¿Se le olvidó cerrar sesión? Arriba a la derecha siempre hay un botón que dice{" "}
            <strong>“Salir”</strong>. Úselo cuando termine, sobre todo si está en un computador
            compartido.
          </Tip>
        </Section>

        {/* Sección 2: Página del colaborador */}
        <Section num="2" title="La página del Colaborador">
          <p>
            Si entra como <strong>colaborador</strong>, verá una página con su nombre y un saludo
            (“Hola, Carolina” por ejemplo). Esta es <strong>su página de trabajo</strong>.
          </p>
          <p className="mt-3">Aquí puede:</p>
          <ul className="my-3 space-y-2">
            <Bullet>📊 Ver sus números: cuántos lugares tiene a cargo y cuántas personas ha registrado.</Bullet>
            <Bullet>🗺️ Ver un mapa con los lugares que le toca atender.</Bullet>
            <Bullet>📝 Registrar a las personas que llegan (ver sección 4).</Bullet>
            <Bullet>📰 Ver las noticias del municipio para estar al día.</Bullet>
            <Bullet>📋 Ver las últimas personas que usted registró.</Bullet>
          </ul>
          <Tip>
            El colaborador <strong>no puede</strong> entrar a la página del administrador. Si
            intenta ir a <strong>/admin</strong>, el sistema lo devuelve a su página. Es por
            seguridad.
          </Tip>
        </Section>

        {/* Sección 3: Página del administrador */}
        <Section num="3" title="La página del Administrador (DIDECO)">
          <p>
            Si entra como <strong>administrador</strong> (con los correos del jefe de Deportes),
            verá un panel más completo. Es como el “cuadro de mando” de toda la comuna.
          </p>
          <p className="mt-3">Aquí puede:</p>
          <ul className="my-3 space-y-2">
            <Bullet>📰 Ver las noticias en vivo de todos los medios (prensa, radio, TV, redes).</Bullet>
            <Bullet>🗺️ Ver un mapa en tiempo real que se actualiza solo cada 30 segundos.</Bullet>
            <Bullet>📅 Ver el <strong>resumen del día</strong>: cuántas personas registró cada colaborador y si cumplió su meta.</Bullet>
            <Bullet>👥 <strong>Asignar colaboradores</strong> a distintos lugares (playas, piscinas, gimnasios).</Bullet>
            <Bullet>📊 Ver gráficos y estadísticas.</Bullet>
            <Bullet>📄 Sacar informes en Excel, Word, PDF o PowerPoint.</Bullet>
            <Bullet>📧 Enviar un correo a la Dirección de Deportes.</Bullet>
          </ul>
          <Tip>
            Para cambiar entre la vista de colaborador y la de administrador, use los botones que
            dicen <strong>“Colaborador”</strong> y <strong>“Admin DIDECO”</strong> arriba a la
            derecha.
          </Tip>
        </Section>

        {/* Sección 4: Registrar matrícula */}
        <Section num="4" title="Cómo registrar a una persona (matrícula)">
          <p>
            Cuando llega una persona a una playa o piscina, el colaborador la registra así:
          </p>
          <ol className="my-3 space-y-3">
            <Step n="1">
              Busque el recuadro que dice <strong>“Formulario de Matrícula”</strong>.
            </Step>
            <Step n="2">
              Escriba el <strong>nombre completo</strong> de la persona.
            </Step>
            <Step n="3">
              Escriba el <strong>RUT</strong>. El sistema lo formatea solo (pone los puntos y el
              guion). Si el RUT está mal escrito, le avisará.
            </Step>
            <Step n="4">
              Elija la <strong>comuna</strong> (Viña del Mar, Valparaíso, etc.).
            </Step>
            <Step n="5">
              Escriba la <strong>dirección</strong> de la persona.
            </Step>
            <Step n="6">
              Arriba del campo <strong>“Lugar asignado”</strong> hay botones para filtrar:{" "}
              <strong>Todos</strong>, <strong>Playas</strong>, <strong>Piscinas</strong> o{" "}
              <strong>Gimnasios</strong>. Haga clic en el que quiera para ver solo esos lugares.
            </Step>
            <Step n="7">
              Elija el <strong>lugar</strong> y el <strong>colaborador responsable</strong> en las
              listas desplegables.
            </Step>
            <Step n="8">
              Presione el botón verde <strong>“Registrar matrícula”</strong>. ¡Listo! Aparecerá un
              mensaje de confirmación.
            </Step>
          </ol>
          <Tip>
            Los datos de las personas están <strong>protegidos</strong>. El RUT se muestra
            enmascarado (parcialmente oculto) para cuidar la privacidad. 🔒
          </Tip>
        </Section>

        {/* Sección 5: Mapa y noticias */}
        <Section num="5" title="Cómo ver el mapa y las noticias">
          <h3 className="mb-2 font-semibold text-slate-800">🗺️ El mapa</h3>
          <p>
            El mapa muestra todos los lugares de Viña del Mar como puntitos de colores:
          </p>
          <ul className="my-3 space-y-2">
            <li className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-full bg-sky-500" />
              <span className="text-sm">Azul = Playas</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-full bg-emerald-500" />
              <span className="text-sm">Verde = Piscinas municipales</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-full bg-amber-500" />
              <span className="text-sm">Naranjo = Gimnasios con piscina</span>
            </li>
          </ul>
          <p>
            Si hace clic en un puntito, verá el nombre del lugar, su dirección y su horario. Si
            presiona el botón <strong>“Mi ubicación”</strong>, el mapa le mostrará dónde está usted
            ahora (necesita dar permiso al navegador). 📍
          </p>
          <h3 className="mb-2 mt-6 font-semibold text-slate-800">📰 Las noticias</h3>
          <p>
            Arriba del mapa hay un recuadro con <strong>“Noticias municipales en vivo”</strong>. Se
            actualiza solo cada 30 segundos. Muestra noticias de periódicos, radios, televisión y
            redes sociales sobre Viña del Mar. Puede filtrarlas con los botones:{" "}
            <strong>Todos</strong>, <strong>Alertas</strong>, <strong>Eventos</strong> o{" "}
            <strong>Info</strong>.
          </p>
          <Tip>
            Las noticias le ayudan a saber si hay alertas (como oleaje fuerte) antes de registrar a
            las personas. ¡Manténgase informado! 📻
          </Tip>
        </Section>

        {/* Sección 6: Asignar colaboradores */}
        <Section num="6" title="Cómo asignar colaboradores a un lugar">
          <p>
            Esto lo hace solo el <strong>administrador</strong>. Sirve para decir qué colaborador
            atiende qué playa o piscina.
          </p>
          <ol className="my-3 space-y-3">
            <Step n="1">
              En la página del administrador, busque la sección{" "}
              <strong>“Asignación de colaboradores”</strong>.
            </Step>
            <Step n="2">
              Use los botones de arriba para ver solo playas, solo piscinas o solo gimnasios.
            </Step>
            <Step n="3">
              Elija un colaborador en la lista <strong>“Filtrar por colaborador”</strong> para ver
              dónde está asignado.
            </Step>
            <Step n="4">
              En cada lugar verá un botón <strong>“＋ Asignar”</strong>. Haga clic ahí para
              asignar ese colaborador al lugar. Aparecerá una marca verde <strong>“✓ Asignado”</strong>.
            </Step>
          </ol>
          <Tip>
            Si se equivoca, puede quitar la asignación igual de fácil. Nada se rompe. 😊
          </Tip>
        </Section>

        {/* Sección 7: Informes */}
        <Section num="7" title="Cómo sacar un informe (Excel, Word, PDF, PowerPoint)">
          <p>
            En la página del administrador hay una sección que dice{" "}
            <strong>“Exportar informe”</strong>. Tiene 4 botones:
          </p>
          <div className="my-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
              <p className="font-semibold text-emerald-700">📊 Excel</p>
              <p className="mt-1 text-xs text-slate-600">
                Una hoja de cálculo con todas las tablas. Ideal para ordenar y sumar.
              </p>
            </div>
            <div className="rounded-xl border border-sky-200 bg-sky-50/60 p-4">
              <p className="font-semibold text-sky-700">📝 Word</p>
              <p className="mt-1 text-xs text-slate-600">
                Un documento que puede editar. Bueno para agregar comentarios.
              </p>
            </div>
            <div className="rounded-xl border border-teal-200 bg-teal-50/60 p-4">
              <p className="font-semibold text-teal-700">📄 PDF</p>
              <p className="mt-1 text-xs text-slate-600">
                Listo para imprimir o enviar por correo. No se puede editar.
              </p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
              <p className="font-semibold text-amber-700">📽️ PowerPoint</p>
              <p className="mt-1 text-xs text-slate-600">
                Una presentación con diapositivas. Ideal para reuniones.
              </p>
            </div>
          </div>
          <p>
            Haga clic en el botón <strong>“Descargar”</strong> del formato que quiera. El archivo se
            guardará en su computador (en la carpeta de Descargas).
          </p>
          <Tip>
            El informe muestra el <strong>lugar asignado</strong> de cada colaborador, cuántas
            personas registró, su meta del día y si la cumplió. Todo con fecha y hora. 📅
          </Tip>
        </Section>

        {/* Sección 8: Correo electrónico */}
        <Section num="8" title="Cómo enviar un correo a la Dirección de Deportes">
          <p>
            En la página del administrador hay una sección que dice{" "}
            <strong>“Envío por correo electrónico”</strong>. Sirve para enviar el informe por correo
            a la Dirección de Deportes.
          </p>
          <ol className="my-3 space-y-3">
            <Step n="1">
              El <strong>destinatario</strong> ya está escrito:{" "}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">
                deportes.dideco@munivina.cl
              </code>
              . No se puede cambiar.
            </Step>
            <Step n="2">
              Escriba su <strong>nombre</strong> y, si quiere, su correo.
            </Step>
            <Step n="3">
              El <strong>asunto</strong> ya viene rellenado, pero puede cambiarlo.
            </Step>
            <Step n="4">
              Escriba un <strong>mensaje</strong> si quiere decir algo.
            </Step>
            <Step n="5">
              Elija si quiere adjuntar un archivo (PDF, PowerPoint, Excel o Word) o ninguno.
            </Step>
            <Step n="6">
              Presione el botón verde <strong>“Enviar correo”</strong>.
            </Step>
          </ol>
          <Tip>
            Si el sistema no tiene configurado el correo saliente, abrirá su propio programa de
            correo (Outlook, Gmail, etc.) con todo listo para enviar. Solo tiene que adjuntar el
            archivo descargado. 📧
          </Tip>
        </Section>

        {/* Sección 9: Preguntas frecuentes */}
        <Section num="9" title="Preguntas frecuentes">
          <Faq q="¿Puedo entrar desde el celular?">
            ¡Sí! La página funciona en celular, tablet y computador. Se adapta al tamaño de la
            pantalla. 📱
          </Faq>
          <Faq q="¿Qué hago si se me olvida la contraseña?">
            Pregúntele al administrador del sistema. Él puede darle una nueva o recordarle la
            cuenta de acceso rápido.
          </Faq>
          <Faq q="¿Mis datos están seguros?">
            Sí. El sistema protege los datos personales: los RUT se muestran enmascarados, las
            contraseñas no se ven, y hay medidas de ciberseguridad activas. 🔒
          </Faq>
          <Faq q="¿Por qué no puedo entrar a la página del administrador?">
            Porque su cuenta es de colaborador. Solo los correos autorizados (del jefe de
            Deportes) pueden ver esa página. Es para proteger la información.
          </Faq>
          <Faq q="¿El mapa funciona sin internet?">
            El mapa necesita internet para cargar los puntitos. Si no hay conexión, espere a tener
            señal. 📶
          </Faq>
          <Faq q="¿Puedo borrar un lugar o un colaborador?">
            Solo el administrador puede hacerlo, y es una eliminación “suave”: el dato se oculta
            pero no se borra del todo, por si se necesita después.
          </Faq>
        </Section>

        {/* Cierre */}
        <section className="mt-10 rounded-2xl border-none bg-white/70 backdrop-blur p-6 sm:p-8 shadow-sm text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-emerald-500 text-white">
            <Heart className="h-6 w-6" />
          </div>
          <h2 className="mb-2 text-xl font-bold text-slate-800">¡Eso es todo! 🎉</h2>
          <p className="text-slate-700 leading-relaxed">
            Esperamos que esta guía le haya servido. Si tiene alguna duda, escríbale a la Dirección
            de Deportes:{" "}
            <a
              href="mailto:deportes.dideco@munivina.cl"
              className="font-semibold text-teal-600 hover:underline"
            >
              deportes.dideco@munivina.cl
            </a>
          </p>
          <p className="mt-3 text-sm text-slate-500">
            Municipalidad de Viña del Mar · Dirección de Deportes DIDECO
          </p>
        </section>
      </div>
    </div>
  )
}

function Section({
  num,
  title,
  children,
}: {
  num: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="mb-8 rounded-2xl border-none bg-white/70 backdrop-blur p-6 sm:p-8 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500 text-base font-bold text-white shadow-sm">
          {num}
        </span>
        <h2 className="text-lg sm:text-xl font-bold text-slate-800">{title}</h2>
      </div>
      <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed space-y-3">
        {children}
      </div>
    </section>
  )
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-0.5 text-emerald-600">✓</span>
      <span>{children}</span>
    </li>
  )
}

function Step({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-white">
        {n}
      </span>
      <span className="text-sm text-slate-700">{children}</span>
    </li>
  )
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50/80 p-4">
      <span className="text-lg">💡</span>
      <p className="text-sm text-amber-900">{children}</p>
    </div>
  )
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <div className="mb-4 rounded-xl border border-white/60 bg-white/60 p-4">
      <p className="font-semibold text-slate-800">❓ {q}</p>
      <p className="mt-2 text-sm text-slate-600">{children}</p>
    </div>
  )
}
