import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    // Si no hay sesión activa aún, usamos el usuario admin principal por defecto
    const usuario = session?.userId
      ? await prisma.usuario.findUnique({ where: { id: session.userId } })
      : await prisma.usuario.findFirst();

    if (!usuario) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      avatar: usuario.avatar,
      telefono: usuario.telefono,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error al obtener perfil" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getSession();
    const body = await req.json();
    const { nombre, email, avatar, telefono } = body;

    const usuario = session?.userId
      ? await prisma.usuario.findUnique({ where: { id: session.userId } })
      : await prisma.usuario.findFirst();

    if (!usuario) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const actualizado = await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        nombre: nombre ? nombre.trim() : undefined,
        email: email ? email.trim().toLowerCase() : undefined,
        avatar: avatar !== undefined ? avatar : undefined,
        telefono: telefono !== undefined ? telefono : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      mensaje: "Perfil actualizado exitosamente",
      usuario: {
        id: actualizado.id,
        nombre: actualizado.nombre,
        email: actualizado.email,
        avatar: actualizado.avatar,
        telefono: actualizado.telefono,
      },
    });
  } catch (error: any) {
    console.error("Error al actualizar perfil:", error);
    return NextResponse.json(
      { error: error.message || "Error al actualizar perfil" },
      { status: 500 }
    );
  }
}
