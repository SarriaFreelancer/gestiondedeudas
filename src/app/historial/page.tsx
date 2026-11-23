"use client";

import React, { useState, useEffect, useMemo } from "react";
import { formatCOP, formatDate, formatDateFull } from "@/lib/formatters";
import { useFinancial } from "@/context/FinancialContext";
import {
  History,
  FileSpreadsheet,
  FileText,
  RotateCcw,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
} from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function HistorialPage() {
  const { deudas, refreshData } = useFinancial();
  const [movimientos, setMovimientos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [filtroEntidad, setFiltroEntidad] = useState<string>("TODAS");
  const [filtroTipo, setFiltroTipo] = useState<string>("TODOS");
  const [busqueda, setBusqueda] = useState<string>("");

  // Modal de reversión
  const [reversionModalOpen, setReversionModalOpen] = useState(false);
  const [movimientoParaRevertir, setMovimientoParaRevertir] = useState<any | null>(null);
  const [motivoReversion, setMotivoReversion] = useState("");
  const [reverting, setReverting] = useState(false);
  const [errorReversion, setErrorReversion] = useState<string | null>(null);

  const fetchMovimientos = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/movimientos", { cache: "no-store" });
      const data = await res.json();
      setMovimientos(data);
    } catch (e) {
      console.error("Error al cargar movimientos:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovimientos();
  }, []);

  // Filtrado reactivo en cliente
  const movimientosFiltrados = useMemo(() => {
    return movimientos.filter((m) => {
      if (filtroEntidad !== "TODAS" && m.deudaId !== filtroEntidad) return false;
      if (filtroTipo !== "TODOS" && m.tipo !== filtroTipo) return false;
      if (busqueda.trim()) {
        const query = busqueda.toLowerCase();
        const entidad = m.deuda?.entidad?.toLowerCase() || "";
        const obs = m.observaciones?.toLowerCase() || "";
        const ref = m.referenciaPago?.toLowerCase() || "";
        if (!entidad.includes(query) && !obs.includes(query) && !ref.includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [movimientos, filtroEntidad, filtroTipo, busqueda]);

  // Manejo de reversión auditable
  const handleConfirmReversion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movimientoParaRevertir) return;

    setReverting(true);
    setErrorReversion(null);

    try {
      const res = await fetch("/api/movimientos/revertir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movimientoId: movimientoParaRevertir.id,
          motivo: motivoReversion.trim() || "Reversión solicitada por el usuario",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al revertir");
      }

      await refreshData();
      await fetchMovimientos();
      setReversionModalOpen(false);
      setMovimientoParaRevertir(null);
      setMotivoReversion("");
    } catch (err: any) {
      setErrorReversion(err.message || "No se pudo realizar la reversión");
    } finally {
      setReverting(false);
    }
  };

  // EXPORTAR A EXCEL
  const exportToExcel = () => {
    const dataToExport = movimientosFiltrados.map((m) => ({
      Fecha: formatDate(m.fecha),
      Acreedor: m.deuda?.entidad || "N/A",
      Tipo: m.tipo,
      Monto: Number(m.monto),
      "Saldo Anterior": Number(m.saldoAnterior),
      "Saldo Posterior": Number(m.saldoPosterior),
      "Método de Pago": m.metodoPago || "N/A",
      Comprobante: m.referenciaPago || "N/A",
      Observaciones: m.observaciones || "",
      Estado: m.estaRevertido ? "REVERTIDO" : "CONFIRMADO",
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Historial_Movimientos");
    XLSX.writeFile(workbook, "Historial_Financiero_MiLibertad.xlsx");
  };

  // EXPORTAR A PDF
  const exportToPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(16);
    doc.text("MI LIBERTAD FINANCIERA — HISTORIAL DE MOVIMIENTOS", 14, 18);
    doc.setFontSize(10);
    doc.text(`Generado: ${new Date().toLocaleDateString("es-CO")}`, 14, 25);

    const tableData = movimientosFiltrados.map((m) => [
      formatDate(m.fecha),
      m.deuda?.entidad || "",
      m.tipo.replace("_", " "),
      formatCOP(m.monto),
      formatCOP(m.saldoPosterior),
      m.metodoPago || "TRANSFERENCIA",
      m.estaRevertido ? "REVERTIDO" : "CONFIRMADO",
    ]);

    autoTable(doc, {
      startY: 30,
      head: [["Fecha", "Acreedor", "Tipo", "Monto", "Saldo Posterior", "Método", "Estado"]],
      body: tableData,
      theme: "striped",
      headStyles: { fillColor: [21, 31, 50] },
      styles: { fontSize: 8 },
    });

    doc.save("Historial_Financiero_MiLibertad.pdf");
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#151F32] border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">Historial Financiero & Auditoría</h1>
            <p className="text-xs text-slate-400">
              Registro inmutable de pagos, abonos y reversiones con trazabilidad de saldos
            </p>
          </div>
        </div>

        {/* BOTONES DE EXPORTACIÓN */}
        <div className="flex items-center gap-2">
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600/20 border border-emerald-500/30 hover:bg-emerald-600/30 text-emerald-300 text-xs font-bold transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Excel (.xlsx)</span>
          </button>

          <button
            onClick={exportToPDF}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-600/20 border border-red-500/30 hover:bg-red-600/30 text-red-300 text-xs font-bold transition-colors"
          >
            <FileText className="w-4 h-4 text-red-400" />
            <span>PDF (.pdf)</span>
          </button>
        </div>
      </div>

      {/* BARRA DE FILTROS */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por notas o ref..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-9 pr-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500 w-48 sm:w-60"
            />
          </div>

          {/* Filtro Entidad */}
          <select
            value={filtroEntidad}
            onChange={(e) => setFiltroEntidad(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
          >
            <option value="TODAS">Todas las Entidades</option>
            {deudas.map((d) => (
              <option key={d.id} value={d.id}>
                {d.entidad}
              </option>
            ))}
          </select>

          {/* Filtro Tipo */}
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
          >
            <option value="TODOS">Todos los Tipos</option>
            <option value="PAGO_CUOTA">Pago de Cuota</option>
            <option value="ABONO_EXTRAORDINARIO">Abono Extraordinario</option>
            <option value="PAGO_TOTAL">Pago Total</option>
            <option value="REVERSION_PAGO">Reversión de Pago</option>
          </select>
        </div>

        <span className="text-xs text-slate-400 font-semibold">
          {movimientosFiltrados.length} movimientos
        </span>
      </div>

      {/* TABLA DE MOVIMIENTOS */}
      <div className="overflow-x-auto rounded-3xl bg-[#151F32] border border-slate-800 shadow-xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
              <th className="py-3.5 px-4">Fecha</th>
              <th className="py-3.5 px-4">Acreedor</th>
              <th className="py-3.5 px-4">Tipo Movimiento</th>
              <th className="py-3.5 px-4 text-right">Valor</th>
              <th className="py-3.5 px-4 text-right">Saldo Ant.</th>
              <th className="py-3.5 px-4 text-right">Saldo Post.</th>
              <th className="py-3.5 px-4">Método / Ref.</th>
              <th className="py-3.5 px-4">Estado</th>
              <th className="py-3.5 px-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {movimientosFiltrados.map((m) => {
              const esReversion = m.tipo === "REVERSION_PAGO";
              const estaRevertido = m.estaRevertido;

              return (
                <tr
                  key={m.id}
                  className={`hover:bg-slate-800/40 transition-colors ${
                    estaRevertido ? "opacity-60 line-through bg-red-950/10" : ""
                  }`}
                >
                  <td className="py-3 px-4 font-mono text-slate-300">
                    {formatDateFull(m.fecha)}
                  </td>
                  <td className="py-3 px-4 font-bold text-white">
                    {m.deuda?.entidad || "N/A"}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        esReversion
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                          : m.tipo === "PAGO_TOTAL"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : m.tipo === "ABONO_EXTRAORDINARIO"
                          ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                          : "bg-slate-800 text-slate-300 border border-slate-700"
                      }`}
                    >
                      {m.tipo.replace("_", " ")}
                    </span>
                  </td>
                  <td
                    className={`py-3 px-4 text-right font-bold ${
                      esReversion ? "text-purple-400" : "text-emerald-400"
                    }`}
                  >
                    {esReversion ? `+${formatCOP(m.monto)}` : `-${formatCOP(m.monto)}`}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-400 font-mono">
                    {formatCOP(m.saldoAnterior)}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-200 font-mono">
                    {formatCOP(m.saldoPosterior)}
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    <div>{m.metodoPago}</div>
                    {m.referenciaPago && (
                      <span className="text-[10px] text-slate-500 font-mono">
                        {m.referenciaPago}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {estaRevertido ? (
                      <span className="text-red-400 text-[11px] font-bold">REVERTIDO</span>
                    ) : esReversion ? (
                      <span className="text-purple-400 text-[11px] font-bold">CONTRA-MOV.</span>
                    ) : (
                      <span className="text-emerald-400 text-[11px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        CONFIRMADO
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {!estaRevertido && !esReversion && (
                      <button
                        onClick={() => {
                          setMovimientoParaRevertir(m);
                          setMotivoReversion("");
                          setErrorReversion(null);
                          setReversionModalOpen(true);
                        }}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-300 border border-slate-700 transition-colors text-[11px] flex items-center gap-1 mx-auto"
                        title="Revertir este movimiento"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Revertir</span>
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {movimientosFiltrados.length === 0 && !loading && (
          <div className="p-8 text-center text-slate-400 text-xs font-semibold">
            No se han registrado movimientos con los filtros especificados.
          </div>
        )}
      </div>

      {/* MODAL AUDITABLE DE REVERSIÓN */}
      {reversionModalOpen && movimientoParaRevertir && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md p-6 rounded-3xl bg-[#151F32] border border-slate-700 shadow-2xl text-slate-100">
            <button
              onClick={() => setReversionModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Reversión Auditable de Pago</h3>
                <p className="text-xs text-slate-400">
                  Restaura el saldo y el estado de la cuota con trazabilidad completa
                </p>
              </div>
            </div>

            {errorReversion && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
                {errorReversion}
              </div>
            )}

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs mb-4">
              <div className="flex justify-between">
                <span className="text-slate-400">Acreedor:</span>
                <span className="font-bold text-white">{movimientoParaRevertir.deuda?.entidad}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Monto del Movimiento:</span>
                <span className="font-bold text-red-400">{formatCOP(movimientoParaRevertir.monto)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Fecha Original:</span>
                <span className="text-slate-300">{formatDate(movimientoParaRevertir.fecha)}</span>
              </div>
              <p className="text-[11px] text-amber-400/90 pt-2 border-t border-slate-800">
                Al confirmar, se generará un contra-movimiento de reversión y el saldo pendiente
                aumentará en {formatCOP(movimientoParaRevertir.monto)}.
              </p>
            </div>

            <form onSubmit={handleConfirmReversion} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Motivo de la Reversión *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Ej. Error en valor digitado, duplicado, etc."
                  value={motivoReversion}
                  onChange={(e) => setMotivoReversion(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReversionModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={reverting || !motivoReversion.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-lg shadow-red-600/30 disabled:opacity-50"
                >
                  {reverting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirmar Reversión"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
