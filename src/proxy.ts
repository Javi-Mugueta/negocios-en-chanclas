import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_SESION, verificarToken } from "@/lib/sesion";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/panel/login" || pathname === "/api/panel/login") {
    return NextResponse.next();
  }

  const sesion = await verificarToken(request.cookies.get(COOKIE_SESION)?.value);
  if (sesion) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ ok: false, error: "No autorizado." }, { status: 401 });
  }

  const destino = request.nextUrl.clone();
  destino.pathname = "/panel/login";
  destino.search = "";
  return NextResponse.redirect(destino);
}

export const config = {
  matcher: ["/panel", "/panel/:path*", "/api/panel/:path*"],
};
