import { Eyebrow, CtaLink } from "@/components/brand/cta";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type Entidad = {
  id: string;
  tab: string;
  titulo: string;
  resumen: string;
  proximamente?: boolean;
  filas: { k: string; v: string }[];
};

const entidades: Entidad[] = [
  {
    id: "llc-1",
    tab: "LLC de 1 miembro",
    titulo: "La LLC de un solo miembro",
    resumen:
      "La favorita de quien emprende por su cuenta: sencilla de montar, ligera de mantener y con tu patrimonio personal separado del de la empresa.",
    filas: [
      { k: "Para quién", v: "Freelancers, creadores y negocios digitales con una sola persona al mando." },
      {
        k: "Cómo la ve el IRS",
        v: "Como una entidad «transparente»: a nivel federal no tributa por sí misma. Lo que te toque en tu país de residencia depende de tu caso.",
      },
      {
        k: "Qué presentar cada año",
        v: "Si no resides en EE. UU., normalmente el formulario 5472 junto a un 1120 pro forma, con las operaciones entre tú y tu LLC.",
      },
      { k: "Con nosotros", v: "Preparamos tu presentación anual 1120 + 5472 de principio a fin." },
    ],
  },
  {
    id: "llc-2",
    tab: "LLC de 2 miembros",
    titulo: "La LLC con socio",
    resumen:
      "Misma flexibilidad, pero a dos. Ideal cuando el proyecto es compartido y queréis reglas claras desde el primer día.",
    filas: [
      { k: "Para quién", v: "Socios que emprenden juntos y quieren repartir propiedad y decisiones." },
      {
        k: "Cómo la ve el IRS",
        v: "Por defecto, como una sociedad (partnership). Las obligaciones cambian respecto a la LLC de un miembro.",
      },
      {
        k: "Qué presentar cada año",
        v: "Depende de cómo esté estructurada y de dónde residáis. Lo revisamos contigo antes de empezar.",
      },
      { k: "Con nosotros", v: "Nuestro formulario de presentación admite LLC de uno o dos miembros." },
    ],
  },
  {
    id: "corp",
    tab: "Corporación",
    titulo: "La corporación (C-Corp)",
    resumen:
      "La estructura clásica para crecer con inversores. Más formalidades, más papeleo y una fiscalidad propia.",
    proximamente: true,
    filas: [
      { k: "Para quién", v: "Proyectos que buscan inversión o planean emitir acciones." },
      {
        k: "Cómo la ve el IRS",
        v: "Como una entidad con impuesto propio: la corporación tributa por sus beneficios.",
      },
      {
        k: "Qué presentar cada año",
        v: "Su propia declaración de sociedades, además de las obligaciones del estado.",
      },
      { k: "Con nosotros", v: "Próximamente. Si te interesa, escríbenos y te avisamos." },
    ],
  },
];

export function Entities() {
  return (
    <section className="relative bg-arena-2/60 py-24 md:py-32 grain">
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-3xl">
          <Eyebrow>Tipos de empresa</Eyebrow>
          <h2 className="mt-4 text-4xl leading-[1.02] font-bold md:text-6xl">
            ¿Qué te pones? <span className="font-serif font-normal italic">Elige tu talla.</span>
          </h2>
          <p className="mt-5 text-lg text-tinta/70">
            Tres formas de tener empresa en EE. UU., explicadas sin tecnicismos. Si dudas, la
            respuesta corta suele ser: una LLC.
          </p>
        </div>

        <Tabs defaultValue="llc-1" className="mt-12">
          <TabsList className="h-auto! w-full flex-wrap justify-start gap-1 rounded-full bg-white/70 p-1.5 ring-1 ring-tinta/10 sm:w-auto">
            {entidades.map((e) => (
              <TabsTrigger
                key={e.id}
                value={e.id}
                className="h-auto flex-none rounded-full px-4 py-2.5 text-sm font-semibold text-tinta/70 data-active:bg-tinta data-active:text-arena data-active:shadow-none sm:px-5"
              >
                {e.tab}
                {e.proximamente && (
                  <span className="ml-1.5 rounded-full bg-chancla/15 px-1.5 py-0.5 text-[0.65rem] font-semibold text-chancla-2 uppercase">
                    Pronto
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {entidades.map((e) => (
            <TabsContent key={e.id} value={e.id} className="mt-8 text-base">
              <div className="grid overflow-hidden rounded-[2rem] border border-tinta/10 bg-card grid-cols-1 lg:grid-cols-12">
                <div
                  className={cn(
                    "relative flex flex-col justify-between gap-10 p-8 md:p-10 lg:col-span-5",
                    e.proximamente ? "bg-tinta-2 text-arena" : "bg-tinta text-arena",
                  )}
                >
                  <div>
                    {e.proximamente && (
                      <span className="inline-block rounded-full bg-sol px-3 py-1 text-xs font-bold text-tinta uppercase">
                        Próximamente
                      </span>
                    )}
                    <h3 className="mt-4 text-3xl font-bold md:text-4xl">{e.titulo}</h3>
                    <p className="mt-4 text-arena/75">{e.resumen}</p>
                  </div>
                  <CtaLink
                    href={e.proximamente ? "/contacto" : "/como-funciona-una-llc"}
                    variant="light"
                    className="self-start"
                  >
                    {e.proximamente ? "Avísame" : "Entender la LLC"}
                  </CtaLink>
                </div>
                <dl className="divide-y divide-tinta/10 lg:col-span-7">
                  {e.filas.map((f) => (
                    <div key={f.k} className="grid gap-1 p-6 sm:grid-cols-3 sm:gap-6 md:px-10">
                      <dt className="font-mono text-xs font-medium tracking-[0.14em] text-chancla-2 uppercase sm:pt-1">
                        {f.k}
                      </dt>
                      <dd className="leading-relaxed text-tinta/80 sm:col-span-2">{f.v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <p className="mt-6 text-sm text-tinta/55">
          Información general orientativa. Cada caso es distinto: no sustituye el asesoramiento
          fiscal o legal profesional.
        </p>
      </div>
    </section>
  );
}
