/**
 * Aviso interno por email cada vez que entra un lead (vía Resend).
 *
 * Solo servidor. Si faltan RESEND_API_KEY, NEC_AVISO_FROM o NEC_AVISO_TO no hace nada.
 * Nunca lanza: un fallo de envío se registra y el lead ya está guardado.
 */
import { ETIQUETA_ORIGEN, etiquetaServicio } from "@/lib/etiquetas";
import { SITIO_URL } from "@/lib/privacidad";
import type { DatosLead } from "@/lib/validacion";

const ZONA = "Europe/Madrid";
const RESEND_URL = "https://api.resend.com/emails";
const TIMEOUT_MS = 8000;

export const AVISO_PAGO =
  "El cliente ha llegado a los planes; el pago se confirma en Stripe (client_reference_id = id de este lead).";

/** Plan del asistente en el asunto (precio del primer año). */
const PLAN_ASUNTO: Record<string, string> = {
  basico: "Básico 397 $",
  estandar: "Estándar 497 $",
};

/** Etiquetas legibles de las claves de `datos` (y de `datos.alta`). Lo no listado sale con su clave. */
const ETIQUETAS: Record<string, string> = {
  punto: "Punto de partida (código)",
  puntoEtiqueta: "Punto de partida",
  tipo: "Tipo de empresa (código)",
  tipoEtiqueta: "Tipo de empresa",
  estado: "Estado",
  nombreLlc: "Nombre de la LLC",
  sinNombre: "Sin nombre todavía",
  requisitos: "Requisitos (código)",
  requisitosEtiqueta: "Requisitos de Formularios LLC",
  caso: "Caso (código)",
  casoEtiqueta: "Resultado del asistente",
  plan: "Plan (código)",
  planEtiqueta: "Plan elegido",
  altaCompleta: "Datos de alta completos",
  opcionesNombre: "Opciones de nombre de la LLC",
  direccion: "Dirección",
  actividad: "Actividad",
  paisResidencia: "País de residencia",
  facturacion: "Facturación (código)",
  facturacionEtiqueta: "Facturación anual esperada",
  aceptaTerminos: "Términos aceptados",
  terminosVersion: "Versión de los términos",
  pasaporte: "Pasaporte",
  ejercicio: "Ejercicio",
  nacionalidad: "Nacionalidad",
  ciudad: "Ciudad",
  codigoPostal: "Código postal",
  estadoConstitucion: "Estado de constitución",
  ein: "EIN",
  direccionLlc: "Dirección de la LLC en EE. UU.",
  fechaConstitucion: "Fecha de constitución",
  retiros: "Sacado de la LLC para el socio (USD)",
  aportaciones: "Transferido por el socio a la LLC (USD)",
  saldo: "Saldo a 31 de diciembre (USD)",
  unicoSocio: "Único socio",
  resideFuera: "Reside fuera de EE. UU.",
  datosCorrectos: "Confirma que los datos son correctos",
  socios: "Número de socios",
  formulariosPrevios: "1120/5472 de años anteriores presentados",
  agenteAlDia: "Registered agent e informe anual al día",
  cuentas: "Cuentas abiertas",
  cuando: "Cuándo quiere cerrarla",
  aceptaPrecio: "Acepta el precio",
};

export type FilaAviso = [etiqueta: string, valor: string];

export type Aviso = { asunto: string; html: string; texto: string };

export type ConfigAviso = { apiKey: string; from: string; to: string[] };

export function escaparHtml(valor: string): string {
  return valor
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Sin saltos de línea ni espacios de más: el asunto es una cabecera. */
function enLinea(valor: string): string {
  return valor.replace(/\s+/g, " ").trim();
}

function valorLegible(valor: unknown): string {
  if (valor == null || valor === "") return "—";
  if (valor === true) return "Sí";
  if (valor === false) return "No";
  if (Array.isArray(valor)) return valor.map(valorLegible).join(", ") || "—";
  if (typeof valor === "object") return JSON.stringify(valor);
  return String(valor);
}

function etiqueta(clave: string): string {
  return ETIQUETAS[clave] ?? clave;
}

export function fechaMadrid(fecha: Date): string {
  return new Intl.DateTimeFormat("es-ES", {
    timeZone: ZONA,
    dateStyle: "full",
    timeStyle: "short",
  }).format(fecha);
}

function casoDe(lead: DatosLead): string | null {
  const c = lead.datos.casoEtiqueta;
  return typeof c === "string" && c ? c : null;
}

function planDe(lead: DatosLead): string | null {
  const p = lead.datos.plan;
  return typeof p === "string" && p in PLAN_ASUNTO ? p : null;
}

/** El lead viene del asistente y su caso es un plan (llega a las tarjetas con el pago). */
function llegaAPlanes(lead: DatosLead): boolean {
  return lead.origen === "empezar" && lead.datos.caso === "plan";
}

export function asuntoAviso(lead: DatosLead): string {
  const partes = ["Nuevo lead NEC", etiquetaServicio(lead.servicio)];
  const caso = casoDe(lead);
  if (caso) partes.push(caso);
  if (llegaAPlanes(lead)) {
    const plan = planDe(lead);
    partes.push(plan ? `Plan ${PLAN_ASUNTO[plan]}` : "Plan sin elegir (Básico 397 $ / Estándar 497 $)");
  }
  partes.push(lead.nombre || "Sin nombre");
  return enLinea(partes.join(" · "));
}

/** Todos los datos del lead, en orden: cabecera fija y luego `datos` (con `alta` desplegado). */
export function filasAviso(lead: DatosLead, id: string | null, fecha: Date): FilaAviso[] {
  const filas: FilaAviso[] = [
    ["Fecha (Madrid)", fechaMadrid(fecha)],
    ["Fuente", ETIQUETA_ORIGEN[lead.origen] ?? lead.origen],
    ["Servicio", etiquetaServicio(lead.servicio)],
  ];
  const caso = casoDe(lead);
  if (caso) filas.push(["Caso", caso]);
  if (llegaAPlanes(lead)) {
    const plan = planDe(lead);
    filas.push(["Plan elegido", plan ? String(lead.datos.planEtiqueta ?? PLAN_ASUNTO[plan]) : "Sin elegir todavía"]);
  }
  filas.push(
    ["Nombre / titular", valorLegible(lead.nombre)],
    ["Email", valorLegible(lead.email)],
    ["Teléfono", valorLegible(lead.telefono)],
  );
  if (lead.mensaje) filas.push(["Mensaje", lead.mensaje]);

  for (const [clave, valor] of Object.entries(lead.datos)) {
    if (clave === "alta" && valor && typeof valor === "object" && !Array.isArray(valor)) {
      for (const [k, v] of Object.entries(valor as Record<string, unknown>)) {
        filas.push([`Alta · ${etiqueta(k)}`, valorLegible(v)]);
      }
      continue;
    }
    filas.push([etiqueta(clave), valorLegible(valor)]);
  }

  filas.push(["Página", valorLegible(lead.pagina)]);
  if (lead.utm) {
    for (const [k, v] of Object.entries(lead.utm)) filas.push([k, v]);
  }
  if (id) filas.push(["ID del lead", id]);
  return filas;
}

export function enlacesAviso(id: string | null): { panel: string; ficha: string | null } {
  return {
    panel: `${SITIO_URL}/panel`,
    ficha: id ? `${SITIO_URL}/panel/leads/${encodeURIComponent(id)}` : null,
  };
}

export function componerAviso(lead: DatosLead, id: string | null, fecha = new Date()): Aviso {
  const asunto = asuntoAviso(lead);
  const filas = filasAviso(lead, id, fecha);
  const enlaces = enlacesAviso(id);
  const avisoPago = llegaAPlanes(lead) ? AVISO_PAGO : null;

  const filasHtml = filas
    .map(
      ([k, v]) =>
        `<tr><th align="left" valign="top" style="padding:6px 12px 6px 0;border-bottom:1px solid #eee;color:#555;font-weight:600;white-space:nowrap">${escaparHtml(k)}</th>` +
        `<td valign="top" style="padding:6px 0;border-bottom:1px solid #eee;white-space:pre-wrap">${escaparHtml(v)}</td></tr>`,
    )
    .join("");

  const html = [
    `<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;font-size:14px;color:#222;max-width:720px">`,
    `<h2 style="margin:0 0 12px">${escaparHtml(asunto)}</h2>`,
    avisoPago
      ? `<p style="margin:0 0 16px;padding:10px 12px;background:#fff4d6;border-radius:8px"><strong>Pago no confirmado.</strong> ${escaparHtml(avisoPago)}</p>`
      : "",
    `<table cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%">${filasHtml}</table>`,
    `<p style="margin:16px 0 0">`,
    enlaces.ficha ? `<a href="${escaparHtml(enlaces.ficha)}">Abrir la ficha del lead</a> · ` : "",
    `<a href="${escaparHtml(enlaces.panel)}">Ir al panel</a></p>`,
    `</div>`,
  ].join("");

  const texto = [
    asunto,
    "",
    ...(avisoPago ? [`PAGO NO CONFIRMADO. ${avisoPago}`, ""] : []),
    ...filas.map(([k, v]) => `${k}: ${v}`),
    "",
    ...(enlaces.ficha ? [`Ficha del lead: ${enlaces.ficha}`] : []),
    `Panel: ${enlaces.panel}`,
  ].join("\n");

  return { asunto, html, texto };
}

export function configAviso(env: NodeJS.ProcessEnv = process.env): ConfigAviso | null {
  const apiKey = env.RESEND_API_KEY?.trim();
  const from = env.NEC_AVISO_FROM?.trim();
  const to = (env.NEC_AVISO_TO ?? "")
    .split(",")
    .map((d) => d.trim())
    .filter(Boolean);
  if (!apiKey || !from || !to.length) return null;
  return { apiKey, from, to };
}

/**
 * Envía el aviso interno de un lead ya guardado. No lanza nunca.
 * Devuelve si se ha enviado (false si no hay configuración o si ha fallado).
 */
export async function avisarLead(
  lead: DatosLead,
  id: string | null,
  opciones: { env?: NodeJS.ProcessEnv; fetch?: typeof fetch; fecha?: Date } = {},
): Promise<boolean> {
  try {
    const config = configAviso(opciones.env);
    if (!config) return false;
    const aviso = componerAviso(lead, id, opciones.fecha);
    const res = await (opciones.fetch ?? fetch)(RESEND_URL, {
      method: "POST",
      headers: {
        authorization: `Bearer ${config.apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: config.from,
        to: config.to,
        subject: aviso.asunto,
        html: aviso.html,
        text: aviso.texto,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      // Solo el código: el cuerpo de la respuesta podría repetir datos del lead.
      console.error("[aviso] Resend respondió", res.status);
      return false;
    }
    return true;
  } catch (error) {
    console.error("[aviso] no se pudo enviar", error instanceof Error ? error.name : "error");
    return false;
  }
}
