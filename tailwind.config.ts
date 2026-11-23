import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: "#0B1120",      // Fondo principal oscuro elegante
          card: "#151F32",      // Tarjetas azul oscuro
          cardHover: "#1C2A44", // Hover en tarjetas
          border: "#1E2C42",    // Bordes sutiles
          borderHover: "#2B3E5C",
          primary: "#3B82F6",   // Azul eléctrico
          primaryGlow: "#60A5FA",
          success: "#10B981",   // Verde progreso / pagos
          successDark: "#065F46",
          danger: "#EF4444",    // Rojo deudas pendientes / mora
          dangerDark: "#7F1D1D",
          warning: "#F59E0B",   // Naranja / ámbar
          textMain: "#F8FAFC",  // Blanco textos
          textMuted: "#94A3B8", // Gris secundarios
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "-apple-system", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      boxShadow: {
        card: "0 8px 30px rgba(0, 0, 0, 0.45)",
        glowBlue: "0 0 25px rgba(59, 130, 246, 0.25)",
        glowGreen: "0 0 25px rgba(16, 185, 129, 0.25)",
        glowRed: "0 0 25px rgba(239, 68, 68, 0.25)",
      },
    },
  },
  plugins: [],
} satisfies Config;
