"use client";

import React, { useState } from "react";
import { useBudget } from "@/context/BudgetContext";
import { PlusCircle, X, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { CategoriaGasto, TipoGasto, PeriodoPresupuesto } from "@prisma/client";

export const AddExpenseModal: React.FC = () => {
  const { isAddExpenseModalOpen, setIsAddExpenseModalOpen, mes, anio, refreshBudgetData } =
    useBudget();

  const [nombre, setNombre] = useState("");
  const [monto, setMonto] = useState<number>(100000);
  const [categoria, setCategoria] = useState<string>("SERVICIOS_PUBLICOS");
  const [tipo, setTipo] = useState<string>("FIJO");
  const [periodoAsignado, setPeriodoAsignado] = useState<string>("QUINCENA_1");
  const [diaVencimiento, setDiaVencimiento] = useState<number>(15);
  const [notas, setNotas] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isAddExpenseModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/presupuesto/gastos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          montoPresupuestado: Number(monto),
          categoria,
          tipo,
          periodoAsignado,
          diaVencimiento: Number(diaVencimiento),
          notas,
          mes,
          anio,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al agregar gasto");
      }

      await refreshBudgetData();
      setIsAddExpenseModalOpen(false);
      setNombre("");
      setNotas("");
    } catch (err: any) {
      setErrorMessage(err.message || "Error al agregar gasto");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md p-6 rounded-3xl bg-[#151F32] border border-slate-700 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => setIsAddExpenseModalOpen(false)}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <PlusCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Agregar Gasto</h3>
            <p className="text-xs text-slate-400">
              Registra arriendos, planes, recibos de servicios o gastos variables
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
              Nombre del Gasto o Servicio *
            </label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Alquiler apartamento, Plan Claro, Recibo Enel..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tipo de Gasto
              </label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
              >
                <option value="FIJO">Fijo (Siempre el mismo valor)</option>
                <option value="VARIABLE">Variable (Cambia cada mes)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Categoría
              </label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
              >
                <option value="VIVIENDA">Vivienda / Alquiler</option>
                <option value="SERVICIOS_PUBLICOS">Servicios Públicos (Luz, Agua, Gas)</option>
                <option value="CONECTIVIDAD">Conectividad (Plan Móvil / Internet)</option>
                <option value="ALIMENTACION">Alimentación & Mercado</option>
                <option value="TRANSPORTE">Transporte / Movilidad</option>
                <option value="SALUD">Salud & Bienestar</option>
                <option value="EDUCACION">Educación</option>
                <option value="ENTRETENIMIENTO">Entretenimiento</option>
                <option value="OTROS">Otros Gastos</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Valor Presupuestado (COP) *
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Periodo a Descontar
              </label>
              <select
                value={periodoAsignado}
                onChange={(e) => setPeriodoAsignado(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
              >
                <option value="QUINCENA_1">1ª Quincena (1 al 15)</option>
                <option value="QUINCENA_2">2ª Quincena (16 al fin)</option>
                <option value="MES_COMPLETO">Mes Completo (Mitad c/u)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Día de Vencimiento
              </label>
              <input
                type="number"
                min={1}
                max={31}
                value={diaVencimiento}
                onChange={(e) => setDiaVencimiento(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Notas u Observaciones
            </label>
            <input
              type="text"
              placeholder="Ej. Pagar antes del 10 para descuento pronto pago"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsAddExpenseModalOpen(false)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || monto <= 0 || !nombre.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  Agregar Gasto
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
