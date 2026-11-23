import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getIngresosList } from "@/services/budgetService";
import { PeriodoPresupuesto } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const now = new Date();
    const mes = parseInt(searchParams.get("mes") || String(now.getMonth() + 1));
    const anio = parseInt(searchParams.get("anio") || String(now.getFullYear()));

    const ingresos = await getIngresosList(mes, anio);
    return NextResponse.json(ingresos);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { descripcion, monto, periodo, mes, anio, fuente } = body;

    if (!descripcion || !monto) {
      return NextResponse.json(
        { error: "Descripción y monto de salario son requeridos" },
        { status: 400 }
      );
    }

    const now = new Date();
    const ingreso = await prisma.ingreso.create({
      data: {
        descripcion: descripcion.trim(),
        monto: Number(monto),
        periodo: (periodo as PeriodoPresupuesto) || PeriodoPresupuesto.QUINCENA_1,
        mes: mes ? parseInt(mes) : now.getMonth() + 1,
        anio: anio ? parseInt(anio) : now.getFullYear(),
        fuente: fuente?.trim() || "SALARIO",
      },
    });

    return NextResponse.json({ success: true, ingreso });
  } catch (error: any) {
    console.error("Error al registrar ingreso:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// Editar salario existente
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, descripcion, monto, periodo, fuente } = body;

    if (!id || !monto) {
      return NextResponse.json(
        { error: "ID y monto de salario son requeridos para actualizar" },
        { status: 400 }
      );
    }

    const ingreso = await prisma.ingreso.update({
      where: { id },
      data: {
        descripcion: descripcion ? descripcion.trim() : undefined,
        monto: Number(monto),
        periodo: periodo ? (periodo as PeriodoPresupuesto) : undefined,
        fuente: fuente ? fuente.trim() : undefined,
      },
    });

    return NextResponse.json({ success: true, ingreso });
  } catch (error: any) {
    console.error("Error al actualizar ingreso:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }

    await prisma.ingreso.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error al eliminar ingreso:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
