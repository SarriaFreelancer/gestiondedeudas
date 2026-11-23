import { NextResponse } from "next/server";
import { trasladarSobranteAMeta } from "@/services/savingsService";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { metaId, monto, mes, anio, bancoDetalle, notas } = body;

    if (!metaId || !monto) {
      return NextResponse.json(
        { error: "Meta y monto son requeridos para realizar el traslado" },
        { status: 400 }
      );
    }

    const res = await trasladarSobranteAMeta({
      metaId,
      monto: Number(monto),
      mes: mes ? parseInt(mes) : undefined,
      anio: anio ? parseInt(anio) : undefined,
      bancoDetalle,
      notas,
    });

    return NextResponse.json({ success: true, ...res });
  } catch (error: any) {
    console.error("Error al trasladar sobrante a meta:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
