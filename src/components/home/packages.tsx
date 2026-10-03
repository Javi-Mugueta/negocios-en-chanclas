import Link from "next/link";
import { Eyebrow } from "@/components/brand/cta";
import { PackageCards } from "@/components/package-cards";

export function Packages() {
  return (
    <section id="paquetes" className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow className="justify-center">Servicios</Eyebrow>
          <h2 className="mt-4 text-4xl leading-[1.02] font-bold md:text-6xl">
            Del primer paso <span className="font-serif font-normal italic">al último.</span>
          </h2>
          <p className="mt-5 text-lg text-tinta/70">
            Tres momentos en la vida de tu LLC. Elige el que te toca ahora; los demás te esperan sin
            prisa.
          </p>
        </div>

        <div className="mt-16">
          <PackageCards />
        </div>

        <p className="mt-12 text-center text-tinta/75">
          ¿No sabes cuál te toca?{" "}
          <Link
            href="/empezar"
            className="font-semibold text-chancla-2 underline decoration-chancla/40 underline-offset-4 transition hover:decoration-chancla"
          >
            Responde cinco preguntas y te lo decimos
          </Link>
          .
        </p>
        <p className="mt-3 text-center text-tinta/65">
          ¿Tienes una corporación? Estamos en ello: llegan{" "}
          <span className="font-semibold text-tinta">próximamente</span>.{" "}
          <Link
            href="/servicios"
            className="font-semibold text-chancla-2 underline decoration-chancla/40 underline-offset-4 transition hover:decoration-chancla"
          >
            Ver todos los servicios
          </Link>
        </p>
      </div>
    </section>
  );
}
