"use client";

import React, { useState } from "react";
import { useBudget } from "@/context/BudgetContext";
import { BANCOS_COLOMBIA } from "@/services/savingsService";
import {
  Target,
  X,
  AlertCircle,
  Loader2,
  Save,
  Building2,
  DollarSign,
  Palette,
} from "lucide-react";

export const CreateGoalModal: React.FC = () => {
  const { isCreateGoalModalOpen, setIsCreateGoalModalOpen, refreshMetas } = useBudget();

  const [nombre, setNombre] = useState("");
  const [montoObjetivo, setMontoObjetivo] = useState<number>(1000000);
  const [montoInicial, setMontoInicial] = useState<number>(0);
  const [bancoUbicacion, setBancoUbicacion] = useState<string>("NU_CAJITA");
  const [color, setColor] = useState<string>("#10B981");
  const [fechaLimite, setFechaLimite] = useState<string>("");
  const [notas, setNotas] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isCreateGoalModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setErrorMessage("El nombre de la meta es requerido.");
      return;
    }
    if (montoObjetivo <= 0) {
      setErrorMessage("El monto objetivo debe ser mayor a 0.");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/metas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombre.trim(),
          montoObjetivo: Number(montoObjetivo),
          montoInicial: Number(montoInicial),
          bancoUbicacion,
          color,
          fechaLimite: fechaLimite ? new Date(fechaLimite) : null,
          notas: notas.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al crear la meta");
      }

      await refreshMetas();
      setIsCreateGoalModalOpen(false);
    } catch (err: any) {
      setErrorMessage(err.message || "Error al crear la meta");
    } finally {
      setSubmitting(false);
    }
  };

  const COLOR_OPTIONS = [
    { label: "Esmeralda", hex: "#10B981" },
    { label: "Cian", hex: "#06B6D4" },
    { label: "Azul", hex: "#3B82F6" },
    { label: "Púrpura", hex: "#8B5CF6" },
    { label: "Violeta", hex: "#9333EA" },
    { label: "Ámbar", hex: "#F59E0B" },
    { label: "Rosa", hex: "#EC4899" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md p-6 rounded-3xl bg-[#0F172A] border border-blue-500/30 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => setIsCreateGoalModalOpen(false)}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-[#38BDF8]">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Nueva Meta de Ahorro</h3>
            <p className="text-xs text-slate-400">
              Crea un objetivo financiero y hazle seguimiento
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
              Nombre de la Meta *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Fondo de Emergencia, Vacaciones, Ahorro Nu"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Monto Objetivo (COP) *
              </label>
              <input
                type="number"
                required
                min={1}
                value={montoObjetivo}
                onChange={(e) => setMontoObjetivo(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Saldo Inicial ya Ahorrado
              </label>
              <input
                type="number"
                min={0}
                value={montoInicial}
                onChange={(e) => setMontoInicial(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Banco o App Financiera de Resguardo *
            </label>
            <select
              value={bancoUbicacion}
              onChange={(e) => setBancoUbicacion(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
            >
              {Object.entries(BANCOS_COLOMBIA).map(([key, item]) => (
                <option key={key} value={key}>
                  {item.label}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-slate-400 mt-1">
              Aquí sabrás exactamente en qué cuenta bancaria tienes guardado este ahorro.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Fecha Límite (Opcional)
              </label>
              <input
                type="date"
                value={fechaLimite}
                onChange={(e) => setFechaLimite(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Color Distintivo
              </label>
              <div className="flex items-center gap-1.5 pt-1">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setColor(c.hex)}
                    className={`w-5 h-5 rounded-full transition-transform ${
                      color === c.hex ? "scale-125 ring-2 ring-white" : "opacity-70"
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.label}
                  />
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Notas / Propósito
            </label>
            <input
              type="text"
              placeholder="Ej. Para imprevistos médicos o reparaciones"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsCreateGoalModalOpen(false)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || !nombre.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Crear Meta
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
