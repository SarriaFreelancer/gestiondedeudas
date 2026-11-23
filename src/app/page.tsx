"use client";

import React from "react";
import { useFinancial } from "@/context/FinancialContext";
import { CentralDonutChart } from "@/components/dashboard/CentralDonutChart";
import { KpiCards } from "@/components/dashboard/KpiCards";
import { CreditorDistributionChart } from "@/components/dashboard/CreditorDistributionChart";
import { ProgressBar } from "@/components/dashboard/ProgressBar";
import {
  Sparkles,
  PiggyBank,
  CheckSquare,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { formatCOP } from "@/lib/formatters";

export default function DashboardPage() {
  const { summary, loading, setIsAbonoModalOpen, deudas, setSelectedDeudaForPayment, setSelectedCuotaForPayment, setIsPaymentModalOpen } = useFinancial();

  if (loading && !summary) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-sm font-semibold text-slate-400">
          Cargando métricas de libertad financiera...
        </p>
      </div>
    );
  }

  const {
    deudaTotalInicial = 14383620,
    totalPagado = 0,
    saldoPendiente = 14383620,
    progresoPorcentaje = 0,
    cuotasMensualesActivas = 0,
    cuotasEnMoraTotales = 0,
    totalEnMora = 0,
    valorCuotaMensualTotal = 0,
    totalDeudas = 5,
    deudasPagadas = 0,
    distribucionPorEntidad = [],
  } = summary || {};

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* HEADER DE BIENVENIDA & ACCIONES RÁPIDAS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-[#151F32] via-[#151F32]/80 to-blue-950/40 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[11px] font-bold uppercase tracking-wider">
              Panel Financiero Personal
            </span>
            <span className="text-slate-500 text-xs">•</span>
            <span className="text-xs text-slate-400">Meta: Deuda Cero</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            MI LIBERTAD FINANCIERA
            <Sparkles className="w-5 h-5 text-emerald-400 hidden sm:inline" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Monitorea el progreso de pago de tus 5 obligaciones, registra abonos extraordinarios y
            observa el gráfico central reducirse hasta cancelar todas tus deudas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsAbonoModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/30"
          >
            <PiggyBank className="w-4 h-4" />
            <span>Registrar Abono</span>
          </button>

          <Link
            href="/cuotas"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <CheckSquare className="w-4 h-4 text-emerald-400" />
            <span>Ver Cuotas</span>
          </Link>
        </div>
      </div>

      {/* SECCIÓN 3.2: 4 TARJETAS INDICADORES (KPIS) */}
      <KpiCards
        deudaTotalInicial={deudaTotalInicial}
        totalPagado={totalPagado}
        saldoPendiente={saldoPendiente}
        progresoPorcentaje={progresoPorcentaje}
        cuotasMensualesActivas={cuotasMensualesActivas}
        cuotasEnMoraTotales={cuotasEnMoraTotales}
        totalEnMora={totalEnMora}
        valorCuotaMensualTotal={valorCuotaMensualTotal}
        totalDeudas={totalDeudas}
        deudasPagadas={deudasPagadas}
      />

      {/* SECCIÓN 3.1: GRÁFICO CIRCULAR CENTRAL (PROTAGONISTA DEL DASHBOARD) */}
      <div className="w-full">
        <CentralDonutChart
          saldoPendiente={saldoPendiente}
          totalPagado={totalPagado}
          deudaTotalInicial={deudaTotalInicial}
          progresoPorcentaje={progresoPorcentaje}
        />
      </div>

      {/* SECCIÓN 3.4: BARRA DE PROGRESO GENERAL HORIZONTAL */}
      <ProgressBar
        progresoPorcentaje={progresoPorcentaje}
        totalPagado={totalPagado}
        saldoPendiente={saldoPendiente}
      />

      {/* SECCIÓN 3.3: GRÁFICO DE DISTRIBUCIÓN POR ENTIDAD Y RESUMEN DE CUOTAS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CreditorDistributionChart
          distribucion={distribucionPorEntidad}
          saldoPendienteTotal={saldoPendiente}
        />

        {/* TARJETA DE PRÓXIMAS CUOTAS / OBLIGACIONES EN MORA */}
        <div className="p-6 rounded-3xl bg-[#151F32] border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                    Prioridad Inmediata
                  </h3>
                  <p className="text-xs text-slate-400">Obligaciones en mora y próximas cuotas</p>
                </div>
              </div>

              <Link
                href="/cuotas"
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
              >
                <span>Ver todas</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {deudas
                .filter((d) => d.cuotasEnMora > 0 || d.estado === "EN_MORA")
                .map((d) => (
                  <div
                    key={d.id}
                    className="p-3.5 rounded-2xl bg-slate-900/90 border border-red-500/20 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{d.entidad}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                          {d.cuotasEnMora} en mora
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Mora reportada:{" "}
                        <span className="text-amber-400 font-semibold">
                          {formatCOP(d.valorVencidoMora)}
                        </span>
                      </p>
                    </div>

                    <div className="text-right flex flex-col items-end gap-1">
                      <span className="text-xs font-bold text-slate-200">
                        {formatCOP(d.valorCuotaMensual)}/cuota
                      </span>
                      <button
                        onClick={() => {
                          const cuotaVencida = d.cuotas.find(
                            (c) => c.estado === "VENCIDA" || c.esMora
                          );
                          if (cuotaVencida) {
                            setSelectedDeudaForPayment(d);
                            setSelectedCuotaForPayment(cuotaVencida);
                            setIsPaymentModalOpen(true);
                          } else {
                            setIsAbonoModalOpen(true);
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold transition-colors"
                      >
                        Poner al día
                      </button>
                    </div>
                  </div>
                ))}

              {deudas.filter((d) => d.cuotasEnMora > 0).length === 0 && (
                <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 text-center">
                  <p className="text-xs font-semibold text-emerald-400">
                    ¡No tienes cuotas en mora registradas!
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Continúa con los pagos programados para mantenerte al día.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Estrategia recomendada:</span>
            <Link
              href="/reportes"
              className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Método Bola de Nieve
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
