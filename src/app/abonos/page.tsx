"use client";

import React, { useState } from "react";
import { useFinancial } from "@/context/FinancialContext";
import { formatCOP, formatDate } from "@/lib/formatters";
import { PiggyBank, PlusCircle, CreditCard, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";

export default function AbonosPage() {
  const { deudas, setIsAbonoModalOpen, setSelectedDeudaForPayment } = useFinancial();

  // Deudas rotativas o de tarjeta (NU, TARJETA DE CRÉDITO DAVIBANK) y deudas con cuotas
  const deudasSinCuotas = deudas.filter((d) => !d.tieneCuotas);
  const deudasConCuotas = deudas.filter((d) => d.tieneCuotas);

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#151F32] border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <PiggyBank className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">Módulo de Abonos & Amortización</h1>
            <p className="text-xs text-slate-400">
              Registra pagos extraordinarios, abonos libres a Nu y Davibank, o liquidaciones totales
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAbonoModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/30"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Nuevo Abono Extraordinario</span>
        </button>
      </div>

      {/* SECCIÓN 1: LÍNEAS ROTATIVAS / SIN PLAN FIJO (NU & TARJETA DE CRÉDITO DAVIBANK) */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
            Obligaciones de Amortización Libre (Sin cuota fija)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {deudasSinCuotas.map((deuda) => {
            const saldo = Number(deuda.saldoPendiente);
            const montoIni = Number(deuda.montoInicial);
            const pagado = Math.max(0, montoIni - saldo);
            const pct = montoIni > 0 ? (pagado / montoIni) * 100 : 0;
            const esPagada = saldo <= 0;

            return (
              <div
                key={deuda.id}
                className="p-6 rounded-3xl bg-[#151F32] border border-slate-800 shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-black text-white">{deuda.entidad}</h3>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      Línea Libre
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mb-4">{deuda.observaciones}</p>

                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800/80 mb-4">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">
                      Saldo Actual Pendiente
                    </span>
                    <div className="text-2xl font-black text-white mt-1">{formatCOP(saldo)}</div>
                    <div className="flex justify-between text-xs text-slate-400 mt-2 pt-2 border-t border-slate-800">
                      <span>Monto Inicial: {formatCOP(montoIni)}</span>
                      <span className="text-emerald-400 font-semibold">{pct.toFixed(2)}% pagado</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      setSelectedDeudaForPayment(deuda);
                      setIsAbonoModalOpen(true);
                    }}
                    disabled={esPagada}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/30 disabled:opacity-50"
                  >
                    <span>Realizar Abono</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECCIÓN 2: ABONOS EXTRAORDINARIOS A CRÉDITOS FIJOS (NEQUI, DAVIVIENDA, CRÉDITO 20 MINUTOS) */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
            Aceleración de Créditos Fijos (Abonos extraordinarios a capital o mora)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {deudasConCuotas.map((deuda) => (
            <div
              key={deuda.id}
              className="p-5 rounded-2xl bg-[#151F32] border border-slate-800 shadow-lg flex flex-col justify-between"
            >
              <div>
                <h3 className="font-bold text-white text-base">{deuda.entidad}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Saldo: <span className="text-slate-100 font-semibold">{formatCOP(deuda.saldoPendiente)}</span>
                </p>
                <p className="text-xs text-slate-400">
                  Cuota: <span className="text-slate-200">{formatCOP(deuda.valorCuotaMensual)}</span> ({deuda.cuotasPendientes} cuotas restantes)
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedDeudaForPayment(deuda);
                  setIsAbonoModalOpen(true);
                }}
                className="mt-4 w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-blue-400 border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
              >
                <PiggyBank className="w-4 h-4" />
                <span>Abonar Extraordinario</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
