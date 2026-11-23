import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { nombre, montoObjetivo, montoActual, bancoUbicacion, color, fechaLimite, notas } = body;

    const meta = await prisma.metaAhorro.update({
      where: { id },
      data: {
        nombre: nombre ? nombre.trim() : undefined,
        montoObjetivo: montoObjetivo !== undefined ? Number(montoObjetivo) : undefined,
        montoActual: montoActual !== undefined ? Number(montoActual) : undefined,
        bancoUbicacion: bancoUbicacion || undefined,
        color: color || undefined,
        fechaLimite: fechaLimite !== undefined ? (fechaLimite ? new Date(fechaLimite) : null) : undefined,
        notas: notas !== undefined ? notas.trim() : undefined,
      },
    });

    return NextResponse.json({ success: true, meta });
  } catch (error: any) {
    console.error("Error al actualizar meta:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.metaAhorro.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error al eliminar meta:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
