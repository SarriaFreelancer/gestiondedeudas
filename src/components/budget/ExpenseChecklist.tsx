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
  Sparkles,
} from "lucide-react";

export const ExpenseChecklist: React.FC = () => {
  const {
    gastos,
    refreshBudgetData,
    setSelectedExpenseForPayment,
    setIsPayExpenseModalOpen,
  } = useBudget();

  const handleTogglePagar = (gasto: any) => {
    if (!gasto.estaPagado) {
      setSelectedExpenseForPayment(gasto);
      setIsPayExpenseModalOpen(true);
    } else {
      // Revertir a no pagado
      if (confirm(`¿Marcar "${gasto.nombre}" como pendiente nuevamente?`)) {
        fetch("/api/presupuesto/gastos", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: gasto.id, estaPagado: false, montoReal: 0 }),
        }).then(() => refreshBudgetData());
      }
    }
  };

  const handleDeleteGasto = async (id: string, nombre: string) => {
    if (confirm(`¿Seguro que deseas eliminar el gasto "${nombre}"?`)) {
      await fetch(`/api/presupuesto/gastos?id=${id}`, { method: "DELETE" });
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
          <div className="p-8 text-center text-slate-400 text-xs">
            No tienes gastos registrados para este periodo. Pulsa &quot;Nuevo Gasto&quot; para agregar
            arriendo, servicios o telefonía.
          </div>
        )}
      </div>
    </div>
  );
};
