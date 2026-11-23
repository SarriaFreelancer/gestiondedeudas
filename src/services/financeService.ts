import { prisma } from "@/lib/prisma";
import { EstadoDeuda, EstadoCuota, TipoMovimiento, DestinoAbono } from "@prisma/client";

export interface DashboardSummary {
  deudaTotalInicial: number;
  totalPagado: number;
  saldoPendiente: number;
  progresoPorcentaje: number;
  porcentajePendiente: number;
  cuotasMensualesActivas: number;
  cuotasEnMoraTotales: number;
  totalEnMora: number;
  valorCuotaMensualTotal: number;
  totalDeudas: number;
  deudasPagadas: number;
  distribucionPorEntidad: {
    id: string;
    entidad: string;
    saldoPendiente: number;
    montoInicial: number;
    porcentajeSobreTotal: number;
    estado: string;
    color: string;
  }[];
}

const ENTITY_COLORS: Record<string, string> = {
  NEQUI: "#8B5CF6", // Morado / Púrpura Nequi
  DAVIVIENDA: "#EF4444", // Rojo Davivienda
  "CRÉDITO 20 MINUTOS": "#F59E0B", // Ámbar / Naranja
  NU: "#9333EA", // Violeta Nu
  "TARJETA DE CRÉDITO DAVIBANK": "#06B6D4", // Cian / Azul eléctrico
};

const DEFAULT_COLORS = ["#3B82F6", "#10B981", "#EC4899", "#6366F1", "#14B8A6"];

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const deudas = await prisma.deuda.findMany({
    orderBy: { orden: "asc" },
    include: {
      cuotas: {
        where: { estado: { in: [EstadoCuota.PENDIENTE, EstadoCuota.VENCIDA] } },
      },
      movimientos: {
        where: { estaRevertido: false },
      },
    },
  });

  let deudaTotalInicial = 0;
  let saldoPendiente = 0;
  let cuotasMensualesActivas = 0;
  let cuotasEnMoraTotales = 0;
  let totalEnMora = 0;
  let valorCuotaMensualTotal = 0;
  let deudasPagadas = 0;

  for (const d of deudas) {
    const montoIni = Number(d.montoInicial);
    const saldoPend = Number(d.saldoPendiente);
    const cuotaMensual = Number(d.valorCuotaMensual);
    const mora = Number(d.valorVencidoMora);

    deudaTotalInicial += montoIni;
    saldoPendiente += saldoPend;
    totalEnMora += mora;
    cuotasEnMoraTotales += d.cuotasEnMora;

    if (d.estado !== EstadoDeuda.PAGADA) {
      valorCuotaMensualTotal += cuotaMensual;
      cuotasMensualesActivas += d.cuotas.length;
    } else {
      deudasPagadas += 1;
    }
  }

  // Pagos netos confirmados en el sistema
  const totalPagado = Math.max(0, deudaTotalInicial - saldoPendiente);

  // Porcentajes
  const progresoPorcentaje =
    deudaTotalInicial > 0 ? (totalPagado / deudaTotalInicial) * 100 : 0;
  const porcentajePendiente =
    deudaTotalInicial > 0 ? (saldoPendiente / deudaTotalInicial) * 100 : 0;

  const distribucionPorEntidad = deudas.map((d, index) => {
    const saldo = Number(d.saldoPendiente);
    const pct = saldoPendiente > 0 ? (saldo / saldoPendiente) * 100 : 0;
    return {
      id: d.id,
      entidad: d.entidad,
      saldoPendiente: saldo,
      montoInicial: Number(d.montoInicial),
      porcentajeSobreTotal: Number(pct.toFixed(2)),
      estado: d.estado,
      color: ENTITY_COLORS[d.entidad] || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
    };
  });

  return {
    deudaTotalInicial,
    totalPagado,
    saldoPendiente,
    progresoPorcentaje: Number(progresoPorcentaje.toFixed(2)),
    porcentajePendiente: Number(porcentajePendiente.toFixed(2)),
    cuotasMensualesActivas,
    cuotasEnMoraTotales,
    totalEnMora,
    valorCuotaMensualTotal,
    totalDeudas: deudas.length,
    deudasPagadas,
    distribucionPorEntidad,
  };
}

export async function getDeudasConDetalle() {
  return await prisma.deuda.findMany({
    orderBy: { orden: "asc" },
    include: {
      cuotas: {
        orderBy: { numeroCuota: "asc" },
      },
      movimientos: {
        orderBy: { fecha: "desc" },
        take: 5,
      },
    },
  });
}

export async function getDeudaById(id: string) {
  return await prisma.deuda.findUnique({
    where: { id },
    include: {
      cuotas: {
        orderBy: { numeroCuota: "asc" },
      },
      movimientos: {
        orderBy: { fecha: "desc" },
      },
    },
  });
}

/**
 * Registra el pago de una cuota específica dentro de una transacción atómica.
 */
export async function registrarPagoCuota(params: {
  deudaId: string;
  cuotaId: string;
  monto?: number;
  metodoPago?: string;
  referenciaPago?: string;
  comprobanteUrl?: string;
  observaciones?: string;
}) {
  return await prisma.$transaction(async (tx) => {
    const deuda = await tx.deuda.findUnique({
      where: { id: params.deudaId },
    });
    if (!deuda) throw new Error("Deuda no encontrada");

    const cuota = await tx.cuota.findUnique({
      where: { id: params.cuotaId },
    });
    if (!cuota) throw new Error("Cuota no encontrada");
    if (cuota.estado === EstadoCuota.PAGADA) {
      throw new Error("Esta cuota ya ha sido pagada previamente.");
    }

    const montoPago = params.monto !== undefined && params.monto > 0 ? params.monto : Number(cuota.valor);
    const saldoAnterior = Number(deuda.saldoPendiente);
    const saldoPosterior = Math.max(0, saldoAnterior - montoPago);

    // 1. Crear el movimiento financiero auditable
    const movimiento = await tx.movimiento.create({
      data: {
        deudaId: deuda.id,
        cuotaId: cuota.id,
        tipo: TipoMovimiento.PAGO_CUOTA,
        monto: montoPago,
        saldoAnterior,
        saldoPosterior,
        fecha: new Date(),
        metodoPago: params.metodoPago || "TRANSFERENCIA",
        referenciaPago: params.referenciaPago,
        comprobanteUrl: params.comprobanteUrl,
        observaciones:
          params.observaciones ||
          `Pago de cuota #${cuota.numeroCuota} por valor de $${montoPago.toLocaleString("es-CO")}`,
        destinoAbono: DestinoAbono.REDUCIR_CAPITAL,
      },
    });

    // 2. Actualizar estado de la cuota
    await tx.cuota.update({
      where: { id: cuota.id },
      data: {
        estado: EstadoCuota.PAGADA,
        fechaPago: new Date(),
      },
    });

    // 3. Recalcular contadores de la deuda
    const nuevasCuotasPendientes = Math.max(0, deuda.cuotasPendientes - 1);
    let nuevasCuotasEnMora = deuda.cuotasEnMora;
    let nuevoValorMora = Number(deuda.valorVencidoMora);

    if (cuota.esMora || cuota.estado === EstadoCuota.VENCIDA) {
      nuevasCuotasEnMora = Math.max(0, deuda.cuotasEnMora - 1);
      nuevoValorMora = Math.max(0, nuevoValorMora - montoPago);
    }

    let nuevoEstado: EstadoDeuda = deuda.estado;
    if (saldoPosterior <= 0) {
      nuevoEstado = EstadoDeuda.PAGADA;
    } else if (nuevasCuotasEnMora === 0) {
      nuevoEstado = EstadoDeuda.AL_DIA;
    }

    await tx.deuda.update({
      where: { id: deuda.id },
      data: {
        saldoPendiente: saldoPosterior,
        cuotasPendientes: nuevasCuotasPendientes,
        cuotasEnMora: nuevasCuotasEnMora,
        valorVencidoMora: nuevoValorMora,
        estado: nuevoEstado,
      },
    });

    return { movimiento, saldoAnterior, saldoPosterior };
  });
}

/**
 * Registra un abono libre, extraordinario o pago total en una transacción atómica.
 */
export async function registrarAbono(params: {
  deudaId: string;
  monto: number;
  tipo?: TipoMovimiento;
  destinoAbono?: DestinoAbono;
  metodoPago?: string;
  referenciaPago?: string;
  comprobanteUrl?: string;
  observaciones?: string;
}) {
  return await prisma.$transaction(async (tx) => {
    const deuda = await tx.deuda.findUnique({
      where: { id: params.deudaId },
      include: {
        cuotas: {
          orderBy: { numeroCuota: "asc" },
        },
      },
    });
    if (!deuda) throw new Error("Deuda no encontrada");

    const saldoAnterior = Number(deuda.saldoPendiente);
    if (saldoAnterior <= 0) {
      throw new Error("Esta deuda ya se encuentra completamente pagada.");
    }

    if (params.monto <= 0) {
      throw new Error("El monto a abonar debe ser mayor a 0.");
    }

    const montoEfectivo = Math.min(params.monto, saldoAnterior);
    const saldoPosterior = Math.max(0, saldoAnterior - montoEfectivo);

    const esPagoTotal = saldoPosterior === 0 || params.tipo === TipoMovimiento.PAGO_TOTAL;
    const tipoMov = esPagoTotal ? TipoMovimiento.PAGO_TOTAL : (params.tipo || TipoMovimiento.ABONO_EXTRAORDINARIO);
    const destino = params.destinoAbono || DestinoAbono.REDUCIR_CAPITAL;

    // 1. Crear movimiento financiero
    const movimiento = await tx.movimiento.create({
      data: {
        deudaId: deuda.id,
        tipo: tipoMov,
        monto: montoEfectivo,
        saldoAnterior,
        saldoPosterior,
        fecha: new Date(),
        metodoPago: params.metodoPago || "TRANSFERENCIA",
        referenciaPago: params.referenciaPago,
        comprobanteUrl: params.comprobanteUrl,
        observaciones:
          params.observaciones ||
          (esPagoTotal
            ? `Cancelación total de la obligación por valor de $${montoEfectivo.toLocaleString("es-CO")}`
            : `Abono extraordinario a capital por $${montoEfectivo.toLocaleString("es-CO")}`),
        destinoAbono: destino,
      },
    });

    // 2. Si la deuda tiene cuotas y se eligen adelantar cuotas o cubrir mora
    let cuotasPendientesActuales = deuda.cuotasPendientes;
    let cuotasEnMoraActuales = deuda.cuotasEnMora;
    let valorMoraActual = Number(deuda.valorVencidoMora);

    if (destino === DestinoAbono.ADELANTAR_CUOTAS) {
      let saldoDisponible = montoEfectivo;
      const cuotasActivas = deuda.cuotas.filter(
        (c) => c.estado === EstadoCuota.PENDIENTE || c.estado === EstadoCuota.VENCIDA
      );

      for (const c of cuotasActivas) {
        const vCuota = Number(c.valor);
        if (saldoDisponible >= vCuota) {
          saldoDisponible -= vCuota;
          await tx.cuota.update({
            where: { id: c.id },
            data: { estado: EstadoCuota.PAGADA, fechaPago: new Date() },
          });
          cuotasPendientesActuales = Math.max(0, cuotasPendientesActuales - 1);
          if (c.esMora || c.estado === EstadoCuota.VENCIDA) {
            cuotasEnMoraActuales = Math.max(0, cuotasEnMoraActuales - 1);
            valorMoraActual = Math.max(0, valorMoraActual - vCuota);
          }
        } else {
          break;
        }
      }
    } else if (destino === DestinoAbono.CUBRIR_MORA) {
      let saldoDisponible = montoEfectivo;
      const cuotasVencidas = deuda.cuotas.filter(
        (c) => c.estado === EstadoCuota.VENCIDA || c.esMora
      );

      for (const c of cuotasVencidas) {
        const vCuota = Number(c.valor);
        if (saldoDisponible >= vCuota) {
          saldoDisponible -= vCuota;
          await tx.cuota.update({
            where: { id: c.id },
            data: { estado: EstadoCuota.PAGADA, fechaPago: new Date() },
          });
          cuotasPendientesActuales = Math.max(0, cuotasPendientesActuales - 1);
          cuotasEnMoraActuales = Math.max(0, cuotasEnMoraActuales - 1);
          valorMoraActual = Math.max(0, valorMoraActual - vCuota);
        } else {
          valorMoraActual = Math.max(0, valorMoraActual - saldoDisponible);
          saldoDisponible = 0;
          break;
        }
      }
    }

    // 3. Determinar estado de la deuda
    let nuevoEstado: EstadoDeuda = deuda.estado;
    if (saldoPosterior <= 0) {
      nuevoEstado = EstadoDeuda.PAGADA;
    } else if (cuotasEnMoraActuales === 0 && deuda.estado === EstadoDeuda.EN_MORA) {
      nuevoEstado = EstadoDeuda.AL_DIA;
    }

    await tx.deuda.update({
      where: { id: deuda.id },
      data: {
        saldoPendiente: saldoPosterior,
        cuotasPendientes: cuotasPendientesActuales,
        cuotasEnMora: cuotasEnMoraActuales,
        valorVencidoMora: valorMoraActual,
        estado: nuevoEstado,
      },
    });

    return { movimiento, saldoAnterior, saldoPosterior };
  });
}

/**
 * Revierte un movimiento financiero de forma auditable.
 */
export async function revertirMovimiento(movimientoId: string, motivo?: string) {
  return await prisma.$transaction(async (tx) => {
    const movOriginal = await tx.movimiento.findUnique({
      where: { id: movimientoId },
      include: { deuda: true, cuota: true },
    });

    if (!movOriginal) throw new Error("Movimiento no encontrado");
    if (movOriginal.estaRevertido) {
      throw new Error("Este movimiento ya fue revertido con anterioridad.");
    }
    if (movOriginal.tipo === TipoMovimiento.REVERSION_PAGO) {
      throw new Error("No se puede revertir una reversión.");
    }

    const deuda = movOriginal.deuda;
    const saldoAnterior = Number(deuda.saldoPendiente);
    const montoRevertido = Number(movOriginal.monto);
    const saldoPosterior = saldoAnterior + montoRevertido;

    // 1. Crear contra-movimiento de reversión
    const contraMovimiento = await tx.movimiento.create({
      data: {
        deudaId: deuda.id,
        cuotaId: movOriginal.cuotaId,
        tipo: TipoMovimiento.REVERSION_PAGO,
        monto: montoRevertido,
        saldoAnterior,
        saldoPosterior,
        fecha: new Date(),
        metodoPago: movOriginal.metodoPago,
        referenciaPago: `REV-${movOriginal.id.slice(0, 8)}`,
        observaciones:
          motivo || `Reversión auditable del movimiento #${movOriginal.id.slice(0, 8)} (${movOriginal.tipo})`,
        movimientoRevertidoId: movOriginal.id,
      },
    });

    // 2. Marcar el movimiento original como revertido
    await tx.movimiento.update({
      where: { id: movOriginal.id },
      data: { estaRevertido: true },
    });

    // 3. Restaurar cuota si estaba asociada
    let cuotasPendientes = deuda.cuotasPendientes;
    let cuotasEnMora = deuda.cuotasEnMora;
    let valorMora = Number(deuda.valorVencidoMora);

    if (movOriginal.cuotaId && movOriginal.cuota) {
      const hoy = new Date();
      const eraMora = new Date(movOriginal.cuota.fechaVencimiento) < hoy;

      await tx.cuota.update({
        where: { id: movOriginal.cuotaId },
        data: {
          estado: eraMora ? EstadoCuota.VENCIDA : EstadoCuota.PENDIENTE,
          fechaPago: null,
          esMora: eraMora,
        },
      });

      cuotasPendientes += 1;
      if (eraMora) {
        cuotasEnMora += 1;
        valorMora += montoRevertido;
      }
    }

    // 4. Restaurar saldo de la deuda
    let nuevoEstado: EstadoDeuda = EstadoDeuda.ACTIVA;
    if (cuotasEnMora > 0) {
      nuevoEstado = EstadoDeuda.EN_MORA;
    } else if (saldoPosterior > 0) {
      nuevoEstado = EstadoDeuda.AL_DIA;
    }

    await tx.deuda.update({
      where: { id: deuda.id },
      data: {
        saldoPendiente: saldoPosterior,
        cuotasPendientes,
        cuotasEnMora,
        valorVencidoMora: valorMora,
        estado: nuevoEstado,
      },
    });

    return contraMovimiento;
  });
}

/**
 * Consulta de historial de movimientos con filtros y paginación.
 */
export async function getHistorialMovimientos(filtros?: {
  deudaId?: string;
  tipo?: TipoMovimiento;
  fechaDesde?: Date;
  fechaHasta?: Date;
}) {
  const where: any = {};

  if (filtros?.deudaId) {
    where.deudaId = filtros.deudaId;
  }
  if (filtros?.tipo) {
    where.tipo = filtros.tipo;
  }
  if (filtros?.fechaDesde || filtros?.fechaHasta) {
    where.fecha = {};
    if (filtros.fechaDesde) where.fecha.gte = filtros.fechaDesde;
    if (filtros.fechaHasta) where.fecha.lte = filtros.fechaHasta;
  }

  return await prisma.movimiento.findMany({
    where,
    orderBy: { fecha: "desc" },
    include: {
      deuda: true,
      cuota: true,
      movimientoOriginal: true,
    },
  });
}
