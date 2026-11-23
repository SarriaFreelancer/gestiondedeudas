import { NextResponse } from "next/server";
import { calcularProyecciones } from "@/services/projectionService";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const abonoStr = searchParams.get("abono");
    const estrategiaStr = searchParams.get("estrategia") as any;

    const abono = abonoStr ? Number(abonoStr) : 300000;
    const estrategia = ["BOLA_DE_NIEVE", "AVALANCHA", "PERSONALIZADA"].includes(estrategiaStr)
      ? estrategiaStr
      : "BOLA_DE_NIEVE";

    const proyeccion = await calcularProyecciones(abono, estrategia);
    return NextResponse.json(proyeccion);
  } catch (error: any) {
    console.error("Error al calcular proyecciones:", error);
    return NextResponse.json({ error: error.message || "Error al calcular proyecciones" }, { status: 500 });
  }
}
