import { getDb } from "@/lib/db";
import { contadores, filtrosDesdeUrl, listarLeads, TAMANO_PAGINA } from "@/lib/leads";
import { exigirSesion, json } from "@/lib/sesion";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const acceso = await exigirSesion(request);
  if (!acceso.ok) return acceso.response;
  try {
    const filtros = filtrosDesdeUrl(new URL(request.url));
    const db = getDb();
    const [lista, cifras] = await Promise.all([listarLeads(db, filtros), contadores(db)]);
    return json({ ok: true, ...lista, page: filtros.page, pageSize: TAMANO_PAGINA, contadores: cifras });
  } catch (error) {
    console.error("[panel] listado", error instanceof Error ? error.message.split("\n")[0] : "error");
    return json({ ok: false, error: "No se han podido cargar las consultas." }, 500);
  }
}
