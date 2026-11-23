"use client";

import React, { useState, useEffect } from "react";
import { formatCOP, formatPercentage } from "@/lib/formatters";
import { useFinancial } from "@/context/FinancialContext";
import {
  LineChart as LineChartIcon,
  Zap,
  Calendar,
  Clock,
  TrendingDown,
  ShieldCheck,
  ChevronRight,
  Flame,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

export default function ReportesPage() {
  const { summary, deudas } = useFinancial();
  const [abonoExtra, setAbonoExtra] = useState<number>(300000);
  const [estrategia, setEstrategia] = useState<string>("BOLA_DE_NIEVE");
  const [proyeccion, setProyeccion] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProyecciones = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/proyecciones?abono=${abonoExtra}&estrategia=${estrategia}`);
        const data = await res.json();
        setProyeccion(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchProyecciones();
  }, [abonoExtra, estrategia]);

  // Datos simulados de evolución temporal proyectada
  const chartEvolucionData = [
    { mes: "Inicio", normal: summary?.deudaTotalInicial || 14383620, acelerado: summary?.deudaTotalInicial || 14383620 },
    { mes: "Mes 6", normal: (summary?.deudaTotalInicial || 14383620) * 0.85, acelerado: (summary?.deudaTotalInicial || 14383620) * 0.7 },
    { mes: "Mes 12", normal: (summary?.deudaTotalInicial || 14383620) * 0.7, acelerado: (summary?.deudaTotalInicial || 14383620) * 0.45 },
    { mes: "Mes 18", normal: (summary?.deudaTotalInicial || 14383620) * 0.55, acelerado: (summary?.deudaTotalInicial || 14383620) * 0.2 },
    { mes: "Mes 24", normal: (summary?.deudaTotalInicial || 14383620) * 0.4, acelerado: 0 },
    { mes: "Mes 36", normal: (summary?.deudaTotalInicial || 14383620) * 0.15, acelerado: 0 },
    { mes: "Mes 48", normal: 0, acelerado: 0 },
  ];

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#151F32] border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <LineChartIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Reportes & Proyección de Libertad Financiera
            </h1>
            <p className="text-xs text-slate-400">
              Simulador interactivo del método Bola de Nieve y cronograma proyectado de cancelación
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
          <Zap className="w-4 h-4" />
          <span>Simulador Inteligente Activo</span>
        </div>
      </div>

      {/* SIMULADOR INTERACTIVO BOLA DE NIEVE (SECCIÓN 12) */}
      <div className="p-6 rounded-3xl bg-[#151F32] border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-400" />
              <h2 className="text-base font-bold text-white">
                Simulador del Método Bola de Nieve
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Ajusta el aporte extraordinario mensual para ver cuánto tiempo y dinero ahorras
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setEstrategia("BOLA_DE_NIEVE")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                estrategia === "BOLA_DE_NIEVE"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              Bola de Nieve (De menor a mayor saldo)
            </button>
          </div>
        </div>

        {/* CONTROL DESLIZANTE DE APORTE EXTRAORDINARIO */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-300">
              Aporte Extraordinario Mensual Sugerido:
            </span>
            <span className="text-lg font-black text-emerald-400 font-mono">
              {formatCOP(abonoExtra)} / mes
            </span>
          </div>

          <input
            type="range"
            min={0}
            max={2000000}
            step={50000}
            value={abonoExtra}
            onChange={(e) => setAbonoExtra(Number(e.target.value))}
            className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />

          <div className="flex justify-between text-[11px] text-slate-400 font-medium">
            <span>$0 (Solo cuotas normales)</span>
            <span>$1.000.000</span>
            <span>$2.000.000</span>
          </div>
        </div>

        {/* COMPARATIVA DE LIBERTAD FINANCIERA */}
        {proyeccion && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">
                Fecha Libertad Normal
              </span>
              <div className="text-lg font-extrabold text-slate-300 mt-1 capitalize">
                {proyeccion.fechaLibertadNormal}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {proyeccion.mesesHastaLibertadNormal} meses pagando cuotas básicas
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
              <span className="text-[11px] font-bold text-emerald-400 uppercase block">
                Fecha Libertad Acelerada
              </span>
              <div className="text-xl font-black text-emerald-300 mt-1 capitalize">
                {proyeccion.fechaLibertadAcelerada}
              </div>
              <p className="text-[11px] text-emerald-400/80 mt-1 font-semibold">
                ¡{proyeccion.mesesHastaLibertadAcelerada} meses con bola de nieve!
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-blue-500/10 border border-blue-500/30">
              <span className="text-[11px] font-bold text-blue-400 uppercase block">
                Tiempo Total Ahorrado
              </span>
              <div className="text-xl font-black text-blue-300 mt-1">
                {proyeccion.mesesAhorrados} Meses
              </div>
              <p className="text-[11px] text-blue-400/80 mt-1 font-semibold">
                ≈ {(proyeccion.mesesAhorrados / 12).toFixed(1)} años de anticipación
              </p>
            </div>
          </div>
        )}

        {/* TABLA DE PROYECCIÓN POR CADA OBLIGACIÓN */}
        {proyeccion?.deudas && (
          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-slate-800">
                  <th className="py-3 px-4">Orden Prioridad</th>
                  <th className="py-3 px-4">Obligación</th>
                  <th className="py-3 px-4 text-right">Saldo Actual</th>
                  <th className="py-3 px-4 text-right">Pago Mensual Base</th>
                  <th className="py-3 px-4">Liquidación Normal</th>
                  <th className="py-3 px-4 text-emerald-400">Liquidación Acelerada</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                {proyeccion.deudas.map((d: any, idx: number) => (
                  <tr key={d.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-bold text-blue-400">#{idx + 1}</td>
                    <td className="py-3 px-4 font-extrabold text-white">{d.entidad}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-200">
                      {formatCOP(d.saldoPendiente)}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-300">
                      {formatCOP(d.cuotaMensual)}
                    </td>
                    <td className="py-3 px-4 text-slate-400 capitalize">
                      {d.fechaFinEstimadaNormal} ({d.mesesEstimadosNormal} m)
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-400 capitalize">
                      {d.fechaFinEstimadaAcelerada} ({d.mesesEstimadosAcelerado} m)
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* GRÁFICO DE EVOLUCIÓN HISTÓRICA / PROYECTADA (SECCIÓN 11) */}
      <div className="p-6 rounded-3xl bg-[#151F32] border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
              Evolución de Reducción de la Deuda Total
            </h3>
            <p className="text-xs text-slate-400">
              Comparativa entre trayectoria habitual vs acelerada con Bola de Nieve
            </p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartEvolucionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="mes" stroke="#64748B" fontSize={11} />
              <YAxis
                stroke="#64748B"
                fontSize={11}
                tickFormatter={(val) => `$${(val / 1000000).toFixed(1)}M`}
              />
              <Tooltip
                formatter={(value: any) => [formatCOP(value), "Saldo Total"]}
                contentStyle={{
                  backgroundColor: "#0B1120",
                  borderColor: "#1E293B",
                  borderRadius: "12px",
                  color: "#F8FAFC",
                }}
              />
              <Line
                type="monotone"
                dataKey="normal"
                name="Plan Normal"
                stroke="#EF4444"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="acelerado"
                name="Plan Bola de Nieve"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-center gap-6 pt-4 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-slate-400">Trayectoria Cuotas Normales</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-emerald-400 font-bold">Trayectoria Bola de Nieve Acelerada</span>
          </div>
        </div>
      </div>
    </div>
  );
}
