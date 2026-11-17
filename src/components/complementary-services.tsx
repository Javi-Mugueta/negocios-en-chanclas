import { CtaLink } from "@/components/brand/cta";
import { serviciosComplementarios } from "@/lib/site";

export function ComplementaryServices() {
  return (
    <div className="mt-16">
      <h3 className="text-center text-2xl font-bold md:text-3xl">Servicios complementarios</h3>
      <ul className="mt-8 grid gap-5 md:grid-cols-3">
        {serviciosComplementarios.map((s) => (
          <li
            key={s.id}
            className="flex h-full flex-col rounded-[2rem] border border-tinta/10 bg-card p-7"
          >
            <h4 className="text-xl font-bold">{s.nombre}</h4>
            <p className="mt-3 flex-1 leading-relaxed text-tinta/70">{s.texto}</p>
            <CtaLink href={s.href} variant="dark" className="mt-7 w-full">
              {s.cta}
            </CtaLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
