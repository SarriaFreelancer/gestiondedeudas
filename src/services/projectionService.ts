import { prisma } from "@/lib/prisma";

export interface ProyeccionDeuda {
  id: string;
  entidad: string;
  saldoPendiente: number;
  cuotaMensual: number;
  mesesEstimadosNormal: number;
  mesesEstimadosAcelerado: number;
  fechaFinEstimadaNormal: string;
  fechaFinEstimadaAcelerada: string;
}

export interface ProyeccionGeneral {
  estrategia: string;
  pagoMensualComprometido: number;
  abonoExtraordinarioSugerido: number;
  mesesHastaLibertadNormal: number;
  mesesHastaLibertadAcelerada: number;
  fechaLibertadNormal: string;
  fechaLibertadAcelerada: string;
  mesesAhorrados: number;
  deudas: ProyeccionDeuda[];
}

export async function calcularProyecciones(
  abonoExtraordinarioMensual: number = 300000,
  estrategia: "BOLA_DE_NIEVE" | "AVALANCHA" | "PERSONALIZADA" = "BOLA_DE_NIEVE"
): Promise<ProyeccionGeneral> {
  const deudas = await prisma.deuda.findMany({
    where: { saldoPendiente: { gt: 0 } },
    include: {
      cuotas: {
        where: { estado: { in: ["PENDIENTE", "VENCIDA"] } },
      },
    },
  });

  // Ordenar deudas según estrategia
  const deudasOrdenadas = [...deudas].sort((a, b) => {
    if (estrategia === "BOLA_DE_NIEVE") {
      // De menor saldo a mayor saldo (efecto psicológico rápido)
      return Number(a.saldoPendiente) - Number(b.saldoPendiente);
    }
    // Por defecto / personalizada por orden
    return a.orden - b.orden;
  });

  let pagoMensualComprometido = 0;
  for (const d of deudas) {
    pagoMensualComprometido += Number(d.valorCuotaMensual);
  }

  // Estimación mensual para deudas sin cuota fija (como NU o Davibank):
  // Si no tienen cuota fija, asumimos un pago mínimo referencial del 5% del saldo o $100.000 para no dejarlas infinitas
  const getCuotaEfectiva = (d: (typeof deudas)[0]) => {
    const c = Number(d.valorCuotaMensual);
    if (c > 0) return c;
    const saldo = Number(d.saldoPendiente);
    return Math.max(50000, Math.round(saldo * 0.05));
  };

  const hoy = new Date();

  // Simulación modo normal
  let maxMesesNormal = 0;
  const deudasProyeccion: ProyeccionDeuda[] = [];

  for (const d of deudasOrdenadas) {
    const saldo = Number(d.saldoPendiente);
    const cuota = getCuotaEfectiva(d);
    const mesesNormal = Math.max(1, Math.ceil(saldo / cuota));
    if (mesesNormal > maxMesesNormal) maxMesesNormal = mesesNormal;

    const fechaNormal = new Date(hoy.getFullYear(), hoy.getMonth() + mesesNormal, 1);

    deudasProyeccion.push({
      id: d.id,
      entidad: d.entidad,
      saldoPendiente: saldo,
      cuotaMensual: cuota,
      mesesEstimadosNormal: mesesNormal,
      mesesEstimadosAcelerado: 0, // Se llenará en la simulación bola de nieve
      fechaFinEstimadaNormal: fechaNormal.toLocaleDateString("es-CO", { month: "long", year: "numeric" }),
      fechaFinEstimadaAcelerada: "",
    });
  }

  // Simulación bola de nieve acelerada mes a mes
  // Creamos copia de los saldos
  const saldosAcelerados = deudasOrdenadas.map((d) => ({
    id: d.id,
    saldo: Number(d.saldoPendiente),
    cuotaBase: getCuotaEfectiva(d),
    mesesFinalizado: 0,
  }));

  let mes = 0;
  const MAX_MESES_SIMULACION = 240; // 20 años tope de seguridad
  let bolaDeNieveBola = abonoExtraordinarioMensual;

  while (saldosAcelerados.some((d) => d.saldo > 0) && mes < MAX_MESES_SIMULACION) {
    mes++;
    let dineroExtraDisponible = bolaDeNieveBola;

    // 1. Pagar cuotas mínimas comprometidas a cada deuda activa
    for (const d of saldosAcelerados) {
      if (d.saldo > 0) {
        const pago = Math.min(d.saldo, d.cuotaBase);
        d.saldo -= pago;
        if (d.saldo <= 0 && d.mesesFinalizado === 0) {
          d.mesesFinalizado = mes;
          // Al liquidar una deuda, su cuota mensual se suma a la bola de nieve
          bolaDeNieveBola += d.cuotaBase;
        }
      }
    }

    // 2. Aplicar el dinero extra a la primera deuda con saldo > 0 según la estrategia
    for (const d of saldosAcelerados) {
      if (d.saldo > 0 && dineroExtraDisponible > 0) {
        const abono = Math.min(d.saldo, dineroExtraDisponible);
        d.saldo -= abono;
        dineroExtraDisponible -= abono;

        if (d.saldo <= 0 && d.mesesFinalizado === 0) {
          d.mesesFinalizado = mes;
          bolaDeNieveBola += d.cuotaBase;
        }
      }
    }
  }

  // Actualizar datos acelerados
  let maxMesesAcelerado = 0;
  for (const dp of deudasProyeccion) {
    const sim = saldosAcelerados.find((s) => s.id === dp.id);
    const m = sim && sim.mesesFinalizado > 0 ? sim.mesesFinalizado : mes;
    dp.mesesEstimadosAcelerado = m;
    if (m > maxMesesAcelerado) maxMesesAcelerado = m;

    const fechaAcel = new Date(hoy.getFullYear(), hoy.getMonth() + m, 1);
    dp.fechaFinEstimadaAcelerada = fechaAcel.toLocaleDateString("es-CO", { month: "long", year: "numeric" });
  }

  const fechaLibertadNormal = new Date(hoy.getFullYear(), hoy.getMonth() + maxMesesNormal, 1);
  const fechaLibertadAcelerada = new Date(hoy.getFullYear(), hoy.getMonth() + maxMesesAcelerado, 1);

  return {
    estrategia,
    pagoMensualComprometido,
    abonoExtraordinarioSugerido: abonoExtraordinarioMensual,
    mesesHastaLibertadNormal: maxMesesNormal,
    mesesHastaLibertadAcelerada: maxMesesAcelerado,
    fechaLibertadNormal: fechaLibertadNormal.toLocaleDateString("es-CO", { month: "long", year: "numeric" }),
    fechaLibertadAcelerada: fechaLibertadAcelerada.toLocaleDateString("es-CO", { month: "long", year: "numeric" }),
    mesesAhorrados: Math.max(0, maxMesesNormal - maxMesesAcelerado),
    deudas: deudasProyeccion,
  };
}
