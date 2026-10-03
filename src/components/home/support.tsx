import { Mail, Phone } from "lucide-react";
import { Eyebrow } from "@/components/brand/cta";
import { ChanclaMark } from "@/components/brand/logo";
import { Pending } from "@/components/brand/pending";
import { Reveal } from "@/components/reveal";
import { contacto } from "@/lib/site";

const canales = [
  {
    icon: Phone,
    etiqueta: "Desde España",
    valor: contacto.telefonoESP.visible,
    href: contacto.telefonoESP.href,
  },
  {
    icon: Phone,
    etiqueta: "Desde EE. UU.",
    valor: contacto.telefonoUSA.visible,
    href: contacto.telefonoUSA.href,
  },
  {
    icon: Mail,
    etiqueta: "Por escrito",
    valor: contacto.email,
    href: `mailto:${contacto.email}`,
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
            Cuando tengas una duda, llamas o escribes y te responde alguien que conoce tu LLC. Sin
            bots, sin menús infinitos y sin cambiar de idioma.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-tinta/60">
            Horario de atención:
            {contacto.horario ? <span>{contacto.horario}</span> : <Pending>Horario pendiente</Pending>}
          </div>
        </div>

        <div className="relative lg:col-span-7">
          <ChanclaMark className="absolute -top-10 right-6 size-16 rotate-12 opacity-90" />
          <ul className="space-y-3">
            {canales.map(({ icon: Icon, etiqueta, valor, href }, i) => (
              <Reveal as="li" key={valor} delay={i * 90}>
                <a
                  href={href}
                  className="group flex items-center gap-5 rounded-3xl border border-tinta/10 bg-card p-5 transition-all duration-300 hover:border-chancla/50 hover:bg-white sm:p-6"
                >
                  <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-arena-2 text-tinta transition-colors duration-300 group-hover:bg-chancla group-hover:text-white">
                    <Icon className="size-6" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-mono text-xs tracking-[0.16em] text-tinta/50 uppercase">
                      {etiqueta}
                    </span>
                    <span className="mt-1 block truncate font-display text-xl font-bold sm:text-2xl">
                      {valor}
                    </span>
                  </span>
                  <span
                    aria-hidden="true"
                    className="hidden text-2xl text-tinta/30 transition-all duration-300 group-hover:translate-x-1 group-hover:text-chancla sm:block"
                  >
                    →
                  </span>
                </a>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
