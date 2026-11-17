import Link from "next/link";
import { MessageCircle, MessagesSquare } from "lucide-react";
import { Eyebrow } from "@/components/brand/cta";
import { ChanclaMark } from "@/components/brand/logo";
import { Reveal } from "@/components/reveal";
import { contacto } from "@/lib/site";

const canales = [
  {
    icon: MessageCircle,
    etiqueta: "WhatsApp España",
    valor: contacto.whatsapp.espana.visible,
    href: contacto.whatsapp.espana.href,
    externo: true,
  },
  {
    icon: MessageCircle,
    etiqueta: "WhatsApp EE. UU.",
    valor: contacto.whatsapp.eeuu.visible,
    href: contacto.whatsapp.eeuu.href,
    externo: true,
  },
  {
    icon: MessagesSquare,
    etiqueta: "Formulario",
    valor: "Escríbenos",
    href: "/contacto",
    externo: false,
  },
];

export function Support() {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-8 grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Eyebrow>Atención humana</Eyebrow>
          <h2 className="mt-4 text-4xl leading-[1.02] font-bold md:text-6xl">
            Personas, <span className="font-serif font-normal italic">no tickets.</span>
          </h2>
          <p className="mt-6 text-lg text-tinta/70">
            Cuando tengas una duda, escríbenos por WhatsApp o con el formulario. Te responde alguien
            que conoce tu LLC, en español o en inglés.
          </p>
        </div>

        <div className="relative lg:col-span-7">
          <ChanclaMark className="absolute -top-10 right-6 size-16 rotate-12 opacity-90" />
          <ul className="space-y-3">
            {canales.map(({ icon: Icon, etiqueta, valor, href, externo }, i) => (
              <Reveal as="li" key={etiqueta} delay={i * 90}>
                {externo ? (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-5 rounded-3xl border border-tinta/10 bg-card p-5 transition-all duration-300 hover:border-chancla/50 hover:bg-white sm:p-6"
                  >
                    <Canal etiqueta={etiqueta} valor={valor} icon={Icon} />
                  </a>
                ) : (
                  <Link
                    href={href}
                    className="group flex items-center gap-5 rounded-3xl border border-tinta/10 bg-card p-5 transition-all duration-300 hover:border-chancla/50 hover:bg-white sm:p-6"
                  >
                    <Canal etiqueta={etiqueta} valor={valor} icon={Icon} />
                  </Link>
                )}
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Canal({
  etiqueta,
  valor,
  icon: Icon,
}: {
  etiqueta: string;
  valor: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <>
      <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-arena-2 text-tinta transition-colors duration-300 group-hover:bg-chancla group-hover:text-white">
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-mono text-xs tracking-[0.16em] text-tinta/50 uppercase">
          {etiqueta}
        </span>
        <span className="mt-1 block truncate font-display text-xl font-bold sm:text-2xl">{valor}</span>
      </span>
      <span
        aria-hidden="true"
        className="hidden text-2xl text-tinta/30 transition-all duration-300 group-hover:translate-x-1 group-hover:text-chancla sm:block"
      >
        →
      </span>
    </>
  );
}
