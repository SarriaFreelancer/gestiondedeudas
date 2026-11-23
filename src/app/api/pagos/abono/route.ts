import { NextResponse } from "next/server";
import { registrarAbono } from "@/services/financeService";
import { abonoSchema, getZodErrorMessage } from "@/lib/validations";
import { TipoMovimiento, DestinoAbono } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = abonoSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: getZodErrorMessage(result.error) }, { status: 400 });
    }

    const { deudaId, monto, tipo, destinoAbono, metodoPago, referenciaPago, observaciones } = result.data;

    const resultado = await registrarAbono({
      deudaId,
      monto,
      tipo: tipo as TipoMovimiento,
      destinoAbono: destinoAbono as DestinoAbono,
      metodoPago,
      referenciaPago,
      observaciones,
    });

    return NextResponse.json({
      success: true,
      mensaje: "Abono registrado exitosamente",
      resultado,
    });
  } catch (error: any) {
    console.error("Error al registrar abono:", error);
    return NextResponse.json(
      { error: error.message || "No se pudo procesar el abono" },
      { status: 400 }
    );
  }
}
