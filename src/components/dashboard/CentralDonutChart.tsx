"use client";

import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { formatCOP, formatPercentage } from "@/lib/formatters";
import confetti from "canvas-confetti";

interface CentralDonutChartProps {
  saldoPendiente: number;
  totalPagado: number;
  deudaTotalInicial: number;
  progresoPorcentaje: number;
}

export const CentralDonutChart: React.FC<CentralDonutChartProps> = ({
  saldoPendiente,
  totalPagado,
  deudaTotalInicial,
  progresoPorcentaje,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (progresoPorcentaje >= 100 && saldoPendiente <= 0 && deudaTotalInicial > 0) {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
  }, [progresoPorcentaje, saldoPendiente, deudaTotalInicial]);

  const porcentajePendiente =
    deudaTotalInicial > 0 ? (saldoPendiente / deudaTotalInicial) * 100 : 0;

  const chartData = [
    {
      name: "Pendiente",
      value: Math.max(0, saldoPendiente),
      color: "#FF5A26",
    },
    {
      name: "Pagado",
      value: Math.max(0, totalPagado),
      color: "#00E676",
    },
  ];

  const displayData =
    deudaTotalInicial === 0
      ? [{ name: "Sin Deudas", value: 1, color: "#3B82F6" }]
      : chartData.filter((d) => d.value > 0);

  return (
    <div className="w-full p-4 sm:p-6 rounded-3xl bg-[#091122]/90 border border-slate-800/80 shadow-2xl backdrop-blur-xl">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
        {/* LADO IZQUIERDO: DONUT CIRCULAR PROTAGONISTA ADAPTABLE */}
        <div className="relative w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 flex-shrink-0 flex items-center justify-center mx-auto sm:mx-0">
          {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  formatter={(value: any, name: any) => [
                    `${formatCOP(value)} (${(
                      (Number(value) / (deudaTotalInicial || 1)) *
                      100
                    ).toFixed(1)}%)`,
                    name,
                  ]}
                  contentStyle={{
                    backgroundColor: "#080E1A",
                    borderColor: "#1E293B",
                    borderRadius: "14px",
                    color: "#F8FAFC",
                    fontSize: "12px",
                  }}
                />
                <Pie
                  data={displayData}
                  cx="50%"
                  cy="50%"
                  innerRadius="65%"
                  outerRadius="90%"
                  paddingAngle={displayData.length > 1 ? 4 : 0}
                  dataKey="value"
                  stroke="#091122"
                  strokeWidth={3}
                  animationDuration={1000}
                >
                  {displayData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          )}

          {/* TEXTO EN EL CENTRO DEL DONUT */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-3">
            {deudaTotalInicial === 0 ? (
              <>
                <span className="text-2xl sm:text-3xl mb-1">🎉</span>
                <span className="text-sm sm:text-base font-black text-emerald-400 tracking-tight">
                  ¡Al día!
                </span>
                <span className="text-[11px] sm:text-xs text-slate-300 font-bold mt-0.5">
                  Sin deudas registradas
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  Libertad 100%
                </span>
              </>
            ) : (
              <>
                <span className="text-[10px] sm:text-xs text-slate-400 font-medium tracking-wide">
                  Saldo Pendiente
                </span>

                <span className="text-base sm:text-xl md:text-2xl font-black text-white tracking-tight my-0.5 truncate max-w-full">
                  {formatCOP(saldoPendiente)}
                </span>

                <span className="text-sm sm:text-base md:text-lg font-black text-[#FF5A26] tracking-tight">
                  {formatPercentage(porcentajePendiente, 1)}
                </span>

                <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium">
                  por pagar
                </span>
              </>
            )}
          </div>
        </div>

        {/* LADO DERECHO: LEYENDA DETALLADA */}
        <div className="grid grid-cols-2 sm:flex sm:flex-col justify-center gap-3 sm:gap-5 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
          {/* Item Pagado Verde */}
          <div className="flex items-start gap-2.5 sm:gap-3 p-2 sm:p-0 rounded-xl bg-slate-900/40 sm:bg-transparent">
            <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-[#00E676] shadow-sm shadow-[#00E676]/60 mt-1 flex-shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] sm:text-xs font-semibold text-slate-300">Pagado</span>
              <span className="text-xs sm:text-base md:text-lg font-black text-white truncate">
                {formatCOP(totalPagado)}
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-slate-400">
                ({formatPercentage(progresoPorcentaje, 1)})
              </span>
            </div>
          </div>

          {/* Item Pendiente Naranja */}
          <div className="flex items-start gap-2.5 sm:gap-3 p-2 sm:p-0 rounded-xl bg-slate-900/40 sm:bg-transparent">
            <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-[#FF5A26] shadow-sm shadow-[#FF5A26]/60 mt-1 flex-shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] sm:text-xs font-semibold text-slate-300">Pendiente</span>
              <span className="text-xs sm:text-base md:text-lg font-black text-white truncate">
                {formatCOP(saldoPendiente)}
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-slate-400">
                ({formatPercentage(porcentajePendiente, 1)})
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
