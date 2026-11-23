"use client";

import React from "react";
import { useBudget } from "@/context/BudgetContext";
import { BudgetPeriodSelector } from "./BudgetPeriodSelector";
import { BudgetKpiCards } from "./BudgetKpiCards";
import { CentralBudgetDonutChart } from "./CentralBudgetDonutChart";
import { BudgetProgressBar } from "./BudgetProgressBar";
import { BudgetCategoryDistributionChart } from "./BudgetCategoryDistributionChart";
import { ExpenseChecklist } from "./ExpenseChecklist";
import { AddIncomeModal } from "./AddIncomeModal";
import { AddExpenseModal } from "./AddExpenseModal";
import { PayExpenseModal } from "./PayExpenseModal";
import { Loader2 } from "lucide-react";

export const BudgetDashboardView: React.FC = () => {
  const { summary, loading } = useBudget();

  if (loading && !summary) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        <p className="text-sm font-semibold text-slate-400">
          Cargando tu presupuesto y flujo de caja...
        </p>
      </div>
    );
  }

  const {
    totalIngresos = 0,
    totalGastosPagados = 0,
    saldoDisponible = 0,
    totalGastosPendientes = 0,
    porcentajeDisponible = 100,
    distribucionPorCategoria = [],
    totalGastosPresupuestados = 0,
  } = summary || {};

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-300">
      {/* 1. SELECTOR QUINCENAL / MENSUAL */}
      <BudgetPeriodSelector />

      {/* 2. 4 TARJETAS KPIS 2X2 */}
      <BudgetKpiCards
        totalIngresos={totalIngresos}
        totalGastosPagados={totalGastosPagados}
        saldoDisponible={saldoDisponible}
        totalGastosPendientes={totalGastosPendientes}
        porcentajeDisponible={porcentajeDisponible}
      />

      {/* 3. DONUT CENTRAL PROTAGONISTA DE SALARIO / DISPONIBLE */}
      <CentralBudgetDonutChart
        saldoDisponible={saldoDisponible}
        totalGastosPagados={totalGastosPagados}
        totalIngresos={totalIngresos}
        porcentajeDisponible={porcentajeDisponible}
      />

      {/* 4. BARRA DE PROGRESO */}
      <BudgetProgressBar porcentajeDisponible={porcentajeDisponible} />

      {/* 5. DISTRIBUCIÓN POR CATEGORÍA (MINI DONUT + LISTA) */}
      <BudgetCategoryDistributionChart
        distribucion={distribucionPorCategoria}
        totalGastos={totalGastosPresupuestados}
      />

      {/* 6. CHECKLIST DE GASTOS FIJOS Y VARIABLES */}
      <ExpenseChecklist />

      {/* MODALES */}
      <AddIncomeModal />
      <AddExpenseModal />
      <PayExpenseModal />
    </div>
  );
};
