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

  // Donut con los colores exactos de la imagen:
  // Naranja vibrante #FF5A26 para Pendiente
  // Verde esmeralda brillante #00E676 para Pagado
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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* LADO IZQUIERDO: DONUT CIRCULAR PROTAGONISTA */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex-shrink-0 flex items-center justify-center mx-auto sm:mx-0">
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
                  innerRadius={78}
                  outerRadius={108}
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

          {/* TEXTO EN EL CENTRO DEL DONUT IDÉNTICO A LA FOTO */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
            <span className="text-xs text-slate-400 font-medium tracking-wide">
              Saldo Pendiente
            </span>

            <span className="text-xl sm:text-2xl font-black text-white tracking-tight my-0.5">
              {formatCOP(saldoPendiente)}
            </span>

            <span className="text-base sm:text-lg font-black text-[#FF5A26] tracking-tight">
              {formatPercentage(porcentajePendiente, 1)}
            </span>

            <span className="text-[11px] text-slate-400 font-medium">
              por pagar
            </span>
          </div>
        </div>

        {/* LADO DERECHO: LEYENDA DETALLADA IDÉNTICA A LA IMAGEN */}
        <div className="flex flex-row sm:flex-col justify-center gap-6 sm:gap-5 w-full sm:w-auto">
          {/* Item Pagado Verde */}
          <div className="flex items-start gap-3">
            <div className="w-3.5 h-3.5 rounded-full bg-[#00E676] shadow-sm shadow-[#00E676]/60 mt-1 flex-shrink-0" />
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-300">Pagado</span>
              <span className="text-base sm:text-lg font-black text-white">
                {formatCOP(totalPagado)}
              </span>
              <span className="text-xs font-bold text-slate-400">
                ({formatPercentage(progresoPorcentaje, 1)})
              </span>
            </div>
          </div>

          {/* Item Pendiente Naranja */}
          <div className="flex items-start gap-3">
            <div className="w-3.5 h-3.5 rounded-full bg-[#FF5A26] shadow-sm shadow-[#FF5A26]/60 mt-1 flex-shrink-0" />
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-300">Pendiente</span>
              <span className="text-base sm:text-lg font-black text-white">
                {formatCOP(saldoPendiente)}
              </span>
              <span className="text-xs font-bold text-slate-400">
                ({formatPercentage(porcentajePendiente, 1)})
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
