import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { Eyebrow } from "@/components/brand/cta";
import { Formularios1065Form } from "@/components/formularios-1065-form";
import { FormulariosLlcForm } from "@/components/formularios-llc-form";
import { SelectorFormularios } from "@/components/selector-formularios";
import { contacto, formularios1065, formulariosLlc, requisitosFormularios } from "@/lib/site";
import { formulariosVisibles, plazo1065Abierto, plazo1120Abierto } from "@/lib/visibilidad";

export const metadata: Metadata = {
  title: "Formularios LLC",
  description: `Envíanos los datos de tu LLC para preparar los formularios del ejercicio ${formulariosLlc.ejercicio}. Servicio de ${formulariosLlc.precio}.`,
};

const requisitos = requisitosFormularios;

export default async function FormulariosLlcPage({
  searchParams,
}: {
  searchParams: Promise<{ socios?: string }>;
}) {
  // Si NEC_FORMULARIOS_LAUNCH está definida y aún no ha llegado, la página no existe: 404 y fuera del índice.
  if (!(await formulariosVisibles())) notFound();
  const { socios } = await searchParams;
  // Fechas límite comprobadas con la hora del servidor (no la del navegador), igual que en la API:
  // desde el 1 de abril, «un socio», y desde el 1 de marzo, «varios socios», muestran el plazo cerrado.
  const abierto1120 = plazo1120Abierto();
  const abierto1065 = plazo1065Abierto();

  return (
    <section className="relative overflow-hidden pb-24 md:pb-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -right-32 size-[38rem] rounded-full bg-[radial-gradient(circle,var(--sol)_0%,transparent_60%)] opacity-30 blur-2xl"
      />
      <div className="relative mx-auto max-w-4xl px-5 pt-12 sm:px-8 md:pt-16">
        <Eyebrow>Formularios LLC · Ejercicio {formulariosLlc.ejercicio}</Eyebrow>
        <h1 className="mt-5 text-5xl leading-[0.95] font-extrabold md:text-7xl">
          Formularios LLC{" "}
          <span className="font-serif font-normal text-chancla italic">{formulariosLlc.ejercicio}.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-tinta/70 md:text-xl">
          Rellena los datos que necesitamos para preparar los formularios de tu LLC del ejercicio{" "}
          {formulariosLlc.ejercicio}. Al final, pasarás a la pantalla de pago del servicio (
          {formulariosLlc.precio}).
        </p>
        <p className="mt-3 max-w-2xl text-sm text-tinta/65">{formulariosLlc.alcance}</p>

        <SelectorFormularios
          inicial={socios === "varios" ? "varios" : "uno"}
          tituloUno="Mi LLC tiene un socio"
          detalleUno={`Formularios 1120/5472 · ${formulariosLlc.precio}`}
          tituloVarios="Tiene varios socios"
          detalleVarios={`${formularios1065.nombre} · ${formularios1065.precio}. Plazo del IRS: 15 de marzo.`}
          uno={
            <>
              <div className="mt-10 rounded-[2rem] border-2 border-sol/70 bg-sol/15 p-6 sm:p-8">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-1 size-6 shrink-0 text-[#b07a00]" aria-hidden="true" />
                  <div>
                    <h2 className="text-2xl font-bold">Antes de contratar</h2>
                    <p className="mt-2 text-tinta/80">
                      Antes de contratar este servicio, debes verificar que cumples los siguientes
                      requisitos. Si incumples alguno o tienes dudas, lo mejor es que te pongas en contacto
                      con nosotros:
                    </p>
                  </div>
                </div>
                <ul className="mt-5 space-y-3">
                  {requisitos.map((r) => (
                    <li key={r} className="flex gap-3 text-tinta/85">
                      <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-chancla" />
                      {r}
                    </li>
                  ))}
                </ul>
                <p className="mt-6 text-sm text-tinta/75">
                  ¿No cumples alguno o tienes dudas?{" "}
                  <Link
                    href="/contacto?servicio=en-regla"
                    className="font-semibold text-chancla-2 underline decoration-chancla/40 underline-offset-4"
                  >
                    Escríbenos desde el formulario de contacto
                  </Link>{" "}
                  o por WhatsApp (
                  <a
                    href={contacto.whatsapp.espana.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-chancla-2 underline decoration-chancla/40 underline-offset-4"
                  >
                    {contacto.whatsapp.espana.visible}
                  </a>
                  ).
                </p>
              </div>

              <p className="mt-10 max-w-2xl rounded-2xl bg-tinta p-4 text-sm font-semibold text-arena">
                {formulariosLlc.avisoPlazo}
              </p>

              <div className="mt-10">
                <FormulariosLlcForm abierto={abierto1120} />
              </div>
            </>
          }
          varios={
            <div className="mt-10 space-y-8">
              <div>
                <h2 className="text-3xl font-bold md:text-4xl">{formularios1065.titulo}</h2>
                <p className="mt-4 max-w-2xl text-lg text-tinta/75">{formularios1065.texto}</p>
                <p className="mt-4 font-display text-2xl font-extrabold">{formularios1065.precio}</p>
                <p className="mt-2 max-w-2xl text-sm text-tinta/65">{formularios1065.alcance}</p>
                <p className="mt-4 max-w-2xl rounded-2xl bg-tinta p-4 text-sm font-semibold text-arena">
                  {formularios1065.avisoPlazo}
                </p>
              </div>
              <Formularios1065Form abierto={abierto1065} />
            </div>
          }
        />
      </div>
    </section>
  );
}
