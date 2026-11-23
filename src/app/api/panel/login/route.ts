import { AuthConfigError, intentarAcceso } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { agente, hashIp, ipDeLaPeticion } from "@/lib/ip";
import { cabeceraCookie, firmarSesion, json, origenPermitido } from "@/lib/sesion";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!origenPermitido(request)) return json({ ok: false, error: "Origen no permitido." }, 403);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "Formato no válido." }, 400);
  }
  const raw = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const usuario = typeof raw.usuario === "string" ? raw.usuario : "";
  const clave = typeof raw.clave === "string" ? raw.clave : "";
  if ((process.env.NEC_SESSION_SECRET ?? "").length < 32 || !(process.env.NEC_ADMIN_USER ?? "").trim()) {
    return json({ ok: false, error: "El acceso no está configurado." }, 500);
  }

  try {
    const ipHash = hashIp(ipDeLaPeticion(request));
    const resultado = await intentarAcceso(getDb(), usuario, clave, ipHash, agente(request));
    if (!resultado.ok) {
      return json(
        {
          ok: false,
          error: resultado.bloqueado
            ? "Demasiados intentos. Prueba de nuevo en unos minutos."
            : "Usuario o contraseña incorrectos.",
        },
        resultado.bloqueado ? 429 : 401,
      );
    }
    const sesion = await firmarSesion(resultado.usuario);
    return json({ ok: true }, 200, { "Set-Cookie": cabeceraCookie(sesion.token) });
  } catch (error) {
    if (error instanceof AuthConfigError) {
      console.error("[panel] falta la configuración de acceso");
      return json({ ok: false, error: "El acceso no está configurado." }, 500);
    }
    console.error("[panel] acceso", error instanceof Error ? error.name : "error");
    return json({ ok: false, error: "No se ha podido entrar. Inténtalo de nuevo." }, 500);
  }
}
