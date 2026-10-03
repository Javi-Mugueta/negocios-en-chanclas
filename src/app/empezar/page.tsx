import type { Metadata } from "next";
import { Eyebrow } from "@/components/brand/cta";
import { FormationWizard, type Punto } from "@/components/wizard/formation-wizard";

export const metadata: Metadata = {
  title: "Empieza aquí",
  description:
    "Cinco preguntas para saber cuál es tu siguiente paso con tu LLC: crearla, ponerla en regla con el IRS o cerrarla.",
};

const desdePaquete: Record<string, Punto> = {
  arranque: "crear",
  "en-regla": "anual",
  cierre: "cerrar",
};

export default async function EmpezarPage({ searchParams }: PageProps<"/empezar">) {
  const { paquete } = await searchParams;
  const puntoInicial = typeof paquete === "string" ? desdePaquete[paquete] : undefined;

  return (
    <section className="relative overflow-hidden pb-24 md:pb-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -right-32 size-[38rem] rounded-full bg-[radial-gradient(circle,var(--sol)_0%,transparent_60%)] opacity-30 blur-2xl"
      />
      <div className="relative mx-auto max-w-7xl px-5 pt-12 sm:px-8 md:pt-16">
        <div className="max-w-3xl">
          <Eyebrow>Empieza aquí</Eyebrow>
          <h1 className="mt-5 text-5xl leading-[0.95] font-extrabold md:text-7xl">
            Cinco preguntas{" "}
            <span className="font-serif font-normal text-chancla italic">y a la sombra.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-tinta/70 md:text-xl">
            Cuéntanos en qué punto está tu LLC y te decimos cuál es tu siguiente paso. Sin
            compromiso: tus respuestas no salen de esta página.
          </p>
        </div>
        <div className="mt-12">
          <FormationWizard puntoInicial={puntoInicial} />
        </div>
      </div>
    </section>
  );
}
