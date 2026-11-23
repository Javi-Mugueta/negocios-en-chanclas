import { cn } from "@/lib/utils";
import { ETIQUETA_ESTADO, type EstadoLead } from "@/lib/etiquetas";

const tono: Record<EstadoLead, string> = {
  nuevo: "bg-[#fde6d3] text-chancla-2",
  contactado: "bg-agua text-tinta",
  en_curso: "bg-sol/50 text-tinta",
  ganado: "bg-emerald-100 text-emerald-950",
  perdido: "bg-tinta/10 text-tinta/70",
  spam: "bg-destructive/10 text-destructive",
};

export function EstadoPill({ estado }: { estado: EstadoLead }) {
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold", tono[estado])}>
      {ETIQUETA_ESTADO[estado]}
    </span>
  );
}
