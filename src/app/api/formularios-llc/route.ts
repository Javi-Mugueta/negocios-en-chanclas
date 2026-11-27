import { avisarLead } from "@/lib/aviso";
import { getDb } from "@/lib/db";
import { agente, hashIp, ipDeLaPeticion } from "@/lib/ip";
import { insertarLead, LimiteConsultasError } from "@/lib/leads";
import { json } from "@/lib/sesion";
import { esHoneypot, validarFormulariosLlc } from "@/lib/validacion";
import { formulariosLlc } from "@/lib/site";
import { formulariosAbiertos, plazo1120Abierto } from "@/lib/visibilidad";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Datos para los formularios de la LLC (pasaporte, EIN, importes).
 * Desde la fecha límite (1 de abril) no se admite: se comprueba aquí, con la hora del servidor.
 * Nada de lo recibido se escribe en los logs: solo el tipo de error.
 */
export async function POST(request: Request) {
  if (!formulariosAbiertos()) return json({ ok: false, error: "No encontrado." }, 404);
  if (!plazo1120Abierto()) return json({ ok: false, error: formulariosLlc.plazoCerrado }, 410);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "Formato no válido." }, 400);
  }

  if (esHoneypot(body)) return json({ ok: true, id: null });

  const validado = validarFormulariosLlc(body);
  if ("errores" in validado) return json({ ok: false, errors: validado.errores }, 422);

  try {
    const ipHash = hashIp(ipDeLaPeticion(request));
    const { id } = await insertarLead(getDb(), validado.datos, { ipHash, userAgent: agente(request) });
    await avisarLead(validado.datos, id);
    return json({ ok: true, id });
  } catch (error) {
    if (error instanceof LimiteConsultasError) {
      return json(
        {
          ok: false,
          error: "Has enviado varios formularios seguidos. Espera unos minutos o escríbenos por WhatsApp.",
        },
        429,
      );
    }
    console.error("[formularios-llc] no se pudo guardar", error instanceof Error ? error.name : "error");
    return json(
      { ok: false, error: "No hemos podido guardar tus datos. Escríbenos por WhatsApp y lo vemos igual." },
      500,
    );
  }
}
