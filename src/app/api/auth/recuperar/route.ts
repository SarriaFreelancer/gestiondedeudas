import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getZodErrorMessage } from "@/lib/validations";

const recoverSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  newPassword: z.string().min(4, "La nueva contraseña debe tener al menos 4 caracteres"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = recoverSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: getZodErrorMessage(result.error) }, { status: 400 });
    }

    const { email, newPassword } = result.data;
    const normalizedEmail = email.trim().toLowerCase();

    const usuario = await prisma.usuario.findUnique({
      where: { email: normalizedEmail },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: "No encontramos ninguna cuenta asociada a este correo electrónico." },
        { status: 404 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.usuario.update({
      where: { email: normalizedEmail },
      data: { password: hashedPassword },
    });

    return NextResponse.json({
      success: true,
      message: "Tu contraseña ha sido restablecida exitosamente. Ahora puedes iniciar sesión.",
    });
  } catch (error: any) {
    console.error("Error en /api/auth/recuperar:", error);
    return NextResponse.json(
      { error: error.message || "Error al restablecer la contraseña" },
      { status: 500 }
    );
  }
}
