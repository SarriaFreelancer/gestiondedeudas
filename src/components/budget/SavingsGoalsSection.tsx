"use client";

import React from "react";
import { useBudget } from "@/context/BudgetContext";
import { formatCOP, formatPercentage } from "@/lib/formatters";
import { BANCOS_COLOMBIA } from "@/services/savingsService";
import {
  PiggyBank,
  Plus,
  ArrowUpRight,
  CheckCircle2,
  Building2,
  Calendar,
  Send,
} from "lucide-react";

export const SavingsGoalsSection: React.FC = () => {
  const {
    metasAhorro,
    totalAhorradoMetas,
    setIsCreateGoalModalOpen,
    setIsTransferModalOpen,
    summary,
  } = useBudget();

  const saldoDisponible = summary?.saldoDisponible || 0;

  return (
    <div className="p-4 sm:p-5 rounded-3xl bg-[#091122] border border-blue-900/40 shadow-xl space-y-4">
      {/* CABECERA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <PiggyBank className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Metas de Ahorro & Reservas Bancarias</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-500/30">
                {metasAhorro.length} {metasAhorro.length === 1 ? "Meta" : "Metas"}
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Seguimiento del dinero que guardas en tus cuentas bancarias y bolsillos
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {saldoDisponible > 0 && metasAhorro.length > 0 && (
            <button
              onClick={() => setIsTransferModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/20"
            >
              <Send className="w-3.5 h-3.5 text-emerald-200" />
              <span>
                <span className="hidden sm:inline">Trasladar Sobrante</span>
                <span className="sm:hidden">Aportar</span> ({formatCOP(saldoDisponible)})
              </span>
            </button>
          )}

          <button
            onClick={() => setIsCreateGoalModalOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-bold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Nueva Meta</span>
          </button>
        </div>
      </div>

      {/* TARJETA DESTACADA: TRASLADO DEL SOBRANTE SI NO HAY METAS O SI HAY SALDO DISPONIBLE */}
      {saldoDisponible > 0 && metasAhorro.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-[#091122] border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <div>
              <p className="text-xs font-bold text-white">
                Tienes un saldo disponible de {formatCOP(saldoDisponible)} en este periodo
              </p>
              <p className="text-[11px] text-slate-400">
                Puedes trasladarlo como un aporte a tus metas de ahorro y guardarlo en tu cuenta bancaria
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-extrabold hover:bg-emerald-400 transition-colors flex items-center gap-1 shadow-md"
          >
            <span>Aportar a Meta</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* LISTA DE METAS */}
      {metasAhorro.length === 0 ? (
        <div className="p-6 text-center rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2">
          <PiggyBank className="w-8 h-8 text-slate-500 mx-auto" />
          <p className="text-xs font-semibold text-slate-300">
            Aún no has creado metas de ahorro
          </p>
          <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
            Crea metas como "Fondo de Emergencia" o "Ahorro Nu 13%". Al final del mes podrás enviar el saldo sobrante de tu salario hacia ellas y saber en qué banco reposa cada peso.
          </p>
          <button
            onClick={() => setIsCreateGoalModalOpen(true)}
            className="mt-2 inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/30"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Crear mi Primera Meta</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {metasAhorro.map((m) => {
            const bancoInfo = BANCOS_COLOMBIA[m.bancoUbicacion] || {
              label: m.bancoUbicacion,
              color: "#64748B",
              badge: "Banco",
            };
            const completada = m.estaCompletada || m.montoActual >= m.montoObjetivo;

            return (
              <div
                key={m.id}
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="text-sm font-bold text-white tracking-tight">
                        {m.nombre}
                      </h4>
                      {/* Badge del Banco donde reposa el dinero */}
                      <span
                        className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md mt-1"
                        style={{
                          backgroundColor: `${bancoInfo.color}20`,
                          color: bancoInfo.color,
                          border: `1px solid ${bancoInfo.color}40`,
                        }}
                      >
                        <Building2 className="w-2.5 h-2.5" />
                        <span>{bancoInfo.badge}</span>
                      </span>
                    </div>

                    {completada ? (
                      <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-4 h-4" />
                      </span>
                    ) : (
                      <span className="text-xs font-black text-emerald-400">
                        {formatPercentage(m.porcentajeCumplimiento, 0)}
                      </span>
                    )}
                  </div>

                  {/* Barra de Progreso */}
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mb-2">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, m.porcentajeCumplimiento)}%`,
                        backgroundColor: m.color || "#10B981",
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Acumulado:</span>
                    <span className="font-bold text-white">
                      {formatCOP(m.montoActual)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Objetivo:</span>
                    <span className="font-mono text-slate-300">
                      {formatCOP(m.montoObjetivo)}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-400">
                    {completada ? "¡Meta cumplida!" : `Faltan: ${formatCOP(m.saldoFaltante)}`}
                  </span>
                  <button
                    onClick={() => setIsTransferModalOpen(true)}
                    className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5 transition-colors"
                  >
                    <span>+ Aportar</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
