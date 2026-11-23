"use client";

import React, { useState } from "react";
import { useBudget } from "@/context/BudgetContext";
import { formatCOP } from "@/lib/formatters";
import { BANCOS_COLOMBIA } from "@/services/savingsService";
import {
  PiggyBank,
  X,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Building2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { AppAlert } from "@/lib/alerts";

export const TransferSurplusModal: React.FC = () => {
  const {
    isTransferModalOpen,
    setIsTransferModalOpen,
    summary,
    metasAhorro,
    mes,
    anio,
    refreshBudgetData,
    refreshMetas,
    setIsCreateGoalModalOpen,
  } = useBudget();

  const saldoDisponible = summary?.saldoDisponible || 0;

  const [metaId, setMetaId] = useState<string>(metasAhorro[0]?.id || "");
  const [monto, setMonto] = useState<number>(saldoDisponible > 0 ? saldoDisponible : 0);
  const [bancoDetalle, setBancoDetalle] = useState<string>("NU_CAJITA");
  const [notas, setNotas] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Mantener metaId actualizada si cambian las metas
  React.useEffect(() => {
    if (!metaId && metasAhorro.length > 0) {
      setMetaId(metasAhorro[0].id);
    }
  }, [metasAhorro, metaId]);

  if (!isTransferModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!metaId) {
      setErrorMessage("Por favor selecciona o crea una meta de ahorro primero.");
      return;
    }
    if (monto <= 0) {
      setErrorMessage("El monto a trasladar debe ser mayor a 0.");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/metas/trasladar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metaId,
          monto: Number(monto),
          mes,
          anio,
          bancoDetalle,
          notas: notas.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al trasladar saldo a la meta");
      }

      setSuccess(true);
      AppAlert.toast(`¡Traslado de ${formatCOP(monto)} a la meta exitoso!`, "success");
      await Promise.all([refreshBudgetData(), refreshMetas()]);
      setTimeout(() => {
        setSuccess(false);
        setIsTransferModalOpen(false);
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || "Error al realizar el traslado");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md p-6 rounded-3xl bg-[#0F172A] border border-emerald-500/30 shadow-2xl text-slate-100">
        <button
          onClick={() => setIsTransferModalOpen(false)}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <PiggyBank className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Trasladar Sobrante a Ahorro</h3>
            <p className="text-xs text-slate-400">
              Registra el dinero que envías a tu cuenta o bolsillo bancario
            </p>
          </div>
        </div>

        {/* NOTA DE CONFIANZA */}
        <div className="p-3 rounded-2xl bg-blue-950/40 border border-blue-500/30 text-xs text-blue-200 mb-4 flex items-start gap-2.5">
          <Building2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
          <p>
            <b>Control y Seguimiento:</b> El dinero físico permanece en tu app bancaria (Nequi, Nu, Bancolombia, etc.). Aquí llevamos la trazabilidad exacta de tus reservas y progreso hacia tu libertad.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span>¡Excelente! Saldo sobrante registrado en tu meta de ahorro con éxito.</span>
          </div>
        )}

        {metasAhorro.length === 0 ? (
          <div className="text-center py-6 space-y-3">
            <p className="text-xs text-slate-400">
              Aún no tienes metas de ahorro registradas.
            </p>
            <button
              type="button"
              onClick={() => {
                setIsTransferModalOpen(false);
                setIsCreateGoalModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/30"
            >
              + Crear mi Primera Meta de Ahorro
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Meta de Destino *
              </label>
              <select
                value={metaId}
                onChange={(e) => setMetaId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
              >
                {metasAhorro.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre} (Acumulado: {formatCOP(m.montoActual)} / Meta: {formatCOP(m.montoObjetivo)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  Monto a Trasladar (COP) *
                </label>
                {saldoDisponible > 0 && (
                  <button
                    type="button"
                    onClick={() => setMonto(saldoDisponible)}
                    className="text-[10px] text-emerald-400 hover:underline font-bold"
                  >
                    Usar todo el disponible ({formatCOP(saldoDisponible)})
                  </button>
                )}
              </div>
              <input
                type="number"
                required
                min={1}
                value={monto}
                onChange={(e) => setMonto(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-base focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                ¿En qué Banco o App Financiera lo guardaste? *
              </label>
              <select
                value={bancoDetalle}
                onChange={(e) => setBancoDetalle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
              >
                {Object.entries(BANCOS_COLOMBIA).map(([key, item]) => (
                  <option key={key} value={key}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Notas adicionales (opcional)
              </label>
              <input
                type="text"
                placeholder="Ej. Guardado en la Cajita de Nu que renta al 13%"
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => setIsTransferModalOpen(false)}
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
                    Trasladando...
                  </>
                ) : (
                  <>
                    Confirmar Traslado
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
