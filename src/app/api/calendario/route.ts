import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const cuotaId = searchParams.get("cuotaId");

    // Consultar cuotas pendientes o en mora
    const cuotas = await prisma.cuota.findMany({
      where: cuotaId
        ? { id: cuotaId }
        : {
            estado: { in: ["PENDIENTE", "VENCIDA"] },
          },
      include: {
        deuda: true,
      },
      orderBy: { fechaVencimiento: "asc" },
    });

    if (cuotas.length === 0) {
      return new NextResponse("No hay cuotas pendientes para agendar.", { status: 404 });
    }

    // Formatear en estándar iCalendar RFC 5545
    const formatICSDate = (date: Date) => {
      return (
        date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
      );
    };

    const now = formatICSDate(new Date());

    let icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Mi Libertad Financiera//Agenda de Pagos//ES",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "X-WR-CALNAME:Vencimientos - Mi Libertad Financiera",
      "X-WR-TIMEZONE:America/Bogota",
    ];

    for (const c of cuotas) {
      const fechaVenc = new Date(c.fechaVencimiento);
      // Evento de 9:00 AM a 10:00 AM en la fecha de vencimiento
      const inicio = new Date(fechaVenc.getFullYear(), fechaVenc.getMonth(), fechaVenc.getDate(), 9, 0, 0);
      const fin = new Date(fechaVenc.getFullYear(), fechaVenc.getMonth(), fechaVenc.getDate(), 10, 0, 0);
      const valorCOP = Number(c.valor).toLocaleString("es-CO");

      const uid = `cuota-${c.id}@milibertadfinanciera.com`;
      const summary = `💰 Pagar Cuota #${c.numeroCuota} ${c.deuda.entidad} ($${valorCOP})`;
      const description = `Recordatorio de pago de cuota #${c.numeroCuota} de la obligación ${c.deuda.entidad}\\nValor: $${valorCOP} COP\\nSaldo pendiente actual: $${Number(c.deuda.saldoPendiente).toLocaleString("es-CO")} COP\\nOrganizado en Mi Libertad Financiera.`;

      icsContent.push(
        "BEGIN:VEVENT",
        `UID:${uid}`,
        `DTSTAMP:${now}`,
        `DTSTART:${formatICSDate(inicio)}`,
        `DTEND:${formatICSDate(fin)}`,
        `SUMMARY:${summary}`,
        `DESCRIPTION:${description}`,
        "STATUS:CONFIRMED",
        // Recordatorio 1: 3 días antes a las 9:00 AM
        "BEGIN:VALARM",
        "TRIGGER:-P3D",
        "ACTION:DISPLAY",
        `DESCRIPTION:Recordatorio: En 3 días vence la cuota de ${c.deuda.entidad}`,
        "END:VALARM",
        // Recordatorio 2: El mismo día del vencimiento a las 8:00 AM
        "BEGIN:VALARM",
        "TRIGGER:-PT1H",
        "ACTION:DISPLAY",
        `DESCRIPTION:¡Hoy vence tu cuota de ${c.deuda.entidad} por $${valorCOP} COP!`,
        "END:VALARM",
        "END:VEVENT"
      );
    }

    icsContent.push("END:VCALENDAR");

    const fileContent = icsContent.join("\r\n");

    return new NextResponse(fileContent, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": 'attachment; filename="cuotas_libertad_financiera.ics"',
      },
    });
  } catch (error: any) {
    console.error("Error al generar calendario:", error);
    return NextResponse.json({ error: error.message || "Error al exportar calendario" }, { status: 500 });
  }
}
