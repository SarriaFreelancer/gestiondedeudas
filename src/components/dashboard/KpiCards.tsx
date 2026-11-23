"use client";

import React from "react";
import { formatCOP, formatPercentage } from "@/lib/formatters";
import { Landmark, TrendingUp, Wallet, Calendar, AlertTriangle } from "lucide-react";

interface KpiCardsProps {
  deudaTotalInicial: number;
  totalPagado: number;
  saldoPendiente: number;
  progresoPorcentaje: number;
  cuotasMensualesActivas: number;
  cuotasEnMoraTotales: number;
  totalEnMora: number;
  valorCuotaMensualTotal: number;
  totalDeudas: number;
  deudasPagadas: number;
}

export const KpiCards: React.FC<KpiCardsProps> = ({
  deudaTotalInicial,
  totalPagado,
  saldoPendiente,
  progresoPorcentaje,
  cuotasMensualesActivas,
  cuotasEnMoraTotales,
  totalEnMora,
  valorCuotaMensualTotal,
  totalDeudas,
  deudasPagadas,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {/* TARJETA 1: DEUDA TOTAL INICIAL */}
      <div className="relative overflow-hidden p-5 rounded-2xl bg-[#151F32] border border-slate-800 shadow-xl hover:border-slate-700 transition-all group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-colors" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Deuda Total Inicial
          </span>
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Landmark className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl font-black text-white tracking-tight">
          {formatCOP(deudaTotalInicial)}
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800/80">
          <span>{totalDeudas} Obligaciones</span>
          <span className="text-blue-400 font-medium">Base conciliada</span>
        </div>
      </div>

      {/* TARJETA 2: TOTAL PAGADO */}
      <div className="relative overflow-hidden p-5 rounded-2xl bg-[#151F32] border border-slate-800 shadow-xl hover:border-emerald-500/30 transition-all group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-colors" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Total Pagado
          </span>
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl font-black text-emerald-400 tracking-tight">
          {formatCOP(totalPagado)}
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800/80">
          <span>Progreso: {formatPercentage(progresoPorcentaje)}</span>
          <span className="text-emerald-400 font-semibold">{deudasPagadas} Liq.</span>
        </div>
      </div>

      {/* TARJETA 3: SALDO PENDIENTE */}
      <div className="relative overflow-hidden p-5 rounded-2xl bg-[#151F32] border border-slate-800 shadow-xl hover:border-red-500/30 transition-all group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-xl group-hover:bg-red-500/10 transition-colors" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Saldo Pendiente
          </span>
          <div className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl font-black text-white tracking-tight">
          {formatCOP(saldoPendiente)}
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800/80">
          <span className="text-red-400 font-medium">Por amortizar</span>
          <span>{totalDeudas - deudasPagadas} activas</span>
        </div>
      </div>

      {/* TARJETA 4: CUOTAS MENSUALES ACTIVAS */}
      <div className="relative overflow-hidden p-5 rounded-2xl bg-[#151F32] border border-slate-800 shadow-xl hover:border-amber-500/30 transition-all group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition-colors" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Cuotas Activas
          </span>
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Calendar className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl font-black text-white tracking-tight flex items-baseline gap-2">
          <span>{cuotasMensualesActivas}</span>
          <span className="text-xs font-normal text-slate-400">
            ({formatCOP(valorCuotaMensualTotal)}/mes)
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-800/80">
          {cuotasEnMoraTotales > 0 ? (
            <span className="flex items-center gap-1 text-amber-400 font-medium">
              <AlertTriangle className="w-3.5 h-3.5" />
              {cuotasEnMoraTotales} cuotas en mora
            </span>
          ) : (
            <span className="text-emerald-400 font-medium">Al día</span>
          )}
          <span className="text-slate-400">{formatCOP(totalEnMora)} mora</span>
        </div>
      </div>
    </div>
  );
};
