import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { formulariosLlc } from "@/lib/site";

export function FormulariosBanner() {
  return (
    <section aria-label={`Formularios LLC ${formulariosLlc.ejercicio}`} className="px-3 pt-3 sm:px-5">
      <Link
        href="/formularios-llc"
        className="group mx-auto flex max-w-7xl flex-col gap-4 rounded-[1.75rem] bg-tinta px-6 py-5 text-arena transition-colors hover:bg-tinta-2 sm:flex-row sm:items-center sm:justify-between sm:px-8"
      >
        <span className="flex items-start gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-chancla text-white">
            <FileText className="size-5" aria-hidden="true" />
          </span>
          <span>
            <span className="block font-mono text-[0.7rem] tracking-[0.18em] text-sol uppercase">
              Ejercicio {formulariosLlc.ejercicio}
            </span>
            <span className="mt-1 block font-display text-xl leading-tight font-bold md:text-2xl">
              Presenta los formularios de tu LLC del {formulariosLlc.ejercicio}
            </span>
          </span>
        </span>
        <span className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-chancla px-6 font-semibold text-white transition group-hover:bg-chancla-2">
          Rellenar el formulario
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </span>
      </Link>
    </section>
  );
}
