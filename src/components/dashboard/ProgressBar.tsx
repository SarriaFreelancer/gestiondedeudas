"use client";

import React from "react";
import { formatPercentage, formatCOP } from "@/lib/formatters";
import { CheckCircle2, ShieldCheck, Flag } from "lucide-react";

interface ProgressBarProps {
  progresoPorcentaje: number;
  totalPagado: number;
  saldoPendiente: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progresoPorcentaje,
  totalPagado,
  saldoPendiente,
}) => {
  const pct = Math.min(100, Math.max(0, progresoPorcentaje));

  return (
    <div className="w-full p-6 rounded-3xl bg-[#151F32] border border-slate-800 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
              Trayecto a la Libertad Financiera
            </h3>
            <p className="text-xs text-slate-400">Amortización global acumulada</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Progreso actual:</span>
          <span className="text-sm font-extrabold text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
            {formatPercentage(pct)}
          </span>
        </div>
      </div>

      {/* Barra de progreso interactiva con glow */}
      <div className="relative w-full h-5 rounded-full bg-slate-900 border border-slate-800 overflow-hidden my-3 p-0.5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-teal-300 transition-all duration-1000 ease-out shadow-sm shadow-emerald-500/50"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Hitos visuales del trayecto */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mt-2">
        <div className="flex items-center gap-1.5 text-slate-300">
          <Flag className="w-3.5 h-3.5 text-slate-500" />
          <span>0% Inicio (${formatCOP(0)})</span>
        </div>

        <div className="hidden sm:flex items-center gap-1 text-slate-500">
          <span>50% Mitad de camino</span>
        </div>

        <div className="flex items-center gap-1.5 text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>100% Libre de Deudas</span>
        </div>
      </div>
    </div>
  );
};
