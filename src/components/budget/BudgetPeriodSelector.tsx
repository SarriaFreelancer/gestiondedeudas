"use client";

import React from "react";
import { useBudget } from "@/context/BudgetContext";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Briefcase,
  Clock,
  Coins,
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

export const BudgetPeriodSelector: React.FC = () => {
  const {
    mes,
    anio,
    periodoFiltro,
    modalidadSalario,
    setMes,
    setAnio,
    setPeriodoFiltro,
    setModalidadSalario,
    setIsAddIncomeModalOpen,
    setIsAddExpenseModalOpen,
  } = useBudget();

  const handlePrevMonth = () => {
    if (mes === 1) {
      setMes(12);
      setAnio(anio - 1);
    } else {
      setMes(mes - 1);
    }
  };

  const handleNextMonth = () => {
    if (mes === 12) {
      setMes(1);
      setAnio(anio + 1);
    } else {
      setMes(mes + 1);
    }
  };

  return (
    <div className="p-3.5 sm:p-4 rounded-3xl bg-[#091122] border border-blue-900/40 shadow-xl space-y-3">
      {/* FILA 1: SELECTOR DE MES Y ACCIONES */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Selector de Mes / Año */}
        <div className="flex items-center justify-between w-full sm:w-auto gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Mes anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-white">
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            <span>
              {MESES[mes - 1]} {anio}
            </span>
          </div>

          <button
            onClick={handleNextMonth}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Mes siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Selector Quincenal / Mensual */}
        <div className="w-full sm:w-auto flex items-center justify-center gap-1 bg-slate-900/80 p-1 rounded-2xl border border-slate-800 text-[11px] sm:text-xs">
          <button
            onClick={() => setPeriodoFiltro("MES_COMPLETO")}
            className={`flex-1 sm:flex-initial px-2.5 py-1.5 rounded-xl font-bold transition-all text-center ${
              periodoFiltro === "MES_COMPLETO"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Mes
          </button>

          <button
            onClick={() => setPeriodoFiltro("QUINCENA_1")}
            className={`flex-1 sm:flex-initial px-2.5 py-1.5 rounded-xl font-bold transition-all text-center ${
              periodoFiltro === "QUINCENA_1"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            1ª Quincena
          </button>

          <button
            onClick={() => setPeriodoFiltro("QUINCENA_2")}
            className={`flex-1 sm:flex-initial px-2.5 py-1.5 rounded-xl font-bold transition-all text-center ${
              periodoFiltro === "QUINCENA_2"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            2ª Quincena
          </button>
        </div>

        {/* Botones de Acción Rápida */}
        <div className="w-full sm:w-auto flex items-center justify-center gap-2">
          <button
            onClick={() => setIsAddIncomeModalOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>
              {modalidadSalario === "INDEPENDIENTE" ? "+ Ingreso Diario" : "+ Salario"}
            </span>
          </button>

          <button
            onClick={() => setIsAddExpenseModalOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-bold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Gasto</span>
          </button>
        </div>
      </div>

      {/* FILA 2: SELECTOR DE MODALIDAD DE INGRESOS (QUINCENAL, MENSUAL, INDEPENDIENTE) */}
      <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
          <Coins className="w-3 h-3 text-[#38BDF8]" />
          Modalidad de tus ingresos:
        </span>

        <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800/80 text-[10px]">
          <button
            type="button"
            onClick={() => setModalidadSalario("QUINCENAL")}
            className={`flex-1 sm:flex-initial px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
              modalidadSalario === "QUINCENAL"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>Quincenal</span>
          </button>

          <button
            type="button"
            onClick={() => setModalidadSalario("MENSUAL")}
            className={`flex-1 sm:flex-initial px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
              modalidadSalario === "MENSUAL"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Calendar className="w-3 h-3" />
            <span>Mensual</span>
          </button>

          <button
            type="button"
            onClick={() => setModalidadSalario("INDEPENDIENTE")}
            className={`flex-1 sm:flex-initial px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
              modalidadSalario === "INDEPENDIENTE"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Briefcase className="w-3 h-3" />
            <span>Independiente / Diario</span>
          </button>
        </div>
      </div>
    </div>
  );
};
