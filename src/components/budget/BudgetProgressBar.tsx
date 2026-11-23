"use client";

import React from "react";
import { Sparkles, Trophy } from "lucide-react";

interface BudgetProgressBarProps {
  porcentajeDisponible: number;
}

export const BudgetProgressBar: React.FC<BudgetProgressBarProps> = ({
  porcentajeDisponible,
}) => {
  const clamped = Math.min(100, Math.max(0, porcentajeDisponible));

  return (
    <div className="p-4 sm:p-5 rounded-3xl bg-[#091122] border border-blue-900/30 shadow-xl space-y-2">
      <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-white">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <span>Control del Salario y Flujo de Caja</span>
        </div>
        <span className="text-emerald-400 font-black">{clamped}% libre</span>
      </div>

      {/* Barra de progreso con gradiente esmeralda */}
      <div className="relative w-full h-3 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 transition-all duration-700 shadow-[0_0_12px_rgba(16,185,129,0.5)]"
          style={{ width: `${clamped}%` }}
        />
      </div>

      <div className="flex justify-between items-center text-[10px] sm:text-[11px] text-slate-400 font-medium pt-1">
        <span>0% gastado</span>
        <span className="text-emerald-400 font-bold">
          {clamped > 30 ? "¡Excelente margen de ahorro!" : "Ajusta gastos variables"}
        </span>
        <span>100% libre</span>
      </div>
    </div>
  );
};
