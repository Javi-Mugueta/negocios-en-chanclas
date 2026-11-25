import { SERVICIO_POR_CASO } from "@/lib/asistente";
import type { BaseDatos, Fila } from "@/lib/db";
import { randomUUID } from "node:crypto";
import type { DatosLead } from "@/lib/validacion";
import { CONSENTIMIENTO_VERSION } from "@/lib/privacidad";
import {
  esEstado,
  esOrigen,
  esServicio,
  ESTADOS,
  SERVICIOS,
  ETIQUETA_SERVICIO,
  type EstadoLead,
  type OrigenLead,
} from "@/lib/etiquetas";
import { inicioDiaMadrid, inicioSemanaMadrid } from "@/lib/fechas";

export class LimiteConsultasError extends Error {
  constructor() {
    super("limite");
    this.name = "LimiteConsultasError";
  }
}

const VENTANA_MS = 10 * 60 * 1000;
const MAX_POR_VENTANA = 5;
export const TAMANO_PAGINA = 20;
const MAX_EXPORT = 10000;

export type Lead = {
  id: string;
  createdAt: string;
  updatedAt: string;
  origen: OrigenLead;
  servicio: string | null;
  nombre: string;
  email: string;
  telefono: string | null;
  mensaje: string | null;
  datos: Record<string, unknown>;
  consentimiento: boolean;
  consentimientoVersion: string | null;
  pagina: string | null;
  utm: Record<string, string> | null;
  estado: EstadoLead;
  notas: string | null;
  borradoEn: string | null;
  ipHash: string | null;
  userAgent: string | null;
};

export type EventoLead = {
  id: string;
  createdAt: string;
  actor: string | null;
  accion: string;
  detalle: Record<string, unknown> | null;
};

export type FiltrosLeads = {
  estado: EstadoLead | null;
  origen: OrigenLead | null;
  servicio: string | null;
  q: string | null;
  page: number;
  incluirBorrados: boolean;
};

export type Contadores = {
  hoy: number;
  semana: number;
  porEstado: Record<EstadoLead, number>;
};

function iso(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string" || typeof value === "number") {
    const fecha = new Date(value);
    if (!Number.isNaN(fecha.getTime())) return fecha.toISOString();
  }
  return value == null ? "" : String(value);
}

function isoONull(value: unknown): string | null {
  if (value == null) return null;
  return iso(value);
}

function objeto(value: unknown): Record<string, unknown> {
  if (!value) return {};
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      return {};
    }
    return {};
  }
  if (typeof value === "object" && !Array.isArray(value)) return value as Record<string, unknown>;
  return {};
}

function utmDe(value: unknown): Record<string, string> | null {
  if (value == null) return null;
  const obj = objeto(value);
  const limpio: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) limpio[k] = String(v);
  return Object.keys(limpio).length ? limpio : null;
}

function si(value: unknown): boolean {
  return value === true || value === "t" || value === "true" || value === 1;
}

export function mapLead(row: Fila): Lead {
  const estado = String(row.estado ?? "nuevo");
  return {
    id: String(row.id),
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
    origen: String(row.origen) as OrigenLead,
    servicio: row.servicio == null ? null : String(row.servicio),
    nombre: String(row.nombre ?? ""),
    email: String(row.email ?? ""),
    telefono: row.telefono == null ? null : String(row.telefono),
    mensaje: row.mensaje == null ? null : String(row.mensaje),
    datos: objeto(row.datos),
    consentimiento: si(row.consentimiento),
    consentimientoVersion: row.consentimiento_version == null ? null : String(row.consentimiento_version),
    pagina: row.pagina == null ? null : String(row.pagina),
    utm: utmDe(row.utm),
    estado: esEstado(estado) ? estado : "nuevo",
    notas: row.notas == null ? null : String(row.notas),
    borradoEn: isoONull(row.borrado_en),
    ipHash: row.ip_hash == null ? null : String(row.ip_hash),
    userAgent: row.user_agent == null ? null : String(row.user_agent),
  };
}

function mapEvento(row: Fila): EventoLead {
  const detalle = row.detalle == null ? null : objeto(row.detalle);
  return {
    id: String(row.id),
    createdAt: iso(row.created_at),
    actor: row.actor == null ? null : String(row.actor),
    accion: String(row.accion ?? ""),
    detalle: detalle && Object.keys(detalle).length ? detalle : row.detalle == null ? null : detalle,
  };
}

export async function insertarLead(
  db: BaseDatos,
  lead: DatosLead,
  meta: { ipHash: string; userAgent: string | null },
): Promise<{ id: string }> {
  const desde = new Date(Date.now() - VENTANA_MS).toISOString();
  return db.transaction(async (tx) => {
    const conteo = await tx.query<{ n: number | string }>(
      `select count(*) as n from nec.leads where ip_hash = $1 and created_at > $2`,
      [meta.ipHash, desde],
    );
    if (Number(conteo[0]?.n ?? 0) >= MAX_POR_VENTANA) throw new LimiteConsultasError();

    const id = randomUUID();
    await tx.query(
      `insert into nec.leads (
         id, created_at, updated_at, origen, servicio, nombre, email, telefono, mensaje,
         datos, consentimiento, consentimiento_version, pagina, utm, ip_hash, user_agent, estado
       ) values (
         $1, now(), now(), $2, $3, $4, $5, $6, $7,
         $8::jsonb, true, $9, $10, $11::jsonb, $12, $13, 'nuevo'
       )`,
      [
        id,
        lead.origen,
        lead.servicio,
        lead.nombre,
        lead.email,
        lead.telefono,
        lead.mensaje,
        JSON.stringify(lead.datos),
        CONSENTIMIENTO_VERSION,
        lead.pagina,
        lead.utm ? JSON.stringify(lead.utm) : null,
        meta.ipHash,
        meta.userAgent,
      ],
    );
    await tx.query(
      `insert into nec.lead_eventos (created_at, lead_id, actor, accion, detalle)
       values (now(), $1, 'web', 'creado', $2::jsonb)`,
      [id, JSON.stringify({ origen: lead.origen })],
    );
    return { id };
  });
}

export function filtrosDesdeUrl(url: URL): FiltrosLeads {
  const estado = url.searchParams.get("estado");
  const origen = url.searchParams.get("origen");
  const servicio = url.searchParams.get("servicio");
  const q = url.searchParams.get("q")?.trim().slice(0, 80) ?? "";
  const page = Number(url.searchParams.get("page") ?? "1");
  return {
    estado: esEstado(estado) ? estado : null,
    origen: esOrigen(origen) ? origen : null,
    servicio: esServicio(servicio) ? servicio : null,
    q: q || null,
    page: Number.isFinite(page) && page > 0 ? Math.min(Math.floor(page), 10000) : 1,
    incluirBorrados: url.searchParams.get("borrados") === "1",
  };
}

function whereDe(filtros: FiltrosLeads): { where: string; params: unknown[] } {
  const partes: string[] = [];
  const params: unknown[] = [];
  if (!filtros.incluirBorrados) partes.push("borrado_en is null");
  if (filtros.estado) {
    params.push(filtros.estado);
    partes.push(`estado = $${params.length}`);
  }
  if (filtros.origen) {
    params.push(filtros.origen);
    partes.push(`origen = $${params.length}`);
  }
  if (filtros.servicio) {
    params.push(filtros.servicio);
    partes.push(`servicio = $${params.length}`);
  }
  if (filtros.q) {
    params.push(filtros.q, filtros.q, filtros.q);
    const a = params.length - 2;
    const b = params.length - 1;
    const c = params.length;
    partes.push(
      `(strpos(lower(nombre), lower($${a})) > 0 or strpos(lower(email), lower($${b})) > 0 or strpos(lower(coalesce(telefono, '')), lower($${c})) > 0)`,
    );
  }
  return { where: partes.length ? `where ${partes.join(" and ")}` : "", params };
}

const COLUMNAS = `id, created_at, updated_at, origen, servicio, nombre, email, telefono, mensaje,
  datos, consentimiento, consentimiento_version, pagina, utm, estado, notas, borrado_en, ip_hash, user_agent`;

export async function listarLeads(
  db: BaseDatos,
  filtros: FiltrosLeads,
): Promise<{ leads: Lead[]; total: number }> {
  const { where, params } = whereDe(filtros);
  const totalFilas = await db.query<{ n: number | string }>(
    `select count(*) as n from nec.leads ${where}`,
    params,
  );
  const total = Number(totalFilas[0]?.n ?? 0);
  const offset = (filtros.page - 1) * TAMANO_PAGINA;
  const filas = await db.query(
    `select ${COLUMNAS} from nec.leads ${where} order by created_at desc limit $${params.length + 1} offset $${params.length + 2}`,
    [...params, TAMANO_PAGINA, offset],
  );
  return { leads: filas.map(mapLead), total };
}

export async function contadores(db: BaseDatos, ahora = new Date()): Promise<Contadores> {
  const hoy = inicioDiaMadrid(ahora).toISOString();
  const semana = inicioSemanaMadrid(ahora).toISOString();
  const [hoyFilas, semanaFilas] = await Promise.all([
    db.query<{ n: number | string }>(
      `select count(*) as n from nec.leads where borrado_en is null and created_at >= $1`,
      [hoy],
    ),
    db.query<{ n: number | string }>(
      `select count(*) as n from nec.leads where borrado_en is null and created_at >= $1`,
      [semana],
    ),
  ]);
  const porEstado = Object.fromEntries(ESTADOS.map((estado) => [estado, 0])) as Record<EstadoLead, number>;
  const grupos = await db.query<{ estado: string; n: number | string }>(
    `select estado, count(*) as n from nec.leads where borrado_en is null group by estado`,
  );
  for (const grupo of grupos) {
    if (esEstado(grupo.estado)) porEstado[grupo.estado] = Number(grupo.n);
  }
  return {
    hoy: Number(hoyFilas[0]?.n ?? 0),
    semana: Number(semanaFilas[0]?.n ?? 0),
    porEstado,
  };
}

// Cada combinaci?n se cuenta una sola vez, aunque el endpoint de contacto acepte
// tambi?n valores usados por formularios espec?ficos.
export const FUENTES = [
  ...SERVICIOS.map((servicio) => ({
    origen: "contacto" as const,
    servicio,
    nombre: servicio === "encargo" ? "Encargo personalizado" : servicio === "formularios-llc" ? "Formularios LLC" : servicio === "cierre-llc" ? "Cierre de LLC" : `Contacto ? ${ETIQUETA_SERVICIO[servicio]}`,
    url: servicio === "encargo" ? "/encargo-personalizado" : servicio === "formularios-llc" ? "/formularios-llc" : servicio === "cierre-llc" ? "/cierra-tu-llc" : `/contacto?servicio=${servicio}`,
  })),
  ...[...new Set(Object.values(SERVICIO_POR_CASO))].map((servicio) => ({
    origen: "empezar" as const,
    servicio,
    nombre: `Asistente ? ${ETIQUETA_SERVICIO[servicio]}`,
    url: "/empezar",
  })),
];

export async function contadoresFuentes(db: BaseDatos, ahora = new Date()) {
  const agrupar = (desde?: string) => db.query<{ origen: string; servicio: string; n: number | string }>(
    `select origen, servicio, count(*) as n from nec.leads where borrado_en is null${desde ? " and created_at >= $1" : ""} group by origen, servicio`,
    desde ? [desde] : [],
  );
  const [totales, hoy, semana] = await Promise.all([
    agrupar(), agrupar(inicioDiaMadrid(ahora).toISOString()), agrupar(inicioSemanaMadrid(ahora).toISOString()),
  ]);
  const cuenta = (filas: typeof totales, origen: string, servicio: string) =>
    Number(filas.find((fila) => fila.origen === origen && fila.servicio === servicio)?.n ?? 0);
  return FUENTES.map((fuente) => ({ ...fuente,
    total: cuenta(totales, fuente.origen, fuente.servicio),
    hoy: cuenta(hoy, fuente.origen, fuente.servicio),
    semana: cuenta(semana, fuente.origen, fuente.servicio),
  }));
}

export async function obtenerLead(db: BaseDatos, id: string): Promise<Lead | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const filas = await db.query(`select ${COLUMNAS} from nec.leads where id = $1`, [id]);
  return filas[0] ? mapLead(filas[0]) : null;
}

export async function eventosDe(db: BaseDatos, id: string): Promise<EventoLead[]> {
  const filas = await db.query(
    `select id, created_at, actor, accion, detalle
     from nec.lead_eventos
     where lead_id = $1
     order by created_at desc, id desc`,
    [id],
  );
  return filas.map(mapEvento);
}

export type CambioLead = {
  estado?: EstadoLead;
  notas?: string | null;
  borrar?: boolean;
  restaurar?: boolean;
};

export function parsearCambio(body: unknown): { error: string } | { cambio: CambioLead } {
  if (!body || typeof body !== "object" || Array.isArray(body)) return { error: "Formato no válido." };
  const raw = body as Record<string, unknown>;
  const cambio: CambioLead = {};
  if ("estado" in raw) {
    if (typeof raw.estado !== "string" || !esEstado(raw.estado)) return { error: "El estado no es válido." };
    cambio.estado = raw.estado;
  }
  if ("notas" in raw) {
    if (raw.notas == null || raw.notas === "") cambio.notas = null;
    else if (typeof raw.notas !== "string" || raw.notas.length > 8000) return { error: "Las notas son demasiado largas." };
    else cambio.notas = raw.notas;
  }
  if (raw.borrar === true) cambio.borrar = true;
  if (raw.restaurar === true) cambio.restaurar = true;
  if (cambio.borrar && cambio.restaurar) return { error: "Elige borrar o restaurar." };
  if (!("estado" in cambio) && !("notas" in cambio) && !cambio.borrar && !cambio.restaurar) {
    return { error: "No hay ningún cambio." };
  }
  return { cambio };
}

export async function actualizarLead(
  db: BaseDatos,
  id: string,
  cambio: CambioLead,
  actor: string,
): Promise<Lead | null> {
  return db.transaction(async (tx) => {
    const actuales = await tx.query(`select ${COLUMNAS} from nec.leads where id = $1`, [id]);
    if (!actuales[0]) return null;
    const antes = mapLead(actuales[0]);
    const estado = cambio.estado ?? antes.estado;
    const notas = "notas" in cambio ? (cambio.notas ?? null) : antes.notas;
    let borradoEn = antes.borradoEn;
    if (cambio.borrar && !antes.borradoEn) borradoEn = new Date().toISOString();
    if (cambio.restaurar) borradoEn = null;

    const filas = await tx.query(
      `update nec.leads
       set estado = $2, notas = $3, borrado_en = $4, updated_at = now()
       where id = $1
       returning ${COLUMNAS}`,
      [id, estado, notas, borradoEn],
    );
    const despues = mapLead(filas[0]);

    if (antes.estado !== despues.estado) {
      await tx.query(
        `insert into nec.lead_eventos (created_at, lead_id, actor, accion, detalle)
         values (now(), $1, $2, 'estado', $3::jsonb)`,
        [id, actor, JSON.stringify({ de: antes.estado, a: despues.estado })],
      );
    }
    if ((antes.notas ?? "") !== (despues.notas ?? "")) {
      await tx.query(
        `insert into nec.lead_eventos (created_at, lead_id, actor, accion, detalle)
         values (now(), $1, $2, 'notas', $3::jsonb)`,
        [
          id,
          actor,
          JSON.stringify({
            antes: (antes.notas ?? "").slice(0, 500),
            despues: (despues.notas ?? "").slice(0, 500),
          }),
        ],
      );
    }
    if (!antes.borradoEn && despues.borradoEn) {
      await tx.query(
        `insert into nec.lead_eventos (created_at, lead_id, actor, accion, detalle)
         values (now(), $1, $2, 'borrado', '{}'::jsonb)`,
        [id, actor],
      );
    }
    if (antes.borradoEn && !despues.borradoEn) {
      await tx.query(
        `insert into nec.lead_eventos (created_at, lead_id, actor, accion, detalle)
         values (now(), $1, $2, 'restaurado', '{}'::jsonb)`,
        [id, actor],
      );
    }
    return despues;
  });
}

export async function exportarLeads(db: BaseDatos, filtros: FiltrosLeads): Promise<Lead[]> {
  const { where, params } = whereDe({ ...filtros, page: 1 });
  const filas = await db.query(
    `select ${COLUMNAS} from nec.leads ${where} order by created_at desc limit $${params.length + 1}`,
    [...params, MAX_EXPORT],
  );
  return filas.map(mapLead);
}
