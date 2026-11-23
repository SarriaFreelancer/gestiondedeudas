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

export interface UsuarioPerfil {
  id: string;
  nombre: string;
  email: string;
  avatar: string | null;
  telefono: string | null;
}

interface FinancialContextType {
  summary: DashboardSummary | null;
  deudas: DeudaItem[];
  usuario: UsuarioPerfil | null;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  refreshUsuario: () => Promise<void>;
  selectedDeudaForPayment: DeudaItem | null;
  setSelectedDeudaForPayment: (deuda: DeudaItem | null) => void;
  selectedCuotaForPayment: any | null;
  setSelectedCuotaForPayment: (cuota: any | null) => void;
  isPaymentModalOpen: boolean;
  setIsPaymentModalOpen: (open: boolean) => void;
  isAbonoModalOpen: boolean;
  setIsAbonoModalOpen: (open: boolean) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export function FinancialProvider({ children }: { children: React.ReactNode }) {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [deudas, setDeudas] = useState<DeudaItem[]>([]);
  const [usuario, setUsuario] = useState<UsuarioPerfil | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedDeudaForPayment, setSelectedDeudaForPayment] = useState<DeudaItem | null>(null);
  const [selectedCuotaForPayment, setSelectedCuotaForPayment] = useState<any | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [isAbonoModalOpen, setIsAbonoModalOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const refreshUsuario = useCallback(async () => {
    try {
      const res = await fetch("/api/usuario/perfil", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setUsuario(data);
      }
    } catch (e) {
      console.error("Error al cargar perfil de usuario:", e);
    }
  }, []);

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
      setError(err.message || "Error al sincronizar con MySQL");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
    refreshUsuario();
  }, [refreshData, refreshUsuario]);

  return (
    <FinancialContext.Provider
      value={{
        summary,
        deudas,
        usuario,
        loading,
        error,
        refreshData,
        refreshUsuario,
        selectedDeudaForPayment,
        setSelectedDeudaForPayment,
        selectedCuotaForPayment,
        setSelectedCuotaForPayment,
        isPaymentModalOpen,
        setIsPaymentModalOpen,
        isAbonoModalOpen,
        setIsAbonoModalOpen,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
      }}
    >
      {children}
    </FinancialContext.Provider>
  );
}

export function useFinancial() {
  const context = useContext(FinancialContext);
  if (!context) {
    throw new Error("useFinancial debe ser utilizado dentro de FinancialProvider");
  }
  return context;
}
