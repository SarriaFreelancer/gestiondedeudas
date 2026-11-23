import { NextResponse } from "next/server";
import { registrarPagoCuota } from "@/services/financeService";
import { pagoCuotaSchema, getZodErrorMessage } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = pagoCuotaSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: getZodErrorMessage(result.error) }, { status: 400 });
    }

    const { deudaId, cuotaId, monto, metodoPago, referenciaPago, observaciones } = result.data;

    const resultado = await registrarPagoCuota({
      deudaId,
      cuotaId,
      monto,
      metodoPago,
      referenciaPago,
      observaciones,
    });

    return NextResponse.json({
      success: true,
      mensaje: "Pago de cuota registrado exitosamente",
      resultado,
    });
  } catch (error: any) {
    console.error("Error al registrar pago de cuota:", error);
    return NextResponse.json(
      { error: error.message || "No se pudo procesar el pago de la cuota" },
      { status: 400 }
    );
  }
}
