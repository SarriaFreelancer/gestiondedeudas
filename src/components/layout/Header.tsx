"use client";

import React from "react";
import { Menu, RefreshCw, Sparkles, ShieldCheck } from "lucide-react";
import { BrandLogo } from "../ui/BrandLogo";
import { useFinancial } from "@/context/FinancialContext";

export const Header: React.FC<{ onToggleMobile: () => void }> = ({ onToggleMobile }) => {
  const { loading, refreshData } = useFinancial();

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#070D1A]/90 backdrop-blur-md border-b border-slate-800/60 px-4 sm:px-6 flex items-center justify-between">
      {/* En móvil: BrandLogo. En desktop: Título y estado */}
      <div className="flex items-center gap-3">
        <div className="lg:hidden">
          <BrandLogo />
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>MySQL 8 Activo</span>
          </div>
          <span className="text-xs text-slate-400">
            Base de datos: <code className="text-blue-400 font-mono">misdeudas</code>
          </span>
        </div>
      </div>

      {/* Acciones de la derecha */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => refreshData()}
          disabled={loading}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          title="Sincronizar base de datos"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-blue-400" : ""}`} />
          <span>Sincronizar</span>
        </button>

        {/* Botón de Menú Hamburguesa SOLO EN MÓVIL (lg:hidden) */}
        <button
          onClick={onToggleMobile}
          className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
          aria-label="Menú principal"
        >
          <Menu className="w-6 h-6 stroke-[2]" />
        </button>
      </div>
    </header>
  );
};
