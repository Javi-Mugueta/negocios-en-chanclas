import type { Metadata } from "next";
import { CtaLink, Eyebrow } from "@/components/brand/cta";
import { Reveal } from "@/components/reveal";
import { dolares, LISTA_ESTADOS_CON_TASA, LISTA_ESTADOS_LLC, PLANES_APERTURA, RENOVACION, TEXTOS_PRECIO } from "@/lib/precios";
import { AGENDA_15MIN, formulariosLlc } from "@/lib/site";
import { formulariosVisibles } from "@/lib/visibilidad";

export const metadata: Metadata = {
  title: "Servicios",
  description:
    "Apertura de LLC y C-Corp, cierre de LLC, cambio de titularidad, Operating Agreement personalizado, operaciones societarias y formularios anuales 1120/5472.",
};

type Servicio = {
  id: string;
  titulo: string;
  texto: React.ReactNode;
  precio: string;
  microcopy?: string;
  cta: string;
  href: string;
};

function servicios(formulariosAbiertos: boolean): Servicio[] {
  return [
    {
      id: "apertura-llc",
      titulo: "Apertura de LLC",
      texto:
        "Constituimos tu LLC en Estados Unidos con el plan que mejor encaje con tu negocio, de un socio o de varios socios. Tienes todos los planes y lo que incluye cada uno en la página principal.",
      precio: TEXTOS_PRECIO.aperturaDesde,
      microcopy: `${dolares(PLANES_APERTURA.basico.precio)} el primer año en Nuevo México, tasa del estado incluida. También en ${LISTA_ESTADOS_CON_TASA} (+ tasa del estado). Renovación, ${dolares(RENOVACION)}/año + tasa anual del estado.`,
      cta: "Ver planes",
      href: "/#paquetes",
    },
    {
      id: "c-corp",
      titulo: "Apertura de C-Corp",
      texto:
        "Si vas a levantar inversión, emitir acciones o tienes un proyecto que no encaja en una LLC, quizá lo que necesitas es una C-Corp. Es un servicio a medida: antes de darte precio, entendemos qué quieres construir.",
      precio: "Presupuesto a medida",
      microcopy: "Es una estructura compleja: necesitamos analizar tu caso antes de darte precio.",
      cta: "Cuéntanos tu proyecto",
      href: "/contacto?servicio=corporacion",
    },
    {
      id: "cierre-llc",
      titulo: "Cierre de LLC",
      texto:
        "¿Ya no usas tu LLC? Cerrarla bien evita que sigan corriendo cuotas anuales, agente registrado y obligaciones de un negocio que ya no tienes. Nos encargamos de todo: la disolución ante el estado y la última declaración ante el IRS (1120/5472 final).",
      precio: TEXTOS_PRECIO.cierre,
      microcopy: `Para LLC de ${LISTA_ESTADOS_LLC}. La tasa depende del estado (en Utah, 0 $). ¿Otro estado? Escríbenos y te damos presupuesto.`,
      cta: "Cierra tu LLC",
      href: "/cierra-tu-llc",
    },
    {
      id: "cambio-titularidad",
      titulo: "Cambio de titularidad de LLC",
      texto:
        "Si vendes o traspasas tu LLC a otra persona, hay que documentar bien la transmisión y dejarla en orden ante el estado. Lo preparamos para que el nuevo dueño reciba una empresa limpia.",
      precio: TEXTOS_PRECIO.cambioTitularidad,
      microcopy: "Algunos estados cobran tasas por este trámite y otros no. Te lo confirmamos antes de empezar.",
      cta: "Solicitar cambio de titularidad",
      href: "/contacto?servicio=cambio-titularidad",
    },
    {
      id: "operating-agreement",
      titulo: "Operating Agreement personalizado",
      texto: (
        <>
          <p>
            El Operating Agreement es el contrato que dice cómo funciona tu LLC: quién decide, cómo se
            reparte el dinero y qué pasa si alguien entra o sale. Una plantilla vale para empezar;
            cuando hay socios, inversores o dinero en juego, conviene uno hecho para ti.
          </p>
          <p className="mt-4 font-semibold text-tinta">Incluye:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Una llamada gratuita de 15 minutos para entender qué necesitas.</li>
            <li>Una sesión de trabajo de 45 minutos para diseñarlo contigo.</li>
            <li>La redacción del documento.</li>
          </ul>
        </>
      ),
      precio: TEXTOS_PRECIO.operatingAgreement,
      microcopy: "El presupuesto final depende de la complejidad de tu caso. Te lo damos cerrado tras la llamada.",
      cta: "Agenda tu llamada gratuita",
      href: AGENDA_15MIN,
    },
    {
      id: "operaciones-societarias",
      titulo: "Operaciones societarias (M&A)",
      texto:
        "Aportar tu LLC a otra sociedad, dar entrada a un socio y pasar de una LLC de un solo miembro a una partnership, fusionar o reorganizar estructuras… Cada operación tiene consecuencias legales y fiscales distintas, así que la estudiamos caso a caso.",
      precio: "Presupuesto a medida",
      cta: "Cuéntanos tu operación",
      href: "/contacto?servicio=operaciones-societarias",
    },
    {
      id: "formularios-anuales",
      titulo: "Formularios anuales 1120/5472",
      texto:
        "Si tu LLC es de un solo socio y no resides en EE. UU., cada año tienes que presentar al IRS el formulario 5472 junto a un 1120 pro forma. Nos pasas los datos y los movimientos del año, los preparamos y los presentamos por ti.",
      precio: formulariosLlc.precio,
      microcopy: "Para LLC de cualquier estado. Solo formularios federales: las obligaciones de tu estado van aparte.",
      cta: "Presentar mis formularios",
      // Mientras /formularios-llc esté oculta (NEC_FORMULARIOS_LAUNCH), al contacto.
      href: formulariosAbiertos ? "/formularios-llc" : "/contacto?servicio=en-regla",
    },
  ];
}

export default async function ServiciosPage() {
  const tarjetas = servicios(await formulariosVisibles());
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
            Servicios para tu LLC
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-tinta/70 md:text-xl">
            Abrirla es solo el principio. Te acompañamos en todo lo que pasa después: cerrarla,
            venderla, ponerla por escrito o reorganizarla.
          </p>
          <p className="mt-5">
            <a
              href="#no-sabes"
              className="font-semibold text-chancla-2 underline decoration-chancla/40 underline-offset-4 transition hover:decoration-chancla"
            >
              ¿No sabes cuál necesitas?
            </a>
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tarjetas.map((s, i) => (
              <Reveal as="li" key={s.id} delay={(i % 3) * 90} className="h-full">
                <article
                  id={s.id}
                  className="flex h-full scroll-mt-28 flex-col rounded-[2rem] border border-tinta/10 bg-card p-7 transition-all duration-500 hover:-translate-y-1 hover:border-chancla/40"
                >
                  <h3 className="text-2xl font-bold">{s.titulo}</h3>
                  <div className="mt-3 flex-1 leading-relaxed text-tinta/70">{s.texto}</div>
                  <div className="mt-6 border-t border-tinta/10 pt-5">
                    <p className="font-display text-2xl font-extrabold text-tinta">{s.precio}</p>
                    {s.microcopy && <p className="mt-2 text-sm text-tinta/60">{s.microcopy}</p>}
                  </div>
                  <CtaLink href={s.href} className="mt-6 w-full">
                    {s.cta}
                  </CtaLink>
                </article>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section id="no-sabes" className="scroll-mt-28 pt-12 pb-24 md:pb-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="rounded-[2rem] bg-tinta p-8 text-arena md:p-14">
            <h2 className="text-4xl leading-[1.02] font-bold md:text-5xl">¿No sabes cuál necesitas?</h2>
            <p className="mt-5 max-w-2xl text-lg text-arena/75">
              Cuéntanos tu caso en una llamada de 15 minutos, sin coste. Te decimos qué servicio encaja
              y, si no necesitas ninguno, también te lo diremos.
            </p>
            <CtaLink href={AGENDA_15MIN} className="mt-8">
              Agenda una llamada gratuita
            </CtaLink>
          </div>
        </div>
      </section>
    </>
  );
}
