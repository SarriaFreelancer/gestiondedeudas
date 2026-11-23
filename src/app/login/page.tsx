"use client";

import React, { useState } from "react";
import { Lock, Mail, ArrowRight, Loader2, ShieldCheck, UserPlus, KeyRound, User, Phone, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { AppAlert } from "@/lib/alerts";

type AuthMode = "LOGIN" | "REGISTER" | "RECOVER";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("LOGIN");

  // Formulario Login
  const [email, setEmail] = useState("davidjuanmontano7@gmail.com");
  const [password, setPassword] = useState("Admin123");

  // Formulario Registro
  const [regNombre, setRegNombre] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regTelefono, setRegTelefono] = useState("");

  // Formulario Recuperar
  const [recEmail, setRecEmail] = useState("");
  const [recNewPassword, setRecNewPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al autenticar");
      }

      window.location.href = "/";
    } catch (err: any) {
      setError(err.message || "Credenciales incorrectas");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: regNombre,
          email: regEmail,
          password: regPassword,
          telefono: regTelefono,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al registrar");
      }

      AppAlert.toast("¡Cuenta creada con éxito! Bienvenido.", "success");
      window.location.href = "/";
    } catch (err: any) {
      setError(err.message || "Error al registrar");
    } finally {
      setLoading(false);
    }
  };

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/auth/recuperar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: recEmail,
          newPassword: recNewPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al restablecer");
      }

      setSuccessMsg(data.message || "Contraseña restablecida exitosamente.");
      AppAlert.toast("Contraseña actualizada con éxito", "success");
      setTimeout(() => {
        setMode("LOGIN");
        setEmail(recEmail);
        setPassword(recNewPassword);
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Error al restablecer contraseña");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[90vh] flex items-center justify-center p-4 overflow-hidden">
      {/* FONDO NOCTURNO DE CORDILLERA DE MONTAÑAS CON ILUMINACIÓN CELESTIAL */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Resplandores celestiales */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-blue-600/20 via-cyan-500/10 to-transparent blur-3xl rounded-full" />
        <div className="absolute top-1/4 right-10 w-80 h-80 bg-blue-500/15 blur-3xl rounded-full" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-indigo-600/15 blur-3xl rounded-full" />

        {/* SVG Silueta de Montañas Nocturnas */}
        <svg
          viewBox="0 0 1000 400"
          preserveAspectRatio="none"
          className="absolute bottom-0 w-full h-[55vh] opacity-75"
        >
          <polygon
            points="0,400 160,180 300,280 460,120 600,240 760,90 900,200 1000,130 1000,400"
            fill="#09142A"
          />
          <polygon
            points="0,400 110,230 240,310 400,170 540,260 720,110 850,220 1000,160 1000,400"
            fill="#060E1E"
          />
          <polygon
            points="0,400 70,290 190,330 330,230 480,310 660,180 800,270 950,200 1000,240 1000,400"
            fill="#030710"
          />
          <g className="animate-pulse">
            <line
              x1="520"
              y1="250"
              x2="720"
              y2="120"
              stroke="#38BDF8"
              strokeWidth="5"
              strokeLinecap="round"
              className="drop-shadow-[0_0_14px_rgba(56,189,248,0.95)]"
            />
            <polygon
              points="720,105 740,125 715,132"
              fill="#38BDF8"
              className="drop-shadow-[0_0_16px_rgba(56,189,248,1)]"
            />
          </g>
        </svg>

        <div className="absolute inset-0 bg-gradient-to-t from-[#070D1A] via-transparent to-[#070D1A]/80" />
      </div>

      {/* TARJETA GLASSMORPHIC ELEGANTE */}
      <div className="relative z-10 w-full max-w-md p-6 sm:p-8 rounded-3xl bg-[#091122]/90 border border-blue-500/30 shadow-[0_0_50px_rgba(15,23,42,0.8)] backdrop-blur-2xl">
        <div className="text-center mb-5">
          <div className="flex justify-center mb-3">
            <BrandLogo />
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center justify-center gap-2">
            <span>
              {mode === "LOGIN" && "Iniciar Sesión"}
              {mode === "REGISTER" && "Crear Nueva Cuenta"}
              {mode === "RECOVER" && "Recuperar Contraseña"}
            </span>
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            {mode === "LOGIN" && "Ingreso a tu sistema de libertad financiera"}
            {mode === "REGISTER" && "Regístrate para gestionar tus deudas y tu salario"}
            {mode === "RECOVER" && "Ingresa tu correo y define tu nueva contraseña"}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs text-center font-medium">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs text-center font-medium flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 1. MODO INICIAR SESIÓN */}
        {mode === "LOGIN" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-blue-500 font-medium transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setSuccessMsg(null);
                    setRecEmail(email);
                    setMode("RECOVER");
                  }}
                  className="text-[11px] text-[#38BDF8] hover:underline font-semibold"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-blue-500 font-medium transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-[#2F80ED] to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black tracking-wide shadow-lg shadow-blue-600/40 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Iniciando sesión...</span>
                </>
              ) : (
                <>
                  <span>Ingresar al Sistema</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-3 text-center border-t border-slate-800">
              <span className="text-xs text-slate-400">¿No tienes una cuenta aún? </span>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setSuccessMsg(null);
                  setMode("REGISTER");
                }}
                className="text-xs font-bold text-emerald-400 hover:underline inline-flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Registrarme gratis</span>
              </button>
            </div>
          </form>
        )}

        {/* 2. MODO REGISTRO */}
        {mode === "REGISTER" && (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nombre Completo
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={regNombre}
                  onChange={(e) => setRegNombre(e.target.value)}
                  placeholder="Tu nombre"
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Mínimo 4 caracteres"
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Teléfono móvil (Opcional)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="tel"
                  value={regTelefono}
                  onChange={(e) => setRegTelefono(e.target.value)}
                  placeholder="+57 300 123 4567"
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black tracking-wide shadow-lg shadow-emerald-600/40 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creando tu cuenta...</span>
                </>
              ) : (
                <>
                  <span>Registrarme y Entrar</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-3 text-center border-t border-slate-800">
              <span className="text-xs text-slate-400">¿Ya tienes cuenta? </span>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setSuccessMsg(null);
                  setMode("LOGIN");
                }}
                className="text-xs font-bold text-blue-400 hover:underline"
              >
                Inicia sesión aquí
              </button>
            </div>
          </form>
        )}

        {/* 3. MODO RECUPERAR CONTRASEÑA */}
        {mode === "RECOVER" && (
          <form onSubmit={handleRecover} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Correo Electrónico de tu Cuenta
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={recEmail}
                  onChange={(e) => setRecEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-cyan-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Nueva Contraseña
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={recNewPassword}
                  onChange={(e) => setRecNewPassword(e.target.value)}
                  placeholder="Define tu nueva clave"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-cyan-500 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-black tracking-wide shadow-lg shadow-cyan-600/40 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Restableciendo...</span>
                </>
              ) : (
                <>
                  <span>Actualizar Contraseña</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-3 text-center border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setSuccessMsg(null);
                  setMode("LOGIN");
                }}
                className="text-xs font-bold text-slate-300 hover:text-white"
              >
                ← Volver al Inicio de Sesión
              </button>
            </div>
          </form>
        )}

        <div className="mt-5 pt-3 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sistema cifrado y seguro en MySQL 8</span>
          </p>
        </div>
      </div>
    </div>
  );
}

