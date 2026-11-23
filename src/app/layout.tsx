import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { FinancialProvider } from "@/context/FinancialContext";
import { BudgetProvider } from "@/context/BudgetContext";
import { AppShell } from "@/components/layout/AppShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#070D1A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Mi Libertad Financiera — Sistema Personal de Gestión de Deudas & Presupuesto",
  description: "Control, organización, tranquilidad y progreso económico hacia la cancelación total de obligaciones y flujo de caja.",
  applicationName: "Mi Libertad Financiera",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Mi Libertad",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#070D1A] text-slate-100 min-h-screen selection:bg-blue-600 selection:text-white`}
      >
        <FinancialProvider>
          <BudgetProvider>
            <AppShell>{children}</AppShell>
          </BudgetProvider>
        </FinancialProvider>
      </body>
    </html>
  );
}
