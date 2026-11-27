import { ENLACE_DEVOLUCIONES, ENLACE_TERMINOS } from "@/lib/privacidad";
import { cn } from "@/lib/utils";

/**
 * Texto de la casilla de aceptación de cada flujo de contratación (siempre antes de pagar).
 * Los enlaces se abren en otra pestaña para no perder lo rellenado.
 */
export function TextoAceptaTerminos({ oscuro = false }: { oscuro?: boolean }) {
  const clase = cn("font-medium underline underline-offset-2", oscuro ? "text-arena" : "text-tinta");
  return (
    <>
      Acepto los{" "}
      <a href={ENLACE_TERMINOS} target="_blank" rel="noopener" className={clase}>
        Términos y Condiciones
      </a>{" "}
      y la{" "}
      <a href={ENLACE_DEVOLUCIONES} target="_blank" rel="noopener" className={clase}>
        Política de devoluciones
      </a>
      , y contrato con fines empresariales o profesionales.
    </>
  );
}

/** Línea recordatoria bajo el botón de pago de Whop. */
export function RecordatorioTerminos({ oscuro = false, className }: { oscuro?: boolean; className?: string }) {
  const clase = cn("font-medium underline underline-offset-2", oscuro ? "text-arena" : "text-tinta");
  return (
    <p className={cn("max-w-xl text-sm", oscuro ? "text-arena/75" : "text-tinta/70", className)}>
      Al pagar aceptas los{" "}
      <a href={ENLACE_TERMINOS} target="_blank" rel="noopener" className={clase}>
        Términos y Condiciones
      </a>{" "}
      y la{" "}
      <a href={ENLACE_DEVOLUCIONES} target="_blank" rel="noopener" className={clase}>
        Política de devoluciones
      </a>
      .
    </p>
  );
}
