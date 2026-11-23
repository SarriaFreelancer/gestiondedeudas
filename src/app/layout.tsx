import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { FinancialProvider } from "@/context/FinancialContext";
import { AppShell } from "@/components/layout/AppShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mi Libertad Financiera — Sistema Personal de Gestión de Deudas",
  description: "Control, organización, tranquilidad y progreso económico hacia la cancelación total de obligaciones.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0B1120] text-slate-100 min-h-screen selection:bg-blue-600 selection:text-white`}
      >
        <FinancialProvider>
          <AppShell>{children}</AppShell>
        </FinancialProvider>
      </body>
    </html>
  );
}
