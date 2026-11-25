import { avisarLead } from "@/lib/aviso";
import { getDb } from "@/lib/db";
import { agente, hashIp, ipDeLaPeticion } from "@/lib/ip";
import { insertarLead, LimiteConsultasError } from "@/lib/leads";
import { json } from "@/lib/sesion";
import { esHoneypot, validarContacto } from "@/lib/validacion";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "Formato no válido." }, 400);
  }

  if (esHoneypot(body)) return json({ ok: true });

  const validado = validarContacto(body);
  if ("errores" in validado) return json({ ok: false, errors: validado.errores }, 422);

  try {
    const ipHash = hashIp(ipDeLaPeticion(request));
    const { id } = await insertarLead(getDb(), validado.datos, { ipHash, userAgent: agente(request) });
    await avisarLead(validado.datos, id);
    return json({ ok: true });
  } catch (error) {
    if (error instanceof LimiteConsultasError) {
      return json(
        {
          ok: false,
          error: "Has enviado varias consultas seguidas. Espera unos minutos o escríbenos por WhatsApp.",
        },
        429,
      );
    }
    console.error("[contacto] no se pudo guardar", error instanceof Error ? error.name : "error");
    return json(
      { ok: false, error: "No hemos podido guardar tu mensaje. Escríbenos por WhatsApp y lo vemos igual." },
      500,
    );
  }
}
