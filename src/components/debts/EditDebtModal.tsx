"use client";

import React, { useState, useEffect } from "react";
import { formatCOP } from "@/lib/formatters";
import { Edit3, X, PlusCircle, CheckSquare, Loader2, AlertCircle, Save } from "lucide-react";
import { useFinancial } from "@/context/FinancialContext";

interface EditDebtModalProps {
  deuda: any | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EditDebtModal: React.FC<EditDebtModalProps> = ({ deuda, isOpen, onClose }) => {
  const { refreshData } = useFinancial();

  const [tab, setTab] = useState<"DATOS" | "CUOTAS">("DATOS");

  // Campos de la deuda
  const [entidad, setEntidad] = useState("");
  const [referencia, setReferencia] = useState("");
  const [montoInicial, setMontoInicial] = useState<number>(0);
  const [saldoPendiente, setSaldoPendiente] = useState<number>(0);
  const [valorCuotaMensual, setValorCuotaMensual] = useState<number>(0);
  const [diaVencimiento, setDiaVencimiento] = useState<number>(5);
  const [estado, setEstado] = useState<string>("ACTIVA");
  const [tieneCuotas, setTieneCuotas] = useState<boolean>(true);
  const [observaciones, setObservaciones] = useState("");

  // Agregar cuotas adicionales
  const [cuotasAAgregar, setCuotasAAgregar] = useState<number>(6);
  const [valorPorCuotaNueva, setValorPorCuotaNueva] = useState<number>(0);

  // Ajustar valor de cuotas existentes pendientes
  const [nuevoValorCuotasPendientes, setNuevoValorCuotasPendientes] = useState<number>(0);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (deuda) {
      setEntidad(deuda.entidad || "");
      setReferencia(deuda.referencia || "");
      setMontoInicial(Number(deuda.montoInicial || 0));
      setSaldoPendiente(Number(deuda.saldoPendiente || 0));
      setValorCuotaMensual(Number(deuda.valorCuotaMensual || 0));
      setDiaVencimiento(Number(deuda.diaVencimiento || 5));
      setEstado(deuda.estado || "ACTIVA");
      setTieneCuotas(Boolean(deuda.tieneCuotas));
      setObservaciones(deuda.observaciones || "");
      setValorPorCuotaNueva(Number(deuda.valorCuotaMensual || 0));
      setNuevoValorCuotasPendientes(Number(deuda.valorCuotaMensual || 0));
      setError(null);
      setSuccessMsg(null);
    }
  }, [deuda]);

  if (!isOpen || !deuda) return null;

  // Guardar datos generales de la deuda
  const handleGuardarDatos = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/deudas/${deuda.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entidad: entidad.trim(),
          referencia: referencia.trim() || null,
          montoInicial: Number(montoInicial),
          saldoPendiente: Number(saldoPendiente),
          valorCuotaMensual: Number(valorCuotaMensual),
          diaVencimiento: Number(diaVencimiento),
          estado,
          tieneCuotas,
          observaciones: observaciones.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al actualizar la deuda");
      }

      await refreshData();
      setSuccessMsg("¡Obligación actualizada exitosamente!");
      setTimeout(() => onClose(), 800);
    } catch (err: any) {
      setError(err.message || "No se pudo guardar la información");
    } finally {
      setSaving(false);
    }
  };

  // Agregar cuotas adicionales
  const handleAgregarCuotas = async () => {
    if (cuotasAAgregar <= 0) return;
    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/deudas/${deuda.id}/cuotas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cantidad: Number(cuotasAAgregar),
          valor: Number(valorPorCuotaNueva),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al agregar cuotas");
      }

      await refreshData();
      setSuccessMsg(`¡Se añadieron ${cuotasAAgregar} cuotas a ${deuda.entidad}!`);
      setTimeout(() => onClose(), 800);
    } catch (err: any) {
      setError(err.message || "Error al agregar cuotas");
    } finally {
      setSaving(false);
    }
  };

  // Ajustar valor de cuotas pendientes existentes
  const handleActualizarValorPendientes = async () => {
    if (nuevoValorCuotasPendientes <= 0) return;
    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/deudas/${deuda.id}/cuotas`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nuevoValor: Number(nuevoValorCuotasPendientes),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al actualizar cuotas pendientes");
      }

      await refreshData();
      setSuccessMsg("¡Valor de cuotas pendientes actualizado correctamente!");
      setTimeout(() => onClose(), 800);
    } catch (err: any) {
      setError(err.message || "Error al actualizar cuotas");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 rounded-3xl bg-[#0F172A] border border-slate-700 shadow-2xl text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Edit3 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Editar Obligación: {deuda.entidad}</h3>
            <p className="text-xs text-slate-400">
              Modifica saldos, valores de cuota y agrega o extiende cuotas
            </p>
          </div>
        </div>

        {/* PESTAÑAS */}
        <div className="flex gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800 mb-4 text-xs font-bold">
          <button
            type="button"
            onClick={() => setTab("DATOS")}
            className={`flex-1 py-2 rounded-lg transition-colors ${
              tab === "DATOS"
                ? "bg-blue-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Datos Principales & Saldo
          </button>
          <button
            type="button"
            onClick={() => setTab("CUOTAS")}
            className={`flex-1 py-2 rounded-lg transition-colors ${
              tab === "CUOTAS"
                ? "bg-blue-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Gestión & Añadir Cuotas
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
            {successMsg}
          </div>
        )}

        {/* PESTAÑA 1: DATOS PRINCIPALES & SALDO */}
        {tab === "DATOS" && (
          <form onSubmit={handleGuardarDatos} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nombre Entidad / Acreedor *
                </label>
                <input
                  type="text"
                  required
                  value={entidad}
                  onChange={(e) => setEntidad(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Referencia o Contrato
                </label>
                <input
                  type="text"
                  value={referencia}
                  onChange={(e) => setReferencia(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Monto Inicial Original (COP)
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={montoInicial}
                  onChange={(e) => setMontoInicial(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Saldo Pendiente Actual (COP) *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={saldoPendiente}
                  onChange={(e) => setSaldoPendiente(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-emerald-500/50 text-emerald-400 text-xs font-black focus:outline-none focus:border-emerald-400"
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Conciliación manual directa
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Valor Cuota Mensual
                </label>
                <input
                  type="number"
                  min={0}
                  value={valorCuotaMensual}
                  onChange={(e) => setValorCuotaMensual(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Día Vencimiento (1-31)
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

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Estado
                </label>
                <select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500 font-semibold"
                >
                  <option value="ACTIVA">ACTIVA</option>
                  <option value="EN_MORA">EN MORA</option>
                  <option value="AL_DIA">AL DÍA</option>
                  <option value="PAGADA">PAGADA</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Observaciones / Notas
              </label>
              <textarea
                rows={2}
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Guardar Cambios</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* PESTAÑA 2: GESTIÓN & AÑADIR CUOTAS */}
        {tab === "CUOTAS" && (
          <div className="space-y-6">
            {/* Resumen actual de cuotas */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Cuotas Totales Registradas:</span>
                <span className="font-bold text-white">{deuda.cuotasTotales} cuotas</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Cuotas Pendientes Restantes:</span>
                <span className="font-bold text-blue-400">{deuda.cuotasPendientes} cuotas</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Cuotas en Mora:</span>
                <span className="font-bold text-red-400">{deuda.cuotasEnMora} cuotas</span>
              </div>
            </div>

            {/* SECCIÓN 1: AGREGAR CUOTAS ADICIONALES */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Agregar Cuotas Consecutivas
                </h4>
              </div>
              <p className="text-[11px] text-slate-400">
                Útil para refinanciaciones, extensiones de plazo o acuerdos de pago adicionales.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Cantidad de cuotas a añadir
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={cuotasAAgregar}
                    onChange={(e) => setCuotasAAgregar(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Valor de cada nueva cuota (COP)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={valorPorCuotaNueva}
                    onChange={(e) => setValorPorCuotaNueva(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleAgregarCuotas}
                disabled={saving || cuotasAAgregar <= 0}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/30 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    <span>Añadir {cuotasAAgregar} Cuotas a {deuda.entidad}</span>
                  </>
                )}
              </button>
            </div>

            {/* SECCIÓN 2: AJUSTAR VALOR DE TODAS LAS CUOTAS PENDIENTES */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-blue-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Actualizar Valor de Cuotas Pendientes
                </h4>
              </div>
              <p className="text-[11px] text-slate-400">
                Cambia el valor programado para todas las cuotas que aún no han sido pagadas.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nuevo Valor para Cuotas Pendientes (COP)
                </label>
                <input
                  type="number"
                  min={1}
                  value={nuevoValorCuotasPendientes}
                  onChange={(e) => setNuevoValorCuotasPendientes(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="button"
                onClick={handleActualizarValorPendientes}
                disabled={saving || nuevoValorCuotasPendientes <= 0}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/30 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Actualizar Valor en Cuotas Pendientes</span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
