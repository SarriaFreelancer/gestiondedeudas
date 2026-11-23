import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { EstadoCuota } from "@prisma/client";

export const dynamic = "force-dynamic";

// AGREGAR CUOTAS ADICIONALES A UNA DEUDA
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const cantidad = Number(body.cantidad || 1);
    const valor = Number(body.valor);

    if (cantidad <= 0) {
      return NextResponse.json({ error: "La cantidad de cuotas debe ser mayor a 0" }, { status: 400 });
    }

    const deuda = await prisma.deuda.findUnique({
      where: { id },
      include: {
        cuotas: {
          orderBy: { numeroCuota: "desc" },
        },
      },
    });

    if (!deuda) {
      return NextResponse.json({ error: "Deuda no encontrada" }, { status: 404 });
    }

    const valorEfectivo = valor > 0 ? valor : Number(deuda.valorCuotaMensual);
    const ultimaCuota = deuda.cuotas[0];
    const ultimoNumero = ultimaCuota ? ultimaCuota.numeroCuota : 0;
    const ultimaFecha = ultimaCuota
      ? new Date(ultimaCuota.fechaVencimiento)
      : new Date();

    const cuotasNuevas = [];
    for (let i = 1; i <= cantidad; i++) {
      const nuevaFecha = new Date(
        ultimaFecha.getFullYear(),
        ultimaFecha.getMonth() + i,
        deuda.diaVencimiento || 5
      );

      cuotasNuevas.push({
        deudaId: deuda.id,
        numeroCuota: ultimoNumero + i,
        valor: valorEfectivo,
        fechaVencimiento: nuevaFecha,
        estado: EstadoCuota.PENDIENTE,
        esMora: false,
      });
    }

    await prisma.$transaction([
      prisma.cuota.createMany({ data: cuotasNuevas }),
      prisma.deuda.update({
        where: { id: deuda.id },
        data: {
          cuotasTotales: deuda.cuotasTotales + cantidad,
          cuotasPendientes: deuda.cuotasPendientes + cantidad,
          tieneCuotas: true,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      mensaje: `Se agregaron ${cantidad} cuotas exitosamente`,
    });
  } catch (error: any) {
    console.error("Error al agregar cuotas:", error);
    return NextResponse.json({ error: error.message || "Error al agregar cuotas" }, { status: 500 });
  }
}

// ACTUALIZAR VALOR DE CUOTAS PENDIENTES
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const nuevoValor = Number(body.nuevoValor);
    if (!nuevoValor || nuevoValor <= 0) {
      return NextResponse.json({ error: "El nuevo valor debe ser mayor a 0" }, { status: 400 });
    }

    // Actualiza todas las cuotas pendientes de esa deuda con el nuevo valor
    await prisma.$transaction([
      prisma.cuota.updateMany({
        where: {
          deudaId: id,
          estado: EstadoCuota.PENDIENTE,
        },
        data: {
          valor: nuevoValor,
        },
      }),
      prisma.deuda.update({
        where: { id },
        data: {
          valorCuotaMensual: nuevoValor,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      mensaje: "Valor de cuotas pendientes actualizado correctamente",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error al actualizar cuotas" }, { status: 500 });
  }
}
