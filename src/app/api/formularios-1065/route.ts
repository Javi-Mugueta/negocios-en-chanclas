import { avisarLead } from "@/lib/aviso";
import { getDb } from "@/lib/db";
import { agente, hashIp, ipDeLaPeticion } from "@/lib/ip";
import { insertarLead, LimiteConsultasError } from "@/lib/leads";
import { json } from "@/lib/sesion";
import { esHoneypot, validarFormularios1065 } from "@/lib/validacion";
import { formularios1065 } from "@/lib/site";
import { formulariosAbiertos, plazo1065Abierto } from "@/lib/visibilidad";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Form 1065 + K-1 (LLC de varios socios): datos de la LLC y de cada socio (pasaportes, importes).
 * Sin prórroga: desde la fecha límite (1 de marzo) no se admite.
 * Nada de lo recibido se escribe en los logs: solo el tipo de error.
 */
export async function POST(request: Request) {
  if (!formulariosAbiertos()) return json({ ok: false, error: "No encontrado." }, 404);
  if (!plazo1065Abierto()) return json({ ok: false, error: formularios1065.plazoCerrado }, 410);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "Formato no válido." }, 400);
  }

  if (esHoneypot(body)) return json({ ok: true, id: null });

  const validado = validarFormularios1065(body);
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
    console.error("[formularios-1065] no se pudo guardar", error instanceof Error ? error.name : "error");
    return json(
      { ok: false, error: "No hemos podido guardar tus datos. Escríbenos por WhatsApp y lo vemos igual." },
      500,
    );
  }
}
