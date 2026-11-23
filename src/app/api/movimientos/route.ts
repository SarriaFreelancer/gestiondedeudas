import { NextResponse } from "next/server";
import { getHistorialMovimientos } from "@/services/financeService";
import { TipoMovimiento } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const deudaId = searchParams.get("deudaId") || undefined;
    const tipo = (searchParams.get("tipo") as TipoMovimiento) || undefined;
    const fechaDesdeStr = searchParams.get("fechaDesde");
    const fechaHastaStr = searchParams.get("fechaHasta");

    const fechaDesde = fechaDesdeStr ? new Date(fechaDesdeStr) : undefined;
    const fechaHasta = fechaHastaStr ? new Date(fechaHastaStr) : undefined;

    const movimientos = await getHistorialMovimientos({
      deudaId,
      tipo,
      fechaDesde,
      fechaHasta,
    });

    return NextResponse.json(movimientos);
  } catch (error: any) {
    console.error("Error al obtener movimientos:", error);
    return NextResponse.json({ error: error.message || "Error al consultar historial" }, { status: 500 });
  }
}
