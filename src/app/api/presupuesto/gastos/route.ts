import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getGastosList } from "@/services/budgetService";
import { PeriodoPresupuesto, TipoGasto, CategoriaGasto } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const now = new Date();
    const mes = parseInt(searchParams.get("mes") || String(now.getMonth() + 1));
    const anio = parseInt(searchParams.get("anio") || String(now.getFullYear()));
    const periodo = searchParams.get("periodo") || undefined;

    const gastos = await getGastosList(mes, anio, periodo);
    return NextResponse.json(gastos);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      nombre,
      categoria,
      tipo,
      montoPresupuestado,
      periodoAsignado,
      diaVencimiento,
      notas,
      mes,
      anio,
    } = body;

    if (!nombre || !montoPresupuestado) {
      return NextResponse.json(
        { error: "Nombre y monto presupuestado son requeridos" },
        { status: 400 }
      );
    }

    const now = new Date();
    const gasto = await prisma.gastoPresupuesto.create({
      data: {
        nombre: nombre.trim(),
        categoria: (categoria as CategoriaGasto) || CategoriaGasto.OTROS,
        tipo: (tipo as TipoGasto) || TipoGasto.FIJO,
        montoPresupuestado: Number(montoPresupuestado),
        montoReal: Number(montoPresupuestado),
        periodoAsignado: (periodoAsignado as PeriodoPresupuesto) || PeriodoPresupuesto.MES_COMPLETO,
        diaVencimiento: diaVencimiento ? parseInt(diaVencimiento) : 15,
        notas: notas?.trim() || null,
        mes: mes ? parseInt(mes) : now.getMonth() + 1,
        anio: anio ? parseInt(anio) : now.getFullYear(),
        estaPagado: false,
      },
    });

    return NextResponse.json({ success: true, gasto });
  } catch (error: any) {
    console.error("Error al crear gasto:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// Marcar como pagado o editar valor real
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, estaPagado, montoReal, comprobanteUrl } = body;

    if (!id) {
      return NextResponse.json({ error: "ID de gasto requerido" }, { status: 400 });
    }

    const gasto = await prisma.gastoPresupuesto.update({
      where: { id },
      data: {
        estaPagado: Boolean(estaPagado),
        montoReal: montoReal !== undefined ? Number(montoReal) : undefined,
        fechaPago: estaPagado ? new Date() : null,
        comprobanteUrl: comprobanteUrl !== undefined ? comprobanteUrl : undefined,
      },
    });

    return NextResponse.json({ success: true, gasto });
  } catch (error: any) {
    console.error("Error al actualizar gasto:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID de gasto requerido" }, { status: 400 });
    }

    await prisma.gastoPresupuesto.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error al eliminar gasto:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
