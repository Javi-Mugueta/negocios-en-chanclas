import { aCsv } from "@/lib/csv";
import { getDb } from "@/lib/db";
import { exportarLeads, filtrosDesdeUrl } from "@/lib/leads";
import { exigirSesion, json } from "@/lib/sesion";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COLUMNAS = [
  "id",
  "creado",
  "actualizado",
  "origen",
  "servicio",
  "nombre",
  "email",
  "telefono",
  "mensaje",
  "estado",
  "notas",
  "pagina",
  "consentimiento",
  "consentimiento_version",
  "datos",
  "utm",
  "borrado_en",
];

export async function GET(request: Request) {
  const acceso = await exigirSesion(request);
  if (!acceso.ok) return acceso.response;
  try {
    const filtros = filtrosDesdeUrl(new URL(request.url));
    const leads = await exportarLeads(getDb(), filtros);
    const csv = aCsv(
      COLUMNAS,
      leads.map((lead) => [
        lead.id,
        lead.createdAt,
        lead.updatedAt,
        lead.origen,
        lead.servicio,
        lead.nombre,
        lead.email,
        lead.telefono,
        lead.mensaje,
        lead.estado,
        lead.notas,
        lead.pagina,
        lead.consentimiento ? "sí" : "no",
        lead.consentimientoVersion,
        lead.datos,
        lead.utm,
        lead.borradoEn,
      ]),
    );
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="consultas-negocios-en-chanclas.csv"',
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("[panel] csv", error instanceof Error ? error.name : "error");
    return json({ ok: false, error: "No se ha podido exportar." }, 500);
  }
}
