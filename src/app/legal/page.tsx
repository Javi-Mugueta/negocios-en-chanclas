import type { Metadata } from "next";
import Link from "next/link";
import { Eyebrow } from "@/components/brand/cta";
import { contacto } from "@/lib/site";

export const metadata: Metadata = {
  title: "Avisos legales",
  robots: { index: false },
};

export default function LegalPage() {
  return (
    <section className="mx-auto max-w-3xl px-5 pt-14 pb-24 sm:px-8 md:pt-20">
      <Eyebrow>Avisos legales</Eyebrow>
      <h1 className="mt-5 text-5xl leading-[0.95] font-extrabold md:text-6xl">Lo legal, a la vista.</h1>
      <p className="mt-6 text-lg text-tinta/70">
        Si tienes una consulta sobre tus datos, escríbenos por WhatsApp o con el{" "}
        <Link href="/contacto" className="font-semibold text-tinta underline underline-offset-4">
          formulario de contacto
        </Link>
        .
      </p>

      <div className="mt-12 space-y-10 text-lg leading-relaxed text-tinta/75">
        <section id="privacidad">
          <h2 className="text-2xl font-bold text-tinta">Política de privacidad</h2>
          <p className="mt-3">
            Los datos que envías en el formulario de contacto —nombre, email, teléfono y mensaje—
            los usamos para responder a tu consulta.
          </p>
        </section>
        <section id="devoluciones">
          <h2 className="text-2xl font-bold text-tinta">Devoluciones y reembolsos</h2>
          <p className="mt-3">
            En diseño web y tiendas online tienes 30 días para solicitar el reembolso si el proyecto
            final no responde a tus necesidades. El pago de esos proyectos es del 50&nbsp;% al
            empezar y del 50&nbsp;% al terminar.
          </p>
        </section>
      </div>

      <p className="mt-12 text-sm text-tinta/60">
        Dirección en EE. UU.: {contacto.direccion.join(", ")}.
      </p>
    </section>
  );
}
