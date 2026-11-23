import { prisma } from "@/lib/prisma";

export interface MetaAhorroItem {
  id: string;
  nombre: string;
  montoObjetivo: number;
  montoActual: number;
  bancoUbicacion: string;
  color: string;
  icono: string;
  fechaLimite: string | null;
  estaCompletada: boolean;
  notas: string | null;
  porcentajeCumplimiento: number;
  saldoFaltante: number;
  aportes: {
    id: string;
    monto: number;
    fecha: string;
    origen: string | null;
    bancoDetalle: string | null;
    notas: string | null;
  }[];
}

export const BANCOS_COLOMBIA: Record<string, { label: string; color: string; badge: string }> = {
  NU_CAJITA: { label: "Nu Colombia (Cajita de Ahorro)", color: "#9333EA", badge: "Nu 13% E.A." },
  NEQUI_BOLSILLO: { label: "Nequi (Bolsillo / Metas)", color: "#8B5CF6", badge: "Nequi" },
  BANCOLOMBIA: { label: "Bancolombia Ahorros", color: "#F59E0B", badge: "Bancolombia" },
  LULO_BANK: { label: "Lulo Bank (Bolsillo)", color: "#06B6D4", badge: "Lulo Bank" },
  DAVIPLATA: { label: "Daviplata / Davivienda", color: "#EF4444", badge: "Daviplata" },
  RAPPI_PAY: { label: "RappiPay (RappiCuenta)", color: "#F97316", badge: "RappiPay" },
  OTRO_BANCO: { label: "Otra Cuenta Bancaria", color: "#64748B", badge: "Bancos" },
};

export async function getMetasAhorro(): Promise<{
  metas: MetaAhorroItem[];
  totalAhorrado: number;
  totalObjetivos: number;
  porcentajeGlobal: number;
}> {
  const metas = await prisma.metaAhorro.findMany({
    orderBy: [{ estaCompletada: "asc" }, { createdAt: "desc" }],
    include: {
      aportes: {
        orderBy: { fecha: "desc" },
        take: 10,
      },
    },
  });

  let totalAhorrado = 0;
  let totalObjetivos = 0;

  const metasList: MetaAhorroItem[] = metas.map((m) => {
    const objetivo = Number(m.montoObjetivo);
    const actual = Number(m.montoActual);

    totalAhorrado += actual;
    totalObjetivos += objetivo;

    const porcentaje = objetivo > 0 ? Math.min(100, (actual / objetivo) * 100) : 0;
    const faltante = Math.max(0, objetivo - actual);

    return {
      id: m.id,
      nombre: m.nombre,
      montoObjetivo: objetivo,
      montoActual: actual,
      bancoUbicacion: m.bancoUbicacion || "NEQUI_BOLSILLO",
      color: m.color || "#10B981",
      icono: m.icono || "PiggyBank",
      fechaLimite: m.fechaLimite ? m.fechaLimite.toISOString() : null,
      estaCompletada: m.estaCompletada || actual >= objetivo,
      notas: m.notas,
      porcentajeCumplimiento: Number(porcentaje.toFixed(1)),
      saldoFaltante: faltante,
      aportes: m.aportes.map((a) => ({
        id: a.id,
        monto: Number(a.monto),
        fecha: a.fecha.toISOString(),
        origen: a.origen,
        bancoDetalle: a.bancoDetalle,
        notas: a.notas,
      })),
    };
  });

  const porcentajeGlobal =
    totalObjetivos > 0 ? Math.min(100, (totalAhorrado / totalObjetivos) * 100) : 0;

  return {
    metas: metasList,
    totalAhorrado,
    totalObjetivos,
    porcentajeGlobal: Number(porcentajeGlobal.toFixed(1)),
  };
}

export async function crearMetaAhorro(data: {
  nombre: string;
  montoObjetivo: number;
  montoInicial?: number;
  bancoUbicacion?: string;
  color?: string;
  fechaLimite?: Date | null;
  notas?: string;
}) {
  const montoInicial = data.montoInicial || 0;
  const meta = await prisma.metaAhorro.create({
    data: {
      nombre: data.nombre.trim(),
      montoObjetivo: data.montoObjetivo,
      montoActual: montoInicial,
      bancoUbicacion: data.bancoUbicacion || "NEQUI_BOLSILLO",
      color: data.color || "#10B981",
      fechaLimite: data.fechaLimite,
      notas: data.notas?.trim(),
      estaCompletada: montoInicial >= data.montoObjetivo,
    },
  });

  if (montoInicial > 0) {
    await prisma.aporteMeta.create({
      data: {
        metaId: meta.id,
        monto: montoInicial,
        origen: "SALDO_INICIAL",
        bancoDetalle: data.bancoUbicacion || "CUENTA_BANCARIA",
        notas: "Monto inicial al crear la meta",
      },
    });
  }

  return meta;
}

export async function trasladarSobranteAMeta(params: {
  metaId: string;
  monto: number;
  mes?: number;
  anio?: number;
  bancoDetalle?: string;
  notas?: string;
}) {
  return await prisma.$transaction(async (tx) => {
    const meta = await tx.metaAhorro.findUnique({
      where: { id: params.metaId },
    });
    if (!meta) throw new Error("Meta de ahorro no encontrada");

    const montoAporte = Number(params.monto);
    if (montoAporte <= 0) throw new Error("El monto a trasladar debe ser mayor a 0");

    const nuevoMontoActual = Number(meta.montoActual) + montoAporte;
    const estaCompletada = nuevoMontoActual >= Number(meta.montoObjetivo);

    // 1. Crear aporte auditable
    const aporte = await tx.aporteMeta.create({
      data: {
        metaId: meta.id,
        monto: montoAporte,
        origen: "SOBRANTE_SALARIO",
        mes: params.mes,
        anio: params.anio,
        bancoDetalle: params.bancoDetalle || meta.bancoUbicacion,
        notas: params.notas || `Traslado de excedente de salario hacia ${meta.nombre}`,
      },
    });

    // 2. Actualizar monto de la meta
    const metaActualizada = await tx.metaAhorro.update({
      where: { id: meta.id },
      data: {
        montoActual: nuevoMontoActual,
        estaCompletada,
      },
    });

    return { meta: metaActualizada, aporte };
  });
}
