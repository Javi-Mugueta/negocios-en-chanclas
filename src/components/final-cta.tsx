import { CtaLink } from "@/components/brand/cta";
import { ChanclaMark } from "@/components/brand/logo";
import { contacto } from "@/lib/site";

export function FinalCta({
  titulo = "Pon los pies en alto.",
  subtitulo = "Del papeleo nos encargamos con calma.",
}: {
  titulo?: string;
  subtitulo?: string;
}) {
  return (
    <section className="px-3 pb-3 sm:px-5 sm:pb-5">
      <div className="relative mx-auto max-w-[96rem] overflow-hidden rounded-[2.5rem] bg-chancla px-6 py-20 text-center text-white md:py-28">
        <svg
          aria-hidden="true"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          className="absolute inset-x-0 bottom-0 h-24 w-full text-chancla-2/60"
        >
          <path
            fill="currentColor"
            d="M0 64c120-32 240-48 360-32s240 64 360 64 240-48 360-64 240 0 360 32v88H0Z"
          />
        </svg>
        <ChanclaMark className="absolute top-10 left-[8%] hidden size-20 -rotate-12 opacity-90 md:block [&_path]:[fill:white]" />
        <div className="relative mx-auto max-w-3xl">
          <h2 className="text-5xl leading-[0.95] font-extrabold md:text-7xl">
            {titulo}
            <span className="mt-2 block font-serif text-4xl font-normal italic md:text-6xl">
              {subtitulo}
            </span>
          </h2>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <CtaLink href="/empezar" variant="dark">
              Empezar ahora
            </CtaLink>
            <CtaLink
              href={`mailto:${contacto.email}`}
              variant="light"
              arrow={false}
            >
              {contacto.email}
            </CtaLink>
          </div>
        </div>
      </div>
    </section>
  );
}
