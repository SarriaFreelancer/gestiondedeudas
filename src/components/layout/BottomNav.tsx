"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Wallet,
  Plus,
  BarChart2,
  MoreHorizontal,
  CheckSquare,
  History,
  LogOut,
  X,
} from "lucide-react";
import { useFinancial } from "@/context/FinancialContext";

export const BottomNav: React.FC = () => {
  const pathname = usePathname();
  const { setIsAbonoModalOpen } = useFinancial();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      {/* MENÚ FLOTANTE "MÁS" */}
      {isMoreOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm p-5 rounded-3xl bg-[#091122] border border-slate-700 shadow-2xl space-y-2 mb-20 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Opciones Adicionales
              </span>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <Link
              href="/cuotas"
              onClick={() => setIsMoreOpen(false)}
              className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-800/60 text-slate-200 text-xs font-semibold transition-colors"
            >
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <CheckSquare className="w-4 h-4" />
              </div>
              <span>Cuotas & Checklist</span>
            </Link>

            <Link
              href="/historial"
              onClick={() => setIsMoreOpen(false)}
              className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-800/60 text-slate-200 text-xs font-semibold transition-colors"
            >
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                <History className="w-4 h-4" />
              </div>
              <span>Historial & Auditoría</span>
            </Link>

            <button
              onClick={() => {
                setIsMoreOpen(false);
                handleLogout();
              }}
              className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-red-500/10 text-red-400 text-xs font-semibold transition-colors"
            >
              <div className="p-2 rounded-xl bg-red-500/10 text-red-400">
                <LogOut className="w-4 h-4" />
              </div>
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      )}

      {/* BARRA DE NAVEGACIÓN INFERIOR FLOTANTE IDÉNTICA A LA IMAGEN */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-[#070D1A]/95 border-t border-slate-800/80 backdrop-blur-xl px-4 py-2 sm:py-2.5 max-w-lg mx-auto sm:rounded-t-3xl shadow-2xl">
        <div className="flex items-center justify-between relative px-2">
          {/* Botón 1: Inicio */}
          <Link
            href="/"
            className={`flex flex-col items-center gap-1 py-1 transition-colors ${
              pathname === "/" ? "text-[#2F80ED]" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-bold">Inicio</span>
          </Link>

          {/* Botón 2: Mis Deudas */}
          <Link
            href="/deudas"
            className={`flex flex-col items-center gap-1 py-1 transition-colors ${
              pathname === "/deudas" ? "text-[#2F80ED]" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Wallet className="w-5 h-5" />
            <span className="text-[10px] font-bold">Mis Deudas</span>
          </Link>

          {/* Botón Central Flotante (+): Registrar Abono o Pago */}
          <div className="relative -top-4 flex items-center justify-center">
            <button
              onClick={() => setIsAbonoModalOpen(true)}
              className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-[#1E6BFF] via-[#2F80ED] to-[#38BDF8] flex items-center justify-center text-white shadow-lg shadow-blue-500/50 hover:scale-105 active:scale-95 transition-transform border-4 border-[#070D1A]"
              title="Registrar Abono o Pago"
            >
              <Plus className="w-7 h-7 stroke-[2.5]" />
            </button>
          </div>

          {/* Botón 4: Reportes */}
          <Link
            href="/reportes"
            className={`flex flex-col items-center gap-1 py-1 transition-colors ${
              pathname === "/reportes" ? "text-[#2F80ED]" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <BarChart2 className="w-5 h-5" />
            <span className="text-[10px] font-bold">Reportes</span>
          </Link>

          {/* Botón 5: Más */}
          <button
            onClick={() => setIsMoreOpen(true)}
            className="flex flex-col items-center gap-1 py-1 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] font-bold">Más</span>
          </button>
        </div>
      </nav>
    </>
  );
};
