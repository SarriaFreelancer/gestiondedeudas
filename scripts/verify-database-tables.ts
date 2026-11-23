import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("=== COMPROBANDO CONEXIÓN Y TABLAS EN MYSQL 8 ===");

  // 1. Mostrar tablas creadas en MySQL
  const tables: any = await prisma.$queryRawUnsafe("SHOW FULL TABLES;");
  console.log("Tablas existentes en la base de datos MySQL 'misdeudas':");
  console.table(tables);

  // 2. Conteo de registros reales
  const [totalDeudas, totalCuotas, totalMovimientos, totalUsuarios, totalConfig] = await Promise.all([
    prisma.deuda.count(),
    prisma.cuota.count(),
    prisma.movimiento.count(),
    prisma.usuario.count(),
    prisma.configuracion.count(),
  ]);

  console.log("\n=== REGISTROS REALES EN BASE DE DATOS ===");
  console.log({
    "Deudas Creadas (deudas)": totalDeudas,
    "Cuotas Generadas (cuotas)": totalCuotas,
    "Movimientos Financieros (movimientos)": totalMovimientos,
    "Usuarios (usuarios)": totalUsuarios,
    "Configuraciones (configuracion)": totalConfig,
  });

  // 3. Deudas con sus saldos reales
  const deudas = await prisma.deuda.findMany({
    select: {
      id: true,
      entidad: true,
      montoInicial: true,
      saldoPendiente: true,
      tieneCuotas: true,
      cuotasTotales: true,
      cuotasPendientes: true,
      estado: true,
    },
  });

  console.log("\n=== DETALLE DE DEUDAS EN MYSQL ===");
  console.table(
    deudas.map((d) => ({
      Entidad: d.entidad,
      "Monto Inicial": Number(d.montoInicial),
      "Saldo Pendiente": Number(d.saldoPendiente),
      "Tiene Cuotas": d.tieneCuotas ? "Sí" : "No",
      "Total Cuotas": d.cuotasTotales,
      "Cuotas Pendientes": d.cuotasPendientes,
      Estado: d.estado,
    }))
  );
}

main()
  .catch((e) => {
    console.error("Error al verificar la base de datos:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
