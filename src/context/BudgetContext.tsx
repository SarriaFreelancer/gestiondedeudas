"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { BudgetSummary } from "@/services/budgetService";

interface BudgetContextType {
  summary: BudgetSummary | null;
  gastos: any[];
  ingresos: any[];
  metasAhorro: any[];
  totalAhorradoMetas: number;
  loading: boolean;
  mes: number;
  anio: number;
  periodoFiltro: string; // 'MES_COMPLETO', 'QUINCENA_1', 'QUINCENA_2'
  modalidadSalario: "QUINCENAL" | "MENSUAL" | "INDEPENDIENTE";
  setMes: (m: number) => void;
  setAnio: (a: number) => void;
  setPeriodoFiltro: (p: string) => void;
  setModalidadSalario: (mod: "QUINCENAL" | "MENSUAL" | "INDEPENDIENTE") => void;
  refreshBudgetData: () => Promise<void>;
  refreshMetas: () => Promise<void>;
  isAddExpenseModalOpen: boolean;
  setIsAddExpenseModalOpen: (open: boolean) => void;
  isAddIncomeModalOpen: boolean;
  setIsAddIncomeModalOpen: (open: boolean) => void;
  isEditIncomeModalOpen: boolean;
  setIsEditIncomeModalOpen: (open: boolean) => void;
  selectedIncomeForEdit: any | null;
  setSelectedIncomeForEdit: (ingreso: any | null) => void;
  isPayExpenseModalOpen: boolean;
  setIsPayExpenseModalOpen: (open: boolean) => void;
  selectedExpenseForPayment: any | null;
  setSelectedExpenseForPayment: (gasto: any | null) => void;
  isTransferModalOpen: boolean;
  setIsTransferModalOpen: (open: boolean) => void;
  isCreateGoalModalOpen: boolean;
  setIsCreateGoalModalOpen: (open: boolean) => void;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const BudgetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const now = new Date();
  const [mes, setMes] = useState<number>(now.getMonth() + 1);
  const [anio, setAnio] = useState<number>(now.getFullYear());
  const [periodoFiltro, setPeriodoFiltro] = useState<string>("MES_COMPLETO");
  const [modalidadSalario, setModalidadSalario] = useState<
    "QUINCENAL" | "MENSUAL" | "INDEPENDIENTE"
  >("QUINCENAL");

  const [summary, setSummary] = useState<BudgetSummary | null>(null);
  const [gastos, setGastos] = useState<any[]>([]);
  const [ingresos, setIngresos] = useState<any[]>([]);
  const [metasAhorro, setMetasAhorro] = useState<any[]>([]);
  const [totalAhorradoMetas, setTotalAhorradoMetas] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Modales
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [isAddIncomeModalOpen, setIsAddIncomeModalOpen] = useState(false);
  const [isEditIncomeModalOpen, setIsEditIncomeModalOpen] = useState(false);
  const [selectedIncomeForEdit, setSelectedIncomeForEdit] = useState<any | null>(null);
  const [isPayExpenseModalOpen, setIsPayExpenseModalOpen] = useState(false);
  const [selectedExpenseForPayment, setSelectedExpenseForPayment] = useState<any | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isCreateGoalModalOpen, setIsCreateGoalModalOpen] = useState(false);

  const refreshMetas = useCallback(async () => {
    try {
      const res = await fetch("/api/metas", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setMetasAhorro(data.metas || []);
        setTotalAhorradoMetas(data.totalAhorrado || 0);
      }
    } catch (e) {
      console.error("Error al cargar metas de ahorro:", e);
    }
  }, []);

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
    refreshMetas();
  }, [refreshBudgetData, refreshMetas]);

  return (
    <BudgetContext.Provider
      value={{
        summary,
        gastos,
        ingresos,
        metasAhorro,
        totalAhorradoMetas,
        loading,
        mes,
        anio,
        periodoFiltro,
        modalidadSalario,
        setMes,
        setAnio,
        setPeriodoFiltro,
        setModalidadSalario,
        refreshBudgetData,
        refreshMetas,
        isAddExpenseModalOpen,
        setIsAddExpenseModalOpen,
        isAddIncomeModalOpen,
        setIsAddIncomeModalOpen,
        isEditIncomeModalOpen,
        setIsEditIncomeModalOpen,
        selectedIncomeForEdit,
        setSelectedIncomeForEdit,
        isPayExpenseModalOpen,
        setIsPayExpenseModalOpen,
        selectedExpenseForPayment,
        setSelectedExpenseForPayment,
        isTransferModalOpen,
        setIsTransferModalOpen,
        isCreateGoalModalOpen,
        setIsCreateGoalModalOpen,
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
