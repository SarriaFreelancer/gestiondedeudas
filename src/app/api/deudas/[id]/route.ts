import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDeudaById } from "@/services/financeService";

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

    const deudaExistente = await prisma.deuda.findUnique({ where: { id } });
    if (!deudaExistente) {
      return NextResponse.json({ error: "Deuda no encontrada" }, { status: 404 });
    }

    const actualizada = await prisma.deuda.update({
      where: { id },
      data: {
        entidad: body.entidad !== undefined ? body.entidad.toUpperCase() : undefined,
        referencia: body.referencia !== undefined ? body.referencia : undefined,
        diaVencimiento: body.diaVencimiento !== undefined ? body.diaVencimiento : undefined,
        valorCuotaMensual: body.valorCuotaMensual !== undefined ? body.valorCuotaMensual : undefined,
        observaciones: body.observaciones !== undefined ? body.observaciones : undefined,
        estado: body.estado !== undefined ? body.estado : undefined,
      },
    });

    return NextResponse.json({ success: true, deuda: actualizada });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error al actualizar deuda" }, { status: 500 });
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

    // Validación de seguridad financiera: si tiene movimientos activos, advertir
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
