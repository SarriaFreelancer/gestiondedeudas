import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createSessionToken, setAuthCookie, clearAuthCookie, getSession } from "@/lib/auth";
import { loginSchema, getZodErrorMessage } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: getZodErrorMessage(result.error) }, { status: 400 });
    }

    const { email, password } = result.data;
    const usuario = await prisma.usuario.findUnique({
      where: { email },
    });

    if (!usuario) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    const validPassword = await bcrypt.compare(password, usuario.password);
    if (!validPassword) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    const token = await createSessionToken({
      userId: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
    });

    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      usuario: { id: usuario.id, email: usuario.email, nombre: usuario.nombre },
    });
  } catch (error: any) {
    console.error("Error en login:", error);
    return NextResponse.json({ error: error.message || "Error al iniciar sesión" }, { status: 500 });
  }
}
