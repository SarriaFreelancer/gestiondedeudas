"use client";

import React from "react";
import { useFinancial } from "@/context/FinancialContext";
import { MountainHero } from "@/components/dashboard/MountainHero";
import { KpiCards } from "@/components/dashboard/KpiCards";
import { CentralDonutChart } from "@/components/dashboard/CentralDonutChart";
import { ProgressBar } from "@/components/dashboard/ProgressBar";
import { CreditorDistributionChart } from "@/components/dashboard/CreditorDistributionChart";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { summary, loading } = useFinancial();

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

      {/* 2. LAS 4 TARJETAS DE KPIS EN GRID 2X2 */}
      <KpiCards
        deudaTotalInicial={deudaTotalInicial}
        totalPagado={totalPagado}
        saldoPendiente={saldoPendiente}
        progresoPorcentaje={progresoPorcentaje}
        cuotasMensualesActivas={cuotasMensualesActivas || 81}
      />

      {/* 3. GRÁFICO CIRCULAR DONUT PROTAGÓNICO */}
      <CentralDonutChart
        saldoPendiente={saldoPendiente}
        totalPagado={totalPagado}
        deudaTotalInicial={deudaTotalInicial}
        progresoPorcentaje={progresoPorcentaje}
      />

      {/* 4. BARRA DE PROGRESO GENERAL CON TROFEO */}
      <ProgressBar progresoPorcentaje={progresoPorcentaje} />

      {/* 5. DISTRIBUCIÓN DE TU DEUDA (MINI DONUT + LISTA) */}
      <CreditorDistributionChart
        distribucion={distribucionPorEntidad}
        saldoPendienteTotal={saldoPendiente}
      />
    </div>
  );
}
