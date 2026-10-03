import { CtaLink, Eyebrow } from "@/components/brand/cta";
import { Faq } from "@/components/faq";

export function FaqSection() {
  return (
    <section id="preguntas" className="bg-arena-2/60 py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <Eyebrow>Preguntas frecuentes</Eyebrow>
            <h2 className="mt-4 text-4xl leading-[1.02] font-bold md:text-5xl">
              Lo que todo el mundo{" "}
              <span className="font-serif font-normal italic">pregunta.</span>
            </h2>
            <p className="mt-5 text-tinta/70">
              ¿No está tu duda? Pregúntanos tal cual te salga. Las preguntas raras son nuestras
              favoritas.
            </p>
            <CtaLink href="/contacto" variant="dark" className="mt-8">
              Preguntar
            </CtaLink>
          </div>
        </div>
        <div className="lg:col-span-8">
          <Faq />
        </div>
      </div>
    </section>
  );
}
