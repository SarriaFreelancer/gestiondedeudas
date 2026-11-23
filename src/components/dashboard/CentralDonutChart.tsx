"use client";

import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { formatCOP, formatPercentage } from "@/lib/formatters";
import { Sparkles, Trophy, AlertCircle, TrendingDown } from "lucide-react";
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

  // Si no hay pagos aún, el gráfico muestra 100% pendiente en color rojo/naranja
  // Si todo está pagado, muestra 100% verde
  const chartData = [
    {
      name: "Deuda Pendiente",
      value: Math.max(0, saldoPendiente),
      color: "#EF4444", // Rojo elegante de advertencia / saldo pendiente
    },
    {
      name: "Deuda Pagada",
      value: Math.max(0, totalPagado),
      color: "#10B981", // Verde esmeralda de progreso / pagado
    },
  ];

  // Caso especial: si saldoPendiente es 0 y totalPagado es 0 (ej. sin datos), mostramos placeholder
  const displayData =
    deudaTotalInicial === 0
      ? [{ name: "Sin Deudas", value: 1, color: "#3B82F6" }]
      : chartData.filter((d) => d.value > 0);

  const esLibreDeDeudas = saldoPendiente <= 0 && deudaTotalInicial > 0;

  return (
    <div className="relative w-full max-w-xl mx-auto flex flex-col items-center justify-center p-6 rounded-3xl bg-[#151F32]/90 border border-slate-700/60 shadow-2xl backdrop-blur-xl">
      {/* Halo de resplandor sutil detrás del gráfico */}
      <div
        className={`absolute -inset-1 rounded-3xl opacity-20 blur-2xl transition-all duration-1000 ${
          esLibreDeDeudas ? "bg-emerald-500" : "bg-gradient-to-r from-red-500 to-emerald-500"
        }`}
      />

      <div className="relative z-10 w-full flex items-center justify-between mb-2 px-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
              Estado de Amortización Central
            </h3>
            <p className="text-xs text-slate-400">Control visual de reducción de obligaciones</p>
          </div>
        </div>

        {esLibreDeDeudas ? (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold animate-bounce">
            <Trophy className="w-4 h-4" />
            ¡100% LIBRE DE DEUDAS!
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Meta: $0 Pendiente
          </div>
        )}
      </div>

      {/* Gráfico Donut y Textos Centrales */}
      <div className="relative w-full h-[360px] flex items-center justify-center">
        {mounted && (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                formatter={(value: any, name: any) => [
                  `${formatCOP(value)} (${(
                    (Number(value) / (deudaTotalInicial || 1)) *
                    100
                  ).toFixed(2)}%)`,
                  name,
                ]}
                contentStyle={{
                  backgroundColor: "#0B1120",
                  borderColor: "#1E293B",
                  borderRadius: "12px",
                  color: "#F8FAFC",
                  boxShadow: "0 10px 25px -5px rgba(0,0,0,0.5)",
                }}
              />
              <Pie
                data={displayData}
                cx="50%"
                cy="50%"
                innerRadius={108}
                outerRadius={148}
                paddingAngle={displayData.length > 1 ? 4 : 0}
                dataKey="value"
                stroke="#151F32"
                strokeWidth={3}
                animationDuration={1200}
                animationEasing="ease-out"
              >
                {displayData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    className="transition-all duration-500 hover:opacity-85"
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        )}

        {/* CONTENIDO CENTRAL EXACTO REQUERIDO */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-6">
          <span className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
            SALDO TOTAL PENDIENTE
          </span>

          <span
            className={`text-3xl sm:text-4xl font-extrabold tracking-tight my-1.5 transition-colors duration-700 ${
              esLibreDeDeudas ? "text-emerald-400" : "text-white"
            }`}
          >
            {formatCOP(saldoPendiente)}
          </span>

          <div className="h-px w-24 bg-gradient-to-r from-transparent via-slate-700 to-transparent my-1" />

          <p className="text-xs text-slate-300 font-medium">
            Total de deuda inicial:{" "}
            <span className="text-slate-100 font-semibold">{formatCOP(deudaTotalInicial)}</span>
          </p>

          <div className="mt-1 flex items-center gap-1.5">
            <span className="text-xs text-slate-400">Progreso de pago:</span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                progresoPorcentaje > 0
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "bg-slate-800 text-slate-300"
              }`}
            >
              {formatPercentage(progresoPorcentaje)}
            </span>
          </div>
        </div>
      </div>

      {/* Barra de Leyenda Inferior */}
      <div className="w-full grid grid-cols-2 gap-3 pt-3 mt-1 border-t border-slate-800 text-xs">
        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-red-500/5 border border-red-500/15">
          <div className="w-3.5 h-3.5 rounded-full bg-red-500 shadow-sm shadow-red-500/50" />
          <div className="flex flex-col">
            <span className="text-slate-400 font-medium">Por Pagar</span>
            <span className="text-slate-200 font-bold">{formatCOP(saldoPendiente)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
          <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
          <div className="flex flex-col">
            <span className="text-slate-400 font-medium">Total Pagado</span>
            <span className="text-emerald-400 font-bold">{formatCOP(totalPagado)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
