"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { PaymentModal } from "../installments/PaymentModal";
import { AbonoModal } from "../payments/AbonoModal";

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#070D1A] text-slate-100 flex flex-col justify-between">
      {/* Sidebar Desktop fijo a la izquierda (oculto en móvil) */}
      <Sidebar
        isOpenMobile={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Contenedor central adaptable */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <Header onToggleMobile={() => setIsMobileOpen(true)} />

        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-xl sm:max-w-3xl lg:max-w-5xl xl:max-w-6xl w-full mx-auto pb-24 lg:pb-8">
          {children}
        </main>

        {/* Barra de navegación inferior: ÚNICAMENTE visible en móviles (lg:hidden) */}
        <BottomNav />
      </div>

      {/* Modales globales de pago y abono */}
      <PaymentModal />
      <AbonoModal />
    </div>
  );
};
