"use client";

import React, { useState } from "react";
import { PlusCircle, X, Loader2 } from "lucide-react";
import { useFinancial } from "@/context/FinancialContext";

export const CreateDebtModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { refreshData } = useFinancial();

  const [entidad, setEntidad] = useState("");
  const [referencia, setReferencia] = useState("");
  const [montoInicial, setMontoInicial] = useState<number>(0);
  const [tieneCuotas, setTieneCuotas] = useState<boolean>(true);
  const [cuotasTotales, setCuotasTotales] = useState<number>(12);
  const [valorCuotaMensual, setValorCuotaMensual] = useState<number>(0);
  const [diaVencimiento, setDiaVencimiento] = useState<number>(5);
  const [observaciones, setObservaciones] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/deudas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entidad: entidad.trim(),
          referencia: referencia.trim() || undefined,
          montoInicial: Number(montoInicial),
          tieneCuotas,
          cuotasTotales: tieneCuotas ? Number(cuotasTotales) : 0,
          valorCuotaMensual: tieneCuotas ? Number(valorCuotaMensual) : 0,
          diaVencimiento: Number(diaVencimiento),
          observaciones: observaciones.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al crear la deuda");
      }

      await refreshData();
      onClose();
    } catch (err: any) {
      setError(err.message || "No se pudo registrar la obligación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg p-6 rounded-3xl bg-[#151F32] border border-slate-700 shadow-2xl text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <PlusCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Nueva Obligación Financiera</h3>
            <p className="text-xs text-slate-400">Registrar un nuevo acreedor en el sistema</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Entidad / Acreedor *
              </label>
              <input
                type="text"
                placeholder="Ej. BANCOLOMBIA"
                value={entidad}
                onChange={(e) => setEntidad(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Referencia o Contrato
              </label>
              <input
                type="text"
                placeholder="Ej. CR-88392"
                value={referencia}
                onChange={(e) => setReferencia(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Monto Inicial / Saldo a Amortizar (COP) *
            </label>
            <input
              type="number"
              placeholder="0"
              value={montoInicial || ""}
              onChange={(e) => setMontoInicial(Number(e.target.value))}
              required
              min={1}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <input
              type="checkbox"
              id="tieneCuotas"
              checked={tieneCuotas}
              onChange={(e) => setTieneCuotas(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-0 bg-slate-800 border-slate-700"
            />
            <label htmlFor="tieneCuotas" className="text-xs text-slate-300 font-medium cursor-pointer">
              ¿Tiene plan de cuotas fijas? (Desmarcar para tarjetas o créditos rotativos libres)
            </label>
          </div>

          {tieneCuotas && (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Cuotas Totales
                </label>
                <input
                  type="number"
                  value={cuotasTotales || ""}
                  onChange={(e) => setCuotasTotales(Number(e.target.value))}
                  min={1}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Valor Cuota Mensual
                </label>
                <input
                  type="number"
                  value={valorCuotaMensual || ""}
                  onChange={(e) => setValorCuotaMensual(Number(e.target.value))}
                  min={0}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Día de Pago (1-31)
                </label>
                <input
                  type="number"
                  value={diaVencimiento || ""}
                  onChange={(e) => setDiaVencimiento(Number(e.target.value))}
                  min={1}
                  max={31}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Observaciones
            </label>
            <textarea
              rows={2}
              placeholder="Detalles adicionales..."
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !entidad || montoInicial <= 0}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Guardar Obligación"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
