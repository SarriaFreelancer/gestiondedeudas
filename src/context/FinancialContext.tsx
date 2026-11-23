"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { DashboardSummary } from "@/services/financeService";

interface DeudaItem {
  id: string;
  entidad: string;
  referencia: string | null;
  montoInicial: number;
  saldoInicial: number;
  saldoPendiente: number;
  valorCuotaMensual: number;
  cuotasTotales: number;
  cuotasPagadasIniciales: number;
  cuotasPendientes: number;
  valorVencidoMora: number;
  cuotasEnMora: number;
  diaVencimiento: number | null;
  estado: string;
  tieneCuotas: boolean;
  observaciones: string | null;
  orden: number;
  cuotas: any[];
  movimientos: any[];
}

interface FinancialContextType {
  summary: DashboardSummary | null;
  deudas: DeudaItem[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  selectedDeudaForPayment: DeudaItem | null;
  setSelectedDeudaForPayment: (deuda: DeudaItem | null) => void;
  selectedCuotaForPayment: any | null;
  setSelectedCuotaForPayment: (cuota: any | null) => void;
  isPaymentModalOpen: boolean;
  setIsPaymentModalOpen: (open: boolean) => void;
  isAbonoModalOpen: boolean;
  setIsAbonoModalOpen: (open: boolean) => void;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export function FinancialProvider({ children }: { children: React.ReactNode }) {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [deudas, setDeudas] = useState<DeudaItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedDeudaForPayment, setSelectedDeudaForPayment] = useState<DeudaItem | null>(null);
  const [selectedCuotaForPayment, setSelectedCuotaForPayment] = useState<any | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [isAbonoModalOpen, setIsAbonoModalOpen] = useState<boolean>(false);

  const refreshData = useCallback(async () => {
    try {
      const [sumRes, deudasRes] = await Promise.all([
        fetch("/api/summary", { cache: "no-store" }),
        fetch("/api/deudas", { cache: "no-store" }),
      ]);

      if (!sumRes.ok || !deudasRes.ok) {
        throw new Error("Error al obtener datos actualizados del servidor");
      }

      const sumData = await sumRes.json();
      const deudasData = await deudasRes.json();

      setSummary(sumData);
      setDeudas(deudasData);
      setError(null);
    } catch (err: any) {
      console.error("Error refreshing financial data:", err);
      setError(err.message || "Error al sincronizar con la base de datos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return (
    <FinancialContext.Provider
      value={{
        summary,
        deudas,
        loading,
        error,
        refreshData,
        selectedDeudaForPayment,
        setSelectedDeudaForPayment,
        selectedCuotaForPayment,
        setSelectedCuotaForPayment,
        isPaymentModalOpen,
        setIsPaymentModalOpen,
        isAbonoModalOpen,
        setIsAbonoModalOpen,
      }}
    >
      {children}
    </FinancialContext.Provider>
  );
}

export function useFinancial() {
  const context = useContext(FinancialContext);
  if (!context) {
    throw new Error("useFinancial must be used within a FinancialProvider");
  }
  return context;
}
