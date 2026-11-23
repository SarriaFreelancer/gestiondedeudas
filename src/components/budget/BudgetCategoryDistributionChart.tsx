"use client";

import React, { useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Sector } from "recharts";
import { formatCOP } from "@/lib/formatters";
import { PieChart as PieIcon } from "lucide-react";

interface BudgetCategoryDistributionChartProps {
  distribucion: {
    categoria: string;
    nombreMostrar: string;
    monto: number;
    porcentaje: number;
    color: string;
  }[];
  totalGastos: number;
}

export const BudgetCategoryDistributionChart: React.FC<BudgetCategoryDistributionChartProps> = ({
  distribucion,
  totalGastos,
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius - 2}
          outerRadius={outerRadius + 4}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      </g>
    );
  };

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-[#091122] border border-blue-900/30 shadow-xl space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
          <PieIcon className="w-5 h-5" />
        </div>
        <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
          Distribución de Gastos por Categoría
        </h2>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* MINI DONUT INTERACTIVO */}
        <div className="relative w-44 h-44 flex-shrink-0 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                // @ts-expect-error Recharts type discrepancy
                activeIndex={activeIndex !== null ? activeIndex : undefined}
                activeShape={renderActiveShape}
                data={distribucion}
                cx="50%"
                cy="50%"
                innerRadius={46}
                outerRadius={68}
                paddingAngle={3}
                dataKey="monto"
                onMouseEnter={onPieEnter}
                onMouseLeave={onPieLeave}
                stroke="none"
              >
                {distribucion.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Gastos</span>
            <span className="text-xs font-black text-white">{formatCOP(totalGastos)}</span>
          </div>
        </div>

        {/* LISTA DE CATEGORÍAS */}
        <div className="flex-1 w-full space-y-2">
          {distribucion.map((item, index) => {
            const isHovered = activeIndex === index;
            return (
              <div
                key={item.categoria}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                className={`flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer ${
                  isHovered
                    ? "bg-slate-800/80 border-slate-700 shadow-md scale-[1.01]"
                    : "bg-slate-900/40 border-slate-800/80 hover:bg-slate-800/40"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs font-semibold text-slate-200">
                    {item.nombreMostrar}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-bold text-slate-400">{item.porcentaje}%</span>
                  <span className="text-xs font-bold text-white font-mono">
                    {formatCOP(item.monto)}
                  </span>
                </div>
              </div>
            );
          })}

          {distribucion.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-4">
              No hay gastos registrados en este periodo.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
