import { Check, FileText, MapPin, Sun } from "lucide-react";
import { CtaLink } from "@/components/brand/cta";
import { ChanclaMark } from "@/components/brand/logo";
import { estadosDestacados } from "@/lib/site";

const pasos = [
  { label: "Estado elegido", detail: estadosDestacados.join(" · "), icon: MapPin },
  { label: "Articles of Organization", detail: "Fecha de creación localizada", icon: FileText },
  { label: "Número EIN", detail: "Listo para el IRS", icon: Check },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 right-[-10%] size-[42rem] rounded-full bg-[radial-gradient(circle_at_center,var(--sol)_0%,transparent_62%)] opacity-35 blur-2xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-[-15%] size-[30rem] rounded-full bg-[radial-gradient(circle_at_center,var(--agua)_0%,transparent_65%)] opacity-70 blur-2xl"
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pt-10 pb-20 sm:px-8 md:pt-16 grid-cols-1 lg:grid-cols-12 lg:gap-8 lg:pb-28">
        <div className="lg:col-span-7">
          <p className="inline-flex items-center gap-2 rounded-full border border-tinta/10 bg-white/60 py-1.5 pr-4 pl-2 text-sm font-medium text-tinta/80 backdrop-blur animate-in fade-in slide-in-from-bottom-2 duration-700">
            <span className="rounded-full bg-tinta px-2 py-0.5 font-mono text-[0.68rem] tracking-widest text-arena uppercase">
              LLC
            </span>
            Gestión de tu empresa en EE. UU., en español
          </p>

          <h1 className="mt-7 text-[clamp(2.75rem,7.2vw,6rem)] leading-[0.92] font-extrabold text-tinta animate-in fade-in slide-in-from-bottom-4 duration-700 [animation-delay:80ms] [animation-fill-mode:both]">
            Tu empresa en Estados Unidos,{" "}
            <span className="relative inline-block font-serif font-normal italic tracking-normal text-chancla">
              sin quitarte
              <svg
                aria-hidden="true"
                viewBox="0 0 300 20"
                preserveAspectRatio="none"
                className="absolute -bottom-1 left-0 h-3 w-full text-sol"
              >
                <path
                  d="M2 14C60 4 120 4 160 9s100 6 136-4"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </span>{" "}
            <span className="font-serif font-normal italic tracking-normal text-chancla">
              las chanclas.
            </span>
          </h1>

          <p className="mt-7 max-w-xl text-lg leading-relaxed text-tinta/75 animate-in fade-in slide-in-from-bottom-4 duration-700 [animation-delay:160ms] [animation-fill-mode:both] md:text-xl">
            Te acompañamos con tu LLC de principio a fin: elegir bien, tener los papeles en orden y
            cumplir cada año con el IRS. En español, con personas de verdad y sin letra pequeña.
          </p>

          <div className="mt-9 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700 [animation-delay:240ms] [animation-fill-mode:both] sm:flex-row">
            <CtaLink href="/empezar">Empieza aquí</CtaLink>
            <CtaLink href="/servicios" variant="ghost" arrow={false}>
              Ver servicios
            </CtaLink>
          </div>

          <ul className="mt-12 grid max-w-xl grid-cols-1 gap-x-6 gap-y-3 text-sm text-tinta/70 sm:grid-cols-3">
            {["Atención en español", "Teléfono en España y EE. UU.", "LLC de 1 o 2 miembros"].map(
              (t) => (
                <li key={t} className="flex items-center gap-2">
                  <span className="grid size-5 place-items-center rounded-full bg-chancla/15 text-chancla-2">
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                  {t}
                </li>
              ),
            )}
          </ul>
        </div>

        <div className="relative lg:col-span-5">
          <HeroCard />
        </div>
      </div>
    </section>
  );
}

function HeroCard() {
  return (
    <div className="relative mx-auto w-full max-w-md animate-in fade-in zoom-in-95 duration-1000 [animation-delay:200ms] [animation-fill-mode:both]">
      <div
        aria-hidden="true"
        className="absolute inset-0 translate-x-4 translate-y-4 rotate-3 rounded-[2rem] bg-chancla"
      />
      <div className="relative rotate-[-1.5deg] rounded-[2rem] border border-tinta/10 bg-card p-6 shadow-[0_30px_60px_-30px_rgba(19,41,61,0.45)] sm:p-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-[0.7rem] tracking-[0.2em] text-tinta/50 uppercase">
              Tu LLC
            </p>
            <p className="mt-1 font-display text-2xl font-bold">En orden, y tú en la playa</p>
          </div>
          <span className="grid size-11 place-items-center rounded-full bg-sol/30 text-[#b07a00]">
            <Sun className="size-6 animate-[spin_24s_linear_infinite]" />
          </span>
        </div>

        <ul className="mt-7 space-y-3">
          {pasos.map(({ label, detail, icon: Icon }, i) => (
            <li
              key={label}
              className="flex items-center gap-4 rounded-2xl border border-tinta/8 bg-arena/70 p-4 animate-in fade-in slide-in-from-left-3 duration-700 [animation-fill-mode:both]"
              style={{ animationDelay: `${500 + i * 140}ms` }}
            >
              <span className="grid size-10 place-items-center rounded-xl bg-white text-tinta shadow-sm">
                <Icon className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{label}</p>
                <p className="truncate text-sm text-tinta/60">{detail}</p>
              </div>
              <span className="grid size-6 place-items-center rounded-full bg-tinta text-arena">
                <Check className="size-3.5" strokeWidth={3} />
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-5 rounded-2xl bg-tinta p-5 text-arena">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[0.7rem] tracking-[0.2em] text-arena/60 uppercase">
              Cita anual con el IRS
            </p>
            <span className="rounded-full bg-chancla px-2.5 py-0.5 text-xs font-semibold">
              1120 + 5472
            </span>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-arena/15">
            <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-sol to-chancla animate-in slide-in-from-left-full duration-[1600ms] [animation-delay:900ms] [animation-fill-mode:both]" />
          </div>
          <p className="mt-3 text-sm text-arena/70">
            Datos recogidos y revisados contigo, listos para los contables autorizados.
          </p>
        </div>
      </div>

      <ChanclaMark className="absolute -top-8 -left-6 size-20 animate-float drop-shadow-lg [--r:-12deg] sm:-left-10" />
    </div>
  );
}
