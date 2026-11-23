"use client";

import React from "react";
import { MountainHero } from "@/components/dashboard/MountainHero";
import { BudgetDashboardView } from "@/components/budget/BudgetDashboardView";
import Link from "next/link";
import { ArrowLeft, Wallet } from "lucide-react";

export default function PresupuestoPage() {
  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-300">
      {/* CABECERA DE MONTAÑA */}
      <MountainHero />

      {/* TÍTULO Y RETORNO */}
      <div className="flex items-center justify-between p-4 rounded-3xl bg-[#091122] border border-blue-900/30">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-white">
              Presupuesto & Salario (Flujo de Caja)
            </h1>
            <p className="text-xs text-slate-400">
              Descuenta alquiler, facturas y servicios de tus ingresos mensuales o quincenales
            </p>
          </div>
        </div>

        <Link
          href="/"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-300 border border-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Ver Deudas</span>
        </Link>
      </div>

      {/* VISTA DEL DASHBOARD DE PRESUPUESTO */}
      <BudgetDashboardView />
    </div>
  );
}
