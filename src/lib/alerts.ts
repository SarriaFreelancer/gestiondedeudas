import Swal, { SweetAlertOptions, SweetAlertResult } from "sweetalert2";

// Configuración visual nocturna y moderna personalizada para "Mi Libertad Financiera"
const darkModalStyles = {
  background: "#091122",
  color: "#F8FAFC",
  customClass: {
    popup: "rounded-3xl border border-blue-900/40 shadow-2xl backdrop-blur-xl p-5 sm:p-6",
    title: "text-lg sm:text-xl font-bold text-white tracking-tight",
    htmlContainer: "text-xs sm:text-sm text-slate-300 font-normal leading-relaxed",
    confirmButton:
      "px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#091122]",
    cancelButton:
      "px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#091122]",
    actions: "gap-2.5 mt-4",
  },
  buttonsStyling: false,
};

export const AppAlert = {
  /**
   * Alerta de Éxito
   */
  success: (title: string, message?: string): Promise<SweetAlertResult> => {
    return Swal.fire({
      ...darkModalStyles,
      icon: "success",
      iconColor: "#10B981", // Emerald
      title,
      html: message,
      confirmButtonText: "Entendido",
      customClass: {
        ...darkModalStyles.customClass,
        confirmButton:
          "px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-500/20 focus:ring-emerald-500",
      },
    });
  },

  /**
   * Alerta de Error
   */
  error: (title: string, message?: string): Promise<SweetAlertResult> => {
    return Swal.fire({
      ...darkModalStyles,
      icon: "error",
      iconColor: "#EF4444", // Red
      title,
      html: message,
      confirmButtonText: "Cerrar",
      customClass: {
        ...darkModalStyles.customClass,
        confirmButton:
          "px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-red-600 hover:bg-red-500 text-white shadow-red-500/20 focus:ring-red-500",
      },
    });
  },

  /**
   * Alerta de Advertencia / Alerta
   */
  warning: (title: string, message?: string): Promise<SweetAlertResult> => {
    return Swal.fire({
      ...darkModalStyles,
      icon: "warning",
      iconColor: "#F59E0B", // Amber
      title,
      html: message,
      confirmButtonText: "Entendido",
      customClass: {
        ...darkModalStyles.customClass,
        confirmButton:
          "px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-amber-600 hover:bg-amber-500 text-white shadow-amber-500/20 focus:ring-amber-500",
      },
    });
  },

  /**
   * Modal de Confirmación Moderno (Reemplaza confirm(...))
   */
  confirm: async (
    title: string,
    message?: string,
    options?: {
      confirmText?: string;
      cancelText?: string;
      isDestructive?: boolean;
    }
  ): Promise<boolean> => {
    const isDestructive = options?.isDestructive ?? true;
    const confirmButtonClass = isDestructive
      ? "px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-red-600 hover:bg-red-500 text-white shadow-red-600/30 focus:ring-red-500"
      : "px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-blue-500/30 focus:ring-blue-500";

    const result = await Swal.fire({
      ...darkModalStyles,
      icon: isDestructive ? "warning" : "question",
      iconColor: isDestructive ? "#F97316" : "#38BDF8",
      title,
      html: message,
      showCancelButton: true,
      confirmButtonText: options?.confirmText || (isDestructive ? "Sí, eliminar" : "Sí, continuar"),
      cancelButtonText: options?.cancelText || "Cancelar",
      reverseButtons: true,
      customClass: {
        ...darkModalStyles.customClass,
        confirmButton: confirmButtonClass,
        cancelButton:
          "px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 focus:ring-slate-500",
      },
    });

    return result.isConfirmed;
  },

  /**
   * Toast flotante para acciones rápidas en móvil/desktop
   */
  toast: (
    title: string,
    icon: "success" | "error" | "warning" | "info" = "success"
  ) => {
    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      background: "#091122",
      color: "#F8FAFC",
      customClass: {
        popup: "rounded-2xl border border-blue-900/40 shadow-2xl backdrop-blur-xl p-3",
        title: "text-xs font-bold text-white",
      },
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      },
    });

    return Toast.fire({
      icon,
      title,
    });
  },
};
