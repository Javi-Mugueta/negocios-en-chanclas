import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Mail, MessageCircle } from "lucide-react";
import { AccionesLead } from "@/components/panel/acciones-lead";
import { EstadoPill } from "@/components/panel/estado-pill";
import { PanelMarco } from "@/components/panel/marco";
import { ETIQUETA_ESTADO, ETIQUETA_ORIGEN, etiquetaServicio } from "@/lib/etiquetas";
import { formatFecha } from "@/lib/fechas";
import { eventosDe, obtenerLead, type EventoLead, type Lead } from "@/lib/leads";
import { getDb } from "@/lib/db";
import { sesionActual } from "@/lib/sesion-servidor";
import { enlaceEmail, enlaceWhatsapp } from "@/lib/telefono";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata = { title: "Consulta" };

const CAMPOS: Record<string, string> = {
  puntoEtiqueta: "Punto de partida",
  tipoEtiqueta: "Tipo de empresa",
  estado: "Estado",
  nombreLlc: "Nombre de la LLC",
  planEtiqueta: "Plan elegido",
};

/** Formularios LLC: orden y etiquetas de la ficha. */
const CAMPOS_FORMULARIOS: [string, string][] = [
  ["ejercicio", "Ejercicio"],
  ["pasaporte", "Número de pasaporte"],
  ["nacionalidad", "Nacionalidad"],
  ["direccion", "Dirección de residencia"],
  ["ciudad", "Ciudad"],
  ["paisResidencia", "País de residencia"],
  ["codigoPostal", "Código postal"],
  ["nombreLlc", "Nombre de la LLC"],
  ["ein", "EIN"],
  ["direccionLlc", "Dirección de la LLC en EE. UU."],
  ["fechaConstitucion", "Fecha de constitución"],
  ["actividad", "Actividad"],
  ["retiros", "Sacado de la LLC para el socio (USD)"],
  ["aportaciones", "Transferido por el socio a la LLC (USD)"],
  ["saldo", "Saldo a 31 de diciembre (USD)"],
];

const CHECKS_FORMULARIOS: [string, string][] = [
  ["unicoSocio", "Soy el único socio de la LLC"],
  ["resideFuera", "Resido fuera de EE. UU."],
  ["datosCorrectos", "Los datos son correctos y completos y soy el responsable de su veracidad"],
];

export default async function DetallePage({ params }: { params: Promise<{ id: string }> }) {
  const sesion = await sesionActual();
  if (!sesion) redirect("/panel/login");
  const { id } = await params;

  let lead: Lead | null = null;
  let eventos: EventoLead[] = [];
  try {
    const db = getDb();
    lead = await obtenerLead(db, id);
    if (lead) eventos = await eventosDe(db, id);
  } catch (error) {
    console.error("[panel] detalle", error instanceof Error ? error.name : "error");
    return (
      <PanelMarco csrf={sesion.csrf}>
        <p role="alert" className="rounded-2xl bg-destructive/10 p-4 text-sm text-destructive">
          No se ha podido abrir la consulta.
        </p>
      </PanelMarco>
    );
  }
  if (!lead) notFound();

  const whatsapp = enlaceWhatsapp(lead.telefono);
  const esFormularios = lead.servicio === "formularios-llc";
  const respuestas = Object.entries(lead.datos).filter(([clave, valor]) => {
    if (esFormularios) return false;
    if (!(clave in CAMPOS)) return false;
    if (clave === "nombreLlc" && (valor == null || valor === "") && lead.datos.sinNombre === true) return false;
    return true;
  });

  return (
    <PanelMarco csrf={sesion.csrf}>
      <Link href="/panel" className="inline-flex items-center gap-2 text-sm font-semibold text-tinta/70 hover:text-tinta">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Todas las consultas
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs tracking-[0.16em] text-chancla-2 uppercase">
            {ETIQUETA_ORIGEN[lead.origen]} · {etiquetaServicio(lead.servicio)}
          </p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{lead.nombre}</h1>
          <p className="mt-1 text-sm text-tinta/55">Recibida {formatFecha(lead.createdAt)}</p>
        </div>
        <EstadoPill estado={lead.estado} />
      </div>

      {lead.borradoEn && (
        <p className="mt-4 rounded-2xl bg-tinta/10 px-4 py-3 text-sm">
          Marcada como borrada el {formatFecha(lead.borradoEn)}. No sale en el listado general.
        </p>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-5">
          <section className="rounded-[1.5rem] border border-tinta/10 bg-card p-5">
            <h2 className="text-lg font-bold">Contacto</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <Fila k="Email" v={lead.email} />
              <Fila k="Teléfono" v={lead.telefono ?? "—"} />
              <Fila k="Página" v={lead.pagina ?? "—"} />
              <Fila k="Consentimiento" v={lead.consentimiento ? `Sí · versión ${lead.consentimientoVersion ?? "—"}` : "No"} />
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={enlaceEmail(lead.email)}
                className="inline-flex h-10 items-center gap-2 rounded-full bg-tinta px-4 text-sm font-semibold text-arena"
              >
                <Mail className="size-4" aria-hidden="true" />
                Escribir email
              </a>
              {whatsapp && (
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-[#25D366] px-4 text-sm font-semibold text-white"
                >
                  <MessageCircle className="size-4" aria-hidden="true" />
                  WhatsApp
                </a>
              )}
            </div>
          </section>

          {lead.mensaje && (
            <section className="rounded-[1.5rem] border border-tinta/10 bg-card p-5">
              <h2 className="text-lg font-bold">Mensaje</h2>
              <p className="mt-3 whitespace-pre-wrap text-tinta/80">{lead.mensaje}</p>
            </section>
          )}

          {esFormularios && (
            <section className="rounded-[1.5rem] border border-tinta/10 bg-card p-5">
              <h2 className="text-lg font-bold">Formularios LLC</h2>
              <dl className="mt-4 space-y-3 text-sm">
                {CAMPOS_FORMULARIOS.map(([clave, etiqueta]) => {
                  const valor = lead.datos[clave];
                  return <Fila key={clave} k={etiqueta} v={valor == null || valor === "" ? "—" : String(valor)} />;
                })}
                {CHECKS_FORMULARIOS.map(([clave, etiqueta]) => (
                  <Fila key={clave} k={etiqueta} v={lead.datos[clave] === true ? "Marcado" : "No"} />
                ))}
              </dl>
              <p className="mt-4 text-xs text-tinta/55">
                El pago (169$) se hace en Stripe, fuera de esta web. Para cruzarlo, busca en Stripe la
                referencia {lead.id}.
              </p>
            </section>
          )}

          {respuestas.length > 0 && (
            <section className="rounded-[1.5rem] border border-tinta/10 bg-card p-5">
              <h2 className="text-lg font-bold">Respuestas del asistente</h2>
              <dl className="mt-4 space-y-3 text-sm">
                {respuestas.map(([clave, valor]) => (
                  <Fila key={clave} k={CAMPOS[clave]} v={valor == null || valor === "" ? "—" : String(valor)} />
                ))}
                {lead.datos.sinNombre === true && <Fila k="Nombre de la LLC" v="Todavía no lo tiene" />}
              </dl>
            </section>
          )}

          {lead.utm && (
            <section className="rounded-[1.5rem] border border-tinta/10 bg-card p-5">
              <h2 className="text-lg font-bold">Campaña</h2>
              <dl className="mt-4 space-y-3 text-sm">
                {Object.entries(lead.utm).map(([clave, valor]) => (
                  <Fila key={clave} k={clave} v={valor} />
                ))}
              </dl>
            </section>
          )}

          <section className="rounded-[1.5rem] border border-tinta/10 bg-card p-5">
            <h2 className="text-lg font-bold">Historial</h2>
            {eventos.length === 0 ? (
              <p className="mt-3 text-sm text-tinta/60">Todavía no hay movimientos.</p>
            ) : (
              <ol className="mt-4 space-y-4">
                {eventos.map((evento) => (
                  <li key={evento.id} className="border-l-2 border-chancla/40 pl-4">
                    <p className="text-sm font-semibold">{textoEvento(evento)}</p>
                    <p className="text-xs text-tinta/50">
                      {formatFecha(evento.createdAt)}
                      {evento.actor ? ` · ${evento.actor}` : ""}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section className="rounded-[1.5rem] border border-dashed border-tinta/15 p-5 text-sm text-tinta/60">
            <h2 className="font-semibold text-tinta">Datos técnicos</h2>
            <p className="mt-2">Identificador de IP (no es la dirección): {lead.ipHash ?? "—"}</p>
            <p className="mt-1 break-all">Navegador: {lead.userAgent ?? "—"}</p>
            <p className="mt-1">Actualizada: {formatFecha(lead.updatedAt)}</p>
          </section>
        </div>

        <aside className="h-fit rounded-[1.5rem] border border-tinta/10 bg-card p-5 lg:sticky lg:top-24">
          <h2 className="text-lg font-bold">Seguimiento</h2>
          <div className="mt-4">
            <AccionesLead lead={lead} csrf={sesion.csrf} />
          </div>
        </aside>
      </div>
    </PanelMarco>
  );
}

function Fila({ k, v }: { k: string; v: string }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[10rem_minmax(0,1fr)]">
      <dt className="text-tinta/50">{k}</dt>
      <dd className="break-words">{v}</dd>
    </div>
  );
}

function textoEvento(evento: EventoLead): string {
  if (evento.accion === "creado") return "Consulta recibida";
  if (evento.accion === "borrado") return "Marcada como borrada";
  if (evento.accion === "restaurado") return "Restaurada";
  if (evento.accion === "notas") return "Notas actualizadas";
  if (evento.accion === "estado") {
    const de = typeof evento.detalle?.de === "string" ? evento.detalle.de : "";
    const a = typeof evento.detalle?.a === "string" ? evento.detalle.a : "";
    const desde = de in ETIQUETA_ESTADO ? ETIQUETA_ESTADO[de as keyof typeof ETIQUETA_ESTADO] : de;
    const hasta = a in ETIQUETA_ESTADO ? ETIQUETA_ESTADO[a as keyof typeof ETIQUETA_ESTADO] : a;
    return `Estado: ${desde || "—"} → ${hasta || "—"}`;
  }
  return evento.accion;
}
