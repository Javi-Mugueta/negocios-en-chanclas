import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { Eyebrow } from "@/components/brand/cta";
import { FormulariosLlcForm } from "@/components/formularios-llc-form";
import { enlaceContacto } from "@/lib/asistente";
import { contacto, formularios1065, formulariosLlc, requisitosFormularios } from "@/lib/site";
import { formulariosVisibles } from "@/lib/visibilidad";

export const metadata: Metadata = {
  title: "Formularios LLC",
  description: `Envíanos los datos de tu LLC para preparar los formularios del ejercicio ${formulariosLlc.ejercicio}. Servicio de ${formulariosLlc.precio}.`,
};

const requisitos = requisitosFormularios;

export default async function FormulariosLlcPage() {
  // Si NEC_FORMULARIOS_LAUNCH está definida y aún no ha llegado, la página no existe: 404 y fuera del índice.
  if (!(await formulariosVisibles())) notFound();

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

        {/* Selector de socios. El formulario del Form 1065 está por diseñar: varios socios va a contacto. */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <a
            href="#formulario"
            className="rounded-[1.5rem] border-2 border-chancla bg-white p-5 transition hover:shadow-md"
          >
            <span className="block font-display text-lg font-bold">Mi LLC tiene un socio</span>
            <span className="mt-1 block text-sm text-tinta/70">
              Formularios 1120/5472 · {formulariosLlc.precio}
            </span>
          </a>
          <Link
            href={enlaceContacto("en-regla", "Mi LLC tiene varios socios y necesito el Form 1065 + K-1.")}
            className="rounded-[1.5rem] border-2 border-tinta/10 bg-white/60 p-5 transition hover:border-tinta/25 hover:bg-white"
          >
            <span className="block font-display text-lg font-bold">Tiene varios socios</span>
            <span className="mt-1 block text-sm text-tinta/70">
              {formularios1065.nombre} · {formularios1065.precio}. Plazo del IRS: 15 de marzo. Escríbenos y lo
              preparamos contigo.
            </span>
          </Link>
        </div>

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

        <div id="formulario" className="mt-10 scroll-mt-28">
          <FormulariosLlcForm />
        </div>
      </div>
    </section>
  );
}
