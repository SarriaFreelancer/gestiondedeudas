"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { BudgetSummary } from "@/services/budgetService";

interface BudgetContextType {
  summary: BudgetSummary | null;
  gastos: any[];
  ingresos: any[];
  loading: boolean;
  mes: number;
  anio: number;
  periodoFiltro: string; // 'MES_COMPLETO', 'QUINCENA_1', 'QUINCENA_2'
  setMes: (m: number) => void;
  setAnio: (a: number) => void;
  setPeriodoFiltro: (p: string) => void;
  refreshBudgetData: () => Promise<void>;
  isAddExpenseModalOpen: boolean;
  setIsAddExpenseModalOpen: (open: boolean) => void;
  isAddIncomeModalOpen: boolean;
  setIsAddIncomeModalOpen: (open: boolean) => void;
  isPayExpenseModalOpen: boolean;
  setIsPayExpenseModalOpen: (open: boolean) => void;
  selectedExpenseForPayment: any | null;
  setSelectedExpenseForPayment: (gasto: any | null) => void;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const BudgetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const now = new Date();
  const [mes, setMes] = useState<number>(now.getMonth() + 1);
  const [anio, setAnio] = useState<number>(now.getFullYear());
  const [periodoFiltro, setPeriodoFiltro] = useState<string>("MES_COMPLETO");

  const [summary, setSummary] = useState<BudgetSummary | null>(null);
  const [gastos, setGastos] = useState<any[]>([]);
  const [ingresos, setIngresos] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modales
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [isAddIncomeModalOpen, setIsAddIncomeModalOpen] = useState(false);
  const [isPayExpenseModalOpen, setIsPayExpenseModalOpen] = useState(false);
  const [selectedExpenseForPayment, setSelectedExpenseForPayment] = useState<any | null>(null);

  const refreshBudgetData = useCallback(async () => {
    try {
      setLoading(true);
      const [resSummary, resGastos, resIngresos] = await Promise.all([
        fetch(`/api/presupuesto/summary?mes=${mes}&anio=${anio}&periodo=${periodoFiltro}`, {
          cache: "no-store",
        }),
        fetch(`/api/presupuesto/gastos?mes=${mes}&anio=${anio}&periodo=${periodoFiltro}`, {
          cache: "no-store",
        }),
        fetch(`/api/presupuesto/ingresos?mes=${mes}&anio=${anio}`, {
          cache: "no-store",
        }),
      ]);

      const dataSummary = await resSummary.json();
      const dataGastos = await resGastos.json();
      const dataIngresos = await resIngresos.json();

      setSummary(dataSummary);
      setGastos(Array.isArray(dataGastos) ? dataGastos : []);
      setIngresos(Array.isArray(dataIngresos) ? dataIngresos : []);
    } catch (err) {
      console.error("Error al cargar datos del presupuesto:", err);
    } finally {
      setLoading(false);
    }
  }, [mes, anio, periodoFiltro]);

  useEffect(() => {
    refreshBudgetData();
  }, [refreshBudgetData]);

  return (
    <BudgetContext.Provider
      value={{
        summary,
        gastos,
        ingresos,
        loading,
        mes,
        anio,
        periodoFiltro,
        setMes,
        setAnio,
        setPeriodoFiltro,
        refreshBudgetData,
        isAddExpenseModalOpen,
        setIsAddExpenseModalOpen,
        isAddIncomeModalOpen,
        setIsAddIncomeModalOpen,
        isPayExpenseModalOpen,
        setIsPayExpenseModalOpen,
        selectedExpenseForPayment,
        setSelectedExpenseForPayment,
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error("useBudget debe ser usado dentro de un BudgetProvider");
  }
  return context;
};
