import { NextResponse } from "next/server";
import { revertirMovimiento } from "@/services/financeService";
import { revertirMovimientoSchema, getZodErrorMessage } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = revertirMovimientoSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: getZodErrorMessage(result.error) }, { status: 400 });
    }

    const { movimientoId, motivo } = result.data;
    const reversion = await revertirMovimiento(movimientoId, motivo);

    return NextResponse.json({
      success: true,
      mensaje: "Movimiento revertido de forma auditable",
      reversion,
    });
  } catch (error: any) {
    console.error("Error al revertir movimiento:", error);
    return NextResponse.json(
      { error: error.message || "No se pudo revertir el movimiento" },
      { status: 400 }
    );
  }
}
