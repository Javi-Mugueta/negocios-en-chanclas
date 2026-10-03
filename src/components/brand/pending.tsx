import { cn } from "@/lib/utils";

/**
 * Marca visible para datos que aún no están publicados por Negocios en Chanclas
 * (precios, horarios, alcance de servicios…). Buscar «PENDIENTE» en el código
 * para encontrarlos todos.
 */
export function Pending({
  children = "Pendiente de confirmar",
  className,
  size = "sm",
}: {
  children?: React.ReactNode;
  className?: string;
  size?: "sm" | "lg";
}) {
  return (
    <span
      data-placeholder="true"
      title="Dato pendiente: Negocios en Chanclas todavía no lo ha publicado"
      className={cn(
        "placeholder-stripes inline-flex w-fit items-center gap-1.5 rounded-md border border-dashed border-[#d9a520] bg-[#fff4d6] font-mono whitespace-nowrap font-medium text-[#7a5600]",
        size === "sm" ? "px-2 py-0.5 text-[0.7rem]" : "px-3 py-1.5 text-sm",
        className,
      )}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full bg-[#d9a520]" />
      {children}
    </span>
  );
}
