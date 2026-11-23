import { NextResponse } from "next/server";
import { getDashboardSummary } from "@/services/financeService";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const now = new Date();
    const mes = searchParams.has("mes")
      ? parseInt(searchParams.get("mes")!)
      : now.getMonth() + 1;
    const anio = searchParams.has("anio")
      ? parseInt(searchParams.get("anio")!)
      : now.getFullYear();

    const summary = await getDashboardSummary(mes, anio);
    return NextResponse.json(summary);
  } catch (error: any) {
    console.error("Error al obtener resumen de dashboard:", error);
    return NextResponse.json(
      { error: error.message || "Error al calcular resumen financiero" },
      { status: 500 }
    );
  }
}
