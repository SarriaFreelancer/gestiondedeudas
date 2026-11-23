"use client";

import React from "react";
import { formatCOP, formatPercentage } from "@/lib/formatters";
import { Coins, CheckCircle, Wallet, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface KpiCardsProps {
  deudaTotalInicial: number;
  totalPagado: number;
  saldoPendiente: number;
  progresoPorcentaje: number;
  cuotasMensualesActivas: number;
  cuotasEnMoraTotales?: number;
  totalEnMora?: number;
  valorCuotaMensualTotal?: number;
  totalDeudas?: number;
  deudasPagadas?: number;
}

export const KpiCards: React.FC<KpiCardsProps> = ({
  deudaTotalInicial,
  totalPagado,
  saldoPendiente,
  progresoPorcentaje,
  cuotasMensualesActivas,
}) => {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-4 w-full">
      {/* TARJETA 1: DEUDA TOTAL INICIAL (AZUL) */}
      <div className="relative overflow-hidden p-3 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#0F284E] via-[#0A1B36] to-[#071326] border border-blue-500/30 shadow-xl shadow-blue-950/30 transition-all hover:scale-[1.01]">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-400 shadow-inner flex-shrink-0">
            <Coins className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-300 truncate">
              Deuda Total Inicial
            </span>
            <span className="text-xs sm:text-lg md:text-2xl font-black text-white tracking-tight mt-0.5 truncate">
              {formatCOP(deudaTotalInicial)}
            </span>
          </div>
        </div>
      </div>

      {/* TARJETA 2: TOTAL PAGADO (VERDE) */}
      <div className="relative overflow-hidden p-3 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#0C3D28] via-[#082B1C] to-[#051C12] border border-emerald-500/30 shadow-xl shadow-emerald-950/30 transition-all hover:scale-[1.01]">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/40 flex-shrink-0">
            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 fill-slate-950 text-emerald-400" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-300 truncate">
              Total Pagado
            </span>
            <span className="text-xs sm:text-lg md:text-2xl font-black text-white tracking-tight mt-0.5 truncate">
              {formatCOP(totalPagado)}
            </span>
            <div className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-emerald-400 mt-0.5">
              <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>{formatPercentage(progresoPorcentaje, 1)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* TARJETA 3: SALDO PENDIENTE (NARANJA / ROJO) */}
      <div className="relative overflow-hidden p-3 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#45180E] via-[#2D1009] to-[#1C0A06] border border-orange-500/30 shadow-xl shadow-orange-950/30 transition-all hover:scale-[1.01]">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-md shadow-orange-500/40 flex-shrink-0">
            <Wallet className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-300 truncate">
              Saldo Pendiente
            </span>
            <span className="text-xs sm:text-lg md:text-2xl font-black text-white tracking-tight mt-0.5 truncate">
              {formatCOP(saldoPendiente)}
            </span>
          </div>
        </div>
      </div>

      {/* TARJETA 4: CUOTAS ACTIVAS (VIOLETA / PÚRPURA) */}
      <div className="relative overflow-hidden p-3 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#24174D] via-[#170E35] to-[#0F0924] border border-purple-500/30 shadow-xl shadow-purple-950/30 transition-all hover:scale-[1.01]">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl bg-purple-600/30 border border-purple-400/30 flex items-center justify-center text-purple-300 shadow-inner flex-shrink-0">
            <Calendar className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-300 truncate">
              Cuotas Activas
            </span>
            <div className="flex items-baseline gap-1.5 sm:gap-2 mt-0.5">
              <span className="text-xs sm:text-lg md:text-2xl font-black text-white tracking-tight">
                {cuotasMensualesActivas}
              </span>
              <span className="flex items-center text-[10px] sm:text-xs font-bold text-emerald-400">
                <ArrowDownRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>3</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
