"use client";

import React, { useEffect, useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { formatCOP } from "@/lib/formatters";

interface CentralBudgetDonutChartProps {
  saldoDisponible: number;
  totalGastosPagados: number;
  totalIngresos: number;
  porcentajeDisponible: number;
}

export const CentralBudgetDonutChart: React.FC<CentralBudgetDonutChartProps> = ({
  saldoDisponible,
  totalGastosPagados,
  totalIngresos,
  porcentajeDisponible,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const data = [
    { name: "Disponible", value: Math.max(0, saldoDisponible), color: "#10B981" }, // Verde esmeralda
    { name: "Gastado", value: Math.max(0, totalGastosPagados), color: "#F97316" }, // Naranja vibrante
  ];

  const hasData = saldoDisponible > 0 || totalGastosPagados > 0;
  const chartData = hasData ? data : [{ name: "Sin datos", value: 1, color: "#334155" }];
  const porcentajeGastado = Number(Math.max(0, 100 - porcentajeDisponible).toFixed(1));

  return (
    <div className="relative flex flex-col items-center justify-center p-4 sm:p-7 rounded-3xl bg-[#080E1B] border border-blue-900/30 shadow-2xl">
      <div className="relative w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 flex items-center justify-center mx-auto">
        {/* Glow de fondo */}
        <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />

        {mounted && (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius="65%"
                outerRadius="88%"
                paddingAngle={hasData ? 3 : 0}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
                stroke="#080E1B"
                strokeWidth={3}
                isAnimationActive={true}
                animationDuration={900}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        )}

        {/* Textos centrales */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-3">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
            Saldo Disponible
          </span>
          <span className="text-lg sm:text-xl md:text-2xl font-black text-white tracking-tight text-emerald-400 drop-shadow-md truncate max-w-full">
            {formatCOP(saldoDisponible)}
          </span>
          <span className="text-xs sm:text-sm font-semibold text-slate-300 mt-0.5">
            {porcentajeDisponible}% disponible
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5">
            Ingresos: {formatCOP(totalIngresos)}
          </span>
        </div>
      </div>

      {/* Leyenda inferior */}
      <div className="w-full grid grid-cols-2 gap-2 sm:gap-6 mt-3 pt-3 border-t border-slate-800/60 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
          <div className="min-w-0">
            <span className="text-slate-400 block text-[9px] uppercase font-bold">Disponible</span>
            <span className="font-bold text-white text-[11px] sm:text-xs truncate block">
              {formatCOP(saldoDisponible)} ({porcentajeDisponible}%)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 flex-shrink-0 shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
          <div className="min-w-0">
            <span className="text-slate-400 block text-[9px] uppercase font-bold">Gastado</span>
            <span className="font-bold text-white text-[11px] sm:text-xs truncate block">
              {formatCOP(totalGastosPagados)} ({porcentajeGastado}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
