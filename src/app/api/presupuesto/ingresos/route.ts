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
    const {
      descripcion,
      monto,
      periodo,
      mes,
      anio,
      fuente,
      sincronizarQuincena = true,
      propagarFuturos = true,
    } = body;

    if (!descripcion || monto === undefined || monto === null) {
      return NextResponse.json(
        { error: "Descripción y monto de salario son requeridos" },
        { status: 400 }
      );
    }

    const now = new Date();
    const fechaObj = body.fecha ? new Date(body.fecha) : now;
    const targetMes = mes ? parseInt(mes) : fechaObj.getMonth() + 1;
    const targetAnio = anio ? parseInt(anio) : fechaObj.getFullYear();
    const targetPeriodo = (periodo as PeriodoPresupuesto) || PeriodoPresupuesto.QUINCENA_1;
    const nuevoMonto = Number(monto);

    const ingreso = await prisma.ingreso.create({
      data: {
        descripcion: descripcion.trim(),
        monto: nuevoMonto,
        periodo: targetPeriodo,
        mes: targetMes,
        anio: targetAnio,
        fecha: fechaObj,
        fuente: fuente?.trim() || (targetPeriodo === PeriodoPresupuesto.DIARIO_VARIABLE ? "HONORARIOS" : "SALARIO"),
      },
    });

    // Si se agrega una quincena y sincronizarQuincena es true, asegurar la contraparte
    if (
      sincronizarQuincena &&
      targetPeriodo !== PeriodoPresupuesto.DIARIO_VARIABLE &&
      (targetPeriodo === PeriodoPresupuesto.QUINCENA_1 ||
        targetPeriodo === PeriodoPresupuesto.QUINCENA_2)
    ) {
      const contrapartePeriodo =
        targetPeriodo === PeriodoPresupuesto.QUINCENA_1
          ? PeriodoPresupuesto.QUINCENA_2
          : PeriodoPresupuesto.QUINCENA_1;

      const contraparteDesc =
        contrapartePeriodo === PeriodoPresupuesto.QUINCENA_1
          ? "Salario 1ra Quincena"
          : "Salario 2da Quincena";

      const contraparte = await prisma.ingreso.findFirst({
        where: {
          mes: targetMes,
          anio: targetAnio,
          periodo: contrapartePeriodo,
        },
      });

      if (contraparte) {
        await prisma.ingreso.update({
          where: { id: contraparte.id },
          data: { monto: nuevoMonto },
        });
      } else {
        await prisma.ingreso.create({
          data: {
            descripcion: contraparteDesc,
            monto: nuevoMonto,
            periodo: contrapartePeriodo,
            mes: targetMes,
            anio: targetAnio,
            fuente: fuente?.trim() || "SALARIO",
          },
        });
      }
    }

    // Propagar a meses futuros existentes
    if (propagarFuturos) {
      const mesesFuturos = await prisma.ingreso.findMany({
        where: {
          OR: [
            { anio: targetAnio, mes: { gt: targetMes } },
            { anio: { gt: targetAnio } },
          ],
          fuente: "SALARIO",
        },
      });

      for (const fut of mesesFuturos) {
        if (sincronizarQuincena || fut.periodo === targetPeriodo) {
          await prisma.ingreso.update({
            where: { id: fut.id },
            data: { monto: nuevoMonto },
          });
        }
      }
    }

    return NextResponse.json({ success: true, ingreso });
  } catch (error: any) {
    console.error("Error al registrar ingreso:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// Editar salario existente con sincronización de quincenas y persistencia futura
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const {
      id,
      descripcion,
      monto,
      periodo,
      fuente,
      sincronizarQuincena = true,
      propagarFuturos = true,
    } = body;

    if (!id || monto === undefined || monto === null) {
      return NextResponse.json(
        { error: "ID y monto de salario son requeridos para actualizar" },
        { status: 400 }
      );
    }

    const ingresoActual = await prisma.ingreso.findUnique({ where: { id } });
    if (!ingresoActual) {
      return NextResponse.json({ error: "Salario no encontrado" }, { status: 404 });
    }

    const nuevoMonto = Number(monto);
    const nuevoPeriodo = periodo ? (periodo as PeriodoPresupuesto) : ingresoActual.periodo;

    const ingreso = await prisma.ingreso.update({
      where: { id },
      data: {
        descripcion: descripcion ? descripcion.trim() : undefined,
        monto: nuevoMonto,
        periodo: nuevoPeriodo,
        fuente: fuente ? fuente.trim() : undefined,
      },
    });

    // Sincronización automática de quincenas en el mismo mes
    if (
      sincronizarQuincena &&
      (nuevoPeriodo === PeriodoPresupuesto.QUINCENA_1 ||
        nuevoPeriodo === PeriodoPresupuesto.QUINCENA_2)
    ) {
      const contrapartePeriodo =
        nuevoPeriodo === PeriodoPresupuesto.QUINCENA_1
          ? PeriodoPresupuesto.QUINCENA_2
          : PeriodoPresupuesto.QUINCENA_1;

      const contraparteDesc =
        contrapartePeriodo === PeriodoPresupuesto.QUINCENA_1
          ? "Salario 1ra Quincena"
          : "Salario 2da Quincena";

      const contraparte = await prisma.ingreso.findFirst({
        where: {
          mes: ingresoActual.mes,
          anio: ingresoActual.anio,
          periodo: contrapartePeriodo,
        },
      });

      if (contraparte) {
        await prisma.ingreso.update({
          where: { id: contraparte.id },
          data: { monto: nuevoMonto },
        });
      } else {
        await prisma.ingreso.create({
          data: {
            descripcion: contraparteDesc,
            monto: nuevoMonto,
            periodo: contrapartePeriodo,
            mes: ingresoActual.mes,
            anio: ingresoActual.anio,
            fuente: ingreso.fuente || "SALARIO",
          },
        });
      }
    }

    // Propagar a meses futuros existentes
    if (propagarFuturos) {
      const mesesFuturos = await prisma.ingreso.findMany({
        where: {
          OR: [
            { anio: ingresoActual.anio, mes: { gt: ingresoActual.mes } },
            { anio: { gt: ingresoActual.anio } },
          ],
          fuente: "SALARIO",
        },
      });

      for (const fut of mesesFuturos) {
        if (sincronizarQuincena || fut.periodo === nuevoPeriodo) {
          await prisma.ingreso.update({
            where: { id: fut.id },
            data: { monto: nuevoMonto },
          });
        }
      }
    }

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
