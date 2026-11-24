import { prisma } from "@/lib/prisma";
import { PeriodoPresupuesto, TipoGasto, CategoriaGasto } from "@prisma/client";

export interface BudgetSummary {
  mes: number;
  anio: number;
  periodoFiltro: string; // 'MES_COMPLETO', 'QUINCENA_1', 'QUINCENA_2'
  totalIngresos: number;
  ingresosQuincena1: number;
  ingresosQuincena2: number;
  totalGastosPresupuestados: number;
  totalGastosPagados: number;
  totalGastosPendientes: number;
  totalGastosFijos: number;
  totalGastosVariables: number;
  saldoDisponible: number;
  porcentajeGastado: number;
  porcentajeDisponible: number;
  distribucionPorCategoria: {
    categoria: string;
    nombreMostrar: string;
    monto: number;
    porcentaje: number;
    color: string;
  }[];
}

export const CATEGORY_COLORS: Record<CategoriaGasto, string> = {
  VIVIENDA: "#3B82F6", // Azul
  SERVICIOS_PUBLICOS: "#F59E0B", // Ámbar / Naranja
  CONECTIVIDAD: "#06B6D4", // Cian
  ALIMENTACION: "#10B981", // Verde Esmeralda
  TRANSPORTE: "#8B5CF6", // Púrpura
  SALUD: "#EC4899", // Rosa
  EDUCACION: "#6366F1", // Índigo
  ENTRETENIMIENTO: "#F97316", // Naranja
  OTROS: "#64748B", // Pizarra
};

export const CATEGORY_LABELS: Record<CategoriaGasto, string> = {
  VIVIENDA: "Vivienda / Alquiler",
  SERVICIOS_PUBLICOS: "Servicios Públicos (Luz, Agua, Gas)",
  CONECTIVIDAD: "Conectividad (Plan Móvil / Internet)",
  ALIMENTACION: "Alimentación & Mercado",
  TRANSPORTE: "Transporte / Movilidad",
  SALUD: "Salud & Bienestar",
  EDUCACION: "Educación",
  ENTRETENIMIENTO: "Entretenimiento & Ocio",
  OTROS: "Otros Gastos",
};

export async function getBudgetSummary(
  mes: number,
  anio: number,
  periodoFiltro: string = "MES_COMPLETO"
): Promise<BudgetSummary> {
  // 1. Consultar Ingresos
  const whereIngreso: any = { mes, anio };
  if (periodoFiltro !== "MES_COMPLETO") {
    whereIngreso.periodo = periodoFiltro as PeriodoPresupuesto;
  }

  // Asegurar que el mes tenga sus ingresos inicializados si no existen
  let todosIngresosMes = await prisma.ingreso.findMany({ where: { mes, anio } });
  if (todosIngresosMes.length === 0) {
    await ensureMonthlyBudgetInitialized(mes, anio);
    todosIngresosMes = await prisma.ingreso.findMany({ where: { mes, anio } });
  }

  // Los gastos SOLO los crea el usuario manualmente. Nunca se autogeneran ni se siembran por defecto.
  const gastos = await prisma.gastoPresupuesto.findMany({
    where: {
      mes,
      anio,
      ...(periodoFiltro !== "MES_COMPLETO"
        ? {
            OR: [
              { periodoAsignado: periodoFiltro as PeriodoPresupuesto },
              { periodoAsignado: PeriodoPresupuesto.MES_COMPLETO },
            ],
          }
        : {}),
    },
  });

  // Cálculos de Ingresos
  let totalIngresos = 0;
  let ingresosQuincena1 = 0;
  let ingresosQuincena2 = 0;

  for (const ing of todosIngresosMes) {
    const val = Number(ing.monto);
    if (ing.periodo === PeriodoPresupuesto.QUINCENA_1) {
      ingresosQuincena1 += val;
    } else if (ing.periodo === PeriodoPresupuesto.QUINCENA_2) {
      ingresosQuincena2 += val;
    } else if (ing.periodo === PeriodoPresupuesto.DIARIO_VARIABLE) {
      // Ingreso diario o independiente: asignado según el día calendario
      const dia = new Date(ing.fecha).getDate();
      if (dia <= 15) {
        ingresosQuincena1 += val;
      } else {
        ingresosQuincena2 += val;
      }
    } else {
      // Mes completo repartido equitativamente
      ingresosQuincena1 += val / 2;
      ingresosQuincena2 += val / 2;
    }
  }

  if (periodoFiltro === "QUINCENA_1") {
    totalIngresos = ingresosQuincena1;
  } else if (periodoFiltro === "QUINCENA_2") {
    totalIngresos = ingresosQuincena2;
  } else {
    totalIngresos = ingresosQuincena1 + ingresosQuincena2;
  }

  // Cálculos de Gastos
  let totalGastosPresupuestados = 0;
  let totalGastosPagados = 0;
  let totalGastosPendientes = 0;
  let totalGastosFijos = 0;
  let totalGastosVariables = 0;

  const categoriasMap = new Map<CategoriaGasto, number>();

  for (const g of gastos) {
    // Si estamos en filtro quincenal y el gasto es de mes completo, asignamos su mitad proporcional
    const factorPeriodo =
      periodoFiltro !== "MES_COMPLETO" && g.periodoAsignado === PeriodoPresupuesto.MES_COMPLETO
        ? 0.5
        : 1.0;

    const montoEfectivo = (g.estaPagado ? Number(g.montoReal) : Number(g.montoPresupuestado)) * factorPeriodo;
    const montoPresup = Number(g.montoPresupuestado) * factorPeriodo;

    totalGastosPresupuestados += montoPresup;

    if (g.estaPagado) {
      totalGastosPagados += montoEfectivo;
    } else {
      totalGastosPendientes += montoPresup;
    }

    if (g.tipo === TipoGasto.FIJO) {
      totalGastosFijos += montoEfectivo;
    } else {
      totalGastosVariables += montoEfectivo;
    }

    // Acumular por categoría
    const prevCat = categoriasMap.get(g.categoria) || 0;
    categoriasMap.set(g.categoria, prevCat + montoEfectivo);
  }

  // Saldo disponible restante
  const saldoDisponible = Math.max(0, totalIngresos - totalGastosPagados);
  const totalGastoOIngreso = totalIngresos > 0 ? totalIngresos : totalGastosPresupuestados || 1;

  const porcentajeGastado = Number(
    Math.min(100, (totalGastosPagados / totalGastoOIngreso) * 100).toFixed(1)
  );
  const porcentajeDisponible = Number(Math.max(0, 100 - porcentajeGastado).toFixed(1));

  // Distribución por categoría
  const distribucionPorCategoria = Array.from(categoriasMap.entries())
    .map(([cat, monto]) => {
      const porcentaje =
        totalGastosPresupuestados > 0
          ? Number(((monto / totalGastosPresupuestados) * 100).toFixed(1))
          : 0;
      return {
        categoria: cat,
        nombreMostrar: CATEGORY_LABELS[cat] || cat,
        monto,
        porcentaje,
        color: CATEGORY_COLORS[cat] || "#64748B",
      };
    })
    .sort((a, b) => b.monto - a.monto);

  return {
    mes,
    anio,
    periodoFiltro,
    totalIngresos,
    ingresosQuincena1,
    ingresosQuincena2,
    totalGastosPresupuestados,
    totalGastosPagados,
    totalGastosPendientes,
    totalGastosFijos,
    totalGastosVariables,
    saldoDisponible,
    porcentajeGastado,
    porcentajeDisponible,
    distribucionPorCategoria,
  };
}

/**
 * Asegura que el mes especificado tenga sus salarios fijos continuos si no existen.
 * Los gastos NUNCA se generan por defecto; el usuario los crea manualmente uno a uno.
 */
export async function ensureMonthlyBudgetInitialized(mes: number, anio: number) {
  // 1. Revisar Ingresos
  const countIngresos = await prisma.ingreso.count({ where: { mes, anio } });
  if (countIngresos === 0) {
    // Si no se han registrado ingresos para este mes, inicializar las quincenas en 0 COP
    // permitiendo que el usuario tenga su saldo en cero hasta que decida registrar su sueldo recibido.
    await prisma.ingreso.createMany({
      data: [
        {
          descripcion: "Salario 1ra Quincena",
          monto: 0,
          periodo: PeriodoPresupuesto.QUINCENA_1,
          mes,
          anio,
          fuente: "SALARIO",
        },
        {
          descripcion: "Salario 2da Quincena",
          monto: 0,
          periodo: PeriodoPresupuesto.QUINCENA_2,
          mes,
          anio,
          fuente: "SALARIO",
        },
      ],
    });
  }
}

export async function getGastosList(mes: number, anio: number, periodo?: string) {
  const where: any = { mes, anio };
  if (periodo && periodo !== "MES_COMPLETO") {
    where.OR = [
      { periodoAsignado: periodo as PeriodoPresupuesto },
      { periodoAsignado: PeriodoPresupuesto.MES_COMPLETO },
    ];
  }

  return await prisma.gastoPresupuesto.findMany({
    where,
    orderBy: [{ diaVencimiento: "asc" }, { createdAt: "asc" }],
  });
}

export async function getIngresosList(mes: number, anio: number) {
  await ensureMonthlyBudgetInitialized(mes, anio);
  return await prisma.ingreso.findMany({
    where: { mes, anio },
    orderBy: { fecha: "desc" },
  });
}
