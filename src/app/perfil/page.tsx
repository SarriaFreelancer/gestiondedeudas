"use client";

import React, { useState, useEffect, useRef } from "react";
import { useFinancial } from "@/context/FinancialContext";
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
  Calendar,
  Database,
  ExternalLink,
  Sparkles,
} from "lucide-react";

export default function PerfilPage() {
  const { refreshUsuario } = useFinancial();
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
  const handleSavePerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPerfil(true);
    setErrorPerfil(null);
    setSuccessPerfil(null);

    try {
      const res = await fetch("/api/usuario/perfil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          email,
          telefono,
          avatar,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al actualizar perfil");
      }

      await refreshUsuario();
      setSuccessPerfil("¡Perfil actualizado exitosamente!");
      setTimeout(() => setSuccessPerfil(null), 4000);
    } catch (err: any) {
      setErrorPerfil(err.message || "No se pudo actualizar el perfil");
    } finally {
      setSavingPerfil(false);
    }
  };

  // Cambiar contraseña
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPassword(true);
    setErrorPassword(null);
    setSuccessPassword(null);

    if (passwordNueva !== passwordConfirm) {
      setErrorPassword("La nueva contraseña y la confirmación no coinciden.");
      setSavingPassword(false);
      return;
    }

    if (passwordNueva.length < 6) {
      setErrorPassword("La nueva contraseña debe tener al menos 6 caracteres.");
      setSavingPassword(false);
      return;
    }

    try {
      const res = await fetch("/api/usuario/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passwordActual,
          passwordNueva,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al cambiar contraseña");
      }

      setSuccessPassword("¡Contraseña actualizada exitosamente!");
      setPasswordActual("");
      setPasswordNueva("");
      setPasswordConfirm("");
      setTimeout(() => setSuccessPassword(null), 4000);
    } catch (err: any) {
      setErrorPassword(err.message || "No se pudo actualizar la contraseña");
    } finally {
      setSavingPassword(false);
    }
  };

  // Disparar instalación PWA
  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
    } else {
      alert(
        "Para instalar en tu teléfono:\n\n1. En Android (Chrome): Pulsa los 3 puntos superiores y selecciona 'Instalar aplicación' o 'Agregar a pantalla principal'.\n2. En iPhone (Safari): Pulsa el botón Compartir y selecciona 'Agregar al inicio'."
      );
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      {/* HEADER */}
      <div className="flex items-center gap-3 p-6 rounded-3xl bg-[#151F32] border border-slate-800 shadow-xl">
        <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
          <User className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            Perfil de Usuario & Configuración
          </h1>
          <p className="text-xs text-slate-400">
            Gestiona tus datos personales, contraseña, app móvil, calendario y copias de seguridad
          </p>
        </div>
      </div>

      {/* SECCIÓN 1: DATOS PERSONALES Y FOTO */}
      <div className="p-6 rounded-3xl bg-[#151F32] border border-slate-800 shadow-xl space-y-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Datos Personales & Fotografía
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

        <form onSubmit={handleSavePerfil} className="space-y-6">
          {/* FOTO DE PERFIL */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-blue-500 bg-slate-800 flex items-center justify-center shadow-lg">
                {avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatar} alt="Foto de perfil" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-slate-500" />
                )}
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 rounded-full flex flex-col items-center justify-center text-white transition-opacity"
              >
                <Camera className="w-6 h-6 mb-1" />
                <span className="text-[10px] font-bold">Cambiar</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoSelect}
              />
            </div>

            <div className="flex-1 text-center sm:text-left space-y-1">
              <h3 className="text-sm font-bold text-white">Foto de Perfil</h3>
              <p className="text-xs text-slate-400">
                Formatos permitidos: JPG, PNG o WebP (máx. 3 MB). Se guarda con tu usuario.
              </p>
              <div className="pt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 font-semibold transition-colors"
                >
                  Subir Foto
                </button>
                {avatar && (
                  <button
                    type="button"
                    onClick={() => setAvatar(null)}
                    className="px-3 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/50 text-xs text-red-300 border border-red-800/40 font-semibold transition-colors"
                  >
                    Quitar Foto
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* CAMPOS DE DATOS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nombre Completo *
              </label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. David Sarria"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Correo Electrónico *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sarriafreelancer7@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Teléfono / WhatsApp (Opcional)
              </label>
              <input
                type="text"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="+57 300 000 0000"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingPerfil}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50"
            >
              {savingPerfil ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Guardar Cambios</span>
            </button>
          </div>
        </form>
      </div>

      {/* SECCIÓN 2: CAMBIO DE CONTRASEÑA */}
      <div className="p-6 rounded-3xl bg-[#151F32] border border-slate-800 shadow-xl space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-400" />
          Seguridad & Cambio de Contraseña
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

        <form onSubmit={handleSavePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Contraseña Actual *
            </label>
            <input
              type="password"
              required
              placeholder="Ingresa tu contraseña actual"
              value={passwordActual}
              onChange={(e) => setPasswordActual(e.target.value)}
              className="w-full sm:w-1/2 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500 font-medium"
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
                placeholder="Mínimo 6 caracteres"
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

      {/* SECCIÓN 3: SINCRONIZACIÓN GOOGLE CALENDAR */}
      <div className="p-6 rounded-3xl bg-[#091122] border border-emerald-900/40 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            Sincronización con Google Calendar
          </h2>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            sarriafreelancer7@gmail.com
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Sincroniza automáticamente los vencimientos de todas tus cuotas en tu cuenta de Google{" "}
          <strong className="text-emerald-400">sarriafreelancer7@gmail.com</strong> con alarmas
          inteligentes (3 días antes y el mismo día a las 8:00 AM) para no volver a incurrir en
          intereses de mora ni cobros imprevistos.
        </p>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-white block">
              Descargar Archivo de Calendario (.ics)
            </span>
            <span className="text-[11px] text-slate-400 block">
              Contiene todas las fechas de pago, montos exactos y alarmas programadas.
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <a
              href="/api/calendario"
              download="cuotas_libertad_financiera.ics"
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-transform active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Descargar .ics</span>
            </a>

            <a
              href="https://calendar.google.com/calendar/u/0/r/settings/export"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title="Abrir Importador de Google Calendar"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-400 space-y-1">
          <span className="font-bold text-slate-200 block mb-1">
            📌 ¿Cómo importarlo en Google Calendar?
          </span>
          <p>
            1. Haz clic en <b>&apos;Descargar .ics&apos;</b> para obtener tu agenda actualizada.
          </p>
          <p>
            2. Abre Google Calendar en tu navegador o móvil con la cuenta{" "}
            <code className="text-emerald-400">sarriafreelancer7@gmail.com</code>.
          </p>
          <p>
            3. Ve a <i>Configuración &gt; Importar y exportar</i> y selecciona el archivo descargado.
            ¡Tus recordatorios aparecerán instantáneamente con notificaciones push en tu teléfono!
          </p>
        </div>
      </div>

      {/* SECCIÓN 4: COPIAS DE SEGURIDAD (BACKUP) */}
      <div className="p-6 rounded-3xl bg-[#091122] border border-blue-900/30 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-400" />
            Copia de Seguridad y Respaldo
          </h2>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase">
            1-Click Backup
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Descarga un respaldo completo e instantáneo de toda tu información financiera (deudas,
          cuotas, abonos, historial auditable y comprobantes) en formato JSON estructurado.
        </p>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-white block">Respaldo Integral en JSON</span>
            <span className="text-[11px] text-slate-400">
              Ideal para migración de servidores o almacenamiento seguro personal.
            </span>
          </div>

          <a
            href="/api/backup"
            download={`backup_libertad_financiera_${new Date().toISOString().slice(0, 10)}.json`}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-transform active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Descargar Copia de Seguridad</span>
          </a>
        </div>
      </div>

      {/* SECCIÓN 5: INSTALACIÓN EN EL TELÉFONO (PWA / APK) */}
      <div className="p-6 rounded-3xl bg-[#091122] border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-indigo-400" />
            Instalación en tu Teléfono (App / APK)
          </h2>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
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

      {/* SECCIÓN 6: INFORMACIÓN DE HOSTINGER & SERVIDOR */}
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