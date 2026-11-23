"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { PaymentModal } from "../installments/PaymentModal";
import { AbonoModal } from "../payments/AbonoModal";

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 flex">
      {/* Sidebar fijo en desktop / drawer en móvil */}
      <Sidebar
        isOpenMobile={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Contenido Principal con margen para el sidebar */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <Header onToggleMobile={() => setIsMobileOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Modales globales de pago y abono */}
      <PaymentModal />
      <AbonoModal />
    </div>
  );
};
