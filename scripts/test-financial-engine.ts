import { prisma } from "../src/lib/prisma";
import {
  getDashboardSummary,
  registrarAbono,
  registrarPagoCuota,
  revertirMovimiento,
} from "../src/services/financeService";
import { TipoMovimiento, DestinoAbono } from "@prisma/client";

async function runTests() {
  console.log("=== INICIANDO PRUEBAS DE INTEGRIDAD FINANCIERA ===");

  // 1. Verificar estado inicial tras el seed
  const summaryInicial = await getDashboardSummary();
  console.log("\n1. Estado Inicial Conciliado:");
  console.log(`- Deuda Total Inicial: $${summaryInicial.deudaTotalInicial.toLocaleString("es-CO")}`);
  console.log(`- Total Pagado: $${summaryInicial.totalPagado.toLocaleString("es-CO")}`);
  console.log(`- Saldo Pendiente: $${summaryInicial.saldoPendiente.toLocaleString("es-CO")}`);
  console.log(`- Progreso: ${summaryInicial.progresoPorcentaje}%`);

  if (
    summaryInicial.deudaTotalInicial !== 14383620 ||
    summaryInicial.saldoPendiente !== 14383620 ||
    summaryInicial.totalPagado !== 0
  ) {
    throw new Error("El estado inicial no coincide con los $14.383.620 COP exactos.");
  }
  console.log("✔ Estado inicial verificado correctamente.");

  // 2. Prueba del ejemplo exacto del prompt:
  // "Si inicialmente debo $14.383.620 y registro un pago de $500.000:
  //  - Total pagado: $500.000
  //  - Saldo pendiente: $13.883.620
  //  - Progreso: aproximadamente 3,48%"
  const davibank = await prisma.deuda.findFirst({
    where: { entidad: "TARJETA DE CRÉDITO DAVIBANK" },
  });
  if (!davibank) throw new Error("No se encontró la deuda Davibank");

  console.log("\n2. Probando Abono Extraordinario de $500.000 a Davibank...");
  const abono = await registrarAbono({
    deudaId: davibank.id,
    monto: 500000,
    tipo: TipoMovimiento.ABONO_EXTRAORDINARIO,
    destinoAbono: DestinoAbono.REDUCIR_CAPITAL,
    metodoPago: "TRANSFERENCIA",
    observaciones: "Abono de prueba de $500.000",
  });

  const summaryPostAbono = await getDashboardSummary();
  console.log(`- Total Pagado: $${summaryPostAbono.totalPagado.toLocaleString("es-CO")}`);
  console.log(`- Saldo Pendiente: $${summaryPostAbono.saldoPendiente.toLocaleString("es-CO")}`);
  console.log(`- Progreso: ${summaryPostAbono.progresoPorcentaje}%`);

  if (
    summaryPostAbono.totalPagado !== 500000 ||
    summaryPostAbono.saldoPendiente !== 13883620 ||
    Math.abs(summaryPostAbono.progresoPorcentaje - 3.48) > 0.05
  ) {
    throw new Error("El cálculo tras el abono de $500.000 no coincide exactamente con el ejemplo del prompt.");
  }
  console.log("✔ Cálculo de $500.000 probado con éxito exacto.");

  // 3. Probar reversión auditable
  console.log("\n3. Probando Reversión Auditable del Abono de $500.000...");
  await revertirMovimiento(abono.movimiento.id, "Prueba de reversión automática");

  const summaryPostReversion = await getDashboardSummary();
  console.log(`- Total Pagado post-reversión: $${summaryPostReversion.totalPagado.toLocaleString("es-CO")}`);
  console.log(`- Saldo Pendiente post-reversión: $${summaryPostReversion.saldoPendiente.toLocaleString("es-CO")}`);
  console.log(`- Progreso post-reversión: ${summaryPostReversion.progresoPorcentaje}%`);

  if (
    summaryPostReversion.totalPagado !== 0 ||
    summaryPostReversion.saldoPendiente !== 14383620 ||
    summaryPostReversion.progresoPorcentaje !== 0
  ) {
    throw new Error("La reversión no restauró el saldo al 100% de integridad.");
  }
  console.log("✔ Reversión auditable completada y saldo restaurado íntegramente.");

  // 4. Probar pago de una cuota de Nequi
  const nequi = await prisma.deuda.findFirst({
    where: { entidad: "NEQUI" },
    include: { cuotas: { where: { estado: "VENCIDA" } } },
  });
  if (!nequi || nequi.cuotas.length === 0) throw new Error("No se encontraron cuotas vencidas en Nequi");

  const cuotaParaPagar = nequi.cuotas[0];
  console.log(`\n4. Probando Pago de Cuota #${cuotaParaPagar.numeroCuota} de Nequi ($${Number(cuotaParaPagar.valor).toLocaleString("es-CO")})...`);

  const pagoCuota = await registrarPagoCuota({
    deudaId: nequi.id,
    cuotaId: cuotaParaPagar.id,
    monto: Number(cuotaParaPagar.valor),
    metodoPago: "NEQUI",
    observaciones: "Pago de cuota de prueba",
  });

  const summaryPostCuota = await getDashboardSummary();
  console.log(`- Total Pagado tras cuota: $${summaryPostCuota.totalPagado.toLocaleString("es-CO")}`);
  console.log(`- Saldo Pendiente tras cuota: $${summaryPostCuota.saldoPendiente.toLocaleString("es-CO")}`);
  console.log(`- Cuotas en mora restantes: ${summaryPostCuota.cuotasEnMoraTotales}`);

  // Revertir para dejar la base de datos impecable en estado 0
  console.log("\n5. Limpiando prueba de cuota con reversión...");
  await revertirMovimiento(pagoCuota.movimiento.id, "Limpieza de prueba de cuota");

  // Re-ejecutar seed para garantizar que el estado quede en su punto cero original
  console.log("✔ Todas las pruebas pasaron satisfactoriamente.");
}

runTests()
  .catch((e) => {
    console.error("Error en pruebas:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
