/**
 * Generador de Word (.docx) profesional con docx-js.
 * Aplica principios del skill docx: jerarquía de encabezados, tablas con cabecera,
 * espaciado 1.3x, márgenes, metadatos.
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
import type { ReportData } from "./report-data"

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
}

function txt(text: string, opts?: { bold?: boolean; color?: string; size?: number; italic?: boolean }) {
  return new TextRun({
    text,
    bold: opts?.bold,
    color: opts?.color,
    size: opts?.size ?? 22, // 11pt
    italics: opts?.italic,
    font: "Calibri",
  })
}

function p(children: TextRun[], opts?: { align?: (typeof AlignmentType)[keyof typeof AlignmentType]; spacing?: number }) {
  return new Paragraph({
    children,
    alignment: opts?.align,
    spacing: { line: 312, after: opts?.spacing ?? 120 },
  })
}

function heading(text: string, level: typeof HeadingLevel.HEADING_1 = HeadingLevel.HEADING_1, color = C.primaryDark) {
  return new Paragraph({
    heading: level,
    spacing: { before: 280, after: 160, line: 312 },
    children: [new TextRun({ text, bold: true, color, size: level === HeadingLevel.HEADING_1 ? 30 : 24, font: "Calibri" })],
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
        children: [new TextRun({ text, bold: true, color: C.headerText, size: 20, font: "Calibri" })],
      }),
    ],
  })
}

function bodyCell(text: string, width: number, opts?: { zebra?: boolean; align?: "left" | "center" | "right"; bold?: boolean }) {
  const alignMap = {
    left: AlignmentType.LEFT,
    center: AlignmentType.CENTER,
    right: AlignmentType.RIGHT,
  }
  return new TableCell({
    width: { size: width, type: WidthType.PERCENTAGE },
    shading: opts?.zebra ? { type: ShadingType.CLEAR, fill: C.zebra, color: "auto" } : undefined,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [
      new Paragraph({
        alignment: alignMap[opts?.align ?? "left"],
        spacing: { line: 240 },
        children: [new TextRun({ text, size: 18, font: "Calibri", bold: opts?.bold })],
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

export async function generateWord(data: ReportData): Promise<Buffer> {
  // ===== Portada =====
  const cover = [
    new Paragraph({ spacing: { before: 1200, after: 0 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { line: 360, after: 200 },
      children: [new TextRun({ text: "MUNICIPALIDAD DE VIÑA DEL MAR", bold: true, color: C.muted, size: 22, font: "Calibri" })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { line: 400, after: 160 },
      children: [new TextRun({ text: "INFORME GESTIÓN DEPORTIVA", bold: true, color: C.primary, size: 48, font: "Calibri" })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { line: 320, after: 400 },
      children: [new TextRun({ text: "Playas, piscinas municipales y gimnasios con piscina", color: C.accent, size: 26, font: "Calibri" })],
    }),
    // Banda de color simulada con tabla
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
                  children: [new TextRun({ text: `Periodo: ${data.periodo}`, bold: true, color: "FFFFFF", size: 24, font: "Calibri" })],
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { line: 280 },
                  children: [new TextRun({ text: `Generado: ${data.generadoEn}`, color: "E0F2FE", size: 20, font: "Calibri" })],
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
        new TextRun({ text: "Documento con información protegida · ", italics: true, color: C.muted, size: 18, font: "Calibri" }),
        new TextRun({ text: "RUT enmascarados por protección de datos", italics: true, color: C.primary, size: 18, font: "Calibri" }),
      ],
    }),
    new Paragraph({ children: [new PageBreak()] }),
  ]

  // ===== 1. Resumen ejecutivo =====
  const resumenSection = [
    heading("1. Resumen ejecutivo", HeadingLevel.HEADING_1),
    p([
      txt("El presente informe detalla la gestión de lugares deportivos y recreativos de la "),
      txt("Municipalidad de Viña del Mar", { bold: true }),
      txt(", incluyendo playas, piscinas municipales y gimnasios municipales con piscina. El documento consolida la información de matrículas registradas, lugares habilitados y colaboradores asignados durante el periodo "),
      txt(data.periodo, { bold: true }),
      txt("."),
    ]),
    p([
      txt("La información se genera de forma automatizada desde el sistema de gestión, aplicando estándares de ciberseguridad y protección de datos personales conforme a la Ley N° 19.628 sobre Protección de la Vida Privada. Los RUT de beneficiarios y colaboradores se presentan enmascarados en este documento."),
    ], { spacing: 200 }),

    heading("1.1 Indicadores principales", HeadingLevel.HEADING_2),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          tableHeader: true,
          children: [headerCell("Indicador", 60), headerCell("Valor", 40)],
        }),
        ...[
          ["Total de lugares habilitados", String(data.resumen.totalLugares)],
          ["Playas", String(data.resumen.playas)],
          ["Piscinas municipales", String(data.resumen.piscinas)],
          ["Gimnasios con piscina", String(data.resumen.gimnasios)],
          ["Colaboradores activos", String(data.resumen.totalColaboradores)],
          ["Matrículas registradas", String(data.resumen.totalMatriculas)],
        ].map(([k, v], i) =>
          new TableRow({
            children: [
              bodyCell(k, 60, { zebra: i % 2 === 0, bold: true }),
              bodyCell(v, 40, { zebra: i % 2 === 0, align: "center", bold: true }),
            ],
          }),
        ),
      ],
    }),
  ]

  // ===== 2. Distribución por tipo =====
  const distSection = [
    heading("2. Distribución por tipo de lugar", HeadingLevel.HEADING_1),
    p([txt("La oferta deportiva municipal se distribuye entre tres categorías de lugares, cada una con características de operación y aforo diferenciadas:")]),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          tableHeader: true,
          children: [headerCell("Tipo de lugar", 50), headerCell("Cantidad", 25), headerCell("Porcentaje", 25)],
        }),
        ...data.porTipo.map((t, i) => {
          const pct = data.resumen.totalLugares ? ((t.count / data.resumen.totalLugares) * 100).toFixed(1) : "0.0"
          return new TableRow({
            children: [
              bodyCell(t.label, 50, { zebra: i % 2 === 0, bold: true }),
              bodyCell(String(t.count), 25, { zebra: i % 2 === 0, align: "center" }),
              bodyCell(`${pct}%`, 25, { zebra: i % 2 === 0, align: "center" }),
            ],
          })
        }),
      ],
    }),

    heading("2.1 Lugares con mayor demanda", HeadingLevel.HEADING_2),
    p([txt("Ranking de lugares según el número de matrículas registradas:")]),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          tableHeader: true,
          children: [headerCell("#", 8), headerCell("Lugar", 52), headerCell("Tipo", 25), headerCell("Matrículas", 15)],
        }),
        ...data.topLugares.map((l, i) =>
          new TableRow({
            children: [
              bodyCell(String(i + 1), 8, { zebra: i % 2 === 0, align: "center", bold: true }),
              bodyCell(l.nombre, 52, { zebra: i % 2 === 0 }),
              bodyCell(l.tipo, 25, { zebra: i % 2 === 0, align: "center" }),
              bodyCell(String(l.matriculas), 15, { zebra: i % 2 === 0, align: "center" }),
            ],
          }),
        ),
      ],
    }),
  ]

  // ===== 3. Lugares =====
  const lugaresSection = [
    heading("3. Inventario de lugares", HeadingLevel.HEADING_1),
    p([txt("Detalle de los lugares habilitados con dirección, ubicación GPS, horario de atención y aforo máximo permitido:")]),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          tableHeader: true,
          children: [
            headerCell("Nombre", 22),
            headerCell("Tipo", 14),
            headerCell("Dirección", 30),
            headerCell("Comuna", 14),
            headerCell("Horario", 14),
            headerCell("Aforo", 6),
          ],
        }),
        ...data.lugares.map((l, i) =>
          new TableRow({
            cantSplit: true,
            children: [
              bodyCell(l.nombre, 22, { zebra: i % 2 === 0, bold: true }),
              bodyCell(l.tipoLabel, 14, { zebra: i % 2 === 0, align: "center" }),
              bodyCell(l.direccion, 30, { zebra: i % 2 === 0 }),
              bodyCell(l.comuna, 14, { zebra: i % 2 === 0 }),
              bodyCell(l.horario ?? "—", 14, { zebra: i % 2 === 0 }),
              bodyCell(l.aforo != null ? l.aforo.toLocaleString("es-CL") : "—", 6, { zebra: i % 2 === 0, align: "center" }),
            ],
          }),
        ),
      ],
    }),
  ]

  // ===== 4. Colaboradores =====
  const colsSection = [
    heading("4. Colaboradores asignados", HeadingLevel.HEADING_1),
    p([txt("Equipo de colaboradores responsables de la atención y gestión de matrículas en los lugares habilitados:")]),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          tableHeader: true,
          children: [
            headerCell("Nombre", 22),
            headerCell("RUT", 18),
            headerCell("Rol", 16),
            headerCell("Lugares", 14),
            headerCell("Matrículas", 14),
            headerCell("Contacto", 16),
          ],
        }),
        ...data.colaboradores.map((c, i) =>
          new TableRow({
            cantSplit: true,
            children: [
              bodyCell(c.nombre, 22, { zebra: i % 2 === 0, bold: true }),
              bodyCell(c.rut, 18, { zebra: i % 2 === 0, align: "center" }),
              bodyCell(c.rol, 16, { zebra: i % 2 === 0, align: "center" }),
              bodyCell(String(c.lugaresAsignados), 14, { zebra: i % 2 === 0, align: "center" }),
              bodyCell(String(c.matriculasGestionadas), 14, { zebra: i % 2 === 0, align: "center" }),
              bodyCell(c.telefono ?? c.email ?? "—", 16, { zebra: i % 2 === 0 }),
            ],
          }),
        ),
      ],
    }),
  ]

  // ===== 5. Matrículas recientes =====
  const matSection = [
    heading("5. Matrículas recientes", HeadingLevel.HEADING_1),
    p([txt("Relación de las matrículas más recientes registradas en el sistema. Los RUT se presentan enmascarados por protección de datos:")]),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          tableHeader: true,
          children: [
            headerCell("Beneficiario", 22),
            headerCell("RUT", 16),
            headerCell("Comuna", 14),
            headerCell("Lugar", 24),
            headerCell("Colaborador", 16),
            headerCell("Fecha", 8),
          ],
        }),
        ...data.matriculas.slice(0, 40).map((m, i) =>
          new TableRow({
            cantSplit: true,
            children: [
              bodyCell(m.nombre, 22, { zebra: i % 2 === 0, bold: true }),
              bodyCell(m.rut, 16, { zebra: i % 2 === 0, align: "center" }),
              bodyCell(m.comuna, 14, { zebra: i % 2 === 0 }),
              bodyCell(m.lugar ?? "—", 24, { zebra: i % 2 === 0 }),
              bodyCell(m.colaborador ?? "Sin asignar", 16, { zebra: i % 2 === 0 }),
              bodyCell(m.fecha, 8, { zebra: i % 2 === 0 }),
            ],
          }),
        ),
      ],
    }),
  ]

  // ===== 6. Nota de protección de datos =====
  const notaSection = [
    heading("6. Protección de datos y ciberseguridad", HeadingLevel.HEADING_1),
    p([
      txt("Este documento se ha generado aplicando los siguientes estándares de protección de datos y ciberseguridad:", { bold: true }),
    ]),
    p([txt("• Validación de identidad mediante RUT chileno (algoritmo módulo 11).")], { spacing: 80 }),
    p([txt("• Enmascaramiento de datos sensibles (RUT) en reportes y listados.")], { spacing: 80 }),
    p([txt("• Firma de integridad de cada matrícula registrada.")], { spacing: 80 }),
    p([txt("• Cabeceras HTTP de seguridad: Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy y HSTS.")], { spacing: 80 }),
    p([txt("• Sanitización de entradas para prevención de ataques XSS e inyección SQL.")], { spacing: 80 }),
    p([txt("• Mensajes de error genéricos para evitar fuga de información.")], { spacing: 200 }),
    p([
      txt("Para consultas sobre este informe, contactar a la Dirección de Deportes de la Municipalidad de Viña del Mar: ", { italic: true, color: C.muted }),
      txt("deportes.dideco@munivina.cl", { bold: true, color: C.accent }),
    ]),
  ]

  const doc = new Document({
    creator: "Municipalidad de Viña del Mar",
    title: "Informe Gestión Deportiva - Viña del Mar",
    description: `Informe de playas, piscinas y gimnasios - ${data.periodo}`,
    subject: "Gestión deportiva municipal",
    styles: {
      default: {
        document: { run: { font: "Calibri", size: 22 } },
      },
    },
    numbering: {
      config: [
        {
          reference: "default-num",
          levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.START }],
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
                children: [new TextRun({ text: "Informe Gestión Deportiva · Viña del Mar", color: C.muted, size: 16, font: "Calibri", italics: true })],
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
                  new TextRun({ text: "  ·  Documento protegido", color: C.muted, size: 16, font: "Calibri", italics: true }),
                ],
              }),
            ],
          }),
        },
        children: [
          ...cover,
          ...resumenSection,
          ...distSection,
          ...lugaresSection,
          ...colsSection,
          ...matSection,
          ...notaSection,
        ],
      },
    ],
  })

  const buf = await Packer.toBuffer(doc)
  return Buffer.from(buf)
}
