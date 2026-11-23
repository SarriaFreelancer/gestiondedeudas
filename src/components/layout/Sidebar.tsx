"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  WalletCards,
  CheckSquare,
  PiggyBank,
  History,
  LineChart,
  LogOut,
  ShieldCheck,
  User,
  Coins,
  X,
} from "lucide-react";
import { BrandLogo } from "../ui/BrandLogo";
import { useFinancial } from "@/context/FinancialContext";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard Deudas", icon: LayoutDashboard },
  { href: "/presupuesto", label: "Presupuesto & Salario", icon: Coins },
  { href: "/deudas", label: "Gestión de Deudas", icon: WalletCards },
  { href: "/cuotas", label: "Cuotas & Checklist", icon: CheckSquare },
  { href: "/abonos", label: "Registrar Abonos", icon: PiggyBank },
  { href: "/historial", label: "Historial Financiero", icon: History },
  { href: "/reportes", label: "Proyección & Reportes", icon: LineChart },
  { href: "/perfil", label: "Perfil & Ajustes", icon: User },
];

export const Sidebar: React.FC<{ isOpenMobile?: boolean; onCloseMobile?: () => void }> = ({
  isOpenMobile,
  onCloseMobile,
}) => {
  const pathname = usePathname();
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useFinancial();

  // Se abre si viene por prop o por el contexto global de la aplicación
  const isDrawerOpen = isOpenMobile || isMobileMenuOpen;

  const handleClose = () => {
    setIsMobileMenuOpen(false);
    if (onCloseMobile) onCloseMobile();
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error(e);
    } finally {
      window.location.href = "/login";
    }
  };

  const navContent = (
    <div className="flex flex-col h-full justify-between p-5">
      <div>
        {/* LOGO DE MONTAÑA OFICIAL Y BOTÓN CERRAR EN MÓVIL */}
        <div className="flex items-center justify-between px-1 py-3 mb-6 border-b border-slate-800">
          <BrandLogo />
          <button
            onClick={handleClose}
            className="lg:hidden p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NAVEGACIÓN */}
        <nav className="space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleClose}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-[#2F80ED] text-white shadow-lg shadow-blue-600/30 font-bold"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* FOOTER & LOGOUT */}
      <div className="pt-4 border-t border-slate-800">
        <Link
          href="/perfil"
          onClick={handleClose}
          className="block p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors mb-3 text-xs text-slate-400 group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>David (Administrador)</span>
            </div>
            <User className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400" />
          </div>
          <p className="text-[11px] text-slate-500 truncate mt-0.5">Configurar cuenta & App</p>
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Sidebar Desktop fijo a la izquierda (oculto en móvil) */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#091122] border-r border-slate-800 fixed inset-y-0 left-0 z-40">
        {navContent}
      </aside>

      {/* Drawer Móvil (se desliza suavemente desde el lateral al pulsar el menú hamburguesa ≡) */}
      {isDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            onClick={handleClose}
          />
          <div className="relative flex flex-col w-72 max-w-[85%] bg-[#091122] border-r border-slate-800 z-50 animate-in slide-in-from-left duration-200 shadow-2xl">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};
