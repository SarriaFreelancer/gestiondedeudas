import { PrismaClient, EstadoDeuda, EstadoCuota } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando Seed de 'Mi Libertad Financiera'...");

  // 1. Limpieza segura si ya existen datos
  await prisma.movimiento.deleteMany();
  await prisma.cuota.deleteMany();
  await prisma.deuda.deleteMany();
  await prisma.configuracion.deleteMany();
  await prisma.usuario.deleteMany();

  // 2. Crear configuración por defecto
  await prisma.configuracion.create({
    data: {
      id: 1,
      moneda: "COP",
      formatoFecha: "DD/MM/YYYY",
      estrategiaPago: "BOLA_DE_NIEVE",
      preferenciasDashboard: JSON.stringify({
        tema: "dark",
        animaciones: true,
        graficoFavorito: "donut",
      }),
    },
  });

  // 3. Crear usuario administrador
  const hashedPassword = await bcrypt.hash("Admin123", 10);
  await prisma.usuario.create({
    data: {
      email: "davidjuanmontano7@gmail.com",
      nombre: "David Juan Montaño",
      password: hashedPassword,
    },
  });

  // Fechas de referencia: noviembre 2026
  const hoy = new Date();
  const anioActual = hoy.getFullYear();
  const mesActual = hoy.getMonth();

  // Helper para generar fechas mensuales
  const getFechaCuota = (offsetMeses: number, dia: number = 5) => {
    const d = new Date(anioActual, mesActual + offsetMeses, dia);
    return d;
  };

  // 4. Cargar DEUDA 1: NEQUI
  // Monto inicial: $2.694.907. Cuotas: 48 (17 pagadas históricamente, 5 en mora, 26 por vencer = 31 pendientes)
  const nequi = await prisma.deuda.create({
    data: {
      entidad: "NEQUI",
      referencia: "CR-NEQUI-PERSONAL",
      montoInicial: 2694907,
      saldoInicial: 2694907,
      saldoPendiente: 2694907,
      valorCuotaMensual: 105000,
      cuotasTotales: 48,
      cuotasPagadasIniciales: 17,
      cuotasPendientes: 31,
      valorVencidoMora: 749507,
      cuotasEnMora: 5,
      diaVencimiento: 5,
      estado: EstadoDeuda.EN_MORA,
      tieneCuotas: true,
      observaciones: "Crédito personal Nequi. 17 cuotas pagadas históricamente previas al sistema, 5 cuotas vencidas en mora.",
      orden: 1,
    },
  });

  // Cuotas Nequi: 1 a 48
  // 1..17 pagadas (-22 a -6 meses atrás)
  // 18..22 en mora (-5 a -1 meses atrás)
  // 23 cuota actual (mes actual), 24..48 futuras
  const cuotasNequi = [];
  for (let i = 1; i <= 48; i++) {
    if (i <= 17) {
      cuotasNequi.push({
        deudaId: nequi.id,
        numeroCuota: i,
        valor: 105000,
        fechaVencimiento: getFechaCuota(i - 23, 5),
        fechaPago: getFechaCuota(i - 23, 4),
        estado: EstadoCuota.PAGADA,
        esMora: false,
      });
    } else if (i <= 22) {
      cuotasNequi.push({
        deudaId: nequi.id,
        numeroCuota: i,
        valor: 105000,
        fechaVencimiento: getFechaCuota(i - 23, 5),
        fechaPago: null,
        estado: EstadoCuota.VENCIDA,
        esMora: true,
      });
    } else {
      cuotasNequi.push({
        deudaId: nequi.id,
        numeroCuota: i,
        valor: 105000,
        fechaVencimiento: getFechaCuota(i - 23, 5),
        fechaPago: null,
        estado: EstadoCuota.PENDIENTE,
        esMora: false,
      });
    }
  }
  await prisma.cuota.createMany({ data: cuotasNequi });

  // 5. Cargar DEUDA 2: DAVIVIENDA
  // Monto inicial: $4.291.384. Cuotas: 24 (0 pagadas, 24 pendientes). Valor cuota: $178.808. Mora: 1 cuota ($178.808).
  const davivienda = await prisma.deuda.create({
    data: {
      entidad: "DAVIVIENDA",
      referencia: "A_1515290",
      montoInicial: 4291384,
      saldoInicial: 4291384,
      saldoPendiente: 4291384,
      valorCuotaMensual: 178808,
      cuotasTotales: 24,
      cuotasPagadasIniciales: 0,
      cuotasPendientes: 24,
      valorVencidoMora: 178808,
      cuotasEnMora: 1,
      diaVencimiento: 15,
      estado: EstadoDeuda.EN_MORA,
      tieneCuotas: true,
      observaciones: "Préstamo Davivienda Ref. A_1515290. 1 cuota vencida pendiente por ponerse al día.",
      orden: 2,
    },
  });

  const cuotasDavivienda = [];
  for (let i = 1; i <= 24; i++) {
    if (i === 1) {
      cuotasDavivienda.push({
        deudaId: davivienda.id,
        numeroCuota: i,
        valor: 178808,
        fechaVencimiento: getFechaCuota(-1, 15),
        fechaPago: null,
        estado: EstadoCuota.VENCIDA,
        esMora: true,
      });
    } else {
      cuotasDavivienda.push({
        deudaId: davivienda.id,
        numeroCuota: i,
        valor: 178808,
        fechaVencimiento: getFechaCuota(i - 2, 15),
        fechaPago: null,
        estado: EstadoCuota.PENDIENTE,
        esMora: false,
      });
    }
  }
  await prisma.cuota.createMany({ data: cuotasDavivienda });

  // 6. Cargar DEUDA 3: CRÉDITO 20 MINUTOS
  // Monto inicial: $2.664.701. Cuotas: 24 (7 pagadas históricamente, 17 pendientes).
  // Cuotas en mora: 12 ($1.957.071 reportado). Valor cuota: $148.148.
  const credito20 = await prisma.deuda.create({
    data: {
      entidad: "CRÉDITO 20 MINUTOS",
      referencia: "CR-20MIN-01",
      montoInicial: 2664701,
      saldoInicial: 2664701,
      saldoPendiente: 2664701,
      valorCuotaMensual: 148148,
      cuotasTotales: 24,
      cuotasPagadasIniciales: 7,
      cuotasPendientes: 17,
      valorVencidoMora: 1957071,
      cuotasEnMora: 12,
      diaVencimiento: 10,
      estado: EstadoDeuda.EN_MORA,
      tieneCuotas: true,
      observaciones: "Crédito 20 Minutos. 7 cuotas pagadas antes del sistema, 12 cuotas reportadas en mora.",
      orden: 3,
    },
  });

  const cuotasCredito20 = [];
  for (let i = 1; i <= 24; i++) {
    if (i <= 7) {
      cuotasCredito20.push({
        deudaId: credito20.id,
        numeroCuota: i,
        valor: 148148,
        fechaVencimiento: getFechaCuota(i - 20, 10),
        fechaPago: getFechaCuota(i - 20, 9),
        estado: EstadoCuota.PAGADA,
        esMora: false,
      });
    } else if (i <= 19) {
      // 12 cuotas en mora (8 a 19)
      cuotasCredito20.push({
        deudaId: credito20.id,
        numeroCuota: i,
        valor: 148148,
        fechaVencimiento: getFechaCuota(i - 20, 10),
        fechaPago: null,
        estado: EstadoCuota.VENCIDA,
        esMora: true,
      });
    } else {
      // 5 cuotas pendientes por vencer (20 a 24)
      cuotasCredito20.push({
        deudaId: credito20.id,
        numeroCuota: i,
        valor: 148148,
        fechaVencimiento: getFechaCuota(i - 20, 10),
        fechaPago: null,
        estado: EstadoCuota.PENDIENTE,
        esMora: false,
      });
    }
  }
  await prisma.cuota.createMany({ data: cuotasCredito20 });

  // 7. Cargar DEUDA 4: NU
  // Monto inicial: $218.628. Sin plan fijo de cuotas. Permite abonos libres o cancelar totalidad.
  await prisma.deuda.create({
    data: {
      entidad: "NU",
      referencia: "NU-COLOMBIA-ROTATIVO",
      montoInicial: 218628,
      saldoInicial: 218628,
      saldoPendiente: 218628,
      valorCuotaMensual: 0,
      cuotasTotales: 0,
      cuotasPagadasIniciales: 0,
      cuotasPendientes: 0,
      valorVencidoMora: 0,
      cuotasEnMora: 0,
      diaVencimiento: 18,
      estado: EstadoDeuda.ACTIVA,
      tieneCuotas: false,
      observaciones: "Tarjeta / Crédito Nu. Sin plan fijo de cuotas. Permite abonos libres y pago total.",
      orden: 4,
    },
  });

  // 8. Cargar DEUDA 5: TARJETA DE CRÉDITO DAVIBANK
  // Monto inicial: $4.514.000. Sin plan fijo de cuotas. Permite abonos libres o cancelar totalidad.
  await prisma.deuda.create({
    data: {
      entidad: "TARJETA DE CRÉDITO DAVIBANK",
      referencia: "TC-DAVIBANK-PLATINUM",
      montoInicial: 4514000,
      saldoInicial: 4514000,
      saldoPendiente: 4514000,
      valorCuotaMensual: 0,
      cuotasTotales: 0,
      cuotasPagadasIniciales: 0,
      cuotasPendientes: 0,
      valorVencidoMora: 0,
      cuotasEnMora: 0,
      diaVencimiento: 25,
      estado: EstadoDeuda.ACTIVA,
      tieneCuotas: false,
      observaciones: "Tarjeta de Crédito Davibank. Sin plan fijo de cuotas. Permite abonos extraordinarios y cancelación total.",
      orden: 5,
    },
  });

  console.log("¡Carga inicial completada exitosamente!");
  console.log("Totales verificados:");
  console.log("NEQUI: $2.694.907");
  console.log("DAVIVIENDA: $4.291.384");
  console.log("CRÉDITO 20 MINUTOS: $2.664.701");
  console.log("NU: $218.628");
  console.log("TARJETA DE CRÉDITO DAVIBANK: $4.514.000");
  console.log("SUMA TOTAL INICIAL: $14.383.620 COP");
}

main()
  .catch((e) => {
    console.error("Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
