import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDeudaById } from "@/services/financeService";
import { EstadoCuota } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deuda = await getDeudaById(id);
    if (!deuda) {
      return NextResponse.json({ error: "Deuda no encontrada" }, { status: 404 });
    }
    return NextResponse.json(deuda);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error al obtener deuda" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const deudaExistente = await prisma.deuda.findUnique({
      where: { id },
      include: {
        cuotas: {
          orderBy: { numeroCuota: "desc" },
        },
      },
    });

    if (!deudaExistente) {
      return NextResponse.json({ error: "Deuda no encontrada" }, { status: 404 });
    }

    const {
      entidad,
      referencia,
      montoInicial,
      saldoPendiente,
      valorCuotaMensual,
      diaVencimiento,
      observaciones,
      estado,
      tieneCuotas,
      cuotasAAgregar, // número de cuotas a añadir si se especifica
      valorPorCuotaNueva,
    } = body;

    const actualizada = await prisma.$transaction(async (tx) => {
      let nuevasCuotasTotales = deudaExistente.cuotasTotales;
      let nuevasCuotasPendientes = deudaExistente.cuotasPendientes;

      // 1. Si se solicita agregar más cuotas
      if (cuotasAAgregar && Number(cuotasAAgregar) > 0) {
        const cantidad = Number(cuotasAAgregar);
        const valorCuota =
          valorPorCuotaNueva !== undefined && Number(valorPorCuotaNueva) > 0
            ? Number(valorPorCuotaNueva)
            : valorCuotaMensual !== undefined
            ? Number(valorCuotaMensual)
            : Number(deudaExistente.valorCuotaMensual);

        const ultimaCuota = deudaExistente.cuotas[0];
        const ultimoNumero = ultimaCuota ? ultimaCuota.numeroCuota : 0;
        const ultimaFecha = ultimaCuota
          ? new Date(ultimaCuota.fechaVencimiento)
          : new Date();

        const cuotasNuevas = [];
        for (let i = 1; i <= cantidad; i++) {
          const nuevaFecha = new Date(
            ultimaFecha.getFullYear(),
            ultimaFecha.getMonth() + i,
            diaVencimiento || deudaExistente.diaVencimiento || 5
          );

          cuotasNuevas.push({
            deudaId: deudaExistente.id,
            numeroCuota: ultimoNumero + i,
            valor: valorCuota,
            fechaVencimiento: nuevaFecha,
            estado: EstadoCuota.PENDIENTE,
            esMora: false,
          });
        }

        await tx.cuota.createMany({ data: cuotasNuevas });
        nuevasCuotasTotales += cantidad;
        nuevasCuotasPendientes += cantidad;
      }

      // 2. Actualizar la deuda con los nuevos valores
      const deudaUpdated = await tx.deuda.update({
        where: { id },
        data: {
          entidad: entidad !== undefined ? entidad.toUpperCase() : undefined,
          referencia: referencia !== undefined ? referencia : undefined,
          montoInicial: montoInicial !== undefined ? Number(montoInicial) : undefined,
          saldoPendiente: saldoPendiente !== undefined ? Number(saldoPendiente) : undefined,
          valorCuotaMensual:
            valorCuotaMensual !== undefined ? Number(valorCuotaMensual) : undefined,
          diaVencimiento: diaVencimiento !== undefined ? Number(diaVencimiento) : undefined,
          observaciones: observaciones !== undefined ? observaciones : undefined,
          estado: estado !== undefined ? estado : undefined,
          tieneCuotas: tieneCuotas !== undefined ? Boolean(tieneCuotas) : undefined,
          cuotasTotales: nuevasCuotasTotales,
          cuotasPendientes: nuevasCuotasPendientes,
        },
        include: {
          cuotas: {
            orderBy: { numeroCuota: "asc" },
          },
        },
      });

      return deudaUpdated;
    });

    return NextResponse.json({ success: true, deuda: actualizada });
  } catch (error: any) {
    console.error("Error al actualizar deuda:", error);
    return NextResponse.json(
      { error: error.message || "Error al actualizar la obligación" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const deuda = await prisma.deuda.findUnique({
      where: { id },
      include: {
        movimientos: {
          where: { estaRevertido: false },
        },
      },
    });

    if (!deuda) {
      return NextResponse.json({ error: "Deuda no encontrada" }, { status: 404 });
    }

    if (deuda.movimientos.length > 0) {
      return NextResponse.json(
        {
          error:
            "No se puede eliminar una obligación que tiene movimientos financieros confirmados. Puedes revertir los pagos primero o marcarla como pagada.",
        },
        { status: 400 }
      );
    }

    await prisma.deuda.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Deuda eliminada correctamente" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error al eliminar deuda" }, { status: 500 });
  }
}
