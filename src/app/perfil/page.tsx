"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  User,
  Camera,
  Mail,
  Phone,
  Lock,
  Smartphone,
  Server,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Download,
  ShieldCheck,
  Globe,
} from "lucide-react";

export default function PerfilPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados de datos de usuario
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);

  // Estados de cambio de contraseña
  const [passwordActual, setPasswordActual] = useState("");
  const [passwordNueva, setPasswordNueva] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  // Estados de proceso
  const [loadingData, setLoadingData] = useState(true);
  const [savingPerfil, setSavingPerfil] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [errorPerfil, setErrorPerfil] = useState<string | null>(null);
  const [successPerfil, setSuccessPerfil] = useState<string | null>(null);
  const [errorPassword, setErrorPassword] = useState<string | null>(null);
  const [successPassword, setSuccessPassword] = useState<string | null>(null);

  // PWA Prompt
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [appOrigin, setAppOrigin] = useState("");

  useEffect(() => {
    // Detectar origen
    if (typeof window !== "undefined") {
      setAppOrigin(window.location.origin);
    }

    // Escuchar evento de instalación PWA
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // Cargar perfil actual
    const fetchPerfil = async () => {
      try {
        setLoadingData(true);
        const res = await fetch("/api/usuario/perfil");
        const data = await res.json();
        if (res.ok) {
          setNombre(data.nombre || "");
          setEmail(data.email || "");
          setTelefono(data.telefono || "");
          setAvatar(data.avatar || null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchPerfil();

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Manejador de selección de foto
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setErrorPerfil("La imagen no debe superar los 3 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Guardar datos del perfil
  const handleGuardarPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPerfil(true);
    setErrorPerfil(null);
    setSuccessPerfil(null);

    try {
      const res = await fetch("/api/usuario/perfil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, telefono, avatar }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al actualizar perfil");
      }

      setSuccessPerfil("¡Perfil y foto guardados exitosamente!");
    } catch (err: any) {
      setErrorPerfil(err.message || "No se pudo actualizar el perfil");
    } finally {
      setSavingPerfil(false);
    }
  };

  // Guardar nueva contraseña
  const handleCambiarPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorPassword(null);
    setSuccessPassword(null);

    if (passwordNueva !== passwordConfirm) {
      setErrorPassword("Las contraseñas nuevas no coinciden.");
      return;
    }

    setSavingPassword(true);

    try {
      const res = await fetch("/api/usuario/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passwordActual, passwordNueva }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al cambiar contraseña");
      }

      setSuccessPassword("¡Contraseña actualizada exitosamente!");
      setPasswordActual("");
      setPasswordNueva("");
      setPasswordConfirm("");
    } catch (err: any) {
      setErrorPassword(err.message || "No se pudo cambiar la contraseña");
    } finally {
      setSavingPassword(false);
    }
  };

  // Disparar instalación de App PWA
  const handleInstallApp = async () => {
    if (!deferredPrompt) {
      alert(
        "Para instalar en tu teléfono:\n\n• En Android (Chrome): Toca los 3 puntos arriba a la derecha y selecciona 'Instalar aplicación' o 'Agregar a la pantalla principal'.\n\n• En iPhone (Safari): Toca el botón Compartir y selecciona 'Agregar al inicio'."
      );
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  if (loadingData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <span className="text-xs text-slate-400">Cargando perfil y configuración...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* HEADER */}
      <div className="p-6 rounded-3xl bg-[#091122] border border-slate-800 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Perfil & Configuración
            </h1>
            <p className="text-xs text-slate-400">
              Personaliza tu cuenta, cambia tu contraseña y configura la app para tu teléfono
            </p>
          </div>
        </div>
      </div>

      {/* SECCIÓN 1: FOTO DE PERFIL & DATOS PERSONALES */}
      <div className="p-6 rounded-3xl bg-[#091122] border border-slate-800 shadow-xl space-y-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <User className="w-4 h-4 text-emerald-400" />
          Datos Personales & Foto
        </h2>

        {errorPerfil && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorPerfil}</span>
          </div>
        )}

        {successPerfil && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successPerfil}</span>
          </div>
        )}

        {/* FOTO DE PERFIL CON BOTÓN DE CÁMARA */}
        <div className="flex flex-col sm:flex-row items-center gap-5 pb-4 border-b border-slate-800">
          <div className="relative group">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-slate-700 bg-slate-800 flex items-center justify-center shadow-lg">
              {avatar ? (
                <img
                  src={avatar}
                  alt="Foto de perfil"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-3xl font-black text-blue-400">
                  {nombre ? nombre.slice(0, 2).toUpperCase() : "AD"}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/40 border-2 border-[#091122] transition-transform hover:scale-110 active:scale-95"
              title="Cambiar foto de perfil"
            >
              <Camera className="w-4 h-4" />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoSelect}
            />
          </div>

          <div className="text-center sm:text-left space-y-1">
            <h3 className="text-base font-bold text-white">{nombre || "Administrador"}</h3>
            <p className="text-xs text-slate-400">{email}</p>
            <p className="text-[11px] text-slate-500">
              Formatos recomendados: JPG, PNG, WebP (máx. 3 MB)
            </p>
            {avatar && (
              <button
                type="button"
                onClick={() => setAvatar(null)}
                className="text-[11px] text-red-400 hover:text-red-300 font-semibold"
              >
                Eliminar foto
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleGuardarPerfil} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nombre de Usuario / Titular *
              </label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Correo Electrónico *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Teléfono / WhatsApp (Opcional)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Ej. +57 300 123 4567"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingPerfil}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
            >
              {savingPerfil ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Guardar Información</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* SECCIÓN 2: SEGURIDAD & CONTRASEÑA */}
      <div className="p-6 rounded-3xl bg-[#091122] border border-slate-800 shadow-xl space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-400" />
          Cambiar Contraseña
        </h2>

        {errorPassword && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorPassword}</span>
          </div>
        )}

        {successPassword && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successPassword}</span>
          </div>
        )}

        <form onSubmit={handleCambiarPassword} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Contraseña Actual *
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={passwordActual}
              onChange={(e) => setPasswordActual(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nueva Contraseña *
              </label>
              <input
                type="password"
                required
                placeholder="Mínimo 4 caracteres"
                value={passwordNueva}
                onChange={(e) => setPasswordNueva(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Confirmar Nueva Contraseña *
              </label>
              <input
                type="password"
                required
                placeholder="Repite la nueva contraseña"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingPassword}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors disabled:opacity-50"
            >
              {savingPassword ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span>Actualizar Contraseña</span>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* SECCIÓN 3: INSTALACIÓN EN EL TELÉFONO (PWA / APK) */}
      <div className="p-6 rounded-3xl bg-[#091122] border border-blue-900/30 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-blue-400" />
            Instalación en tu Teléfono (App / APK)
          </h2>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase">
            PWA Standalone
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Esta aplicación cuenta con soporte nativo de **Progressive Web App (PWA)**. Al
          instalarla en tu teléfono, se ejecuta en pantalla completa sin barra de navegador, con
          icono en tu menú de inicio y rendimiento nativo tipo APK.
        </p>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-white block">Instalar en un clic</span>
            <span className="text-[11px] text-slate-400">
              Compatible con Android (Chrome) y iPhone (Safari)
            </span>
          </div>

          <button
            onClick={handleInstallApp}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-transform active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Instalar App en Teléfono</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-400 pt-2">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <span className="font-bold text-slate-200 block mb-1">🤖 En Android:</span>
            <span>
              Abre el enlace en Chrome, presiona los 3 puntos (⋮) y pulsa{" "}
              <b className="text-emerald-400">&apos;Instalar aplicación&apos;</b> o{" "}
              <b className="text-emerald-400">&apos;Agregar a la pantalla principal&apos;</b>.
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <span className="font-bold text-slate-200 block mb-1">🍏 En iPhone (iOS):</span>
            <span>
              Abre en Safari, pulsa el botón Compartir (cuadrado con flecha hacia arriba) y toca{" "}
              <b className="text-blue-400">&apos;Agregar al inicio&apos;</b>.
            </span>
          </div>
        </div>
      </div>

      {/* SECCIÓN 4: INFORMACIÓN DE HOSTINGER & SERVIDOR */}
      <div className="p-6 rounded-3xl bg-[#091122] border border-slate-800 shadow-xl space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Server className="w-4 h-4 text-purple-400" />
          Servidor & Dominio de Hostinger
        </h2>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Dirección / Origen Actual:</span>
            <span className="font-mono font-bold text-emerald-400">
              {appOrigin || "http://localhost:3000"}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Arquitectura:</span>
            <span className="font-semibold text-slate-200">
              Next.js Full Stack (Frontend + Backend Integrados)
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Rutas de Backend:</span>
            <span className="font-semibold text-slate-200">
              Relativas automáticas (<code className="text-blue-400">/api/*</code>)
            </span>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
          💡 <b>Nota importante para tu subida a Hostinger:</b> Dado que la aplicación está
          construida con Next.js App Router, el backend y el frontend residen en el mismo proyecto.
          Cuando configures tu dominio o VPS en Hostinger, <b>no necesitas configurar IPs separadas</b>{" "}
          para el backend porque las peticiones se realizan de forma relativa a tu propio dominio.
        </p>
      </div>
    </div>
  );
}
