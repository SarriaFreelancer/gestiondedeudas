"use client";

import React, { useState, useEffect, useRef } from "react";
import { useBudget } from "@/context/BudgetContext";
import { CheckCircle2, X, AlertCircle, Loader2, Camera, FileCheck, ArrowRight } from "lucide-react";
import { formatCOP } from "@/lib/formatters";

export const PayExpenseModal: React.FC = () => {
  const {
    isPayExpenseModalOpen,
    setIsPayExpenseModalOpen,
    selectedExpenseForPayment,
    refreshBudgetData,
  } = useBudget();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [montoReal, setMontoReal] = useState<number>(0);
  const [comprobanteUrl, setComprobanteUrl] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (selectedExpenseForPayment) {
      setMontoReal(
        Number(selectedExpenseForPayment.montoReal) ||
          Number(selectedExpenseForPayment.montoPresupuestado) ||
          0
      );
      setComprobanteUrl(selectedExpenseForPayment.comprobanteUrl || "");
      setErrorMessage(null);
    }
  }, [selectedExpenseForPayment]);

  if (!isPayExpenseModalOpen || !selectedExpenseForPayment) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      setErrorMessage("La foto del recibo no debe superar los 4 MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setComprobanteUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmPay = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/presupuesto/gastos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedExpenseForPayment.id,
          estaPagado: true,
          montoReal: Number(montoReal),
          comprobanteUrl: comprobanteUrl || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al registrar pago");
      }

      await refreshBudgetData();
      setIsPayExpenseModalOpen(false);
    } catch (err: any) {
      setErrorMessage(err.message || "No se pudo registrar el pago");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md p-6 rounded-3xl bg-[#151F32] border border-slate-700 shadow-2xl text-slate-100">
        <button
          onClick={() => setIsPayExpenseModalOpen(false)}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Descontar Gasto de Salario</h3>
            <p className="text-xs text-slate-400">
              Registra el pago de &quot;{selectedExpenseForPayment.nombre}&quot;
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleConfirmPay} className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Concepto:</span>
              <span className="font-bold text-white">{selectedExpenseForPayment.nombre}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Valor Presupuestado:</span>
              <span className="text-slate-300">
                {formatCOP(selectedExpenseForPayment.montoPresupuestado)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Tipo:</span>
              <span className="text-blue-400 font-semibold">{selectedExpenseForPayment.tipo}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Valor Real Pagado / Descontado (COP) *
            </label>
            <input
              type="number"
              required
              min={1}
              value={montoReal}
              onChange={(e) => setMontoReal(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-base focus:outline-none focus:border-blue-500"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              💡 Si la factura llegó por un valor diferente al presupuestado, ajústalo aquí.
            </span>
          </div>

          {/* Adjuntar foto del recibo / factura */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Foto del Recibo / Comprobante (Opcional)
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
              >
                <Camera className="w-4 h-4 text-emerald-400" />
                <span>{comprobanteUrl ? "Cambiar foto" : "Subir pantallazo"}</span>
              </button>

              {comprobanteUrl && (
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                  <FileCheck className="w-4 h-4" />
                  <span>Adjunto</span>
                  <button
                    type="button"
                    onClick={() => setComprobanteUrl("")}
                    className="text-[11px] text-red-400 hover:text-red-300 ml-1"
                  >
                    Quitar
                  </button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsPayExpenseModalOpen(false)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || montoReal <= 0}
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
