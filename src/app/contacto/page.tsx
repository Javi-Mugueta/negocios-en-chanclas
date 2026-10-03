import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { Eyebrow } from "@/components/brand/cta";
import { ChanclaMark } from "@/components/brand/logo";
import { Pending } from "@/components/brand/pending";
import { ContactForm } from "@/components/contact-form";
import { contacto } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Habla con Negocios en Chanclas por teléfono en España o EE. UU., por email o con el formulario. Te respondemos en español.",
};

export default async function ContactoPage({ searchParams }: PageProps<"/contacto">) {
  const { servicio } = await searchParams;

  return (
    <section className="relative overflow-hidden pb-24 md:pb-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -left-40 size-[36rem] rounded-full bg-[radial-gradient(circle,var(--agua)_0%,transparent_60%)] opacity-80 blur-2xl"
      />
      <div className="relative mx-auto grid max-w-7xl gap-14 px-5 pt-14 sm:px-8 md:pt-20 grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Eyebrow>Contacto</Eyebrow>
          <h1 className="mt-5 text-5xl leading-[0.95] font-extrabold md:text-7xl">
            Hablemos,{" "}
            <span className="font-serif font-normal text-chancla italic">sin corbata.</span>
          </h1>
          <p className="mt-6 max-w-md text-lg text-tinta/70">
            Cuéntanos en qué punto está tu LLC (o tu idea) y te decimos cómo podemos ayudarte. Te
            responde una persona, en español.
          </p>

          <ul className="mt-10 space-y-6">
            <ContactRow icon={Phone} label="Teléfono España">
              <a className="hover:text-chancla-2" href={contacto.telefonoESP.href}>
                {contacto.telefonoESP.visible}
              </a>
            </ContactRow>
            <ContactRow icon={Phone} label="Teléfono EE. UU.">
              <a className="hover:text-chancla-2" href={contacto.telefonoUSA.href}>
                {contacto.telefonoUSA.visible}
              </a>
            </ContactRow>
            <ContactRow icon={Mail} label="Email">
              <a className="break-all hover:text-chancla-2" href={`mailto:${contacto.email}`}>
                {contacto.email}
              </a>
            </ContactRow>
            <ContactRow icon={MapPin} label="Dirección en EE. UU.">
              <span className="text-lg font-semibold">
                {contacto.direccion.map((l) => (
                  <span key={l} className="block">
                    {l}
                  </span>
                ))}
              </span>
            </ContactRow>
          </ul>

          <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-tinta/60">
            Horario:
            {contacto.horario ?? <Pending>Horario pendiente</Pending>}
          </div>
        </div>

        <div className="relative lg:col-span-7">
          <ChanclaMark className="absolute -top-8 -right-2 z-10 size-16 rotate-12 animate-float [--r:12deg] sm:-right-6" />
          <ContactForm servicioInicial={typeof servicio === "string" ? servicio : undefined} />
        </div>
      </div>
    </section>
  );
}

function ContactRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-4">
      <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-tinta text-arena">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="font-mono text-xs tracking-[0.16em] text-tinta/50 uppercase">{label}</p>
        <div className="mt-1 font-display text-xl font-bold">{children}</div>
      </div>
    </li>
  );
}
