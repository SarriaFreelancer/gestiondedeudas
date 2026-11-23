"use client";

import React, { useState } from "react";
import { useFinancial } from "@/context/FinancialContext";
import { formatCOP, formatPercentage } from "@/lib/formatters";
import {
  WalletCards,
  PlusCircle,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  PiggyBank,
  CheckSquare,
  Trash2,
  ExternalLink,
  CreditCard,
} from "lucide-react";
import Link from "next/link";
import { CreateDebtModal } from "@/components/debts/CreateDebtModal";

export default function DeudasPage() {
  const { deudas, refreshData, setSelectedDeudaForPayment, setIsAbonoModalOpen } = useFinancial();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeleteDebt = async (id: string, entidad: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar la deuda '${entidad}'? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      setDeletingId(id);
      const res = await fetch(`/api/deudas/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "No se pudo eliminar la deuda");
      } else {
        await refreshData();
      }
    } catch (e: any) {
      alert(e.message || "Error al eliminar");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#151F32] border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <WalletCards className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">Módulo de Gestión de Deudas</h1>
            <p className="text-xs text-slate-400">
              Control individual de tus 5 obligaciones comerciales y planes de pago
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/30"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Nueva Obligación</span>
        </button>
      </div>

      {/* LISTA DE TARJETAS DE DEUDA */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {deudas.map((deuda) => {
          const montoIni = Number(deuda.montoInicial);
          const saldoPend = Number(deuda.saldoPendiente);
          const totalPag = Math.max(0, montoIni - saldoPend);
          const progreso = montoIni > 0 ? (totalPag / montoIni) * 100 : 0;
          const esMora = deuda.estado === "EN_MORA" || deuda.cuotasEnMora > 0;
          const esPagada = deuda.estado === "PAGADA" || saldoPend <= 0;

          return (
            <div
              key={deuda.id}
              className={`relative overflow-hidden p-6 rounded-3xl bg-[#151F32] border transition-all duration-300 flex flex-col justify-between ${
                esPagada
                  ? "border-emerald-500/40 shadow-emerald-500/10"
                  : esMora
                  ? "border-red-500/40 hover:border-red-500/70 shadow-red-500/10"
                  : "border-slate-800 hover:border-slate-700"
              } shadow-xl`}
            >
              <div>
                {/* CABECERA DE LA TARJETA */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-lg font-black text-white tracking-tight">{deuda.entidad}</h3>
                    {deuda.referencia && (
                      <span className="text-[11px] font-mono text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
                        Ref: {deuda.referencia}
                      </span>
                    )}
                  </div>

                  {/* BADGE DE ESTADO */}
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${
                      esPagada
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                        : esMora
                        ? "bg-red-500/20 text-red-400 border-red-500/30"
                        : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                    }`}
                  >
                    {deuda.estado.replace("_", " ")}
                  </span>
                </div>

                {/* SALDO PENDIENTE PROTAGONISTA */}
                <div className="my-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80">
                  <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                    Saldo Pendiente Actual
                  </span>
                  <div className="text-2xl font-black text-white mt-0.5">
                    {formatCOP(saldoPend)}
                  </div>

                  {/* BARRA DE PROGRESO INDIVIDUAL */}
                  <div className="mt-3">
                    <div className="flex justify-between text-[11px] text-slate-400 font-semibold mb-1">
                      <span>Progreso de pago</span>
                      <span className="text-emerald-400">{formatPercentage(progreso)}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                        style={{ width: `${Math.min(100, Math.max(0, progreso))}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* DATOS DETALLADOS REQUERIDOS */}
                <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-800/80">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Monto Original</span>
                    <span className="font-semibold text-slate-200">{formatCOP(montoIni)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Total Pagado</span>
                    <span className="font-semibold text-emerald-400">{formatCOP(totalPag)}</span>
                  </div>

                  {deuda.tieneCuotas ? (
                    <>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Valor de Cuota</span>
                        <span className="font-semibold text-slate-200">
                          {formatCOP(deuda.valorCuotaMensual)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Cuotas</span>
                        <span className="font-semibold text-slate-200">
                          {deuda.cuotasTotales - deuda.cuotasPendientes} / {deuda.cuotasTotales} (
                          {deuda.cuotasPendientes} restan)
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="col-span-2 text-slate-400 text-[11px] italic">
                      Línea rotativa / Sin cuota fija (Permite abonos parciales y liquidación total)
                    </div>
                  )}

                  {deuda.diaVencimiento && (
                    <div className="col-span-2 flex items-center justify-between pt-1">
                      <span className="text-slate-400 text-[11px] flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Día de corte / vencimiento:
                      </span>
                      <span className="font-bold text-slate-200">Día {deuda.diaVencimiento}</span>
                    </div>
                  )}
                </div>

                {/* ALERTA DE MORA SI TIENE */}
                {esMora && Number(deuda.valorVencidoMora) > 0 && (
                  <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                      {deuda.cuotasEnMora} cuotas vencidas
                    </span>
                    <span className="font-extrabold text-red-400">
                      {formatCOP(deuda.valorVencidoMora)}
                    </span>
                  </div>
                )}
              </div>

              {/* BOTONES DE ACCIÓN */}
              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center gap-2">
                {deuda.tieneCuotas ? (
                  <Link
                    href={`/cuotas?deudaId=${deuda.id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
                  >
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Ver Cuotas</span>
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedDeudaForPayment(deuda);
                      setIsAbonoModalOpen(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-md shadow-blue-600/30 transition-all"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Pagar / Abonar</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setSelectedDeudaForPayment(deuda);
                    setIsAbonoModalOpen(true);
                  }}
                  title="Abono Extraordinario"
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                >
                  <PiggyBank className="w-4 h-4 text-blue-400" />
                </button>

                <button
                  onClick={() => handleDeleteDebt(deuda.id, deuda.entidad)}
                  disabled={deletingId === deuda.id}
                  title="Eliminar Obligación"
                  className="p-2 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <CreateDebtModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
    </div>
  );
}
