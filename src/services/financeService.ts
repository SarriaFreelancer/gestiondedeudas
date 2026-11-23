import { prisma } from "@/lib/prisma";
import { EstadoDeuda, EstadoCuota, TipoMovimiento, DestinoAbono } from "@prisma/client";

export interface DashboardSummary {
  mesSeleccionado: number;
  anioSeleccionado: number;
  esMesActual: boolean;
  deudaTotalInicial: number;
  totalPagado: number;
  saldoPendiente: number; // Saldo al corte del mes seleccionado
  deudaActualEnVivo: number; // Saldo actual real en tiempo real
  saldoInicioMes: number; // Saldo con el que inició el mes seleccionado
  totalAbonadoEnMes: number; // Lo que se abonó/pagó exactamente en este mes
  saldoCierreMes: number; // Saldo con el que cerró el mes seleccionado
  porcentajeAmortizadoMes: number; // % amortizado en el mes
  progresoPorcentaje: number;
  porcentajePendiente: number;
  cuotasMensualesActivas: number;
  cuotasEnMoraTotales: number;
  totalEnMora: number;
  valorCuotaMensualTotal: number;
  totalDeudas: number;
  deudasPagadas: number;
  movimientosDelMes: {
    id: string;
    deudaId: string;
    entidad: string;
    tipo: string;
    monto: number;
    fecha: string;
    saldoAnterior: number;
    saldoPosterior: number;
    observaciones: string | null;
  }[];
  distribucionPorEntidad: {
    id: string;
    entidad: string;
    saldoPendiente: number;
    saldoInicioMes: number;
    abonadoEnMes: number;
    saldoCierreMes: number;
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

export async function getDashboardSummary(
  mesParam?: number,
  anioParam?: number
): Promise<DashboardSummary> {
  const now = new Date();
  const currentMes = now.getMonth() + 1;
  const currentAnio = now.getFullYear();

  const mesSeleccionado = mesParam || currentMes;
  const anioSeleccionado = anioParam || currentAnio;
  const esMesActual =
    mesSeleccionado === currentMes && anioSeleccionado === currentAnio;

  const inicioMes = new Date(anioSeleccionado, mesSeleccionado - 1, 1, 0, 0, 0, 0);
  const finMes = new Date(anioSeleccionado, mesSeleccionado, 0, 23, 59, 59, 999);

  const deudas = await prisma.deuda.findMany({
    orderBy: { orden: "asc" },
    include: {
      cuotas: {
        where: { estado: { in: [EstadoCuota.PENDIENTE, EstadoCuota.VENCIDA] } },
      },
      movimientos: {
        where: { estaRevertido: false },
        orderBy: { fecha: "asc" },
      },
    },
  });

  let deudaTotalInicial = 0;
  let deudaActualEnVivo = 0;
  let saldoTotalInicioMes = 0;
  let totalAbonadoEnMes = 0;
  let saldoTotalCierreMes = 0;

  let cuotasMensualesActivas = 0;
  let cuotasEnMoraTotales = 0;
  let totalEnMora = 0;
  let valorCuotaMensualTotal = 0;
  let deudasPagadas = 0;

  // Arreglo temporal enriquecido con trazabilidad
  const deudasCalculadas = deudas.map((d) => {
    const montoIni = Number(d.montoInicial);
    const saldoActual = Number(d.saldoPendiente);
    const cuotaMensual = Number(d.valorCuotaMensual);
    const mora = Number(d.valorVencidoMora);

    deudaTotalInicial += montoIni;
    deudaActualEnVivo += saldoActual;
    totalEnMora += mora;
    cuotasEnMoraTotales += d.cuotasEnMora;

    if (d.estado !== EstadoDeuda.PAGADA && saldoActual > 0) {
      valorCuotaMensualTotal += cuotaMensual;
      cuotasMensualesActivas += d.cuotas.length;
    } else {
      deudasPagadas += 1;
    }

    // Movimientos del mes seleccionado para esta deuda
    const movsEnMes = d.movimientos.filter((m) => {
      const f = new Date(m.fecha);
      return f >= inicioMes && f <= finMes;
    });

    const abonadoEnMes = movsEnMes.reduce((sum, m) => {
      if (
        m.tipo === TipoMovimiento.PAGO_CUOTA ||
        m.tipo === TipoMovimiento.ABONO_EXTRAORDINARIO ||
        m.tipo === TipoMovimiento.PAGO_TOTAL
      ) {
        return sum + Number(m.monto);
      }
      return sum;
    }, 0);

    // Movimientos posteriores al fin del mes seleccionado
    const movsPosteriores = d.movimientos.filter(
      (m) => new Date(m.fecha) > finMes
    );

    const pagosPosteriores = movsPosteriores.reduce((sum, m) => {
      if (
        m.tipo === TipoMovimiento.PAGO_CUOTA ||
        m.tipo === TipoMovimiento.ABONO_EXTRAORDINARIO ||
        m.tipo === TipoMovimiento.PAGO_TOTAL
      ) {
        return sum + Number(m.monto);
      }
      return sum;
    }, 0);

    let saldoCierreMes = saldoActual;
    let saldoInicioMes = saldoActual;

    if (esMesActual) {
      saldoCierreMes = saldoActual;
      saldoInicioMes = Math.min(montoIni, saldoActual + abonadoEnMes);
    } else if (finMes < now) {
      // Mes histórico del pasado
      saldoCierreMes = Math.min(montoIni, saldoActual + pagosPosteriores);
      saldoInicioMes = Math.min(montoIni, saldoCierreMes + abonadoEnMes);
    } else {
      // Mes futuro
      saldoCierreMes = saldoActual;
      saldoInicioMes = saldoActual;
    }

    saldoTotalInicioMes += saldoInicioMes;
    totalAbonadoEnMes += abonadoEnMes;
    saldoTotalCierreMes += saldoCierreMes;

    return {
      deuda: d,
      montoIni,
      saldoActual,
      saldoInicioMes,
      abonadoEnMes,
      saldoCierreMes,
      movimientosMes: movsEnMes,
    };
  });

  // Saldo a mostrar como principal: si es mes actual, el saldo vivo; si es mes histórico, el saldo de cierre de ese mes
  const saldoPendiente = esMesActual ? deudaActualEnVivo : saldoTotalCierreMes;

  // Total pagado acumulado hasta la fecha de corte
  const totalPagado = Math.max(0, deudaTotalInicial - saldoPendiente);

  // Porcentajes
  const progresoPorcentaje =
    deudaTotalInicial > 0 ? (totalPagado / deudaTotalInicial) * 100 : 0;
  const porcentajePendiente =
    deudaTotalInicial > 0 ? (saldoPendiente / deudaTotalInicial) * 100 : 0;

  const porcentajeAmortizadoMes =
    saldoTotalInicioMes > 0
      ? (totalAbonadoEnMes / saldoTotalInicioMes) * 100
      : 0;

  // Movimientos del mes de todas las deudas agrupados y ordenados por fecha
  const movimientosDelMes = deudasCalculadas
    .flatMap((item) =>
      item.movimientosMes.map((m) => ({
        id: m.id,
        deudaId: item.deuda.id,
        entidad: item.deuda.entidad,
        tipo: m.tipo,
        monto: Number(m.monto),
        fecha: m.fecha.toISOString(),
        saldoAnterior: Number(m.saldoAnterior),
        saldoPosterior: Number(m.saldoPosterior),
        observaciones: m.observaciones,
      }))
    )
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  // Distribución por entidad para el mes seleccionado
  const distribucionPorEntidad = deudasCalculadas.map((item, index) => {
    const d = item.deuda;
    const saldo = esMesActual ? item.saldoActual : item.saldoCierreMes;
    const pct = saldoPendiente > 0 ? (saldo / saldoPendiente) * 100 : 0;
    return {
      id: d.id,
      entidad: d.entidad,
      saldoPendiente: saldo,
      saldoInicioMes: item.saldoInicioMes,
      abonadoEnMes: item.abonadoEnMes,
      saldoCierreMes: item.saldoCierreMes,
      montoInicial: item.montoIni,
      porcentajeSobreTotal: Number(pct.toFixed(2)),
      estado: d.estado,
      color: ENTITY_COLORS[d.entidad] || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
    };
  });

  return {
    mesSeleccionado,
    anioSeleccionado,
    esMesActual,
    deudaTotalInicial,
    totalPagado,
    saldoPendiente,
    deudaActualEnVivo,
    saldoInicioMes: saldoTotalInicioMes,
    totalAbonadoEnMes,
    saldoCierreMes: saldoTotalCierreMes,
    porcentajeAmortizadoMes: Number(porcentajeAmortizadoMes.toFixed(2)),
    progresoPorcentaje: Number(progresoPorcentaje.toFixed(2)),
    porcentajePendiente: Number(porcentajePendiente.toFixed(2)),
    cuotasMensualesActivas,
    cuotasEnMoraTotales,
    totalEnMora,
    valorCuotaMensualTotal,
    totalDeudas: deudas.length,
    deudasPagadas,
    movimientosDelMes,
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
