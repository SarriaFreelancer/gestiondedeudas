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

  // Asegurar que el mes tenga sus ingresos y gastos inicializados
  let todosIngresosMes = await prisma.ingreso.findMany({ where: { mes, anio } });
  let gastos = await prisma.gastoPresupuesto.findMany({
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

  if (todosIngresosMes.length === 0 || gastos.length === 0) {
    await ensureMonthlyBudgetInitialized(mes, anio);
    todosIngresosMes = await prisma.ingreso.findMany({ where: { mes, anio } });
    gastos = await prisma.gastoPresupuesto.findMany({
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
  }

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
 * Asegura que el mes especificado tenga sus salarios fijos continuos
 * y sus gastos fijos recurrentes arrastrados del mes anterior.
 */
export async function ensureMonthlyBudgetInitialized(mes: number, anio: number) {
  // 1. Revisar Ingresos
  const countIngresos = await prisma.ingreso.count({ where: { mes, anio } });
  if (countIngresos === 0) {
    // Buscar los últimos ingresos configurados en meses anteriores
    const ultimosIngresos = await prisma.ingreso.findMany({
      where: {
        OR: [
          { anio: { lt: anio } },
          { anio: anio, mes: { lt: mes } },
        ],
      },
      orderBy: [{ anio: "desc" }, { mes: "desc" }, { createdAt: "desc" }],
      take: 4,
    });

    if (ultimosIngresos.length > 0) {
      const ultMes = ultimosIngresos[0].mes;
      const ultAnio = ultimosIngresos[0].anio;
      const ingresosFuente = await prisma.ingreso.findMany({
        where: { mes: ultMes, anio: ultAnio },
      });

      if (ingresosFuente.length > 0) {
        await prisma.ingreso.createMany({
          data: ingresosFuente.map((ing) => ({
            descripcion: ing.descripcion,
            monto: ing.monto,
            periodo: ing.periodo,
            mes,
            anio,
            fuente: ing.fuente || "SALARIO",
          })),
        });
      }
    } else {
      // Si no hay ninguno previo en la base de datos, sembrar plantilla base
      await prisma.ingreso.createMany({
        data: [
          {
            descripcion: "Salario 1ra Quincena",
            monto: 2500000,
            periodo: PeriodoPresupuesto.QUINCENA_1,
            mes,
            anio,
            fuente: "SALARIO",
          },
          {
            descripcion: "Salario 2da Quincena",
            monto: 2500000,
            periodo: PeriodoPresupuesto.QUINCENA_2,
            mes,
            anio,
            fuente: "SALARIO",
          },
        ],
      });
    }
  }

  // 2. Revisar Gastos
  const countGastos = await prisma.gastoPresupuesto.count({ where: { mes, anio } });
  if (countGastos === 0) {
    // Buscar los últimos gastos de un mes anterior
    const ultimosGastos = await prisma.gastoPresupuesto.findMany({
      where: {
        OR: [
          { anio: { lt: anio } },
          { anio: anio, mes: { lt: mes } },
        ],
      },
      orderBy: [{ anio: "desc" }, { mes: "desc" }, { createdAt: "desc" }],
      take: 20,
    });

    if (ultimosGastos.length > 0) {
      const ultMes = ultimosGastos[0].mes;
      const ultAnio = ultimosGastos[0].anio;
      const gastosFuente = await prisma.gastoPresupuesto.findMany({
        where: { mes: ultMes, anio: ultAnio },
      });

      if (gastosFuente.length > 0) {
        await prisma.gastoPresupuesto.createMany({
          data: gastosFuente.map((g) => ({
            nombre: g.nombre,
            categoria: g.categoria,
            tipo: g.tipo,
            montoPresupuestado: g.montoPresupuestado,
            montoReal: 0,
            periodoAsignado: g.periodoAsignado,
            diaVencimiento: g.diaVencimiento,
            estaPagado: false,
            fechaPago: null,
            notas: g.notas,
            mes,
            anio,
          })),
        });
      }
    } else {
      await seedDefaultMonthlyBudget(mes, anio);
    }
  }
}

// Plantilla inicial para el usuario (Alquiler, Plan de Datos, Servicios, etc.)
export async function seedDefaultMonthlyBudget(mes: number, anio: number) {
  const existingIng = await prisma.ingreso.count({ where: { mes, anio } });
  if (existingIng === 0) {
    await prisma.ingreso.createMany({
      data: [
        {
          descripcion: "Salario 1ra Quincena",
          monto: 2500000,
          periodo: PeriodoPresupuesto.QUINCENA_1,
          mes,
          anio,
          fuente: "SALARIO",
        },
        {
          descripcion: "Salario 2da Quincena",
          monto: 2500000,
          periodo: PeriodoPresupuesto.QUINCENA_2,
          mes,
          anio,
          fuente: "SALARIO",
        },
      ],
    });
  }

  // Gastos fijos y variables base colombianos
  const existingGastos = await prisma.gastoPresupuesto.count({ where: { mes, anio } });
  if (existingGastos === 0) {
    await prisma.gastoPresupuesto.createMany({
      data: [
        {
          nombre: "Alquiler / Arriendo Vivienda",
          categoria: CategoriaGasto.VIVIENDA,
          tipo: TipoGasto.FIJO,
          montoPresupuestado: 1200000,
          montoReal: 0,
          periodoAsignado: PeriodoPresupuesto.QUINCENA_1,
          diaVencimiento: 5,
          estaPagado: false,
          mes,
          anio,
        },
        {
          nombre: "Plan de Datos Móvil & Telefonía",
          categoria: CategoriaGasto.CONECTIVIDAD,
          tipo: TipoGasto.FIJO,
          montoPresupuestado: 65000,
          montoReal: 0,
          periodoAsignado: PeriodoPresupuesto.QUINCENA_1,
          diaVencimiento: 10,
          estaPagado: false,
          mes,
          anio,
        },
        {
          nombre: "Internet Hogar Fibra Óptica",
          categoria: CategoriaGasto.CONECTIVIDAD,
          tipo: TipoGasto.FIJO,
          montoPresupuestado: 95000,
          montoReal: 0,
          periodoAsignado: PeriodoPresupuesto.QUINCENA_2,
          diaVencimiento: 18,
          estaPagado: false,
          mes,
          anio,
        },
        {
          nombre: "Factura de Energía / Luz",
          categoria: CategoriaGasto.SERVICIOS_PUBLICOS,
          tipo: TipoGasto.VARIABLE,
          montoPresupuestado: 140000,
          montoReal: 0,
          periodoAsignado: PeriodoPresupuesto.QUINCENA_1,
          diaVencimiento: 12,
          estaPagado: false,
          mes,
          anio,
        },
        {
          nombre: "Factura de Agua & Aseo",
          categoria: CategoriaGasto.SERVICIOS_PUBLICOS,
          tipo: TipoGasto.VARIABLE,
          montoPresupuestado: 95000,
          montoReal: 0,
          periodoAsignado: PeriodoPresupuesto.QUINCENA_2,
          diaVencimiento: 20,
          estaPagado: false,
          mes,
          anio,
        },
        {
          nombre: "Gas Natural Domiciliario",
          categoria: CategoriaGasto.SERVICIOS_PUBLICOS,
          tipo: TipoGasto.VARIABLE,
          montoPresupuestado: 35000,
          montoReal: 0,
          periodoAsignado: PeriodoPresupuesto.QUINCENA_1,
          diaVencimiento: 14,
          estaPagado: false,
          mes,
          anio,
        },
        {
          nombre: "Mercado & Alimentación Quincena 1",
          categoria: CategoriaGasto.ALIMENTACION,
          tipo: TipoGasto.VARIABLE,
          montoPresupuestado: 450000,
          montoReal: 0,
          periodoAsignado: PeriodoPresupuesto.QUINCENA_1,
          diaVencimiento: 3,
          estaPagado: false,
          mes,
          anio,
        },
        {
          nombre: "Mercado & Alimentación Quincena 2",
          categoria: CategoriaGasto.ALIMENTACION,
          tipo: TipoGasto.VARIABLE,
          montoPresupuestado: 450000,
          montoReal: 0,
          periodoAsignado: PeriodoPresupuesto.QUINCENA_2,
          diaVencimiento: 18,
          estaPagado: false,
          mes,
          anio,
        },
      ],
    });
  }
}

export async function getGastosList(mes: number, anio: number, periodo?: string) {
  await ensureMonthlyBudgetInitialized(mes, anio);
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
