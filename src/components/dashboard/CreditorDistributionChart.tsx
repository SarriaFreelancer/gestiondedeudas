"use client";

import React, { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { formatCOP, formatPercentage } from "@/lib/formatters";
import { PieChart as PieIcon, Building2 } from "lucide-react";

interface CreditorDistributionProps {
  distribucion: {
    id: string;
    entidad: string;
    saldoPendiente: number;
    montoInicial: number;
    porcentajeSobreTotal: number;
    estado: string;
    color: string;
  }[];
  saldoPendienteTotal: number;
}

export const CreditorDistributionChart: React.FC<CreditorDistributionProps> = ({
  distribucion,
  saldoPendienteTotal,
}) => {
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);

  // Filtrar entidades que tienen saldo pendiente > 0 para el gráfico
  const dataActiva = distribucion.filter((d) => d.saldoPendiente > 0);

  const entidadSeleccionada = distribucion.find((d) => d.entidad === selectedEntity) || dataActiva[0];

  return (
    <div className="w-full p-6 rounded-3xl bg-[#151F32] border border-slate-800 shadow-xl flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <PieIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
              Distribución por Acreedor
            </h3>
            <p className="text-xs text-slate-400">Participación en el saldo pendiente total</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Gráfico Circular Recharts */}
        <div className="h-60 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                formatter={(value: any, name: any) => [
                  `${formatCOP(value)} (${(
                    (Number(value) / (saldoPendienteTotal || 1)) *
                    100
                  ).toFixed(2)}%)`,
                  name,
                ]}
                contentStyle={{
                  backgroundColor: "#0B1120",
                  borderColor: "#1E293B",
                  borderRadius: "12px",
                  color: "#F8FAFC",
                }}
              />
              <Pie
                data={dataActiva}
                dataKey="saldoPendiente"
                nameKey="entidad"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                onClick={(entry: any) => setSelectedEntity(entry?.entidad || entry?.name || null)}
                cursor="pointer"
              >
                {dataActiva.map((entry) => (
                  <Cell
                    key={entry.id}
                    fill={entry.color}
                    stroke={selectedEntity === entry.entidad ? "#ffffff" : "#151F32"}
                    strokeWidth={selectedEntity === entry.entidad ? 3 : 1}
                    className="transition-all duration-300"
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Detalle interactivo al seleccionar */}
        <div className="flex flex-col gap-2">
          {entidadSeleccionada && (
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700/80 mb-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-400 uppercase">
                  Acreedor Seleccionado
                </span>
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entidadSeleccionada.color }}
                />
              </div>
              <div className="text-lg font-extrabold text-white">
                {entidadSeleccionada.entidad}
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-xl font-bold text-slate-100">
                  {formatCOP(entidadSeleccionada.saldoPendiente)}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {formatPercentage(entidadSeleccionada.porcentajeSobreTotal)} del saldo
                </span>
              </div>
            </div>
          )}

          {/* Lista de acreedores */}
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {distribucion.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedEntity(item.entidad)}
                className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-colors ${
                  selectedEntity === item.entidad
                    ? "bg-slate-800 border border-slate-600 text-white"
                    : "hover:bg-slate-800/50 text-slate-300 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-medium truncate max-w-[140px] text-left">
                    {item.entidad}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-200">
                    {formatCOP(item.saldoPendiente)}
                  </span>
                  <span className="text-slate-400 w-12 text-right">
                    {formatPercentage(item.porcentajeSobreTotal)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
