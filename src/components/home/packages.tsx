import Link from "next/link";
import { Eyebrow } from "@/components/brand/cta";
import { ComplementaryServices } from "@/components/complementary-services";
import { PlanCards } from "@/components/plan-cards";

export function Packages() {
  return (
    <section id="paquetes" className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow className="justify-center">Planes</Eyebrow>
          <h2 className="mt-4 text-4xl leading-[1.02] font-bold md:text-6xl">
            Elige cómo abrimos <span className="font-serif font-normal italic">tu empresa.</span>
          </h2>
          <p className="mt-5 text-lg text-tinta/70">
            Dos planes para constituir tu LLC y un encargo a medida para los casos que piden sentarse
            contigo.
          </p>
        </div>

        <div className="mt-16">
          <PlanCards />
        </div>

        <ComplementaryServices />

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
          ¿Necesitas una corporación (C-Corp)? La hacemos{" "}
          <span className="font-semibold text-tinta">a medida</span>, hablando contigo 1 a 1.{" "}
          <Link
            href="/contacto?servicio=corporacion"
            className="font-semibold text-chancla-2 underline decoration-chancla/40 underline-offset-4 transition hover:decoration-chancla"
          >
            Cuéntanos tu caso
          </Link>
        </p>
      </div>
    </section>
  );
}
