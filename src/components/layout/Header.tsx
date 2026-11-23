"use client";

import React from "react";
import { Menu, RefreshCw, Database, Sparkles } from "lucide-react";
import { useFinancial } from "@/context/FinancialContext";

export const Header: React.FC<{ onToggleMobile: () => void }> = ({ onToggleMobile }) => {
  const { loading, refreshData } = useFinancial();

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#0B1120]/80 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobile}
          className="lg:hidden p-2 rounded-xl bg-slate-800/70 border border-slate-700 text-slate-300 hover:text-white"
          aria-label="Abrir Menú"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-slate-300 hidden sm:inline-block">
            MySQL 8 Conectado
          </span>
          <span className="text-slate-600 hidden sm:inline-block">•</span>
          <span className="text-xs text-slate-400 hidden md:inline-block">
            Base de datos: <code className="text-blue-400 font-mono">misdeudas</code>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => refreshData()}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-600 transition-colors disabled:opacity-50"
          title="Sincronizar datos"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-blue-400" : ""}`} />
          <span className="hidden sm:inline">Sincronizar</span>
        </button>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Plan Libertad</span>
        </div>
      </div>
    </header>
  );
};
