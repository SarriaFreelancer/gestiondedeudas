"use client";

import React from "react";
import { useBudget } from "@/context/BudgetContext";
import { BudgetPeriodSelector } from "./BudgetPeriodSelector";
import { BudgetKpiCards } from "./BudgetKpiCards";
import { CentralBudgetDonutChart } from "./CentralBudgetDonutChart";
import { BudgetProgressBar } from "./BudgetProgressBar";
import { BudgetCategoryDistributionChart } from "./BudgetCategoryDistributionChart";
import { ExpenseChecklist } from "./ExpenseChecklist";
import { SavingsGoalsSection } from "./SavingsGoalsSection";
import { AddIncomeModal } from "./AddIncomeModal";
import { EditIncomeModal } from "./EditIncomeModal";
import { AddExpenseModal } from "./AddExpenseModal";
import { PayExpenseModal } from "./PayExpenseModal";
import { TransferSurplusModal } from "./TransferSurplusModal";
import { CreateGoalModal } from "./CreateGoalModal";
import { Loader2, Coins, Edit3, Plus, TrendingUp } from "lucide-react";
import { formatCOP } from "@/lib/formatters";

export const BudgetDashboardView: React.FC = () => {
  const {
    summary,
    ingresos,
    loading,
    setIsAddIncomeModalOpen,
    setSelectedIncomeForEdit,
    setIsEditIncomeModalOpen,
    modalidadSalario,
  } = useBudget();

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
      {/* 1. SELECTOR TEMPORAL Y MODALIDAD DE SALARIOS */}
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

      {/* 4. MÓDULO ESTRATÉGICO DE METAS DE AHORRO & RESERVAS BANCARIAS */}
      <SavingsGoalsSection />

      {/* GESTIÓN DE SALARIOS E INGRESOS REGISTRADOS */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#091122] border border-blue-900/30 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Coins className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                {modalidadSalario === "INDEPENDIENTE"
                  ? "Flujo de Ingresos Diarios / Variables"
                  : "Salarios e Ingresos del Mes"}
              </h3>
              <p className="text-[11px] text-slate-400">
                {modalidadSalario === "INDEPENDIENTE"
                  ? "Registros de tus ventas, servicios o ingresos del día a día"
                  : "Haz clic en el lápiz para modificar el monto o quincena"}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAddIncomeModalOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>
              {modalidadSalario === "INDEPENDIENTE" ? "+ Ingreso Diario" : "+ Salario"}
            </span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {ingresos.map((ing) => {
            const fechaStr = new Date(ing.fecha).toLocaleDateString("es-CO", {
              day: "numeric",
              month: "short",
            });

            return (
              <div
                key={ing.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <div>
                  <span className="text-xs font-bold text-white block">
                    {ing.descripcion}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    {ing.periodo === "DIARIO_VARIABLE" ? (
                      <>
                        <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                          {fechaStr}
                        </span>
                        <span className="text-slate-400">• {ing.fuente || "Variable"}</span>
                      </>
                    ) : ing.periodo === "QUINCENA_1" ? (
                      "1ª Quincena (1-15)"
                    ) : ing.periodo === "QUINCENA_2" ? (
                      "2ª Quincena (16-fin)"
                    ) : (
                      "Mes Completo"
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-black text-white font-mono">
                    {formatCOP(ing.monto)}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedIncomeForEdit(ing);
                      setIsEditIncomeModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-600/20 text-slate-300 hover:text-emerald-400 border border-slate-700 transition-colors"
                    title="Editar este salario o ingreso"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {ingresos.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-3 col-span-2">
              No tienes ingresos registrados este mes. Pulsa &quot;+ Salario&quot; o &quot;+ Ingreso Diario&quot; para agregarlo.
            </p>
          )}
        </div>
      </div>

      {/* 5. BARRA DE PROGRESO */}
      <BudgetProgressBar porcentajeDisponible={porcentajeDisponible} />

      {/* 6. DISTRIBUCIÓN POR CATEGORÍA (MINI DONUT + LISTA) */}
      <BudgetCategoryDistributionChart
        distribucion={distribucionPorCategoria}
        totalGastos={totalGastosPresupuestados}
      />

      {/* 7. CHECKLIST DE GASTOS FIJOS Y VARIABLES */}
      <ExpenseChecklist />

      {/* MODALES */}
      <AddIncomeModal />
      <EditIncomeModal />
      <AddExpenseModal />
      <PayExpenseModal />
      <TransferSurplusModal />
      <CreateGoalModal />
    </div>
  );
};
