"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { RotateCw, Menu, User } from "lucide-react";
import { useFinancial } from "@/context/FinancialContext";
import { BrandLogo } from "../ui/BrandLogo";

export const MountainHero: React.FC = () => {
  const { refreshData, loading, setIsMobileMenuOpen, usuario } = useFinancial();
  const [timeStr, setTimeStr] = useState("9:41 a.m.");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString("es-CO", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      );
    };
    updateTime();
  }, []);

  // Obtener primer nombre del usuario logueado (por ejemplo, "David")
  const primerNombre = usuario?.nombre ? usuario.nombre.trim().split(" ")[0] : "David";

  return (
    // Espacio superior elegante (mt-2 sm:mt-4) para despegar la imagen del notch / borde del teléfono
    <div className="relative w-full overflow-hidden rounded-3xl bg-[#091122] border border-blue-900/30 mt-2 sm:mt-4 mb-4 sm:mb-6 shadow-2xl">
      {/* Fondo de cordillera de montañas con resplandor y flecha ascendente */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Glow azul celestial */}
        <div className="absolute top-0 right-1/4 w-96 h-48 bg-blue-500/25 blur-3xl rounded-full" />
        <div className="absolute top-2 right-10 w-44 h-44 bg-cyan-400/20 blur-2xl rounded-full" />

        {/* SVG Silueta de Montañas con iluminación azul de fondo */}
        <svg
          viewBox="0 0 1000 320"
          preserveAspectRatio="none"
          className="absolute bottom-0 w-full h-full opacity-60"
        >
          {/* Montañas de fondo oscuras */}
          <polygon
            points="0,320 180,140 320,230 480,90 620,200 780,60 920,180 1000,100 1000,320"
            fill="#0D1B36"
          />

          {/* Montañas intermedias con aristas azuladas */}
          <polygon
            points="0,320 120,180 250,260 420,130 550,220 740,80 860,190 1000,130 1000,320"
            fill="#08142B"
          />

          {/* Montañas frontales */}
          <polygon
            points="0,320 80,240 200,280 340,190 500,270 680,140 820,240 960,160 1000,200 1000,320"
            fill="#050C1B"
          />

          {/* Flecha ascendente brillante hacia la cima */}
          <g className="animate-pulse">
            <line
              x1="520"
              y1="220"
              x2="730"
              y2="90"
              stroke="#38BDF8"
              strokeWidth="5"
              strokeLinecap="round"
              className="drop-shadow-[0_0_12px_rgba(56,189,248,0.9)]"
            />
            <polygon
              points="730,75 750,95 725,102"
              fill="#38BDF8"
              className="drop-shadow-[0_0_15px_rgba(56,189,248,1)]"
            />
          </g>
        </svg>

        {/* Gradiente vertical para oscurecer la base */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080E1A] via-transparent to-transparent" />
      </div>

      {/* Contenido en primer plano */}
      <div className="relative z-10 p-4 sm:p-7 flex flex-col justify-between">
        {/* FILA SUPERIOR: Logo a la izquierda, Foto de Perfil en circulito y Menú hamburguesa (≡) a la derecha */}
        <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-blue-900/30">
          <BrandLogo />

          <div className="flex items-center gap-2.5">
            {/* Foto de Perfil en circulito con enlace para editar */}
            <Link
              href="/perfil"
              className="relative group block"
              title={`Perfil de ${usuario?.nombre || "Usuario"} (Clic para editar)`}
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border-2 border-emerald-400 bg-slate-800 flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 group-hover:border-emerald-300 transition-all">
                {usuario?.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={usuario.avatar}
                    alt={usuario.nombre}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-black text-white">
                    {(usuario?.nombre || "D").charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </Link>

            {/* Botón de Menú lateral en móvil (≡) */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-slate-900/70 border border-slate-700/60 text-slate-200 hover:text-white hover:bg-slate-800 transition-colors"
              title="Abrir menú de navegación"
              aria-label="Abrir menú"
            >
              <Menu className="w-5 h-5 stroke-[2.2]" />
            </button>
          </div>
        </div>

        {/* FILA INFERIOR: Saludo personalizado con el nombre del usuario y Pastilla "Actualizado hoy" */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight">
                ¡Hola {primerNombre}!
              </h1>
              <span className="text-xl sm:text-3xl animate-bounce">💪</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 font-medium mt-0.5">
              Vamos por tu libertad financiera
            </p>
          </div>

          {/* Pastilla "Actualizado hoy" */}
          <button
            onClick={() => refreshData()}
            disabled={loading}
            className="self-start sm:self-center flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#0B1E19]/80 border border-emerald-500/30 hover:border-emerald-500/60 shadow-lg shadow-emerald-950/40 backdrop-blur-md transition-all group"
          >
            <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400 group-hover:rotate-180 transition-transform duration-500">
              <RotateCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </div>
            <div className="flex flex-col text-left leading-none">
              <span className="text-[10px] text-emerald-300 font-medium">Actualizado hoy</span>
              <span className="text-[11px] text-emerald-400 font-bold mt-0.5">{timeStr}</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
