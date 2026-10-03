import { CtaLink } from "@/components/brand/cta";
import { ChanclaMark } from "@/components/brand/logo";

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-2xl flex-col items-center px-5 py-28 text-center">
      <ChanclaMark className="size-24 animate-float [--r:-8deg]" />
      <p className="mt-8 font-mono text-sm tracking-[0.2em] text-chancla-2 uppercase">Error 404</p>
      <h1 className="mt-3 text-5xl font-extrabold md:text-6xl">
        Esta página se fue <span className="font-serif font-normal italic">a la playa.</span>
      </h1>
      <p className="mt-5 text-lg text-tinta/70">
        No encontramos lo que buscas. Puede que el enlace haya cambiado o que nunca existiera.
      </p>
      <CtaLink href="/" className="mt-10">
        Volver al inicio
      </CtaLink>
    </section>
  );
}
