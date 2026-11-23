"use client";

import React, { useState } from "react";
import { useBudget } from "@/context/BudgetContext";
import { Wallet, X, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { formatCOP } from "@/lib/formatters";

export const AddIncomeModal: React.FC = () => {
  const { isAddIncomeModalOpen, setIsAddIncomeModalOpen, mes, anio, refreshBudgetData } =
    useBudget();

  const [descripcion, setDescripcion] = useState("Salario Quincenal");
  const [monto, setMonto] = useState<number>(2500000);
  const [periodo, setPeriodo] = useState<string>("QUINCENA_1");
  const [fuente, setFuente] = useState<string>("SALARIO");
  const [sincronizarQuincena, setSincronizarQuincena] = useState<boolean>(true);
  const [propagarFuturos, setPropagarFuturos] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isAddIncomeModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/presupuesto/ingresos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          descripcion,
          monto: Number(monto),
          periodo,
          fuente,
          mes,
          anio,
          sincronizarQuincena,
          propagarFuturos,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al registrar ingreso");
      }

      await refreshBudgetData();
      setIsAddIncomeModalOpen(false);
    } catch (err: any) {
      setErrorMessage(err.message || "Error al registrar ingreso");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md p-6 rounded-3xl bg-[#151F32] border border-slate-700 shadow-2xl text-slate-100">
        <button
          onClick={() => setIsAddIncomeModalOpen(false)}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Ingresar Salario / Ingreso</h3>
            <p className="text-xs text-slate-400">
              Registra el dinero que llegó en tu quincena o mes
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Descripción del Ingreso *
            </label>
            <input
              type="text"
              required
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej. Salario 1ra Quincena, Bono, etc."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Monto Recibido (COP) *
            </label>
            <input
              type="number"
              required
              min={1}
              value={monto}
              onChange={(e) => setMonto(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-base focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Periodo Asignado
              </label>
              <select
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
              >
                <option value="QUINCENA_1">1ª Quincena (1-15)</option>
                <option value="QUINCENA_2">2ª Quincena (16-fin)</option>
                <option value="MES_COMPLETO">Mes Completo</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tipo / Fuente
              </label>
              <select
                value={fuente}
                onChange={(e) => setFuente(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
              >
                <option value="SALARIO">Salario Fijo</option>
                <option value="HONORARIOS">Honorarios / Extra</option>
                <option value="PRIMA">Prima de Servicios</option>
                <option value="OTROS">Otro Ingreso</option>
              </select>
            </div>
          </div>

          {/* OPCIONES DE SINCRONIZACIÓN Y PERSISTENCIA */}
          {(periodo === "QUINCENA_1" || periodo === "QUINCENA_2") && (
            <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sincronizarQuincena}
                  onChange={(e) => setSincronizarQuincena(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
                />
                <div className="text-[11px]">
                  <span className="font-semibold text-white block">
                    Sincronizar ambas quincenas automáticamente
                  </span>
                  <span className="text-slate-400">
                    Crea o actualiza la otra quincena con este mismo valor
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer pt-1 border-t border-slate-800/60">
                <input
                  type="checkbox"
                  checked={propagarFuturos}
                  onChange={(e) => setPropagarFuturos(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
                />
                <div className="text-[11px]">
                  <span className="font-semibold text-white block">
                    Mantener fijo para los próximos meses
                  </span>
                  <span className="text-slate-400">
                    Al pasar a diciembre u otros meses, este salario se conservará
                  </span>
                </div>
              </label>
            </div>
          )}

          <div className="flex items-center gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsAddIncomeModalOpen(false)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
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
                  Guardando...
                </>
              ) : (
                <>
                  Registrar Salario
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
