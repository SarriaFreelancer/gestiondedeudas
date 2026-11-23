import { NextResponse } from "next/server";
import { getMetasAhorro, crearMetaAhorro } from "@/services/savingsService";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getMetasAhorro();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error al obtener metas de ahorro:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nombre, montoObjetivo, montoInicial, bancoUbicacion, color, fechaLimite, notas } = body;

    if (!nombre || !montoObjetivo) {
      return NextResponse.json(
        { error: "Nombre y monto objetivo de la meta son requeridos" },
        { status: 400 }
      );
    }

    const meta = await crearMetaAhorro({
      nombre,
      montoObjetivo: Number(montoObjetivo),
      montoInicial: montoInicial ? Number(montoInicial) : 0,
      bancoUbicacion,
      color,
      fechaLimite: fechaLimite ? new Date(fechaLimite) : null,
      notas,
    });

    return NextResponse.json({ success: true, meta });
  } catch (error: any) {
    console.error("Error al crear meta de ahorro:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
