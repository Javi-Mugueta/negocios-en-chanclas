const SERVICIOS = ["arranque", "en-regla", "cierre", "corporacion", "web", "otra"] as const;

type Payload = {
  nombre?: unknown;
  email?: unknown;
  telefono?: unknown;
  servicio?: unknown;
  mensaje?: unknown;
  consentimiento?: unknown;
};

const isText = (v: unknown, max: number): v is string =>
  typeof v === "string" && v.trim().length > 0 && v.length <= max;

/**
 * Endpoint de demostración: valida y responde, pero NO envía el mensaje a
 * ningún sitio. Conectar aquí el proveedor de email o CRM antes de publicar.
 */
export async function POST(request: Request) {
  let body: Payload;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Formato no válido." }, { status: 400 });
  }

  const errors: Record<string, string> = {};
  if (!isText(body.nombre, 120)) errors.nombre = "Dinos cómo te llamas.";
  if (!isText(body.email, 200) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email))
    errors.email = "Necesitamos un email válido para responderte.";
  if (body.telefono !== undefined && body.telefono !== "" && !isText(body.telefono, 40))
    errors.telefono = "Revisa el teléfono.";
  if (!SERVICIOS.includes(body.servicio as (typeof SERVICIOS)[number]))
    errors.servicio = "Elige una opción.";
  if (!isText(body.mensaje, 4000)) errors.mensaje = "Cuéntanos un poco qué necesitas.";
  if (body.consentimiento !== true) errors.consentimiento = "Necesitamos tu consentimiento.";

  if (Object.keys(errors).length > 0) {
    return Response.json({ ok: false, errors }, { status: 422 });
  }

  console.info("[contacto] Nuevo mensaje (modo demostración, no se envía):", {
    servicio: body.servicio,
    recibido: new Date().toISOString(),
  });

  return Response.json({ ok: true, demo: true });
}
