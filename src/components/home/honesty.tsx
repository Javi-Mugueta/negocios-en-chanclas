import { CreditCard, Handshake, Languages, MapPin, MessageSquareQuote } from "lucide-react";
import { Eyebrow } from "@/components/brand/cta";
import { Pending } from "@/components/brand/pending";
import { Reveal } from "@/components/reveal";

const pilares = [
  {
    icon: Languages,
    titulo: "Todo en español",
    texto: "Formularios, explicaciones y llamadas. El inglés lo dejamos para el IRS.",
  },
  {
    icon: MapPin,
    titulo: "Un pie en cada orilla",
    texto: "Dirección en Albuquerque, New Mexico, y teléfono en España y en EE. UU.",
  },
  {
    icon: CreditCard,
    titulo: "Pago sencillo",
    texto: "Pagas con tarjeta en el mismo formulario de tu presentación, sin pasos extra.",
  },
];

export function Honesty() {
  return (
    <section className="relative overflow-hidden bg-tinta py-24 text-arena md:py-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -bottom-40 size-[36rem] rounded-full bg-[radial-gradient(circle,var(--chancla)_0%,transparent_60%)] opacity-25 blur-3xl"
      />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-14 grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <Eyebrow className="text-sol">Sin letra pequeña</Eyebrow>
            <h2 className="mt-4 text-4xl leading-[1.02] font-bold md:text-6xl">
              Relajados, sí.{" "}
              <span className="font-serif font-normal text-chancla italic">Descuidados, nunca.</span>
            </h2>
            <p className="mt-6 max-w-lg text-lg text-arena/70">
              Ir en chanclas es una actitud, no una excusa. Por eso te contamos exactamente qué
              hacemos y qué no, antes de que pagues nada.
            </p>
          </div>

          <Reveal className="lg:col-span-6">
            <div className="relative rounded-[2rem] bg-arena p-8 text-tinta md:p-10">
              <Handshake className="size-9 text-chancla" aria-hidden="true" />
              <p className="mt-6 font-display text-2xl leading-snug font-bold md:text-3xl">
                «Solo intermediamos: recogemos todos tus datos y los entregamos a contables
                autorizados, que son quienes presentan los formularios.»
              </p>
              <p className="mt-5 text-tinta/65">
                Lo dejamos por escrito en cada presentación. Tú sabes en todo momento quién hace
                qué, y nosotros nos aseguramos de que no falte ni un dato.
              </p>
            </div>
          </Reveal>
        </div>

        <ul className="mt-16 grid gap-px overflow-hidden rounded-[2rem] bg-arena/10 md:grid-cols-3">
          {pilares.map(({ icon: Icon, titulo, texto }, i) => (
            <Reveal as="li" key={titulo} delay={i * 100} className="bg-tinta p-8">
              <Icon className="size-7 text-sol" aria-hidden="true" />
              <h3 className="mt-5 text-xl font-bold">{titulo}</h3>
              <p className="mt-2 text-arena/65">{texto}</p>
            </Reveal>
          ))}
        </ul>

        <div className="mt-6 flex flex-col items-start gap-4 rounded-[2rem] border border-dashed border-arena/25 p-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <MessageSquareQuote className="size-8 shrink-0 text-arena/40" aria-hidden="true" />
            <p className="text-arena/70">
              Aquí irán opiniones reales de clientes de Negocios en Chanclas.
            </p>
          </div>
          <Pending>Reseñas pendientes</Pending>
        </div>
      </div>
    </section>
  );
}
