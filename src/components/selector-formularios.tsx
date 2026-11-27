"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export type OpcionSocios = "uno" | "varios";

/**
 * Selector del principio de /formularios-llc: «Mi LLC tiene un socio» (1120/5472) o
 * «Tiene varios socios» (Form 1065 + K-1). Cada opción tiene su propio formulario.
 */
export function SelectorFormularios({
  inicial,
  tituloUno,
  detalleUno,
  tituloVarios,
  detalleVarios,
  uno,
  varios,
}: {
  inicial: OpcionSocios;
  tituloUno: string;
  detalleUno: string;
  tituloVarios: string;
  detalleVarios: string;
  uno: React.ReactNode;
  varios: React.ReactNode;
}) {
  const [opcion, setOpcion] = useState<OpcionSocios>(inicial);

  function elegir(o: OpcionSocios) {
    setOpcion(o);
    const url = new URL(window.location.href);
    if (o === "varios") url.searchParams.set("socios", "varios");
    else url.searchParams.delete("socios");
    window.history.replaceState(null, "", url);
  }

  const tarjeta = (o: OpcionSocios, titulo: string, detalle: string) => (
    <button
      type="button"
      role="radio"
      aria-checked={opcion === o}
      onClick={() => elegir(o)}
      className={cn(
        "rounded-[1.5rem] border-2 bg-white p-5 text-left transition hover:shadow-md focus-visible:ring-4 focus-visible:ring-chancla/30 focus-visible:outline-none",
        opcion === o ? "border-chancla" : "border-tinta/10 bg-white/60 hover:border-tinta/25",
      )}
    >
      <span className="block font-display text-lg font-bold">{titulo}</span>
      <span className="mt-1 block text-sm text-tinta/70">{detalle}</span>
    </button>
  );

  return (
    <>
      <div role="radiogroup" aria-label="¿Cuántos socios tiene tu LLC?" className="mt-8 grid gap-4 sm:grid-cols-2">
        {tarjeta("uno", tituloUno, detalleUno)}
        {tarjeta("varios", tituloVarios, detalleVarios)}
      </div>
      <div id="formulario" className="scroll-mt-28">
        {opcion === "uno" ? uno : varios}
      </div>
    </>
  );
}
