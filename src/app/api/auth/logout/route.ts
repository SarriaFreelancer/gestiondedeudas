import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await clearAuthCookie();
    return NextResponse.json({
      success: true,
      mensaje: "Sesión cerrada exitosamente",
    });
  } catch (error: any) {
    console.error("Error al cerrar sesión:", error);
    return NextResponse.json(
      { error: error.message || "Error al cerrar sesión" },
      { status: 500 }
    );
  }
}
