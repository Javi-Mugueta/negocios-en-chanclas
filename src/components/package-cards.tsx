import { Check } from "lucide-react";
import { CtaLink } from "@/components/brand/cta";
import { Pending } from "@/components/brand/pending";
import { Reveal } from "@/components/reveal";
import { paquetes } from "@/lib/site";
import { cn } from "@/lib/utils";

export function PackageCards() {
  return (
    <div className="grid gap-5 lg:grid-cols-3 lg:items-stretch">
      {paquetes.map((p, i) => (
        <Reveal key={p.id} delay={i * 120} className="h-full">
          <article
            id={p.id}
            className={cn(
              "relative flex h-full flex-col rounded-[2rem] p-8 transition-all duration-500 hover:-translate-y-1",
              p.destacado
                ? "bg-tinta text-arena shadow-[0_40px_80px_-40px_rgba(19,41,61,0.8)] lg:-my-4 lg:py-12"
                : "border border-tinta/10 bg-card hover:shadow-[0_24px_48px_-28px_rgba(19,41,61,0.35)]",
            )}
          >
            {p.destacado && (
              <span className="absolute -top-3.5 left-8 rounded-full bg-chancla px-3.5 py-1 text-xs font-bold tracking-wide text-white uppercase shadow-lg">
                El más pedido
              </span>
            )}
            <p
              className={cn(
                "font-mono text-xs font-medium tracking-[0.16em] uppercase",
                p.destacado ? "text-sol" : "text-chancla-2",
              )}
            >
              {p.servicio}
            </p>
            <h3 className="mt-3 text-3xl font-bold">{p.nombre}</h3>
            <p className={cn("mt-2", p.destacado ? "text-arena/70" : "text-tinta/65")}>{p.lema}</p>

            <div className="mt-7 min-h-12">
              {p.precio ? (
                <p className="font-display text-4xl font-extrabold">{p.precio}</p>
              ) : (
                <Pending size="lg">Precio pendiente</Pending>
              )}
            </div>

            <div className={cn("my-7 h-px", p.destacado ? "bg-arena/15" : "bg-tinta/10")} />

            {p.alcancePendiente && (
              <Pending className="mb-4 self-start">Alcance por confirmar</Pending>
            )}
            <ul className="flex-1 space-y-3.5">
              {p.incluye.map((item) => (
                <li key={item} className="flex gap-3">
                  <span
                    className={cn(
                      "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full",
                      p.destacado ? "bg-chancla text-white" : "bg-chancla/15 text-chancla-2",
                    )}
                  >
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                  <span className={p.destacado ? "text-arena/85" : "text-tinta/80"}>{item}</span>
                </li>
              ))}
            </ul>

            <CtaLink
              href={`/empezar?paquete=${p.id}`}
              variant={p.destacado ? "primary" : "dark"}
              className="mt-9 w-full"
            >
              {p.cta}
            </CtaLink>
          </article>
        </Reveal>
      ))}
    </div>
  );
}
