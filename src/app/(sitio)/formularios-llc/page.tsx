import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { Eyebrow } from "@/components/brand/cta";
import { FormulariosLlcForm } from "@/components/formularios-llc-form";
import { contacto, formulariosLlc } from "@/lib/site";
import { formulariosVisibles } from "@/lib/visibilidad";

export const metadata: Metadata = {
  title: "Formularios LLC",
  description: `Envíanos los datos de tu LLC para preparar los formularios del ejercicio ${formulariosLlc.ejercicio}. Servicio de ${formulariosLlc.precio}.`,
};

const requisitos = [
  "Tu LLC tiene un solo socio: si tienes dos o más, requieres compliance adicional. Ponte en contacto con nosotros para que te informemos.",
  "El socio no es ciudadano estadounidense ni residente fiscal en EE. UU.",
  "La LLC no tiene oficina, empleados ni almacén físico en USA.",
  "La LLC está al día: has presentado formularios otros años si debías y tienes un agente registrador activo y contratado.",
  "No has recibido ninguna carta o multa de la IRS que haya que tener en cuenta.",
];

export default async function FormulariosLlcPage() {
  // Antes del 1 de enero de 2027 (hora de Madrid) la página no existe: 404 y fuera del índice.
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

        <div className="mt-10">
          <FormulariosLlcForm />
        </div>
      </div>
    </section>
  );
}
