"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useFinancial } from "@/context/FinancialContext";
import { formatCOP, formatDate } from "@/lib/formatters";
import {
  CheckSquare,
  Square,
  CheckCircle2,
  Calendar,
  Filter,
  Loader2,
  PlusCircle,
  Download,
  ExternalLink,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { EditDebtModal } from "@/components/debts/EditDebtModal";

function CuotasPageContent() {
  const { deudas, setSelectedDeudaForPayment, setSelectedCuotaForPayment, setIsPaymentModalOpen } =
    useFinancial();

  const searchParams = useSearchParams();
  const initialDeudaId = searchParams.get("deudaId") || "";

  // Deudas que tienen plan de cuotas (NEQUI, DAVIVIENDA, CRÉDITO 20 MINUTOS, etc.)
  const deudasConCuotas = useMemo(() => deudas.filter((d) => d.tieneCuotas), [deudas]);

  const [selectedDeudaId, setSelectedDeudaId] = useState<string>(
    initialDeudaId || (deudasConCuotas[0]?.id ?? "")
  );

  const [filtroEstado, setFiltroEstado] = useState<string>("TODAS"); // TODAS, PENDIENTES, VENCIDAS, PAGADAS
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Sincronizar si cambia deudasConCuotas
  React.useEffect(() => {
    if (!selectedDeudaId && deudasConCuotas.length > 0) {
      setSelectedDeudaId(deudasConCuotas[0].id);
    }
  }, [deudasConCuotas, selectedDeudaId]);

  const deudaActual = deudas.find((d) => d.id === selectedDeudaId) || deudasConCuotas[0];

  // Cuotas filtradas
  const cuotasFiltradas = useMemo(() => {
    if (!deudaActual?.cuotas) return [];
    return deudaActual.cuotas.filter((c: any) => {
      if (filtroEstado === "PENDIENTES") return c.estado === "PENDIENTE";
      if (filtroEstado === "VENCIDAS") return c.estado === "VENCIDA" || c.esMora;
      if (filtroEstado === "PAGADAS") return c.estado === "PAGADA";
      return true;
    });
  }, [deudaActual, filtroEstado]);

  const handleSelectCuotaParaPagar = (cuota: any) => {
    if (cuota.estado === "PAGADA") return;
    if (deudaActual) {
      setSelectedDeudaForPayment(deudaActual);
      setSelectedCuotaForPayment(cuota);
      setIsPaymentModalOpen(true);
    }
  };

  // Helper para generar enlace directo a Google Calendar (para la cuenta de Google sarriafreelancer7@gmail.com)
  const getGoogleCalendarUrl = (cuota: any) => {
    const fecha = new Date(cuota.fechaVencimiento);
    const yyyy = fecha.getUTCFullYear();
    const mm = String(fecha.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(fecha.getUTCDate()).padStart(2, "0");
    const dateFormatted = `${yyyy}${mm}${dd}`;
    const dates = `${dateFormatted}T140000Z/${dateFormatted}T150000Z`;

    const titulo = encodeURIComponent(
      `💰 Pagar Cuota #${cuota.numeroCuota} ${deudaActual?.entidad || "Deuda"} ($${Number(cuota.valor).toLocaleString("es-CO")})`
    );
    const detalles = encodeURIComponent(
      `Recordatorio de vencimiento de cuota de ${deudaActual?.entidad}\nValor: $${Number(cuota.valor).toLocaleString("es-CO")} COP\nSincronizado desde Mi Libertad Financiera.`
    );

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${titulo}&dates=${dates}&details=${detalles}`;
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#151F32] border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Módulo de Cuotas & Checklist
            </h1>
            <p className="text-xs text-slate-400">
              Seguimiento cuota a cuota con confirmación auditable y amortización inmediata
            </p>
          </div>
        </div>

        {/* SELECTOR DE ENTIDAD CON CUOTAS & BOTON AGREGAR */}
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs font-semibold text-slate-400">Obligación:</label>
          <select
            value={selectedDeudaId}
            onChange={(e) => setSelectedDeudaId(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-xs focus:outline-none focus:border-blue-500"
          >
            {deudasConCuotas.map((d) => (
              <option key={d.id} value={d.id}>
                {d.entidad} ({d.cuotasPendientes} pendientes)
              </option>
            ))}
          </select>

          {deudaActual && (
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-bold transition-colors"
              title="Añadir más cuotas o editar valor"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Añadir / Ajustar Cuotas</span>
            </button>
          )}

          {/* Sincronización Google Calendar */}
          <a
            href="/api/calendario"
            download="cuotas_libertad_financiera.ics"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-colors"
            title="Descargar agenda de cuotas (.ics) para sincronizar en Google Calendar"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Sincronizar Google Calendar</span>
          </a>
        </div>
      </div>

      {deudaActual && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block">Saldo Pendiente:</span>
            <span className="text-lg font-bold text-white">{formatCOP(deudaActual.saldoPendiente)}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Cuota Mensual:</span>
            <span className="text-lg font-bold text-slate-200">
              {formatCOP(deudaActual.valorCuotaMensual)}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">Progreso Cuotas:</span>
            <span className="text-lg font-bold text-emerald-400">
              {deudaActual.cuotasTotales - deudaActual.cuotasPendientes} / {deudaActual.cuotasTotales}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">Estado en Mora:</span>
            <span
              className={`text-lg font-bold ${
                deudaActual.cuotasEnMora > 0 ? "text-amber-400" : "text-emerald-400"
              }`}
            >
              {deudaActual.cuotasEnMora > 0
                ? `${deudaActual.cuotasEnMora} cuotas (${formatCOP(deudaActual.valorVencidoMora)})`
                : "Al día"}
            </span>
          </div>
        </div>
      )}

      {/* FILTROS DE ESTADO */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-400">Filtrar por:</span>
          <div className="flex gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            {["TODAS", "PENDIENTES", "VENCIDAS", "PAGADAS"].map((est) => (
              <button
                key={est}
                onClick={() => setFiltroEstado(est)}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  filtroEstado === est
                    ? "bg-blue-600 text-white font-bold shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {est === "VENCIDAS" ? "EN MORA" : est}
              </button>
            ))}
          </div>
        </div>

        <span className="text-xs text-slate-400 font-medium">
          Mostrando {cuotasFiltradas.length} cuotas
        </span>
      </div>

      {/* LISTA CHECKLIST DE CUOTAS */}
      <div className="space-y-2">
        {cuotasFiltradas.map((cuota: any) => {
          const isPagada = cuota.estado === "PAGADA";
          const isVencida = cuota.estado === "VENCIDA" || cuota.esMora;

          return (
            <div
              key={cuota.id}
              className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border transition-all duration-200 gap-3 ${
                isPagada
                  ? "bg-slate-900/40 border-slate-800/80 opacity-80"
                  : isVencida
                  ? "bg-red-500/5 border-red-500/30 hover:border-red-500/60"
                  : "bg-[#151F32] border-slate-800 hover:border-slate-700"
              }`}
            >
              {/* Checkbox y Número */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => !isPagada && handleSelectCuotaParaPagar(cuota)}
                  disabled={isPagada}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isPagada
                      ? "text-emerald-400 cursor-default"
                      : isVencida
                      ? "text-red-400 hover:bg-red-500/10 cursor-pointer"
                      : "text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                  }`}
                  title={isPagada ? "Cuota Pagada" : "Registrar pago de cuota"}
                >
                  {isPagada ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-400" />
                  )}
                </button>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-white">
                      Cuota #{cuota.numeroCuota}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                        isPagada
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                          : isVencida
                          ? "bg-red-500/20 text-red-400 border-red-500/30"
                          : "bg-slate-800 text-slate-300 border-slate-700"
                      }`}
                    >
                      {isVencida ? "Vencida / En Mora" : cuota.estado}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Vence: {formatDate(cuota.fechaVencimiento)}
                    </span>
                    {isPagada && cuota.fechaPago && (
                      <span className="text-emerald-400 flex items-center gap-1">
                        • Pagada: {formatDate(cuota.fechaPago)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Valor y Acciones */}
              <div className="flex items-center justify-between sm:justify-end gap-3">
                <span className="text-base font-extrabold text-white">
                  {formatCOP(cuota.valor)}
                </span>

                {!isPagada ? (
                  <div className="flex items-center gap-2">
                    {/* Botón directo a Google Calendar */}
                    <a
                      href={getGoogleCalendarUrl(cuota)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                      title="Agendar en Google Calendar (sarriafreelancer7@gmail.com)"
                    >
                      <Calendar className="w-4 h-4 text-emerald-400" />
                    </a>

                    <button
                      onClick={() => handleSelectCuotaParaPagar(cuota)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/30"
                    >
                      <span>Pagar Cuota</span>
                    </button>
                  </div>
                ) : (
                  <span className="text-xs font-semibold text-emerald-400 px-3 py-1 rounded-lg bg-emerald-500/10">
                    Saldada
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {cuotasFiltradas.length === 0 && (
          <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center">
            <p className="text-sm font-semibold text-slate-400">
              No hay cuotas que coincidan con el filtro seleccionado.
            </p>
          </div>
        )}
      </div>

      <EditDebtModal
        deuda={deudaActual}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </div>
  );
}

export default function CuotasPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh] gap-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <span className="text-xs text-slate-400">Cargando cuotas...</span>
        </div>
      }
    >
      <CuotasPageContent />
    </Suspense>
  );
}