"use client";

import React, { useState } from "react";
import { formatCOP } from "@/lib/formatters";
import { PiggyBank, X, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { useFinancial } from "@/context/FinancialContext";

export const AbonoModal: React.FC = () => {
  const { isAbonoModalOpen, setIsAbonoModalOpen, deudas, refreshData } = useFinancial();

  const [deudaId, setDeudaId] = useState<string>("");
  const [tipo, setTipo] = useState<string>("ABONO_EXTRAORDINARIO");
  const [destinoAbono, setDestinoAbono] = useState<string>("REDUCIR_CAPITAL");
  const [monto, setMonto] = useState<number>(50000);
  const [metodoPago, setMetodoPago] = useState<string>("TRANSFERENCIA");
  const [referenciaPago, setReferenciaPago] = useState<string>("");
  const [observaciones, setObservaciones] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Seleccionar la primera deuda activa si no hay seleccionada
  React.useEffect(() => {
    if (deudas.length > 0 && !deudaId) {
      const activa = deudas.find((d) => d.saldoPendiente > 0) || deudas[0];
      setDeudaId(activa.id);
    }
  }, [deudas, deudaId]);

  if (!isAbonoModalOpen) return null;

  const deudaSeleccionada = deudas.find((d) => d.id === deudaId);

  const handleTipoChange = (newTipo: string) => {
    setTipo(newTipo);
    if (newTipo === "PAGO_TOTAL" && deudaSeleccionada) {
      setMonto(Number(deudaSeleccionada.saldoPendiente));
    }
  };

  const handleAbonar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deudaId) return;

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/pagos/abono", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deudaId,
          monto: Number(monto),
          tipo,
          destinoAbono,
          metodoPago,
          referenciaPago: referenciaPago.trim() || undefined,
          observaciones: observaciones.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al procesar el abono");
      }

      await refreshData();
      setIsAbonoModalOpen(false);
    } catch (err: any) {
      setErrorMessage(err.message || "No se pudo procesar el abono");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg p-6 rounded-3xl bg-[#151F32] border border-slate-700 shadow-2xl text-slate-100">
        <button
          onClick={() => setIsAbonoModalOpen(false)}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <PiggyBank className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Registrar Abono o Pago</h3>
            <p className="text-xs text-slate-400">
              Abonos extraordinarios, parciales o cancelación total
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleAbonar} className="space-y-4">
          {/* Selección de Deuda */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Seleccionar Obligación / Acreedor
            </label>
            <select
              value={deudaId}
              onChange={(e) => {
                setDeudaId(e.target.value);
                const d = deudas.find((item) => item.id === e.target.value);
                if (d && tipo === "PAGO_TOTAL") {
                  setMonto(Number(d.saldoPendiente));
                }
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-semibold text-xs focus:outline-none focus:border-blue-500"
            >
              {deudas.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.entidad} — Saldo: {formatCOP(d.saldoPendiente)}{" "}
                  {d.tieneCuotas ? `(${d.cuotasPendientes} cuotas)` : "(Libre/Rotativo)"}
                </option>
              ))}
            </select>
          </div>

          {/* Información del acreedor seleccionado */}
          {deudaSeleccionada && (
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex justify-between items-center">
              <div>
                <span className="text-slate-400">Saldo actual: </span>
                <span className="font-bold text-white">
                  {formatCOP(deudaSeleccionada.saldoPendiente)}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Nuevo saldo estimado: </span>
                <span className="font-bold text-emerald-400">
                  {formatCOP(
                    Math.max(0, Number(deudaSeleccionada.saldoPendiente) - Number(monto || 0))
                  )}
                </span>
              </div>
            </div>
          )}

          {/* Tipo de Operación */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tipo de Operación
              </label>
              <select
                value={tipo}
                onChange={(e) => handleTipoChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
              >
                <option value="ABONO_EXTRAORDINARIO">Abono Extraordinario / Parcial</option>
                <option value="PAGO_TOTAL">Cancelación Total</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Destino del Abono
              </label>
              <select
                value={destinoAbono}
                onChange={(e) => setDestinoAbono(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
              >
                <option value="REDUCIR_CAPITAL">Reducir Capital Directo</option>
                <option value="CUBRIR_MORA">Cubrir Cuotas en Mora</option>
                <option value="ADELANTAR_CUOTAS">Adelantar Cuotas Futuras</option>
              </select>
            </div>
          </div>

          {/* Valor a Abonar */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-slate-300">
                Valor del Abono (COP)
              </label>
              {deudaSeleccionada && (
                <button
                  type="button"
                  onClick={() => setMonto(Number(deudaSeleccionada.saldoPendiente))}
                  className="text-[11px] text-blue-400 hover:text-blue-300 font-medium"
                >
                  Pagar totalidad ({formatCOP(deudaSeleccionada.saldoPendiente)})
                </button>
              )}
            </div>
            <input
              type="number"
              value={monto}
              onChange={(e) => setMonto(Number(e.target.value))}
              required
              min={1}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-base focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Método de Pago
              </label>
              <select
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
              >
                <option value="TRANSFERENCIA">Transferencia</option>
                <option value="PSE">PSE</option>
                <option value="NEQUI">Nequi</option>
                <option value="DAVIPLATA">Daviplata</option>
                <option value="EFECTIVO">Efectivo</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                No. Comprobante
              </label>
              <input
                type="text"
                placeholder="Opcional"
                value={referenciaPago}
                onChange={(e) => setReferenciaPago(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Observaciones
            </label>
            <textarea
              rows={2}
              placeholder="Ej. Abono prima de servicios, ahorro extra..."
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAbonoModalOpen(false)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || monto <= 0}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  Confirmar Abono
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
