import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [deudas, cuotas, movimientos, usuario, configuracion] = await Promise.all([
      prisma.deuda.findMany({ include: { cuotas: true } }),
      prisma.cuota.findMany(),
      prisma.movimiento.findMany(),
      prisma.usuario.findMany({ select: { id: true, email: true, nombre: true, telefono: true, createdAt: true } }),
      prisma.configuracion.findMany(),
    ]);

    const backupData = {
      sistema: "Mi Libertad Financiera",
      version: "1.0.0",
      fechaExportacion: new Date().toISOString(),
      deudas,
      cuotas,
      movimientos,
      usuario,
      configuracion,
    };

    const jsonString = JSON.stringify(backupData, null, 2);
    const fecha = new Date().toISOString().split("T")[0];

    return new NextResponse(jsonString, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="backup_libertad_financiera_${fecha}.json"`,
      },
    });
  } catch (error: any) {
    console.error("Error al generar backup:", error);
    return NextResponse.json({ error: error.message || "Error al generar backup" }, { status: 500 });
  }
}
