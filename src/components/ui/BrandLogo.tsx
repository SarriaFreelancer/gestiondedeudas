import React from "react";

export const BrandLogo: React.FC<{ size?: "sm" | "md" | "lg" }> = ({ size = "md" }) => {
  return (
    <div className="flex items-center gap-2.5">
      {/* Icono de Montaña estilizado idéntico a la imagen */}
      <div className="relative w-10 h-10 flex-shrink-0 flex items-center justify-center">
        <svg viewBox="0 0 100 85" className="w-full h-full drop-shadow-md">
          {/* Montaña trasera dorada */}
          <polygon
            points="50,5 75,55 25,55"
            fill="url(#goldGradient)"
            stroke="#D97706"
            strokeWidth="1.5"
          />
          {/* Pico nevado trasero */}
          <polygon points="50,5 57,20 50,17 43,20" fill="#FEF3C7" />

          {/* Montaña frontal azul / cian */}
          <polygon
            points="28,25 62,80 5,80"
            fill="url(#blueGradient)"
            stroke="#0284C7"
            strokeWidth="1.5"
          />
          {/* Pico nevado frontal */}
          <polygon points="28,25 36,45 28,40 20,45" fill="#E0F2FE" />

          {/* Segunda montaña frontal menor */}
          <polygon
            points="70,38 95,80 50,80"
            fill="url(#cyanGradient)"
            stroke="#0D9488"
            strokeWidth="1"
          />

          {/* Línea de base dorada */}
          <path
            d="M 2 80 L 98 80"
            stroke="#F59E0B"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
            <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>
            <linearGradient id="cyanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2DD4BF" />
              <stop offset="100%" stopColor="#0F766E" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="flex flex-col leading-tight">
        <span className="text-[17px] font-extrabold text-white tracking-tight">
          Mi Libertad
        </span>
        <span className="text-[16px] font-black text-white tracking-tight -mt-0.5">
          Financiera
        </span>
      </div>
    </div>
  );
};
