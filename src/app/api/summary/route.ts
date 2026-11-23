import { NextResponse } from "next/server";
import { getDashboardSummary } from "@/services/financeService";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const summary = await getDashboardSummary();
    return NextResponse.json(summary);
  } catch (error: any) {
    console.error("Error al obtener resumen de dashboard:", error);
    return NextResponse.json(
      { error: error.message || "Error al calcular resumen financiero" },
      { status: 500 }
    );
  }
}
