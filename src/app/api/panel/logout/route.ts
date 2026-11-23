import { cabeceraCerrarSesion, exigirCsrf, exigirSesion, json } from "@/lib/sesion";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const acceso = await exigirSesion(request);
  if (!acceso.ok) return acceso.response;
  const csrf = exigirCsrf(request, acceso.sesion);
  if (csrf) return csrf;
  return json({ ok: true }, 200, { "Set-Cookie": cabeceraCerrarSesion() });
}
