"use client";

import React from "react";
import { useFinancial } from "@/context/FinancialContext";
import { formatCOP } from "@/lib/formatters";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  History,
  TrendingDown,
  ArrowRight,
  RotateCcw,
} from "lucide-react";

const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export const DebtMonthSelector: React.FC = () => {
  const {
    mesSeleccionado,
    anioSeleccionado,
    esMesActual,
    setMesSeleccionado,
    setAnioSeleccionado,
    irAMesActual,
    summary,
  } = useFinancial();

  const handlePrevMonth = () => {
    if (mesSeleccionado === 1) {
      setMesSeleccionado(12);
      setAnioSeleccionado(anioSeleccionado - 1);
    } else {
      setMesSeleccionado(mesSeleccionado - 1);
    }
  };

  const handleNextMonth = () => {
    if (mesSeleccionado === 12) {
      setMesSeleccionado(1);
      setAnioSeleccionado(anioSeleccionado + 1);
    } else {
      setMesSeleccionado(mesSeleccionado + 1);
    }
  };

  const {
    saldoInicioMes = 0,
    totalAbonadoEnMes = 0,
    saldoCierreMes = 0,
    deudaActualEnVivo = 0,
  } = summary || {};

  return (
    <div className="p-3.5 sm:p-4 rounded-3xl bg-[#091122] border border-blue-900/40 shadow-2xl space-y-3">
      {/* BARRA SUPERIOR: CONTROLES DE NAVEGACIÓN TEMPORAL */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center justify-between w-full sm:w-auto gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-blue-500/50 transition-colors"
            title="Mes anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-blue-500/30 text-xs sm:text-sm font-bold text-white shadow-inner">
            <Calendar className="w-4 h-4 text-[#38BDF8]" />
            <span>
              {MESES[mesSeleccionado - 1]} {anioSeleccionado}
            </span>
            {esMesActual && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-blue-500/20 text-[#38BDF8] border border-blue-400/30">
                ACTUAL
              </span>
            )}
          </div>

          <button
            onClick={handleNextMonth}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-blue-500/50 transition-colors"
            title="Mes siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* ACCIÓN RÁPIDA: VOLVER AL MES ACTUAL SI ESTÁ EN EL PASADO O FUTURO */}
        {!esMesActual ? (
          <button
            onClick={irAMesActual}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold transition-all shadow-lg shadow-cyan-500/20"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Volver a Mes Actual (Lo que debo hoy)</span>
          </button>
        ) : (
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Trazabilidad en tiempo real activa</span>
          </div>
        )}
      </div>

      {/* CINTA DE TRAZABILIDAD MENSUAL (INICIO, ABONADO, CIERRE) */}
      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800/80 text-center">
        <div className="p-2 rounded-2xl bg-slate-900/60 border border-slate-800/80 overflow-hidden">
          <span className="text-[10px] text-slate-400 block font-medium truncate">
            Debías al Iniciar
          </span>
          <span className="text-[11px] sm:text-xs md:text-sm font-bold text-slate-200 truncate block" title={formatCOP(saldoInicioMes)}>
            {formatCOP(saldoInicioMes)}
          </span>
        </div>

        <div className="p-2 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 overflow-hidden">
          <span className="text-[10px] text-emerald-300 block font-bold flex items-center justify-center gap-1 truncate">
            <TrendingDown className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">Abonaste</span>
          </span>
          <span className="text-[11px] sm:text-xs md:text-sm font-black text-emerald-400 truncate block" title={totalAbonadoEnMes > 0 ? `-${formatCOP(totalAbonadoEnMes)}` : "$0"}>
            {totalAbonadoEnMes > 0 ? `-${formatCOP(totalAbonadoEnMes)}` : "$0"}
          </span>
        </div>

        <div className="p-2 rounded-2xl bg-slate-900/60 border border-slate-800/80 overflow-hidden">
          <span className="text-[10px] text-slate-400 block font-medium truncate">
            {esMesActual ? "Debes Hoy" : "Cerraste"}
          </span>
          <span className="text-[11px] sm:text-xs md:text-sm font-bold text-[#38BDF8] truncate block" title={formatCOP(saldoCierreMes)}>
            {formatCOP(saldoCierreMes)}
          </span>
        </div>
      </div>

      {!esMesActual && (
        <div className="p-2 rounded-xl bg-blue-950/30 border border-blue-500/20 text-[11px] text-blue-300 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
            <span>
              Corte histórico de <b>{MESES[mesSeleccionado - 1]} {anioSeleccionado}</b>. Tu saldo real hoy es{" "}
              <b>{formatCOP(deudaActualEnVivo)}</b>.
            </span>
          </div>
          <button
            onClick={irAMesActual}
            className="text-[10px] underline font-bold hover:text-white flex-shrink-0"
          >
            Ver hoy
          </button>
        </div>
      )}
    </div>
  );
};
