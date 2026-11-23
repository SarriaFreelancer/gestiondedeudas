import { NextResponse } from "next/server";
import { getBudgetSummary } from "@/services/budgetService";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const now = new Date();
    const mes = parseInt(searchParams.get("mes") || String(now.getMonth() + 1));
    const anio = parseInt(searchParams.get("anio") || String(now.getFullYear()));
    const periodo = searchParams.get("periodo") || "MES_COMPLETO";

    const summary = await getBudgetSummary(mes, anio, periodo);
    return NextResponse.json(summary);
  } catch (error: any) {
    console.error("Error al obtener resumen de presupuesto:", error);
    return NextResponse.json(
      { error: error.message || "Error al cargar presupuesto" },
      { status: 500 }
    );
  }
}
