import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function PUT(req: Request) {
  try {
    const session = await getSession();
    const body = await req.json();
    const { passwordActual, passwordNueva } = body;

    if (!passwordNueva || passwordNueva.length < 4) {
      return NextResponse.json(
        { error: "La nueva contraseña debe tener al menos 4 caracteres" },
        { status: 400 }
      );
    }

    const usuario = session?.userId
      ? await prisma.usuario.findUnique({ where: { id: session.userId } })
      : await prisma.usuario.findFirst();

    if (!usuario) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // Verificar contraseña actual
    const esCorrecta = await bcrypt.compare(passwordActual, usuario.password);
    if (!esCorrecta) {
      return NextResponse.json(
        { error: "La contraseña actual no es correcta" },
        { status: 400 }
      );
    }

    // Hashear y actualizar
    const hashed = await bcrypt.hash(passwordNueva, 10);
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { password: hashed },
    });

    return NextResponse.json({
      success: true,
      mensaje: "Contraseña actualizada exitosamente",
    });
  } catch (error: any) {
    console.error("Error al cambiar contraseña:", error);
    return NextResponse.json(
      { error: error.message || "Error al cambiar la contraseña" },
      { status: 500 }
    );
  }
}
