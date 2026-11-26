import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Eyebrow } from "@/components/brand/cta";
import { FormationWizard, type Punto } from "@/components/wizard/formation-wizard";
import { PLANES_ASISTENTE, type PlanAsistente } from "@/lib/site";
import { formulariosVisibles } from "@/lib/visibilidad";

export const metadata: Metadata = {
  title: "Empieza aquí",
  description:
    "Unas preguntas para saber cuál es tu siguiente paso con tu LLC: crearla, ponerla en regla con el IRS o cerrarla.",
};

const desdePaquete: Record<string, Punto> = {
  arranque: "crear",
  "en-regla": "anual",
};

export default async function EmpezarPage({
  searchParams,
}: {
  searchParams: Promise<{ paquete?: string; plan?: string; tipo?: string }>;
}) {
  const { paquete, plan: planParam, tipo } = await searchParams;
  // El cierre es un servicio propio con su página.
  if (paquete === "cierre") redirect("/cierra-tu-llc");
  const puntoInicial = typeof paquete === "string" ? desdePaquete[paquete] : undefined;
  const plan =
    typeof planParam === "string" && planParam in PLANES_ASISTENTE ? (planParam as PlanAsistente) : undefined;
  const formulariosAbiertos = await formulariosVisibles();

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
            Paso a paso{" "}
            <span className="font-serif font-normal text-chancla italic">y a la sombra.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-tinta/70 md:text-xl">
            Cuéntanos en qué punto está tu LLC y te decimos cuál es tu siguiente paso. Al final
            guardamos tus respuestas, con tu consentimiento, para poder escribirte.
          </p>
        </div>
        <div className="mt-12">
          <FormationWizard
            puntoInicial={plan ? "crear" : puntoInicial}
            tipoInicial={tipo === "llc-2" ? "llc-2" : undefined}
            plan={plan}
            formulariosAbiertos={formulariosAbiertos}
          />
        </div>
      </div>
    </section>
  );
}
