import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDeudasConDetalle } from "@/services/financeService";
import { crearDeudaSchema, getZodErrorMessage } from "@/lib/validations";
import { EstadoDeuda, EstadoCuota } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const deudas = await getDeudasConDetalle();
    return NextResponse.json(deudas);
  } catch (error: any) {
    console.error("Error al obtener deudas:", error);
    return NextResponse.json({ error: error.message || "Error al consultar deudas" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = crearDeudaSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: getZodErrorMessage(result.error) }, { status: 400 });
    }

    const data = result.data;

    const nuevaDeuda = await prisma.$transaction(async (tx) => {
      const deuda = await tx.deuda.create({
        data: {
          entidad: data.entidad.toUpperCase(),
          referencia: data.referencia || null,
          montoInicial: data.montoInicial,
          saldoInicial: data.montoInicial,
          saldoPendiente: data.montoInicial,
          valorCuotaMensual: data.tieneCuotas ? data.valorCuotaMensual : 0,
          cuotasTotales: data.tieneCuotas ? data.cuotasTotales : 0,
          cuotasPagadasIniciales: 0,
          cuotasPendientes: data.tieneCuotas ? data.cuotasTotales : 0,
          valorVencidoMora: 0,
          cuotasEnMora: 0,
          diaVencimiento: data.diaVencimiento || 5,
          estado: EstadoDeuda.ACTIVA,
          tieneCuotas: data.tieneCuotas,
          observaciones: data.observaciones || null,
        },
      });

      // Generar cuotas si tiene plan de cuotas
      if (data.tieneCuotas && data.cuotasTotales > 0) {
        const cuotas = [];
        const hoy = new Date();
        for (let i = 1; i <= data.cuotasTotales; i++) {
          const fechaVenc = new Date(hoy.getFullYear(), hoy.getMonth() + i - 1, data.diaVencimiento || 5);
          cuotas.push({
            deudaId: deuda.id,
            numeroCuota: i,
            valor: data.valorCuotaMensual,
            fechaVencimiento: fechaVenc,
            estado: EstadoCuota.PENDIENTE,
            esMora: false,
          });
        }
        await tx.cuota.createMany({ data: cuotas });
      }

      return deuda;
    });

    return NextResponse.json({ success: true, deuda: nuevaDeuda }, { status: 201 });
  } catch (error: any) {
    console.error("Error al crear deuda:", error);
    return NextResponse.json({ error: error.message || "Error al crear la deuda" }, { status: 500 });
  }
}
