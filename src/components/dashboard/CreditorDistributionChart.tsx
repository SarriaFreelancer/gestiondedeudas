"use client";

import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { formatCOP, formatPercentage } from "@/lib/formatters";
import { PieChart as PieIcon } from "lucide-react";

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

// Colores exactos a la imagen suministrada
const ACCURATE_COLORS: Record<string, string> = {
  NEQUI: "#8E44EC", // Morado brillante
  DAVIVIENDA: "#FF6D00", // Naranja brillante
  "CRÉDITO 20 MINUTOS": "#00B0FF", // Azul celeste / cian
  NU: "#76FF03", // Verde lima neón
  "TARJETA DE CRÉDITO DAVIBANK": "#536DFE", // Azul índigo
  Davibank: "#536DFE",
};

export const CreditorDistributionChart: React.FC<CreditorDistributionProps> = ({
  distribucion,
  saldoPendienteTotal,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const dataAlineada = distribucion.map((d) => ({
    ...d,
    nombreVisual:
      d.entidad === "TARJETA DE CRÉDITO DAVIBANK"
        ? "Davibank"
        : d.entidad === "CRÉDITO 20 MINUTOS"
        ? "Crédito 20 Minutos"
        : d.entidad,
    colorAlineado: ACCURATE_COLORS[d.entidad] || d.color,
  }));

  const dataActiva = dataAlineada.filter((d) => d.saldoPendiente > 0);

  return (
    <div className="w-full p-4 sm:p-6 rounded-3xl bg-[#091122]/90 border border-slate-800/80 shadow-2xl">
      {/* Título idéntico a la imagen */}
      <div className="flex items-center gap-2 mb-4">
        <div className="text-blue-500">
          <PieIcon className="w-5 h-5 fill-blue-500/20 text-blue-400" />
        </div>
        <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
          Distribución de tu deuda
        </h3>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
        {/* Mini Donut multicolor idéntico a la foto */}
        <div className="relative w-44 h-44 flex-shrink-0 flex items-center justify-center mx-auto md:mx-0">
          {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  formatter={(value: any, name: any) => [
                    `${formatCOP(value)} (${(
                      (Number(value) / (saldoPendienteTotal || 1)) *
                      100
                    ).toFixed(1)}%)`,
                    name,
                  ]}
                  contentStyle={{
                    backgroundColor: "#080E1A",
                    borderColor: "#1E293B",
                    borderRadius: "12px",
                    color: "#F8FAFC",
                    fontSize: "12px",
                  }}
                />
                <Pie
                  data={dataActiva}
                  dataKey="saldoPendiente"
                  nameKey="nombreVisual"
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={74}
                  paddingAngle={2}
                >
                  {dataActiva.map((entry) => (
                    <Cell key={entry.id} fill={entry.colorAlineado} stroke="#091122" strokeWidth={2} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Tabla a la derecha con punto, Nombre, % y Monto idéntica a la imagen */}
        <div className="w-full flex-1 space-y-2.5">
          {dataAlineada.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between text-xs py-1 hover:bg-slate-800/30 px-2 rounded-lg transition-colors"
            >
              {/* Punto y Nombre */}
              <div className="flex items-center gap-2.5 min-w-[130px]">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: item.colorAlineado }}
                />
                <span className="font-semibold text-white tracking-tight">
                  {item.nombreVisual}
                </span>
              </div>

              {/* Porcentaje */}
              <span className="font-bold text-slate-300 w-12 text-right">
                {formatPercentage(item.porcentajeSobreTotal, 1)}
              </span>

              {/* Saldo en pesos */}
              <span className="font-mono font-bold text-white text-right w-24">
                {formatCOP(item.saldoPendiente)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
