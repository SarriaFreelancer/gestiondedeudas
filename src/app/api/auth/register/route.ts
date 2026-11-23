import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { createSessionToken, setAuthCookie } from "@/lib/auth";
import { getZodErrorMessage } from "@/lib/validations";

const registerSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(4, "La contraseña debe tener al menos 4 caracteres"),
  telefono: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: getZodErrorMessage(result.error) }, { status: 400 });
    }

    const { nombre, email, password, telefono } = result.data;
    const normalizedEmail = email.trim().toLowerCase();

    // Verificar si el usuario ya existe
    const existing = await prisma.usuario.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Este correo electrónico ya está registrado. Inicia sesión o recupera tu contraseña." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const nuevoUsuario = await prisma.usuario.create({
      data: {
        nombre: nombre.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        telefono: telefono?.trim() || null,
      },
    });

    // Iniciar sesión inmediatamente creando el token JWT y seteando la cookie
    const token = await createSessionToken({
      userId: nuevoUsuario.id,
      email: nuevoUsuario.email,
      nombre: nuevoUsuario.nombre,
    });

    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      message: "Usuario registrado e iniciado exitosamente",
      user: {
        id: nuevoUsuario.id,
        nombre: nuevoUsuario.nombre,
        email: nuevoUsuario.email,
      },
    });
  } catch (error: any) {
    console.error("Error en /api/auth/register:", error);
    return NextResponse.json(
      { error: error.message || "Error interno al procesar el registro" },
      { status: 500 }
    );
  }
}
