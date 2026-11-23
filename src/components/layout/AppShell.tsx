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
      {/* Sidebar Desktop y Drawer Móvil */}
      <Sidebar
        isOpenMobile={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Contenedor central alineado al estilo de la app */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <Header onToggleMobile={() => setIsMobileOpen(true)} />

        <main className="flex-1 p-3.5 sm:p-6 max-w-xl sm:max-w-3xl lg:max-w-4xl w-full mx-auto pb-24">
          {children}
        </main>

        {/* Barra de navegación inferior móvil */}
        <BottomNav />
      </div>

      {/* Modales globales de pago y abono */}
      <PaymentModal />
      <AbonoModal />
    </div>
  );
};
