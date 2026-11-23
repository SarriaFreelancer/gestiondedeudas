"use client";

import React from "react";
import { useBudget } from "@/context/BudgetContext";
import { Calendar, ChevronLeft, ChevronRight, Plus } from "lucide-react";

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
    setMes,
    setAnio,
    setPeriodoFiltro,
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
    <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-4 rounded-3xl bg-[#091122] border border-blue-900/30 shadow-xl">
      {/* Selector de Mes / Año */}
      <div className="flex items-center gap-2">
        <button
          onClick={handlePrevMonth}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
          title="Mes anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-white">
          <Calendar className="w-4 h-4 text-blue-400" />
          <span>
            {MESES[mes - 1]} {anio}
          </span>
        </div>

        <button
          onClick={handleNextMonth}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
          title="Mes siguiente"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Selector Quincenal / Mensual */}
      <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-2xl border border-slate-800 text-xs">
        <button
          onClick={() => setPeriodoFiltro("MES_COMPLETO")}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
            periodoFiltro === "MES_COMPLETO"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Mes Completo
        </button>

        <button
          onClick={() => setPeriodoFiltro("QUINCENA_1")}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
            periodoFiltro === "QUINCENA_1"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          1ª Quincena (1-15)
        </button>

        <button
          onClick={() => setPeriodoFiltro("QUINCENA_2")}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
            periodoFiltro === "QUINCENA_2"
              ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          2ª Quincena (16-fin)
        </button>
      </div>

      {/* Botones de Acción Rápida */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsAddIncomeModalOpen(true)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Ingresar Salario</span>
        </button>

        <button
          onClick={() => setIsAddExpenseModalOpen(true)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-bold transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nuevo Gasto</span>
        </button>
      </div>
    </div>
  );
};
