"use client";

import React from "react";
import { RefreshCw, Database } from "lucide-react";
import { useFinancial } from "@/context/FinancialContext";

export const Header: React.FC<{ onToggleMobile?: () => void }> = () => {
  const { loading, refreshData } = useFinancial();

  return (
    // Visible ÚNICAMENTE en versión de escritorio (hidden lg:flex). En móvil está 100% oculto.
    <header className="hidden lg:flex sticky top-0 z-30 h-16 bg-[#070D1A]/90 backdrop-blur-md border-b border-slate-800/60 px-6 items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>MySQL 8 Conectado</span>
        </div>
        <span className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
          <Database className="w-3.5 h-3.5 text-blue-400" />
          <span>misdeudas</span>
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => refreshData()}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          title="Sincronizar base de datos"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-blue-400" : ""}`} />
          <span>Sincronizar Datos</span>
        </button>
      </div>
    </header>
  );
};
