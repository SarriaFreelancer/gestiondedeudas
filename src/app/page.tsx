"use client";

import React, { useState } from "react";
import { useFinancial } from "@/context/FinancialContext";
import { MountainHero } from "@/components/dashboard/MountainHero";
import { KpiCards } from "@/components/dashboard/KpiCards";
import { CentralDonutChart } from "@/components/dashboard/CentralDonutChart";
import { ProgressBar } from "@/components/dashboard/ProgressBar";
import { CreditorDistributionChart } from "@/components/dashboard/CreditorDistributionChart";
import { DebtMonthSelector } from "@/components/dashboard/DebtMonthSelector";
import { BudgetDashboardView } from "@/components/budget/BudgetDashboardView";
import { Loader2, Coins, Landmark } from "lucide-react";

export default function DashboardPage() {
  const { summary, loading } = useFinancial();
  const [activeView, setActiveView] = useState<"DEUDAS" | "PRESUPUESTO">("DEUDAS");

  if (loading && !summary) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-sm font-semibold text-slate-400">
          Cargando tu libertad financiera...
        </p>
      </div>
    );
  }

  const {
    deudaTotalInicial = 14383620,
    totalPagado = 0,
    saldoPendiente = 14383620,
    progresoPorcentaje = 0,
    cuotasMensualesActivas = 81,
    distribucionPorEntidad = [],
  } = summary || {};

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-300">
      {/* 1. CABECERA DE MONTAÑA IDÉNTICA A LA FOTO */}
      <MountainHero />

      {/* 2. SELECTOR MODERNO DE VISTA PRINCIPAL (DEUDAS VS PRESUPUESTO) */}
      <div className="flex items-center justify-center p-1.5 rounded-2xl bg-[#091122] border border-blue-900/40 max-w-md mx-auto shadow-2xl">
        <button
          onClick={() => setActiveView("DEUDAS")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all duration-200 ${
            activeView === "DEUDAS"
              ? "bg-[#2F80ED] text-white shadow-lg shadow-blue-600/40 scale-[1.02]"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Landmark className="w-4 h-4" />
          <span>Mis Deudas & Libertad</span>
        </button>

        <button
          onClick={() => setActiveView("PRESUPUESTO")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all duration-200 ${
            activeView === "PRESUPUESTO"
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/40 scale-[1.02]"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>Presupuesto & Salario</span>
        </button>
      </div>

      {/* VISTA 1: CONTROL DE DEUDAS (INTERFAZ ORIGINAL) */}
      {activeView === "DEUDAS" ? (
        <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
          {/* SELECTOR TEMPORAL Y TRAZABILIDAD MENSUAL DE DEUDAS */}
          <DebtMonthSelector />

          {/* LAS 4 TARJETAS DE KPIS EN GRID 2X2 */}
          <KpiCards
            deudaTotalInicial={deudaTotalInicial}
            totalPagado={totalPagado}
            saldoPendiente={saldoPendiente}
            progresoPorcentaje={progresoPorcentaje}
            cuotasMensualesActivas={cuotasMensualesActivas || 81}
          />

          {/* GRÁFICO CIRCULAR DONUT PROTAGÓNICO */}
          <CentralDonutChart
            saldoPendiente={saldoPendiente}
            totalPagado={totalPagado}
            deudaTotalInicial={deudaTotalInicial}
            progresoPorcentaje={progresoPorcentaje}
          />

          {/* BARRA DE PROGRESO GENERAL CON TROFEO */}
          <ProgressBar progresoPorcentaje={progresoPorcentaje} />

          {/* DISTRIBUCIÓN DE TU DEUDA (MINI DONUT + LISTA) */}
          <CreditorDistributionChart
            distribucion={distribucionPorEntidad}
            saldoPendienteTotal={saldoPendiente}
          />
        </div>
      ) : (
        /* VISTA 2: SEGUNDA INTERFAZ COMPLETA (PRESUPUESTO & FLUJO DE CAJA) */
        <BudgetDashboardView />
      )}
    </div>
  );
}
