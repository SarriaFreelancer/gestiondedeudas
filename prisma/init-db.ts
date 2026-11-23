import { PrismaClient, EstadoDeuda, EstadoCuota } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("=== INICIANDO INIT-DB (CREACIÓN DE TABLAS, ADMIN Y DATOS) ===");

  const adminEmail = "davidjuanmontano7@gmail.com";
  const rawPassword = "Admin123";

  // 1. Asegurar configuración base sin borrar datos existentes
  const config = await prisma.configuracion.findFirst();
  if (!config) {
    await prisma.configuracion.create({
      data: {
        id: 1,
        moneda: "COP",
        formatoFecha: "DD/MM/YYYY",
        estrategiaPago: "BOLA_DE_NIEVE",
        modalidadSalario: "QUINCENAL",
        preferenciasDashboard: JSON.stringify({
          tema: "dark",
          animaciones: true,
          graficoFavorito: "donut",
        }),
      },
    });
    console.log("✓ Configuración base inicializada.");
  }

  // 2. Crear o actualizar usuario administrador
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  const existingUser = await prisma.usuario.findUnique({
    where: { email: adminEmail },
  });

  if (!existingUser) {
    const oldUser = await prisma.usuario.findFirst({
      where: {
        OR: [
          { email: "david@milibertadfinanciera.com" },
          { nombre: "David" },
        ],
      },
    });

    if (oldUser) {
      await prisma.usuario.update({
        where: { id: oldUser.id },
        data: {
          email: adminEmail,
          nombre: "David Juan Montaño",
          password: hashedPassword,
        },
      });
      console.log(`✓ Usuario anterior actualizado a: ${adminEmail}`);
    } else {
      await prisma.usuario.create({
        data: {
          email: adminEmail,
          nombre: "David Juan Montaño",
          password: hashedPassword,
        },
      });
      console.log(`✓ Nuevo usuario administrador creado: ${adminEmail}`);
    }
  } else {
    await prisma.usuario.update({
      where: { email: adminEmail },
      data: {
        nombre: "David Juan Montaño",
        password: hashedPassword,
      },
    });
    console.log(`✓ Contraseña de usuario administrador actualizada para: ${adminEmail}`);
  }

  // 3. SEED DE DATOS INICIALES (SOLO UNA VEZ SI LA BD ESTÁ VACÍA DE DEUDAS)
  const totalDeudas = await prisma.deuda.count();
  if (totalDeudas === 0) {
    console.log("ℹ️ No se detectaron deudas previas en la base de datos.");
    console.log("📦 Procediendo con la carga inicial única de deudas y salario para David...");

    const hoy = new Date();
    const anioActual = hoy.getFullYear();
    const mesActual = hoy.getMonth();

    const getFechaCuota = (offsetMeses: number, dia: number = 5) => {
      return new Date(anioActual, mesActual + offsetMeses, dia);
    };

    // A. DEUDA 1: NEQUI
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

    // B. DEUDA 2: DAVIVIENDA
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

    // C. DEUDA 3: CRÉDITO 20 MINUTOS
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

    // D. DEUDA 4: NU
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

    // E. DEUDA 5: TARJETA DE CRÉDITO DAVIBANK
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

    // F. INICIALIZAR SALARIOS QUINCENALES DEL MES ACTUAL SI NO EXISTEN INGRESOS
    const totalIngresos = await prisma.ingreso.count({
      where: { mes: mesActual + 1, anio: anioActual },
    });
    if (totalIngresos === 0) {
      await prisma.ingreso.createMany({
        data: [
          {
            descripcion: "Salario Quincena 1",
            monto: 1020000,
            periodo: "QUINCENA_1",
            mes: mesActual + 1,
            anio: anioActual,
            fuente: "SALARIO",
          },
          {
            descripcion: "Salario Quincena 2",
            monto: 1020000,
            periodo: "QUINCENA_2",
            mes: mesActual + 1,
            anio: anioActual,
            fuente: "SALARIO",
          },
        ],
      });
      console.log("✓ Salario base quincenal registrado para el mes actual.");
    }

    console.log("✓ Carga inicial única de deudas y salarios finalizada exitosamente.");
  } else {
    console.log(`ℹ️ La base de datos ya contiene ${totalDeudas} deudas registradas. No se alterarán los datos.`);
  }

  console.log("=== BASE DE DATOS Y USUARIO LISTOS PARA USAR ===");
}

main()
  .catch((e) => {
    console.error("Error en init-db:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
