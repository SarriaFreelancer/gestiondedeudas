import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.APP_SECRET || "mi_libertad_financiera_super_secret_key_2026_jwt"
);

const COOKIE_NAME = "mlf_auth_session";

// Rutas públicas que no requieren autenticación
const PUBLIC_PATHS = ["/login", "/api/auth/login", "/manifest.webmanifest", "/icon.svg"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir archivos estáticos de Next.js, iconos e imágenes públicas
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/calendario") || // Permitir suscripción externa de calendario
    pathname.includes(".") ||
    PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(path))
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;

  let isValid = false;
  if (token) {
    try {
      await jwtVerify(token, SECRET);
      isValid = true;
    } catch {
      isValid = false;
    }
  }

  // Si no está autenticado y trata de ingresar al dashboard o rutas protegidas
  if (!isValid) {
    const loginUrl = new URL("/login", request.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(COOKIE_NAME);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
