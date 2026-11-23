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
  Camera,
  Download,
  Eye,
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
  const [filtroMes, setFiltroMes] = useState<string>("TODOS");
  const [busqueda, setBusqueda] = useState<string>("");

  // Modal de reversión
  const [reversionModalOpen, setReversionModalOpen] = useState(false);
  const [movimientoParaRevertir, setMovimientoParaRevertir] = useState<any | null>(null);
  const [motivoReversion, setMotivoReversion] = useState("");
  const [reverting, setReverting] = useState(false);
  const [errorReversion, setErrorReversion] = useState<string | null>(null);

  // Modal de Comprobante / Recibo
  const [comprobanteModalOpen, setComprobanteModalOpen] = useState(false);
  const [comprobanteActivo, setComprobanteActivo] = useState<{
    url: string;
    entidad: string;
    monto: number;
    fecha: string;
  } | null>(null);

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
      if (filtroMes !== "TODOS") {
        const fechaM = new Date(m.fecha);
        const mesM = fechaM.getMonth() + 1;
        if (mesM !== parseInt(filtroMes)) return false;
      }
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
  }, [movimientos, filtroEntidad, filtroTipo, filtroMes, busqueda]);

  // Cálculos de resumen de lo filtrado
  const totalAbonadoFiltrado = useMemo(() => {
    return movimientosFiltrados.reduce((sum, m) => {
      if (
        !m.estaRevertido &&
        (m.tipo === "PAGO_CUOTA" ||
          m.tipo === "ABONO_EXTRAORDINARIO" ||
          m.tipo === "PAGO_TOTAL")
      ) {
        return sum + Number(m.monto);
      }
      return sum;
    }, 0);
  }, [movimientosFiltrados]);

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

  // Exportar a Excel
  const exportToExcel = () => {
    const dataToExport = movimientosFiltrados.map((m) => ({
      Fecha: formatDateFull(m.fecha),
      Acreedor: m.deuda?.entidad || "N/A",
      "Tipo Movimiento": m.tipo,
      "Destino Abono": m.destinoAbono || "N/A",
      "Monto (COP)": Number(m.monto),
      "Saldo Anterior": Number(m.saldoAnterior),
      "Saldo Posterior": Number(m.saldoPosterior),
      "Método de Pago": m.metodoPago,
      "Referencia / Comprobante": m.referenciaPago || "",
      Observaciones: m.observaciones || "",
      Estado: m.estaRevertido ? "REVERTIDO" : "CONFIRMADO",
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Historial_Movimientos");

    XLSX.writeFile(workbook, `Movimientos_Libertad_Financiera_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Exportar a PDF
  const exportToPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });

    doc.setFontSize(16);
    doc.text("MI LIBERTAD FINANCIERA — HISTORIAL AUDITABLE DE MOVIMIENTOS", 14, 15);
    doc.setFontSize(10);
    doc.text(`Generado: ${new Date().toLocaleString("es-CO")}`, 14, 22);

    const tableData = movimientosFiltrados.map((m) => [
      formatDate(m.fecha),
      m.deuda?.entidad || "N/A",
      m.tipo.replace("_", " "),
      formatCOP(m.monto),
      formatCOP(m.saldoAnterior),
      formatCOP(m.saldoPosterior),
      m.metodoPago,
      m.estaRevertido ? "REVERTIDO" : "OK",
    ]);

    autoTable(doc, {
      head: [["Fecha", "Acreedor", "Tipo", "Monto", "Saldo Ant.", "Saldo Post.", "Método", "Estado"]],
      body: tableData,
      startY: 28,
      theme: "striped",
      styles: { fontSize: 8 },
      headStyles: { fillColor: [21, 31, 50] },
    });

    doc.save(`Movimientos_Libertad_Financiera_${new Date().toISOString().slice(0, 10)}.pdf`);
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
            <h1 className="text-xl sm:text-2xl font-black text-white">Historial Financiero Auditable</h1>
            <p className="text-xs text-slate-400">
              Registro inmutable de cuotas, abonos y reversiones con trazabilidad total
            </p>
          </div>
        </div>

        {/* BOTONES DE EXPORTACIÓN */}
        <div className="flex items-center gap-2">
          <button
            onClick={exportToExcel}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Exportar Excel</span>
          </button>
          <button
            onClick={exportToPDF}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 text-xs font-bold transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>Exportar PDF</span>
          </button>
        </div>
      </div>

      {/* BARRA DE FILTROS & BÚSQUEDA */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-3">
        {/* Búsqueda */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por acreedor, ref..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Filtro Mes */}
        <div>
          <select
            value={filtroMes}
            onChange={(e) => setFiltroMes(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
          >
            <option value="TODOS">Todos los meses (Histórico total)</option>
            <option value="1">Enero</option>
            <option value="2">Febrero</option>
            <option value="3">Marzo</option>
            <option value="4">Abril</option>
            <option value="5">Mayo</option>
            <option value="6">Junio</option>
            <option value="7">Julio</option>
            <option value="8">Agosto</option>
            <option value="9">Septiembre</option>
            <option value="10">Octubre</option>
            <option value="11">Noviembre</option>
            <option value="12">Diciembre</option>
          </select>
        </div>

        {/* Filtro Acreedor */}
        <div>
          <select
            value={filtroEntidad}
            onChange={(e) => setFiltroEntidad(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
          >
            <option value="TODAS">Todos los acreedores</option>
            {deudas.map((d) => (
              <option key={d.id} value={d.id}>
                {d.entidad}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro Tipo */}
        <div>
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
          >
            <option value="TODOS">Todos los tipos</option>
            <option value="PAGO_CUOTA">Pagos de Cuota</option>
            <option value="ABONO_EXTRAORDINARIO">Abonos Extraordinarios</option>
            <option value="PAGO_TOTAL">Cancelación Total</option>
            <option value="REVERSION_PAGO">Reversiones Auditables</option>
          </select>
        </div>
      </div>

      {/* RESUMEN DEL PERIODO FILTRADO */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-slate-900/40 border border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Total movimientos visibles:</span>
          <span className="font-bold text-white px-2 py-0.5 rounded bg-slate-800">
            {movimientosFiltrados.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Total pagado/abonado en el filtro:</span>
          <span className="font-extrabold text-emerald-400 font-mono text-sm">
            {formatCOP(totalAbonadoFiltrado)}
          </span>
        </div>
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
              <th className="py-3.5 px-4">Método / Recibo</th>
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
                      <span className="text-[10px] text-slate-500 font-mono block">
                        Ref: {m.referenciaPago}
                      </span>
                    )}
                    {m.comprobanteUrl && (
                      <button
                        onClick={() => {
                          setComprobanteActivo({
                            url: m.comprobanteUrl,
                            entidad: m.deuda?.entidad || "Movimiento",
                            monto: m.monto,
                            fecha: m.fecha,
                          });
                          setComprobanteModalOpen(true);
                        }}
                        className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-[10px] font-bold border border-emerald-500/20 transition-colors"
                      >
                        <Camera className="w-3 h-3" />
                        <span>Ver Foto Recibo</span>
                      </button>
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

      {/* MODAL VISOR DE COMPROBANTE / FOTO */}
      {comprobanteModalOpen && comprobanteActivo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg p-6 rounded-3xl bg-[#151F32] border border-slate-700 shadow-2xl text-slate-100 flex flex-col items-center">
            <button
              onClick={() => {
                setComprobanteModalOpen(false);
                setComprobanteActivo(null);
              }}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-full flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Comprobante de Pago</h3>
                <p className="text-xs text-slate-400">
                  {comprobanteActivo.entidad} — {formatCOP(comprobanteActivo.monto)} ({formatDate(comprobanteActivo.fecha)})
                </p>
              </div>
            </div>

            {/* IMAGEN DEL COMPROBANTE */}
            <div className="w-full max-h-[60vh] overflow-hidden rounded-2xl border border-slate-700 bg-black/60 flex items-center justify-center p-2 mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={comprobanteActivo.url}
                alt="Comprobante de pago"
                className="max-h-[55vh] w-auto object-contain rounded-xl shadow-lg"
              />
            </div>

            <div className="w-full flex items-center justify-between gap-3 pt-2">
              <a
                href={comprobanteActivo.url}
                download={`comprobante_${comprobanteActivo.entidad}_${new Date().getTime()}.png`}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Descargar Foto</span>
              </a>

              <button
                onClick={() => {
                  setComprobanteModalOpen(false);
                  setComprobanteActivo(null);
                }}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}