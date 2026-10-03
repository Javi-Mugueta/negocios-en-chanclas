import type { Metadata } from "next";
import { Eyebrow } from "@/components/brand/cta";
import { Pending } from "@/components/brand/pending";
import { contacto } from "@/lib/site";

export const metadata: Metadata = {
  title: "Avisos legales",
  robots: { index: false },
};

const secciones = [
  { id: "privacidad", titulo: "Política de privacidad" },
  { id: "cookies", titulo: "Política de cookies" },
  { id: "devoluciones", titulo: "Política de devoluciones y reembolsos" },
];

export default function LegalPage() {
  return (
    <section className="mx-auto max-w-3xl px-5 pt-14 pb-24 sm:px-8 md:pt-20">
      <Eyebrow>Avisos legales</Eyebrow>
      <h1 className="mt-5 text-5xl leading-[0.95] font-extrabold md:text-6xl">Lo legal, a la vista.</h1>
      <p className="mt-6 text-lg text-tinta/70">
        Los textos legales definitivos de Negocios en Chanclas se publicarán aquí. Mientras tanto,
        para cualquier consulta sobre tus datos escríbenos a{" "}
        <a className="font-semibold text-tinta underline underline-offset-4" href={`mailto:${contacto.email}`}>
          {contacto.email}
        </a>
        .
      </p>

      <div className="mt-12 space-y-4">
        {secciones.map((s) => (
          <div
            key={s.id}
            id={s.id}
            className="flex flex-col gap-3 rounded-3xl border border-dashed border-tinta/20 bg-card p-6 sm:flex-row sm:items-center sm:justify-between"
          >
            <h2 className="text-xl font-bold">{s.titulo}</h2>
            <Pending>Texto legal pendiente</Pending>
          </div>
        ))}
      </div>
    </section>
  );
}
