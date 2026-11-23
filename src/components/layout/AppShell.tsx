"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { PaymentModal } from "../installments/PaymentModal";
import { AbonoModal } from "../payments/AbonoModal";
import { useFinancial } from "@/context/FinancialContext";

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useFinancial();

  // Si estamos en la página de Login, renderizar 100% limpia afuera del dashboard (sin Sidebar, Header ni BottomNav)
  if (pathname === "/login") {
    return <div className="min-h-screen w-full bg-[#070D1A] overflow-x-hidden">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-[#070D1A] text-slate-100 flex flex-col justify-between">
      {/* Sidebar Desktop fijo a la izquierda (en móvil y tablet abre como drawer overlay si isMobileMenuOpen es true) */}
      <Sidebar
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Contenedor central adaptable a teléfonos, tablets y monitores */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen w-full min-w-0">
        {/* Header visible ÚNICAMENTE en versión de escritorio (hidden lg:flex) */}
        <Header />

        {/* Contenido principal con padding inferior adecuado para la barra flotante móvil */}
        <main className="flex-1 p-3 sm:p-5 md:p-6 lg:p-8 max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl w-full mx-auto pb-28 lg:pb-8 min-w-0">
          {children}
        </main>

        {/* Barra de navegación inferior: visible en móviles y tablets en modo táctil (lg:hidden) */}
        <BottomNav />
      </div>

      {/* Modales globales de pago y abono */}
      <PaymentModal />
      <AbonoModal />
    </div>
  );
};

