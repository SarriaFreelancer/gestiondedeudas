"use client";

import React, { useState } from "react";
import { formatCOP, formatDate } from "@/lib/formatters";
import { CheckCircle2, X, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { useFinancial } from "@/context/FinancialContext";

export const PaymentModal: React.FC = () => {
  const {
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    selectedDeudaForPayment,
    selectedCuotaForPayment,
    refreshData,
  } = useFinancial();

  const [monto, setMonto] = useState<number>(0);
  const [metodoPago, setMetodoPago] = useState<string>("TRANSFERENCIA");
  const [referenciaPago, setReferenciaPago] = useState<string>("");
  const [observaciones, setObservaciones] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Inicializar monto cuando se abre
  React.useEffect(() => {
    if (selectedCuotaForPayment) {
      setMonto(Number(selectedCuotaForPayment.valor));
      setReferenciaPago("");
      setObservaciones("");
      setErrorMessage(null);
    }
  }, [selectedCuotaForPayment]);

  if (!isPaymentModalOpen || !selectedDeudaForPayment || !selectedCuotaForPayment) {
    return null;
  }

  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/pagos/cuota", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deudaId: selectedDeudaForPayment.id,
          cuotaId: selectedCuotaForPayment.id,
          monto: Number(monto),
          metodoPago,
          referenciaPago: referenciaPago.trim() || undefined,
          observaciones: observaciones.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al procesar el pago");
      }

      // Actualizar datos del dashboard en tiempo real sin recargar página
      await refreshData();
      setIsPaymentModalOpen(false);
    } catch (err: any) {
      setErrorMessage(err.message || "No se pudo registrar el pago");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md p-6 rounded-3xl bg-[#151F32] border border-slate-700 shadow-2xl text-slate-100">
        <button
          onClick={() => setIsPaymentModalOpen(false)}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Confirmar Pago de Cuota</h3>
            <p className="text-xs text-slate-400">Afectación en tiempo real del saldo pendiente</p>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Resumen de la cuota */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 mb-4 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">Acreedor / Obligación:</span>
            <span className="font-bold text-white">{selectedDeudaForPayment.entidad}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Número de Cuota:</span>
            <span className="font-bold text-blue-400">Cuota #{selectedCuotaForPayment.numeroCuota}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Vencimiento:</span>
            <span className="text-slate-200">{formatDate(selectedCuotaForPayment.fechaVencimiento)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Saldo actual de la deuda:</span>
            <span className="font-semibold text-slate-300">
              {formatCOP(selectedDeudaForPayment.saldoPendiente)}
            </span>
          </div>
          <div className="flex justify-between pt-1 border-t border-slate-800">
            <span className="text-slate-400 font-semibold">Nuevo saldo estimado:</span>
            <span className="font-bold text-emerald-400">
              {formatCOP(Math.max(0, Number(selectedDeudaForPayment.saldoPendiente) - Number(monto)))}
            </span>
          </div>
        </div>

        <form onSubmit={handleConfirmPayment} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Valor del Pago (COP)
            </label>
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
                Comprobante / Ref.
              </label>
              <input
                type="text"
                placeholder="Opcional"
                value={referenciaPago}
                onChange={(e) => setReferenciaPago(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
              >
              </input>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Observaciones (Opcional)
            </label>
            <textarea
              rows={2}
              placeholder="Notas del pago..."
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsPaymentModalOpen(false)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || monto <= 0}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/30 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  Confirmar Pago
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
