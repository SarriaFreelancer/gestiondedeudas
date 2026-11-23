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
    <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full">
      {/* TARJETA 1: DEUDA TOTAL INICIAL (AZUL) */}
      <div className="relative overflow-hidden p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#0F284E] via-[#0A1B36] to-[#071326] border border-blue-500/30 shadow-xl shadow-blue-950/30 transition-all hover:scale-[1.01]">
        <div className="flex items-center gap-3">
          {/* Icono de Monedas Apiladas Azul */}
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-400 shadow-inner flex-shrink-0">
            <Coins className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-300">
              Deuda Total Inicial
            </span>
            <span className="text-base sm:text-2xl font-black text-white tracking-tight mt-0.5">
              {formatCOP(deudaTotalInicial)}
            </span>
          </div>
        </div>
      </div>

      {/* TARJETA 2: TOTAL PAGADO (VERDE) */}
      <div className="relative overflow-hidden p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#0C3D28] via-[#082B1C] to-[#051C12] border border-emerald-500/30 shadow-xl shadow-emerald-950/30 transition-all hover:scale-[1.01]">
        <div className="flex items-center gap-3">
          {/* Icono Checkmark Verde */}
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/40 flex-shrink-0">
            <CheckCircle className="w-6 h-6 fill-slate-950 text-emerald-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-300">
              Total Pagado
            </span>
            <span className="text-base sm:text-2xl font-black text-white tracking-tight mt-0.5">
              {formatCOP(totalPagado)}
            </span>
            <div className="flex items-center gap-1 text-[11px] sm:text-xs font-bold text-emerald-400 mt-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>{formatPercentage(progresoPorcentaje, 1)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* TARJETA 3: SALDO PENDIENTE (NARANJA / ROJO) */}
      <div className="relative overflow-hidden p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#45180E] via-[#2D1009] to-[#1C0A06] border border-orange-500/30 shadow-xl shadow-orange-950/30 transition-all hover:scale-[1.01]">
        <div className="flex items-center gap-3">
          {/* Icono Billetera Naranja */}
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-md shadow-orange-500/40 flex-shrink-0">
            <Wallet className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-300">
              Saldo Pendiente
            </span>
            <span className="text-base sm:text-2xl font-black text-white tracking-tight mt-0.5">
              {formatCOP(saldoPendiente)}
            </span>
          </div>
        </div>
      </div>

      {/* TARJETA 4: CUOTAS ACTIVAS (VIOLETA / PÚRPURA) */}
      <div className="relative overflow-hidden p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#24174D] via-[#170E35] to-[#0F0924] border border-purple-500/30 shadow-xl shadow-purple-950/30 transition-all hover:scale-[1.01]">
        <div className="flex items-center gap-3">
          {/* Icono Calendario Morado */}
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-purple-600/30 border border-purple-400/30 flex items-center justify-center text-purple-300 shadow-inner flex-shrink-0">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-300">
              Cuotas Activas
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-base sm:text-2xl font-black text-white tracking-tight">
                {cuotasMensualesActivas}
              </span>
              <span className="flex items-center text-[11px] sm:text-xs font-bold text-emerald-400">
                <ArrowDownRight className="w-3.5 h-3.5" />
                <span>3</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
