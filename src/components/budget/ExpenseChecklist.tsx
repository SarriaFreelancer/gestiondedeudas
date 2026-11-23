"use client";

import React from "react";
import { useBudget } from "@/context/BudgetContext";
import { formatCOP } from "@/lib/formatters";
import {
  CheckCircle2,
  Square,
  Calendar,
  Trash2,
  Camera,
  Layers,
  PlusCircle,
} from "lucide-react";
import { AppAlert } from "@/lib/alerts";

export const ExpenseChecklist: React.FC = () => {
  const {
    gastos,
    refreshBudgetData,
    setSelectedExpenseForPayment,
    setIsPayExpenseModalOpen,
    setIsAddExpenseModalOpen,
  } = useBudget();

  const handleTogglePagar = async (gasto: any) => {
    if (!gasto.estaPagado) {
      setSelectedExpenseForPayment(gasto);
      setIsPayExpenseModalOpen(true);
    } else {
      // Revertir a no pagado
      const confirmado = await AppAlert.confirm(
        "¿Revertir estado a pendiente?",
        `¿Deseas marcar "<b>${gasto.nombre}</b>" como pendiente nuevamente? Se devolverá este saldo al disponible.`,
        {
          confirmText: "Sí, revertir",
          cancelText: "Mantener pagado",
          isDestructive: false,
        }
      );

      if (confirmado) {
        await fetch("/api/presupuesto/gastos", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: gasto.id, estaPagado: false, montoReal: 0 }),
        });
        AppAlert.toast(`"${gasto.nombre}" marcado como pendiente`, "info");
        await refreshBudgetData();
      }
    }
  };

  const handleDeleteGasto = async (id: string, nombre: string) => {
    const confirmado = await AppAlert.confirm(
      "¿Eliminar este gasto?",
      `¿Estás seguro de que deseas eliminar "<b>${nombre}</b>"? Esta acción no se puede deshacer.`,
      {
        confirmText: "Sí, eliminar",
        cancelText: "Cancelar",
        isDestructive: true,
      }
    );

    if (confirmado) {
      await fetch(`/api/presupuesto/gastos?id=${id}`, { method: "DELETE" });
      AppAlert.toast(`Gasto "${nombre}" eliminado`, "success");
      await refreshBudgetData();
    }
  };

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-[#091122] border border-blue-900/30 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Control de Gastos Fijos y Variables
            </h2>
            <p className="text-xs text-slate-400">
              Descuenta facturas de tu salario y mantén el control de cada pago
            </p>
          </div>
        </div>

        <span className="text-xs text-slate-400 font-medium">
          {gastos.length} gastos registrados
        </span>
      </div>

      <div className="space-y-2.5">
        {gastos.map((gasto) => {
          const isPagado = gasto.estaPagado;
          const isFijo = gasto.tipo === "FIJO";

          return (
            <div
              key={gasto.id}
              className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 rounded-2xl border transition-all gap-3 ${
                isPagado
                  ? "bg-slate-900/40 border-slate-800/80 opacity-75"
                  : "bg-slate-900/80 border-slate-800 hover:border-slate-700 shadow-md"
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleTogglePagar(gasto)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isPagado ? "text-emerald-400" : "text-slate-400 hover:text-white"
                  }`}
                  title={isPagado ? "Gasto pagado (clic para revertir)" : "Pagar gasto y descontar del salario"}
                >
                  {isPagado ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-400" />
                  )}
                </button>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-white">{gasto.nombre}</span>

                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                        isFijo
                          ? "bg-blue-500/10 text-blue-300 border-blue-500/20"
                          : "bg-amber-500/10 text-amber-300 border-amber-500/20"
                      }`}
                    >
                      {gasto.tipo}
                    </span>

                    <span className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                      {gasto.periodoAsignado.replace("_", " ")}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      Día de pago sugerido: {gasto.diaVencimiento || 15}
                    </span>
                    {gasto.notas && <span className="text-slate-500">• {gasto.notas}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3">
                <div className="text-right">
                  <span className="text-sm sm:text-base font-black text-white block">
                    {formatCOP(isPagado ? gasto.montoReal : gasto.montoPresupuestado)}
                  </span>
                  {isPagado ? (
                    <span className="text-[10px] text-emerald-400 font-bold block">
                      ✓ Descontado del salario
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 block">Pendiente por descontar</span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {!isPagado ? (
                    <button
                      onClick={() => {
                        setSelectedExpenseForPayment(gasto);
                        setIsPayExpenseModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/30"
                    >
                      Pagar
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-400 font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      Pagado
                    </span>
                  )}

                  <button
                    onClick={() => handleDeleteGasto(gasto.id, gasto.nombre)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Eliminar gasto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {gastos.length === 0 && (
          <div className="p-8 sm:p-10 text-center rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mx-auto flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">No tienes gastos creados en este periodo</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Puedes agregar manualmente tu alquiler, plan de datos, servicios o cualquier gasto que necesites controlar.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAddExpenseModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-500/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Agregar Mi Primer Gasto</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
