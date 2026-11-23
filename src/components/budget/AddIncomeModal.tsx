"use client";

import React, { useState, useEffect } from "react";
import { useBudget } from "@/context/BudgetContext";
import { Wallet, X, AlertCircle, Loader2, ArrowRight, Calendar, Briefcase } from "lucide-react";
import { AppAlert } from "@/lib/alerts";
import { formatCOP } from "@/lib/formatters";

export const AddIncomeModal: React.FC = () => {
  const { isAddIncomeModalOpen, setIsAddIncomeModalOpen, mes, anio, refreshBudgetData, modalidadSalario } =
    useBudget();

  const hoyStr = new Date().toISOString().slice(0, 10);

  const [descripcion, setDescripcion] = useState("Salario Quincenal");
  const [monto, setMonto] = useState<number>(1500000);
  const [periodo, setPeriodo] = useState<string>("QUINCENA_1");
  const [fuente, setFuente] = useState<string>("SALARIO");
  const [fecha, setFecha] = useState<string>(hoyStr);
  const [sincronizarQuincena, setSincronizarQuincena] = useState<boolean>(true);
  const [propagarFuturos, setPropagarFuturos] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (modalidadSalario === "INDEPENDIENTE") {
      setDescripcion("Ingreso Diario / Venta / Honorarios");
      setPeriodo("DIARIO_VARIABLE");
      setFuente("HONORARIOS");
      setMonto(150000);
      setSincronizarQuincena(false);
      setPropagarFuturos(false);
    } else if (modalidadSalario === "MENSUAL") {
      setDescripcion("Salario Mensual");
      setPeriodo("MES_COMPLETO");
      setFuente("SALARIO");
      setMonto(3000000);
      setSincronizarQuincena(false);
      setPropagarFuturos(true);
    } else {
      setDescripcion("Salario Quincenal");
      setPeriodo("QUINCENA_1");
      setFuente("SALARIO");
      setMonto(1500000);
      setSincronizarQuincena(true);
      setPropagarFuturos(true);
    }
  }, [modalidadSalario, isAddIncomeModalOpen]);

  if (!isAddIncomeModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/presupuesto/ingresos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          descripcion,
          monto: Number(monto),
          periodo,
          fuente,
          fecha,
          mes,
          anio,
          sincronizarQuincena: periodo === "DIARIO_VARIABLE" ? false : sincronizarQuincena,
          propagarFuturos: periodo === "DIARIO_VARIABLE" ? false : propagarFuturos,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al registrar ingreso");
      }

      await refreshBudgetData();
      AppAlert.toast("Ingreso registrado con éxito", "success");
      setIsAddIncomeModalOpen(false);
    } catch (err: any) {
      setErrorMessage(err.message || "Error al registrar ingreso");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md p-6 rounded-3xl bg-[#151F32] border border-slate-700 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => setIsAddIncomeModalOpen(false)}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {modalidadSalario === "INDEPENDIENTE"
                ? "Registrar Ingreso Diario / Variable"
                : "Ingresar Salario / Ingreso"}
            </h3>
            <p className="text-xs text-slate-400">
              {modalidadSalario === "INDEPENDIENTE"
                ? "Agrega lo que ganaste hoy, por servicio o día a día"
                : "Registra el dinero que llegó en tu quincena o mes"}
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Descripción del Ingreso *
            </label>
            <input
              type="text"
              required
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej. Salario Quincenal, Venta del día, Honorarios..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Monto Recibido (COP) *
            </label>
            <input
              type="number"
              required
              min={1}
              value={monto}
              onChange={(e) => setMonto(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-base focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Fecha si es independiente / diario */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Fecha en que recibiste el dinero
            </label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Periodo Asignado
              </label>
              <select
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
              >
                <option value="DIARIO_VARIABLE">Ingreso Diario / Variable</option>
                <option value="QUINCENA_1">1ª Quincena (1-15)</option>
                <option value="QUINCENA_2">2ª Quincena (16-fin)</option>
                <option value="MES_COMPLETO">Mes Completo</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tipo / Fuente
              </label>
              <select
                value={fuente}
                onChange={(e) => setFuente(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
              >
                <option value="SALARIO">Salario Fijo</option>
                <option value="HONORARIOS">Honorarios / Profesional</option>
                <option value="VENTAS">Venta / Comercio</option>
                <option value="FREELANCE">Freelance / Turno</option>
                <option value="COMISIONES">Comisiones</option>
                <option value="PRIMA">Prima de Servicios</option>
                <option value="OTROS">Otro Ingreso</option>
              </select>
            </div>
          </div>

          {/* OPCIONES DE SINCRONIZACIÓN Y PERSISTENCIA (SOLO SI ES QUINCENA) */}
          {(periodo === "QUINCENA_1" || periodo === "QUINCENA_2") && (
            <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sincronizarQuincena}
                  onChange={(e) => setSincronizarQuincena(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
                />
                <div className="text-[11px]">
                  <span className="font-semibold text-white block">
                    Sincronizar ambas quincenas automáticamente
                  </span>
                  <span className="text-slate-400">
                    Crea o actualiza la otra quincena con este mismo valor
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer pt-1 border-t border-slate-800/60">
                <input
                  type="checkbox"
                  checked={propagarFuturos}
                  onChange={(e) => setPropagarFuturos(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
                />
                <div className="text-[11px]">
                  <span className="font-semibold text-white block">
                    Mantener fijo para los próximos meses
                  </span>
                  <span className="text-slate-400">
                    Al pasar a diciembre u otros meses, este salario se conservará
                  </span>
                </div>
              </label>
            </div>
          )}

          <div className="flex items-center gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsAddIncomeModalOpen(false)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || monto <= 0}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/30 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  Registrar Ingreso
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
