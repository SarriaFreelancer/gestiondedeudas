"use client";

import React from "react";
import { formatCOP } from "@/lib/formatters";
import { Wallet, CheckCircle2, DollarSign, CalendarCheck, TrendingUp, TrendingDown } from "lucide-react";

interface BudgetKpiCardsProps {
  totalIngresos: number;
  totalGastosPagados: number;
  saldoDisponible: number;
  totalGastosPendientes: number;
  porcentajeDisponible: number;
}

export const BudgetKpiCards: React.FC<BudgetKpiCardsProps> = ({
  totalIngresos,
  totalGastosPagados,
  saldoDisponible,
  totalGastosPendientes,
  porcentajeDisponible,
}) => {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-4 w-full">
      {/* 1. Salario / Ingreso del Periodo (Azul) */}
      <div className="relative overflow-hidden p-3 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#0E1E38] to-[#0A1426] border border-blue-500/20 shadow-xl flex flex-col justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2.5 mb-2 min-w-0">
          <div className="p-1.5 sm:p-2.5 rounded-xl bg-blue-500/20 text-blue-400 w-fit">
            <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <span className="text-[10px] sm:text-xs font-semibold text-slate-300 truncate">
            Salario / Ingresos
          </span>
        </div>
        <div className="min-w-0">
          <span className="text-xs sm:text-lg md:text-2xl font-black text-white tracking-tight block truncate">
            {formatCOP(totalIngresos)}
          </span>
          <span className="text-[9px] sm:text-[11px] text-blue-300 font-medium mt-1 flex items-center gap-1 truncate">
            <TrendingUp className="w-3 h-3 flex-shrink-0" />
            Flujo del mes
          </span>
        </div>
      </div>

      {/* 2. Total Gastos Pagados (Verde) */}
      <div className="relative overflow-hidden p-3 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#0F2D24] to-[#091D17] border border-emerald-500/20 shadow-xl flex flex-col justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2.5 mb-2 min-w-0">
          <div className="p-1.5 sm:p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 w-fit">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <span className="text-[10px] sm:text-xs font-semibold text-slate-300 truncate">
            Gastos Descontados
          </span>
        </div>
        <div className="min-w-0">
          <span className="text-xs sm:text-lg md:text-2xl font-black text-white tracking-tight block text-emerald-400 truncate">
            {formatCOP(totalGastosPagados)}
          </span>
          <span className="text-[9px] sm:text-[11px] text-emerald-300 font-medium mt-1 flex items-center gap-1 truncate">
            <TrendingDown className="w-3 h-3 text-emerald-400 flex-shrink-0" />
            {(100 - porcentajeDisponible).toFixed(1)}% ejecutado
          </span>
        </div>
      </div>

      {/* 3. Saldo Libre Disponible (Naranja/Verde) */}
      <div className="relative overflow-hidden p-3 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#2D1B11] to-[#1D110B] border border-orange-500/20 shadow-xl flex flex-col justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2.5 mb-2 min-w-0">
          <div className="p-1.5 sm:p-2.5 rounded-xl bg-orange-500/20 text-orange-400 w-fit">
            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <span className="text-[10px] sm:text-xs font-semibold text-slate-300 truncate">
            Saldo Disponible
          </span>
        </div>
        <div className="min-w-0">
          <span className="text-xs sm:text-lg md:text-2xl font-black text-white tracking-tight block text-[#38BDF8] truncate">
            {formatCOP(saldoDisponible)}
          </span>
          <span className="text-[9px] sm:text-[11px] text-orange-300 font-medium mt-1 flex items-center gap-1 truncate">
            {porcentajeDisponible}% restante
          </span>
        </div>
      </div>

      {/* 4. Gastos Pendientes por Descontar (Púrpura) */}
      <div className="relative overflow-hidden p-3 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#241538] to-[#160D24] border border-purple-500/20 shadow-xl flex flex-col justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2.5 mb-2 min-w-0">
          <div className="p-1.5 sm:p-2.5 rounded-xl bg-purple-500/20 text-purple-400 w-fit">
            <CalendarCheck className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <span className="text-[10px] sm:text-xs font-semibold text-slate-300 truncate">
            Gastos por Pagar
          </span>
        </div>
        <div className="min-w-0">
          <span className="text-xs sm:text-lg md:text-2xl font-black text-white tracking-tight block text-purple-300 truncate">
            {formatCOP(totalGastosPendientes)}
          </span>
          <span className="text-[9px] sm:text-[11px] text-purple-400 font-medium mt-1 block truncate">
            Compromisos del mes
          </span>
        </div>
      </div>
    </div>
  );
};
