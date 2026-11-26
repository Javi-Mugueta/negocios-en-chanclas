import { avisarLead } from "@/lib/aviso";
import { getDb } from "@/lib/db";
import { agente, hashIp, ipDeLaPeticion } from "@/lib/ip";
import { insertarLead, LimiteConsultasError } from "@/lib/leads";
import { json } from "@/lib/sesion";
import { esHoneypot, validarEmpezar } from "@/lib/validacion";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "Formato no válido." }, 400);
  }

  if (esHoneypot(body)) return json({ ok: true, id: null });

  const validado = validarEmpezar(body);
  if ("errores" in validado) return json({ ok: false, errors: validado.errores }, 422);

  try {
    const ipHash = hashIp(ipDeLaPeticion(request));
    const { id } = await insertarLead(getDb(), validado.datos, { ipHash, userAgent: agente(request) });
    await avisarLead(validado.datos, id);
    // El id va en el client_reference_id de Stripe para unir el pago con el alta.
    return json({ ok: true, id });
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
    console.error("[empezar] no se pudo guardar", error instanceof Error ? error.name : "error");
    return json(
      { ok: false, error: "No hemos podido guardar tus respuestas. Escríbenos por WhatsApp y lo vemos igual." },
      500,
    );
  }
}
