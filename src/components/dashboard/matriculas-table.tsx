"use client"

import { ClipboardList, MapPin, User, Calendar } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { TIPO_LABELS, TIPO_COLORS, type TipoLugar } from "@/lib/security"

type Mat = {
  id: string
  nombre: string
  rutMasked: string
  comuna: string
  direccion: string
  lugar: { nombre: string; tipo: TipoLugar } | null
  colaborador: { nombre: string } | null
  createdAt: string
}

function fmtFecha(iso: string): string {
  try {
    return new Date(iso).toLocaleString("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return iso
  }
}

export function MatriculasTable({ matriculas }: { matriculas: Mat[] }) {
  if (matriculas.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white/50 p-10 text-center text-sm text-muted-foreground">
        Aún no hay matrículas registradas.
      </div>
    )
  }
  return (
    <div className="rounded-xl border border-white/60 bg-white/70 backdrop-blur shadow-sm overflow-hidden">
      <div className="max-h-[420px] overflow-y-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-white/95 backdrop-blur z-10">
            <TableRow className="hover:bg-transparent border-slate-100">
              <TableHead className="text-xs">
                <span className="inline-flex items-center gap-1"><User className="h-3.5 w-3.5" />Beneficiario</span>
              </TableHead>
              <TableHead className="text-xs">RUT</TableHead>
              <TableHead className="text-xs hidden md:table-cell">Dirección</TableHead>
              <TableHead className="text-xs">
                <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />Lugar</span>
              </TableHead>
              <TableHead className="text-xs hidden sm:table-cell">Colaborador</TableHead>
              <TableHead className="text-xs hidden lg:table-cell">
                <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />Fecha</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {matriculas.map((m) => (
              <TableRow key={m.id} className="border-slate-100 hover:bg-sky-50/40">
                <TableCell>
                  <div className="font-medium text-slate-800 text-sm">{m.nombre}</div>
                  <div className="text-[11px] text-muted-foreground">{m.comuna}</div>
                </TableCell>
                <TableCell className="text-xs tabular-nums text-slate-600">{m.rutMasked}</TableCell>
                <TableCell className="text-xs text-slate-600 hidden md:table-cell max-w-[200px] truncate">
                  {m.direccion}
                </TableCell>
                <TableCell>
                  {m.lugar ? (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium text-slate-700">{m.lugar.nombre}</span>
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 w-fit"
                        style={{
                          color: TIPO_COLORS[m.lugar.tipo],
                          borderColor: `${TIPO_COLORS[m.lugar.tipo]}40`,
                          background: `${TIPO_COLORS[m.lugar.tipo]}10`,
                        }}
                      >
                        {TIPO_LABELS[m.lugar.tipo]}
                      </Badge>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-xs text-slate-600 hidden sm:table-cell">
                  {m.colaborador?.nombre ?? <span className="text-muted-foreground">Sin asignar</span>}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground hidden lg:table-cell tabular-nums">
                  {fmtFecha(m.createdAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
