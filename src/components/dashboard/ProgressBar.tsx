"use client";

import React from "react";
import { formatPercentage } from "@/lib/formatters";

interface ProgressBarProps {
  progresoPorcentaje: number;
  totalPagado?: number;
  saldoPendiente?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progresoPorcentaje }) => {
  const pct = Math.min(100, Math.max(0, progresoPorcentaje));

  return (
    <div className="w-full p-4 sm:p-5 rounded-3xl bg-[#091122]/90 border border-slate-800/80 shadow-xl">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2.5">
          <span className="text-xl sm:text-2xl">🏆</span>
          <span className="text-xs sm:text-sm font-bold text-white tracking-tight">
            Tu progreso general
          </span>
        </div>

        <span className="text-sm sm:text-base font-black text-white">
          {formatPercentage(pct, 1)}
        </span>
      </div>

      {/* Barra de progreso */}
      <div className="w-full h-3 rounded-full bg-[#0E1A33] overflow-hidden p-0.5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-[#00E676] to-teal-300 transition-all duration-1000 ease-out shadow-sm shadow-emerald-500/50"
          style={{ width: `${Math.max(2, pct)}%` }}
        />
      </div>

      <p className="text-[11px] text-slate-400 font-medium text-center mt-2.5">
        ¡Cada pago te acerca a la libertad!
      </p>
    </div>
  );
};
