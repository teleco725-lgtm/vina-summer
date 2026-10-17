/**
 * Generador de Word (.docx) — Informe diario de colaboradores deportivos.
 *
 * Estructura:
 *   - Portada con banda teal + fechaLabel + generadoEn.
 *   - §1 Resumen del día (KPI table).
 *   - §2 Cumplimiento por colaborador (tabla con shading condicional en %).
 *   - §3 Registros capturados del día (libro mayor con fecha y hora).
 *   - §4 Lugares asignados por colaborador (matriz colaborador × lugar).
 *   - §5 Protección de datos.
 *
 * Header (right italic muted) + footer (center "Página X de Y · Documento protegido").
 * Margins 2cm. Line spacing 312.
 */
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  AlignmentType,
  WidthType,
  BorderStyle,
  ShadingType,
  PageBreak,
  Footer,
  Header,
  PageNumber,
  LevelFormat,
} from "docx"
import {
  colorPorCumplimiento,
  estadoCumplimiento,
  flattenLugares,
  flattenRegistros,
  type ResumenDia,
} from "@/lib/resumen-dia"

const C = {
  primary: "0F766E",
  primaryDark: "134E4A",
  accent: "0369A1",
  amber: "B45309",
  header: "0F766E",
  headerText: "FFFFFF",
  zebra: "F0FDFA",
  border: "A7F3D0",
  muted: "475569",
  total: "115E59",
}

function txt(
  text: string,
  opts?: { bold?: boolean; color?: string; size?: number; italic?: boolean },
) {
  return new TextRun({
    text,
    bold: opts?.bold,
    color: opts?.color,
    size: opts?.size ?? 22, // 11pt
    italics: opts?.italic,
    font: "Calibri",
  })
}

function p(
  children: TextRun[],
  opts?: {
    align?: (typeof AlignmentType)[keyof typeof AlignmentType]
    spacing?: number
  },
) {
  return new Paragraph({
    children,
    alignment: opts?.align,
    spacing: { line: 312, after: opts?.spacing ?? 120 },
  })
}

function heading(
  text: string,
  level: typeof HeadingLevel.HEADING_1 = HeadingLevel.HEADING_1,
  color = C.primaryDark,
) {
  return new Paragraph({
    heading: level,
    spacing: { before: 280, after: 160, line: 312 },
    children: [
      new TextRun({
        text,
        bold: true,
        color,
        size: level === HeadingLevel.HEADING_1 ? 30 : 24,
        font: "Calibri",
      }),
    ],
  })
}

function headerCell(text: string, width: number) {
  return new TableCell({
    width: { size: width, type: WidthType.PERCENTAGE },
    shading: { type: ShadingType.CLEAR, fill: C.header, color: "auto" },
    margins: { top: 80, bottom: 80, left: 100, right: 100 },
    children: [
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { line: 240 },
        children: [
          new TextRun({
            text,
            bold: true,
            color: C.headerText,
            size: 20,
            font: "Calibri",
          }),
        ],
      }),
    ],
  })
}

type Align = "left" | "center" | "right"

function bodyCell(
  text: string,
  width: number,
  opts?: {
    zebra?: boolean
    align?: Align
    bold?: boolean
    color?: string
    fill?: string
  },
) {
  const alignMap: Record<Align, (typeof AlignmentType)[keyof typeof AlignmentType]> = {
    left: AlignmentType.LEFT,
    center: AlignmentType.CENTER,
    right: AlignmentType.RIGHT,
  }
  const shadingFill = opts?.fill ?? (opts?.zebra ? C.zebra : undefined)
  return new TableCell({
    width: { size: width, type: WidthType.PERCENTAGE },
    shading: shadingFill
      ? { type: ShadingType.CLEAR, fill: shadingFill, color: "auto" }
      : undefined,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [
      new Paragraph({
        alignment: alignMap[opts?.align ?? "left"],
        spacing: { line: 240 },
        children: [
          new TextRun({
            text,
            size: 18,
            font: "Calibri",
            bold: opts?.bold,
            color: opts?.color,
          }),
        ],
      }),
    ],
  })
}

const noBorders = {
  top: { style: BorderStyle.NONE, size: 0 },
  bottom: { style: BorderStyle.NONE, size: 0 },
  left: { style: BorderStyle.NONE, size: 0 },
  right: { style: BorderStyle.NONE, size: 0 },
  insideHorizontal: { style: BorderStyle.NONE, size: 0 },
  insideVertical: { style: BorderStyle.NONE, size: 0 },
}

export async function generateWord(data: ResumenDia): Promise<Buffer> {
  // ===== Portada =====
  const cover = [
    new Paragraph({ spacing: { before: 1200, after: 0 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { line: 360, after: 200 },
      children: [
        new TextRun({
          text: "DIRECCIÓN DE DEPORTES · DIDECO",
          bold: true,
          color: C.muted,
          size: 22,
          font: "Calibri",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { line: 400, after: 160 },
      children: [
        new TextRun({
          text: "INFORME DIARIO DE COLABORADORES",
          bold: true,
          color: C.primary,
          size: 44,
          font: "Calibri",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { line: 320, after: 400 },
      children: [
        new TextRun({
          text: "Municipalidad de Viña del Mar",
          color: C.accent,
          size: 24,
          font: "Calibri",
        }),
      ],
    }),
    // Banda teal con fechaLabel + generadoEn
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: noBorders,
      rows: [
        new TableRow({
          children: [
            new TableCell({
              shading: { type: ShadingType.CLEAR, fill: C.primary, color: "auto" },
              margins: { top: 200, bottom: 200, left: 200, right: 200 },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { line: 300 },
                  children: [
                    new TextRun({
                      text: `Fecha: ${data.fechaLabel}`,
                      bold: true,
                      color: "FFFFFF",
                      size: 24,
                      font: "Calibri",
                    }),
                  ],
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { line: 280 },
                  children: [
                    new TextRun({
                      text: `Generado: ${data.generadoEn}`,
                      color: "E0F2FE",
                      size: 20,
                      font: "Calibri",
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    }),
    new Paragraph({ spacing: { before: 600, after: 0 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { line: 280 },
      children: [
        new TextRun({
          text: "Documento con información protegida · ",
          italics: true,
          color: C.muted,
          size: 18,
          font: "Calibri",
        }),
        new TextRun({
          text: "RUT enmascarados por protección de datos",
          italics: true,
          color: C.primary,
          size: 18,
          font: "Calibri",
        }),
      ],
    }),
    new Paragraph({ children: [new PageBreak()] }),
  ]

  // ===== §1 Resumen del día =====
  const resumenSection = [
    heading("1. Resumen del día"),
    p([
      txt("El presente informe detalla la gestión diaria de los colaboradores deportivos de la "),
      txt("Dirección de Deportes · DIDECO", { bold: true }),
      txt(
        " de la Municipalidad de Viña del Mar, correspondiente al día ",
      ),
      txt(data.fechaLabel, { bold: true }),
      txt(
        ". El documento consolida la meta diaria, los registros capturados (usuarios matriculados) y el porcentaje de cumplimiento individual y global.",
      ),
    ]),
    p([
      txt(
        "Cada matrícula registrada se detalla con fecha y hora exactas, permitiendo reconstruir la jornada operativa de cada colaborador y verificar el cumplimiento de las metas asignadas. Los datos personales se presentan enmascarados conforme a la Ley N° 19.628 sobre Protección de la Vida Privada.",
      ),
    ], { spacing: 200 }),

    heading("1.1 Indicadores principales", HeadingLevel.HEADING_2),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          tableHeader: true,
          children: [headerCell("Indicador", 60), headerCell("Valor", 40)],
        }),
        ...(
          [
            ["Meta total del día", String(data.totalMetaDia)],
            ["Realizado total", String(data.totalRealizado)],
            ["Cumplimiento global", `${data.cumplimientoGlobal}%`],
            ["Colaboradores activos", String(data.totalColaboradores)],
            ["Registros del día", String(data.totalRegistros)],
            ["Lugares monitoreados", String(data.totalLugaresMonitoreados)],
          ] as Array<[string, string]>
        ).map(([k, v], i) =>
          new TableRow({
            cantSplit: true,
            children: [
              bodyCell(k, 60, { zebra: i % 2 === 0, bold: true }),
              bodyCell(v, 40, {
                zebra: i % 2 === 0,
                align: "center",
                bold: true,
                color: C.accent,
              }),
            ],
          }),
        ),
      ],
    }),
  ]

  // ===== §2 Cumplimiento por colaborador =====
  const excedieron = data.colaboradores.filter((c) => c.cumplimiento >= 100)
  const enProgreso = data.colaboradores.filter(
    (c) => c.cumplimiento >= 50 && c.cumplimiento < 100,
  )
  const bajos = data.colaboradores.filter((c) => c.cumplimiento < 50)

  const cumplimientoSection = [
    heading("2. Cumplimiento por colaborador"),
    p([
      txt(
        "Tabla con la meta diaria, registros realizados, porcentaje de cumplimiento y estado individual de cada colaborador activo. El color del porcentaje indica: ",
      ),
      txt("verde ≥ 100%", { bold: true, color: "065F46" }),
      txt(", "),
      txt("amarillo 50–99%", { bold: true, color: "92400E" }),
      txt(", "),
      txt("rojo < 50%", { bold: true, color: "991B1B" }),
      txt("."),
    ]),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          tableHeader: true,
          children: [
            headerCell("Colaborador", 20),
            headerCell("Rol", 12),
            headerCell("Lugar(es) asignado(s)", 30),
            headerCell("Meta", 9),
            headerCell("Realizado", 10),
            headerCell("%", 9),
            headerCell("Estado", 10),
          ],
        }),
        ...data.colaboradores.map((c, i) => {
          const colors = colorPorCumplimiento(c.cumplimiento)
          const est = estadoCumplimiento(c.cumplimiento)
          return new TableRow({
            cantSplit: true,
            children: [
              bodyCell(c.nombre, 20, { zebra: i % 2 === 0, bold: true }),
              bodyCell(c.rol, 12, { zebra: i % 2 === 0, align: "center" }),
              bodyCell(
                c.lugaresAsignados.map((l) => l.nombre).join(", ") || "Sin asignar",
                30,
                { zebra: i % 2 === 0 },
              ),
              bodyCell(String(c.meta), 9, { zebra: i % 2 === 0, align: "center" }),
              bodyCell(String(c.realizado), 10, {
                zebra: i % 2 === 0,
                align: "center",
              }),
              bodyCell(`${c.cumplimiento}%`, 9, {
                zebra: false,
                align: "center",
                bold: true,
                color: colors.fg,
                fill: colors.bg,
              }),
              bodyCell(`${est.icon} ${est.label}`, 10, {
                zebra: i % 2 === 0,
                align: "center",
                color: colors.fg,
              }),
            ],
          })
        }),
        // Fila TOTAL
        new TableRow({
          cantSplit: true,
          children: [
            bodyCell("TOTAL", 20, { bold: true, color: "FFFFFF", fill: C.total }),
            bodyCell("—", 12, {
              align: "center",
              bold: true,
              color: "FFFFFF",
              fill: C.total,
            }),
            bodyCell("Promedio global", 30, {
              bold: true,
              color: "FFFFFF",
              fill: C.total,
            }),
            bodyCell(String(data.totalMetaDia), 9, {
              align: "center",
              bold: true,
              color: "FFFFFF",
              fill: C.total,
            }),
            bodyCell(String(data.totalRealizado), 10, {
              align: "center",
              bold: true,
              color: "FFFFFF",
              fill: C.total,
            }),
            bodyCell(`${data.cumplimientoGlobal}%`, 9, {
              align: "center",
              bold: true,
              color: colorPorCumplimiento(data.cumplimientoGlobal).fg,
              fill: colorPorCumplimiento(data.cumplimientoGlobal).bg,
            }),
            bodyCell(`${estadoCumplimiento(data.cumplimientoGlobal).icon} Global`, 10, {
              align: "center",
              bold: true,
              color: colorPorCumplimiento(data.cumplimientoGlobal).fg,
              fill: C.total,
            }),
          ],
        }),
      ],
    }),
    p([], { spacing: 80 }),
    p([
      txt("Resumen ejecutivo: ", { bold: true }),
      txt(`${excedieron.length} colaborador(es) cumplieron o superaron la meta diaria`, {
        bold: true,
        color: "065F46",
      }),
      txt(", "),
      txt(`${enProgreso.length} en progreso (50–99%)`, { bold: true, color: "92400E" }),
      txt(", y "),
      txt(`${bajos.length} por debajo del 50%`, { bold: true, color: "991B1B" }),
      txt(" del cumplimiento esperado."),
    ]),
  ]

  // ===== §3 Registros capturados del día =====
  const registros = flattenRegistros(data)
  const registrosSection = [
    heading("3. Registros capturados del día"),
    p([
      txt(
        "Detalle de las matrículas registradas durante la jornada, ordenadas por hora. Cada registro incluye fecha y hora exactas, beneficiario, lugar asignado, tipo de lugar y colaborador responsable. Los RUT se presentan enmascarados por protección de datos personales.",
      ),
    ]),
    p(
      [
        txt("Total registros del día: ", { bold: true, color: C.primaryDark }),
        txt(String(registros.length), { bold: true, color: C.accent }),
      ],
      { spacing: 160 },
    ),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          tableHeader: true,
          children: [
            headerCell("Hora", 8),
            headerCell("Fecha", 10),
            headerCell("Beneficiario", 22),
            headerCell("Lugar asignado", 24),
            headerCell("Tipo", 14),
            headerCell("Colaborador", 22),
          ],
        }),
        ...registros.map((r, i) =>
          new TableRow({
            cantSplit: true,
            children: [
              bodyCell(r.hora, 8, { zebra: i % 2 === 0, align: "center", bold: true }),
              bodyCell(r.fecha, 10, { zebra: i % 2 === 0, align: "center" }),
              bodyCell(r.beneficiario, 22, { zebra: i % 2 === 0, bold: true }),
              bodyCell(r.lugar, 24, { zebra: i % 2 === 0 }),
              bodyCell(r.tipoLugar, 14, { zebra: i % 2 === 0, align: "center" }),
              bodyCell(r.colaborador, 22, { zebra: i % 2 === 0 }),
            ],
          }),
        ),
      ],
    }),
  ]

  // ===== §4 Lugares asignados por colaborador =====
  const lugares = flattenLugares(data)
  const lugaresSection = [
    heading("4. Lugares asignados por colaborador"),
    p([
      txt(
        "Matriz colaborador × lugar con tipo y dirección. Cada fila representa una asignación activa de un colaborador a un lugar deportivo.",
      ),
    ]),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          tableHeader: true,
          children: [
            headerCell("Colaborador", 22),
            headerCell("Rol", 12),
            headerCell("Lugar", 24),
            headerCell("Tipo", 18),
            headerCell("Dirección", 24),
          ],
        }),
        ...lugares.map((l, i) =>
          new TableRow({
            cantSplit: true,
            children: [
              bodyCell(l.colaborador, 22, { zebra: i % 2 === 0, bold: true }),
              bodyCell(l.rol, 12, { zebra: i % 2 === 0, align: "center" }),
              bodyCell(l.lugar, 24, { zebra: i % 2 === 0 }),
              bodyCell(l.tipo, 18, { zebra: i % 2 === 0, align: "center" }),
              bodyCell(l.direccion, 24, { zebra: i % 2 === 0 }),
            ],
          }),
        ),
      ],
    }),
  ]

  // ===== §5 Protección de datos =====
  const notaSection = [
    heading("5. Protección de datos y ciberseguridad"),
    p([
      txt(
        "Este documento se ha generado aplicando los siguientes estándares de protección de datos y ciberseguridad, conforme a la Ley N° 19.628 sobre Protección de la Vida Privada:",
        { bold: true },
      ),
    ]),
    p([txt("• Validación de identidad mediante RUT chileno (algoritmo módulo 11).")], { spacing: 80 }),
    p([txt("• Enmascaramiento de datos sensibles (RUT) en reportes y listados.")], { spacing: 80 }),
    p([txt("• Firma de integridad de cada matrícula registrada.")], { spacing: 80 }),
    p([
      txt(
        "• Cabeceras HTTP de seguridad: Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy y HSTS.",
      ),
    ], { spacing: 80 }),
    p([txt("• Sanitización de entradas para prevención de ataques XSS e inyección SQL.")], { spacing: 80 }),
    p([txt("• Mensajes de error genéricos para evitar fuga de información.")], { spacing: 200 }),
    p([
      txt(
        "Para consultas sobre este informe, contactar a la Dirección de Deportes de la Municipalidad de Viña del Mar: ",
        { italic: true, color: C.muted },
      ),
      txt("deportes.dideco@munivina.cl", { bold: true, color: C.accent }),
    ]),
  ]

  const doc = new Document({
    creator: "Municipalidad de Viña del Mar",
    title: "Informe Diario de Colaboradores Deportivos",
    description: `Informe del día ${data.fechaLabel}`,
    subject: "Informe diario colaboradores deportivos",
    styles: {
      default: {
        document: { run: { font: "Calibri", size: 22 } },
      },
    },
    numbering: {
      config: [
        {
          reference: "default-num",
          levels: [
            { level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.START },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 }, // 2cm
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: "Informe Diario Colaboradores · Viña del Mar",
                    color: C.muted,
                    size: 16,
                    font: "Calibri",
                    italics: true,
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: "Página ", color: C.muted, size: 16, font: "Calibri" }),
                  new TextRun({ children: [PageNumber.CURRENT], color: C.muted, size: 16, font: "Calibri" }),
                  new TextRun({ text: " de ", color: C.muted, size: 16, font: "Calibri" }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], color: C.muted, size: 16, font: "Calibri" }),
                  new TextRun({
                    text: "  ·  Documento protegido",
                    color: C.muted,
                    size: 16,
                    font: "Calibri",
                    italics: true,
                  }),
                ],
              }),
            ],
          }),
        },
        children: [
          ...cover,
          ...resumenSection,
          ...cumplimientoSection,
          ...registrosSection,
          ...lugaresSection,
          ...notaSection,
        ],
      },
    ],
  })

  const buf = await Packer.toBuffer(doc)
  return Buffer.from(buf)
}
