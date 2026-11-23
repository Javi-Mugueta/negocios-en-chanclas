import type { FiltrosLeads } from "@/lib/leads";
import { ESTADOS, ETIQUETA_ESTADO, ETIQUETA_ORIGEN, ETIQUETA_SERVICIO, ORIGENES, SERVICIOS } from "@/lib/etiquetas";

const campo =
  "h-11 w-full rounded-2xl border border-tinta/15 bg-white px-3 text-sm outline-none focus-visible:border-chancla focus-visible:ring-3 focus-visible:ring-chancla/20";

export function queryDeFiltros(filtros: FiltrosLeads, page = filtros.page): string {
  const params = new URLSearchParams();
  if (filtros.q) params.set("q", filtros.q);
  if (filtros.estado) params.set("estado", filtros.estado);
  if (filtros.origen) params.set("origen", filtros.origen);
  if (filtros.servicio) params.set("servicio", filtros.servicio);
  if (filtros.incluirBorrados) params.set("borrados", "1");
  if (page > 1) params.set("page", String(page));
  const texto = params.toString();
  return texto ? `?${texto}` : "";
}

export function Filtros({ filtros }: { filtros: FiltrosLeads }) {
  return (
    <form method="get" className="grid gap-3 rounded-[1.5rem] border border-tinta/10 bg-card p-4 sm:grid-cols-2 lg:grid-cols-6">
      <label className="space-y-1 text-xs font-semibold text-tinta/70 sm:col-span-2">
        Buscar
        <input
          name="q"
          defaultValue={filtros.q ?? ""}
          placeholder="Nombre, email o teléfono"
          className={campo}
        />
      </label>
      <label className="space-y-1 text-xs font-semibold text-tinta/70">
        Estado
        <select name="estado" defaultValue={filtros.estado ?? ""} className={campo}>
          <option value="">Todos</option>
          {ESTADOS.map((estado) => (
            <option key={estado} value={estado}>
              {ETIQUETA_ESTADO[estado]}
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-1 text-xs font-semibold text-tinta/70">
        Origen
        <select name="origen" defaultValue={filtros.origen ?? ""} className={campo}>
          <option value="">Todos</option>
          {ORIGENES.map((origen) => (
            <option key={origen} value={origen}>
              {ETIQUETA_ORIGEN[origen]}
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-1 text-xs font-semibold text-tinta/70">
        Servicio
        <select name="servicio" defaultValue={filtros.servicio ?? ""} className={campo}>
          <option value="">Todos</option>
          {SERVICIOS.map((servicio) => (
            <option key={servicio} value={servicio}>
              {ETIQUETA_SERVICIO[servicio]}
            </option>
          ))}
        </select>
      </label>
      <div className="flex flex-col justify-end gap-3 sm:col-span-2 sm:flex-row sm:items-center lg:col-span-6">
        <label className="flex items-center gap-2 text-sm text-tinta/80">
          <input
            type="checkbox"
            name="borrados"
            value="1"
            defaultChecked={filtros.incluirBorrados}
            className="size-4 accent-[var(--chancla)]"
          />
          Incluir borradas
        </label>
        <button
          type="submit"
          className="h-11 rounded-full bg-tinta px-5 text-sm font-semibold text-arena focus-visible:ring-4 focus-visible:ring-chancla/30 focus-visible:outline-none sm:ml-auto"
        >
          Filtrar
        </button>
      </div>
    </form>
  );
}
