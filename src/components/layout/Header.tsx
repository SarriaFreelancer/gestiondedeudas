"use client";

import React from "react";
import { Menu } from "lucide-react";
import { BrandLogo } from "../ui/BrandLogo";

export const Header: React.FC<{ onToggleMobile: () => void }> = ({ onToggleMobile }) => {
  return (
    <header className="sticky top-0 z-30 h-16 bg-[#070D1A]/90 backdrop-blur-md border-b border-slate-800/60 px-4 sm:px-6 flex items-center justify-between">
      {/* Logotipo exacto a la imagen: Montaña dorada y azul + Mi Libertad Financiera */}
      <BrandLogo />

      {/* Botón de Menú Hamburguesa a la derecha idéntico a la imagen */}
      <button
        onClick={onToggleMobile}
        className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
        aria-label="Menú principal"
      >
        <Menu className="w-6 h-6 stroke-[2]" />
      </button>
    </header>
  );
};
