import Link from "next/link";
import { redirect } from "next/navigation";
import { Download } from "lucide-react";
import { EstadoPill } from "@/components/panel/estado-pill";
import { Filtros, queryDeFiltros } from "@/components/panel/filtros";
import { PanelMarco } from "@/components/panel/marco";
import { ETIQUETA_ESTADO, ETIQUETA_ORIGEN, ESTADOS, etiquetaServicio } from "@/lib/etiquetas";
import { formatFecha } from "@/lib/fechas";
import { contadores, contadoresFuentes, filtrosDesdeUrl, listarLeads, TAMANO_PAGINA, tieneAltaCompleta, type Contadores, type FiltrosLeads, type Lead } from "@/lib/leads";
import { getDb } from "@/lib/db";
import { sesionActual } from "@/lib/sesion-servidor";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata = { title: "Consultas" };

function urlDe(sp: Record<string, string | string[] | undefined>) {
  const params = new URLSearchParams();
  for (const [clave, valor] of Object.entries(sp)) {
    if (typeof valor === "string") params.set(clave, valor);
  }
  return new URL(`https://negociosenchanclas.com/panel?${params}`);
}

export default async function PanelPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sesion = await sesionActual();
  if (!sesion) redirect("/panel/login");
  const filtros = filtrosDesdeUrl(urlDe(await searchParams));

  let leads: Lead[] = [];
  let total = 0;
  let cifras: Contadores | null = null;
  let fuentes: Awaited<ReturnType<typeof contadoresFuentes>> = [];
  let fallo = false;
  try {
    const db = getDb();
    const [lista, conteo, fuentesDb] = await Promise.all([listarLeads(db, filtros), contadores(db), contadoresFuentes(db)]);
    fuentes = fuentesDb;
    leads = lista.leads;
    total = lista.total;
    cifras = conteo;
  } catch (error) {
    console.error("[panel] listado", error instanceof Error ? error.name : "error");
    fallo = true;
  }

  const desde = total === 0 ? 0 : (filtros.page - 1) * TAMANO_PAGINA + 1;
  const hasta = Math.min(filtros.page * TAMANO_PAGINA, total);
  const paginas = Math.max(1, Math.ceil(total / TAMANO_PAGINA));

  return (
    <PanelMarco csrf={sesion.csrf}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold sm:text-4xl">Consultas</h1>
          <p className="mt-1 text-sm text-tinta/60">Las más recientes primero. Hoy y esta semana, en hora de Madrid.</p>
        </div>
        <a
          href={`/api/panel/leads/export${queryDeFiltros({ ...filtros, page: 1 })}`}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold ring-1 ring-tinta/15 focus-visible:ring-4 focus-visible:ring-chancla/30 focus-visible:outline-none"
        >
          <Download className="size-4" aria-hidden="true" />
          Exportar CSV
        </a>
      </div>

      {cifras && (
        <>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Tarjeta cifra={cifras.hoy} etiqueta="Nuevas hoy" />
            <Tarjeta cifra={cifras.semana} etiqueta="Nuevas esta semana" />
            <Tarjeta cifra={cifras.porEstado.nuevo} etiqueta="Sin atender" />
          </div>
          <ul className="mt-3 flex flex-wrap gap-2">
            {ESTADOS.map((estado) => (
              <li key={estado} className="rounded-full bg-white px-3 py-1 text-sm ring-1 ring-tinta/10">
                {ETIQUETA_ESTADO[estado]} <span className="font-semibold">{cifras.porEstado[estado]}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      {!fallo && (
        <section className="mt-8" aria-labelledby="fuentes-titulo">
          <h2 id="fuentes-titulo" className="text-xl font-bold">Fuentes de datos</h2>
          <p className="mt-1 text-sm text-tinta/60">Consultas activas por origen y servicio. Hoy y esta semana, en hora de Madrid.</p>
          <div className="mt-3 overflow-x-auto rounded-[1.5rem] border border-tinta/10 bg-card">
            <table className="w-full min-w-[42rem] text-left text-sm">
              <thead><tr className="text-tinta/60"><th className="p-3">Fuente</th><th className="p-3">URL pública</th><th className="p-3">Total</th><th className="p-3">Con datos de alta</th><th className="p-3">Hoy</th><th className="p-3">Esta semana</th><th className="p-3"><span className="sr-only">Consultas</span></th></tr></thead>
              <tbody>{fuentes.map((fuente) => (
                <tr key={`${fuente.origen}-${fuente.servicio}`} className="border-t border-tinta/10">
                  <th scope="row" className="p-3 font-semibold">{fuente.nombre}</th>
                  <td className="p-3"><a className="underline" href={fuente.url}>{fuente.url}</a></td>
                  <td className="p-3">{fuente.total}</td><td className="p-3">{fuente.conAlta ?? "—"}</td><td className="p-3">{fuente.hoy}</td><td className="p-3">{fuente.semana}</td>
                  <td className="p-3"><Link className="font-semibold underline" href={`/panel?origen=${fuente.origen}&servicio=${fuente.servicio}#consultas`}>Ver consultas<span className="sr-only"> de {fuente.nombre}</span></Link></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </section>
      )}

      <div id="consultas" className="mt-6">
        <Filtros filtros={filtros} />
      </div>

      {fallo ? (
        <p role="alert" className="mt-6 rounded-2xl bg-destructive/10 p-4 text-sm text-destructive">
          No se han podido cargar las consultas. Revisa la conexión con la base de datos.
        </p>
      ) : leads.length === 0 ? (
        <p className="mt-8 rounded-[1.5rem] border border-dashed border-tinta/20 p-8 text-center text-tinta/70">
          No hay consultas con estos filtros.
        </p>
      ) : (
        <>
          <p className="mt-4 text-sm text-tinta/55">
            {desde}–{hasta} de {total}
          </p>
          <ListaMovil leads={leads} />
          <ListaTabla leads={leads} />
          <Paginacion filtros={filtros} page={filtros.page} paginas={paginas} />
        </>
      )}
    </PanelMarco>
  );
}

function BadgeAlta() {
  return (
    <span className="mt-1 block w-fit rounded-full bg-chancla/10 px-2 py-0.5 text-xs font-semibold text-chancla-2">
      Datos de alta completos
    </span>
  );
}

function Tarjeta({ cifra, etiqueta }: { cifra: number; etiqueta: string }) {
  return (
    <div className="rounded-[1.5rem] border border-tinta/10 bg-card p-4">
      <p className="font-display text-3xl font-extrabold">{cifra}</p>
      <p className="mt-1 text-sm text-tinta/60">{etiqueta}</p>
    </div>
  );
}

function ListaMovil({ leads }: { leads: Lead[] }) {
  return (
    <ul className="mt-4 space-y-3 md:hidden">
      {leads.map((lead) => (
        <li key={lead.id}>
          <Link
            href={`/panel/leads/${lead.id}`}
            className="block rounded-[1.5rem] border border-tinta/10 bg-card p-4 focus-visible:ring-4 focus-visible:ring-chancla/30 focus-visible:outline-none"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="font-semibold">{lead.nombre}</p>
              <EstadoPill estado={lead.estado} />
            </div>
            <p className="mt-1 truncate text-sm text-tinta/70">{lead.email}</p>
            <p className="mt-2 text-sm text-tinta/60">
              {ETIQUETA_ORIGEN[lead.origen]} · {etiquetaServicio(lead.servicio)}
            </p>
            {tieneAltaCompleta(lead) && <BadgeAlta />}
            <p className="mt-1 text-xs text-tinta/45">{formatFecha(lead.createdAt)}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function ListaTabla({ leads }: { leads: Lead[] }) {
  return (
    <div className="mt-4 hidden overflow-x-auto rounded-[1.5rem] border border-tinta/10 bg-card md:block">
      <table className="w-full min-w-[44rem] text-left text-sm">
        <caption className="sr-only">Consultas recibidas</caption>
        <thead className="text-xs tracking-wide text-tinta/50 uppercase">
          <tr>
            <th className="px-4 py-3 font-semibold">Persona</th>
            <th className="px-4 py-3 font-semibold">Origen</th>
            <th className="px-4 py-3 font-semibold">Servicio</th>
            <th className="px-4 py-3 font-semibold">Estado</th>
            <th className="px-4 py-3 font-semibold">Recibida</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id} className="border-t border-tinta/10">
              <td className="px-4 py-3">
                <Link href={`/panel/leads/${lead.id}`} className="font-semibold hover:text-chancla-2">
                  {lead.nombre}
                </Link>
                <p className="text-tinta/60">{lead.email}</p>
                {lead.telefono && <p className="text-tinta/50">{lead.telefono}</p>}
              </td>
              <td className="px-4 py-3">{ETIQUETA_ORIGEN[lead.origen]}</td>
              <td className="px-4 py-3">
                {etiquetaServicio(lead.servicio)}
                {tieneAltaCompleta(lead) && <BadgeAlta />}
              </td>
              <td className="px-4 py-3">
                <EstadoPill estado={lead.estado} />
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-tinta/60">{formatFecha(lead.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Paginacion({ filtros, page, paginas }: { filtros: FiltrosLeads; page: number; paginas: number }) {
  if (paginas <= 1) return null;
  return (
    <nav aria-label="Páginas" className="mt-4 flex items-center justify-between text-sm">
      {page > 1 ? (
        <Link href={`/panel${queryDeFiltros(filtros, page - 1)}`} className="font-semibold underline">
          Anterior
        </Link>
      ) : (
        <span />
      )}
      <span className="text-tinta/55">
        Página {page} de {paginas}
      </span>
      {page < paginas ? (
        <Link href={`/panel${queryDeFiltros(filtros, page + 1)}`} className="font-semibold underline">
          Siguiente
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
