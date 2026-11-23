import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(4, "La contraseña debe tener al menos 4 caracteres"),
});

export const pagoCuotaSchema = z.object({
  deudaId: z.string().min(1, "Deuda requerida"),
  cuotaId: z.string().min(1, "Cuota requerida"),
  monto: z.number().positive("El monto debe ser mayor a 0").optional(),
  metodoPago: z.string().default("TRANSFERENCIA"),
  referenciaPago: z.string().optional(),
  observaciones: z.string().optional(),
});

export const abonoSchema = z.object({
  deudaId: z.string().min(1, "Deuda requerida"),
  monto: z.number().positive("El monto debe ser mayor a cero"),
  tipo: z.enum(["ABONO_EXTRAORDINARIO", "PAGO_TOTAL"]).default("ABONO_EXTRAORDINARIO"),
  destinoAbono: z.enum(["REDUCIR_CAPITAL", "CUBRIR_MORA", "ADELANTAR_CUOTAS"]).default("REDUCIR_CAPITAL"),
  metodoPago: z.string().default("TRANSFERENCIA"),
  referenciaPago: z.string().optional(),
  observaciones: z.string().optional(),
});

export const crearDeudaSchema = z.object({
  entidad: z.string().min(2, "El nombre de la entidad es requerido"),
  referencia: z.string().optional(),
  montoInicial: z.number().positive("El monto inicial debe ser mayor a 0"),
  valorCuotaMensual: z.number().min(0).default(0),
  cuotasTotales: z.number().int().min(0).default(0),
  diaVencimiento: z.number().int().min(1).max(31).default(5),
  tieneCuotas: z.boolean().default(true),
  observaciones: z.string().optional(),
});

export const revertirMovimientoSchema = z.object({
  movimientoId: z.string().min(1, "ID de movimiento requerido"),
  motivo: z.string().min(3, "Indique el motivo de la reversión"),
});

export function getZodErrorMessage(error: any): string {
  if (error?.issues && Array.isArray(error.issues) && error.issues.length > 0) {
    return error.issues[0]?.message || "Datos inválidos";
  }
  if (error?.errors && Array.isArray(error.errors) && error.errors.length > 0) {
    return error.errors[0]?.message || "Datos inválidos";
  }
  return error?.message || "Datos inválidos";
}
