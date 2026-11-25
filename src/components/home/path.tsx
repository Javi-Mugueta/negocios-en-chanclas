import { Eyebrow } from "@/components/brand/cta";
import { Reveal } from "@/components/reveal";

const pasos = [
  {
    n: "01",
    titulo: "Contactas con nosotros",
    texto: "Nos cuentas tu idea, caso, necesidades, inquietudes y validamos tu modelo.",
  },
  {
    n: "02",
    titulo: "Elegimos la estructura correcta para ti",
    texto: "Nos aseguramos de que la LLC es para ti y que no vas a tirar ni tiempo ni dinero.",
  },
  {
    n: "03",
    titulo: "Abrimos tu LLC",
    texto:
      "En los términos estipulados, a tu medida y según tus necesidades, dándote lo que necesitas, ni más ni menos.",
  },
  {
    n: "04",
    titulo: "Cada año, en regla",
    texto:
      "Estamos ahí, año tras año, presentando el Compliance necesario, manteniendo tu set up y no dejando que incurras en irregularidades en EE. UU.",
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
          <div className="md:col-span-5">
            <p className="text-lg text-tinta/70">
              Tu empresa en Estados Unidos abierta en menos de un mes, con una cuenta bancaria
              asegurada* y abierta por un profesional. Acompañamiento real durante toda la vida útil
              de tu negocio.
            </p>
            <p className="mt-3 text-xs text-tinta/55">
              *Servicio adicional, no incluido en ningún plan. Se contrata aparte.
            </p>
          </div>
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
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
