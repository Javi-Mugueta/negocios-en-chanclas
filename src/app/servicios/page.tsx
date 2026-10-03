import type { Metadata } from "next";
import { ClipboardList, SearchCheck, Send } from "lucide-react";
import { CtaLink, Eyebrow } from "@/components/brand/cta";
import { FinalCta } from "@/components/final-cta";
import { PackageCards } from "@/components/package-cards";
import { Reveal } from "@/components/reveal";
import { checklistPresentacion, serviciosDigitales } from "@/lib/site";

export const metadata: Metadata = {
  title: "Servicios",
  description:
    "Constitución, presentación anual de los formularios 1120 y 5472 y baja de tu LLC. Además, diseño web, tiendas online, SEO y mantenimiento para tu negocio.",
};

const flujo = [
  {
    icon: ClipboardList,
    titulo: "Rellenas el formulario",
    texto: "En español, con explicaciones en cada campo. Tus datos, los de tu LLC y los números del año.",
  },
  {
    icon: SearchCheck,
    titulo: "Lo revisamos contigo",
    texto: "Comprobamos que no falte nada y que todo cuadre. Si algo no está claro, te llamamos.",
  },
  {
    icon: Send,
    titulo: "Contables autorizados lo presentan",
    texto: "Les entregamos tu expediente completo y son ellos quienes presentan los formularios ante el IRS.",
  },
];

export default function ServiciosPage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 -right-20 size-[38rem] rounded-full bg-[radial-gradient(circle,var(--sol)_0%,transparent_60%)] opacity-30 blur-2xl"
        />
        <div className="relative mx-auto max-w-7xl px-5 pt-14 pb-8 sm:px-8 md:pt-20">
          <Eyebrow>Servicios</Eyebrow>
          <h1 className="mt-5 max-w-4xl text-5xl leading-[0.95] font-extrabold md:text-7xl">
            Lo que hacemos por tu LLC,{" "}
            <span className="font-serif font-normal text-chancla italic">y cómo lo hacemos.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-tinta/70 md:text-xl">
            Servicios claros para cada etapa de tu empresa en EE. UU. Sin cuotas sorpresa, sin
            jerga y con una persona al otro lado.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <PackageCards />
          <p className="mt-10 text-center text-sm text-tinta/60">
            Corporaciones (C-Corp): próximamente. Los precios marcados como pendientes se
            publicarán en cuanto estén confirmados.
          </p>
        </div>
      </section>

      <section id="presentacion" className="bg-tinta py-24 text-arena md:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-12 md:items-end">
            <div className="md:col-span-7">
              <Eyebrow className="text-sol">Presentación 1120 + 5472</Eyebrow>
              <h2 className="mt-4 text-4xl leading-[1.02] font-bold md:text-6xl">
                Tu cita con el IRS,{" "}
                <span className="font-serif font-normal text-chancla italic">en tres pasos.</span>
              </h2>
            </div>
            <p className="text-lg text-arena/70 md:col-span-5">
              Lo importante, por delante: solo intermediamos. Recogemos y revisamos tus datos; la
              presentación la hacen contables autorizados.
            </p>
          </div>

          <ol className="mt-14 grid gap-5 md:grid-cols-3">
            {flujo.map(({ icon: Icon, titulo, texto }, i) => (
              <Reveal as="li" key={titulo} delay={i * 110}>
                <div className="h-full rounded-[2rem] bg-tinta-2/70 p-8 ring-1 ring-arena/10">
                  <div className="flex items-center justify-between">
                    <span className="grid size-12 place-items-center rounded-2xl bg-chancla text-white">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <span className="font-display text-5xl font-extrabold text-arena/10">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="mt-6 text-2xl font-bold">{titulo}</h3>
                  <p className="mt-3 text-arena/70">{texto}</p>
                </div>
              </Reveal>
            ))}
          </ol>

          <div className="mt-16 rounded-[2rem] bg-arena p-8 text-tinta md:p-12">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <h3 className="text-3xl font-bold">Ten esto a mano</h3>
              <p className="text-tinta/60">Si no hubo actividad, escribe «0»: ningún campo puede quedar vacío.</p>
            </div>
            <div className="mt-8 grid gap-8 md:grid-cols-3">
              {checklistPresentacion.map((g) => (
                <div key={g.grupo}>
                  <p className="font-mono text-xs tracking-[0.16em] text-chancla-2 uppercase">{g.grupo}</p>
                  <ul className="mt-4 space-y-2.5">
                    {g.items.map((it) => (
                      <li key={it} className="flex gap-3 text-tinta/80">
                        <span aria-hidden="true" className="mt-1 grid size-4 shrink-0 place-items-center rounded border border-tinta/25" />
                        {it}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-10">
              <CtaLink href="/contacto?servicio=en-regla">Preparar mi presentación</CtaLink>
            </div>
          </div>
        </div>
      </section>

      <section id="digital" className="py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-12 md:items-end">
            <div className="md:col-span-7">
              <Eyebrow>Y para tu negocio online</Eyebrow>
              <h2 className="mt-4 text-4xl leading-[1.02] font-bold md:text-6xl">
                Web, tienda y SEO.{" "}
                <span className="font-serif font-normal italic">Con la misma calma.</span>
              </h2>
            </div>
            <p className="text-lg text-tinta/70 md:col-span-5">
              Tu LLC necesita escaparate. Diseñamos, mantenemos y posicionamos webs y tiendas
              online, con formación incluida para que tú también puedas tocarlas.
            </p>
          </div>

          <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {serviciosDigitales.map((s, i) => (
              <Reveal as="li" key={s.nombre} delay={(i % 3) * 90}>
                <div className="group flex h-full flex-col rounded-[2rem] border border-tinta/10 bg-card p-7 transition-all duration-500 hover:-translate-y-1 hover:border-chancla/40">
                  <h3 className="text-xl font-bold">{s.nombre}</h3>
                  <p className="mt-3 flex-1 text-tinta/70">{s.descripcion}</p>
                  <div className="mt-6 flex items-baseline gap-3 border-t border-tinta/10 pt-5">
                    <span className="font-display text-3xl font-extrabold text-tinta">{s.precio}</span>
                    {"precioAnterior" in s && s.precioAnterior && (
                      <span className="text-tinta/45 line-through">{s.precioAnterior}</span>
                    )}
                  </div>
                </div>
              </Reveal>
            ))}
          </ul>

          <div className="mt-8 grid gap-4 rounded-[2rem] bg-arena-2 p-7 text-tinta/75 md:grid-cols-2 md:p-9">
            <p>
              <strong className="text-tinta">Garantía de 30 días.</strong> En diseño web y tiendas
              online tienes 30 días para solicitar el reembolso si el proyecto final no responde a
              tus necesidades.
            </p>
            <p>
              <strong className="text-tinta">Pago en dos partes.</strong> 50 % al empezar y 50 % al
              terminar. Tras la compra, un técnico te contacta para fijar día y hora.
            </p>
          </div>
        </div>
      </section>

      <FinalCta titulo="¿Hablamos de lo tuyo?" subtitulo="Sin compromiso y sin prisas." />
    </>
  );
}
