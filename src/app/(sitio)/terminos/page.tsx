import type { Metadata } from "next";
import Link from "next/link";
import { Eyebrow } from "@/components/brand/cta";
import { PoliticaDevoluciones, TerminosYCondiciones } from "@/components/legal/terminos";
import { ENLACE_PRIVACIDAD, TERMINOS_VERSION } from "@/lib/privacidad";

export const metadata: Metadata = {
  title: "Términos y Condiciones y Política de devoluciones",
  description:
    "Condiciones con las que Leaving Vorkuta LLC presta los servicios de Negocios en Chanclas y cuándo hay devolución.",
  alternates: { canonical: "/terminos" },
};

/** Mismo texto validado que /legal#terminos y /legal#devoluciones, en una página propia. */
export default function TerminosPage() {
  return (
    <section className="mx-auto max-w-3xl px-5 pt-14 pb-24 sm:px-8 md:pt-20">
      <Eyebrow>Avisos legales</Eyebrow>
      <h1 className="mt-5 text-5xl leading-[0.95] font-extrabold md:text-6xl">Términos y Condiciones.</h1>
      <p className="mt-6 text-lg text-tinta/70">
        Las condiciones con las que contratas nuestros servicios y nuestra{" "}
        <a href="#devoluciones" className="font-semibold text-tinta underline underline-offset-4">
          Política de devoluciones
        </a>
        . Versión {TERMINOS_VERSION}. La{" "}
        <Link href={ENLACE_PRIVACIDAD} className="font-semibold text-tinta underline underline-offset-4">
          Política de privacidad
        </Link>{" "}
        está en Avisos legales.
      </p>

      <div className="mt-12 space-y-14 text-lg leading-relaxed text-tinta/75">
        <TerminosYCondiciones />
        <PoliticaDevoluciones />
      </div>
    </section>
  );
}
