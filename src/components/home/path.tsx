import { Eyebrow } from "@/components/brand/cta";
import { Pending } from "@/components/brand/pending";
import { Reveal } from "@/components/reveal";

const pasos = [
  {
    n: "01",
    titulo: "Nos cuentas tu idea",
    texto:
      "Por email o por teléfono, en España o en EE. UU. Sin formularios eternos ni jerga: primero entendemos qué quieres montar.",
  },
  {
    n: "02",
    titulo: "Eliges estado y estructura",
    texto:
      "New Mexico, Wyoming, Delaware… Te explicamos las diferencias en cristiano y decides con calma: LLC de uno o de dos miembros.",
  },
  {
    n: "03",
    titulo: "Tu LLC toma forma",
    texto:
      "Articles of Organization, EIN y lo necesario para empezar a operar. Te guardamos todo bien ordenado para cuando lo necesites.",
    pendiente: true,
  },
  {
    n: "04",
    titulo: "Cada año, en regla",
    texto:
      "Llega la presentación de los formularios 1120 y 5472: rellenas un formulario guiado, lo revisamos y lo pasamos a contables autorizados.",
  },
];

export function Path() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-6 grid-cols-1 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <Eyebrow>El camino</Eyebrow>
            <h2 className="mt-4 text-4xl leading-[1.02] font-bold md:text-6xl">
              Cuatro pasos. <span className="font-serif font-normal italic">Cero agobios.</span>
            </h2>
          </div>
          <p className="text-lg text-tinta/70 md:col-span-5">
            Tener una empresa en Estados Unidos no tiene por qué parecer una oposición. Este es el
            recorrido, de la primera conversación a tu cita anual con el IRS.
          </p>
        </div>

        <ol className="relative mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <svg
            aria-hidden="true"
            className="absolute top-10 right-0 left-0 hidden h-4 w-full text-chancla/40 lg:block"
            preserveAspectRatio="none"
            viewBox="0 0 100 4"
          >
            <line
              x1="0"
              y1="2"
              x2="100"
              y2="2"
              stroke="currentColor"
              strokeWidth="0.6"
              strokeDasharray="1.2 1.6"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          {pasos.map((paso, i) => (
            <Reveal as="li" key={paso.n} delay={i * 110} className="relative">
              <div className="group relative h-full rounded-3xl border border-tinta/10 bg-card p-7 transition-all duration-500 hover:-translate-y-1 hover:border-chancla/40 hover:shadow-[0_24px_48px_-28px_rgba(19,41,61,0.4)]">
                <span className="relative z-10 grid size-14 place-items-center rounded-2xl bg-arena font-display text-xl font-extrabold text-chancla ring-1 ring-tinta/10 transition-colors duration-500 group-hover:bg-chancla group-hover:text-white">
                  {paso.n}
                </span>
                <h3 className="mt-6 text-2xl font-bold">{paso.titulo}</h3>
                <p className="mt-3 leading-relaxed text-tinta/70">{paso.texto}</p>
                {paso.pendiente && (
                  <Pending className="mt-4">Alcance por confirmar</Pending>
                )}
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
