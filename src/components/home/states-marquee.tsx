import { estados } from "@/lib/site";

export function StatesMarquee() {
  const row = [...estados, ...estados];
  return (
    <section
      aria-label="Estados con los que trabajamos"
      className="relative border-y border-tinta/10 bg-tinta py-5 text-arena"
    >
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-5 sm:px-8">
        <p className="hidden shrink-0 font-mono text-[0.7rem] tracking-[0.2em] text-arena/50 uppercase md:block">
          LLC registradas en
        </p>
        <div className="relative flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
          <ul className="flex w-max animate-marquee gap-8 hover:[animation-play-state:paused]">
            {row.map((estado, i) => (
              <li
                key={`${estado}-${i}`}
                aria-hidden={i >= estados.length}
                className="flex items-center gap-8 font-display text-lg font-semibold whitespace-nowrap"
              >
                {estado}
                <span aria-hidden="true" className="size-1.5 rounded-full bg-chancla" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
