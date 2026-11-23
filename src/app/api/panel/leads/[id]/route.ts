import { getDb } from "@/lib/db";
import { actualizarLead, eventosDe, obtenerLead, parsearCambio } from "@/lib/leads";
import { exigirCsrf, exigirSesion, json } from "@/lib/sesion";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function idDe(context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return id;
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const acceso = await exigirSesion(request);
  if (!acceso.ok) return acceso.response;
  const id = await idDe(context);
  try {
    const db = getDb();
    const lead = await obtenerLead(db, id);
    if (!lead) return json({ ok: false, error: "No encontramos esa consulta." }, 404);
    const eventos = await eventosDe(db, id);
    return json({ ok: true, lead, eventos });
  } catch (error) {
    console.error("[panel] detalle", error instanceof Error ? error.name : "error");
    return json({ ok: false, error: "No se ha podido abrir la consulta." }, 500);
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const acceso = await exigirSesion(request);
  if (!acceso.ok) return acceso.response;
  const csrf = exigirCsrf(request, acceso.sesion);
  if (csrf) return csrf;
  const id = await idDe(context);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "Formato no válido." }, 400);
  }
  const cambio = parsearCambio(body);
  if ("error" in cambio) return json({ ok: false, error: cambio.error }, 422);

  try {
    const lead = await actualizarLead(getDb(), id, cambio.cambio, acceso.sesion.usuario);
    if (!lead) return json({ ok: false, error: "No encontramos esa consulta." }, 404);
    return json({ ok: true, lead });
  } catch (error) {
    console.error("[panel] cambio", error instanceof Error ? error.name : "error");
    return json({ ok: false, error: "No se ha podido guardar el cambio." }, 500);
  }
}
