import { cn } from "@/lib/utils";

export function ChanclaMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      <g transform="rotate(-14 22 34)">
        <path
          d="M22 6c8 0 11 9 11 22s-2 30-11 30-11-17-11-30S14 6 22 6Z"
          fill="var(--chancla)"
        />
        <path
          d="M22 16 13 34M22 16l9 18"
          stroke="var(--tinta)"
          strokeWidth="3.2"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="22" cy="16" r="2.6" fill="var(--tinta)" />
      </g>
      <g transform="rotate(12 44 34)">
        <path
          d="M44 8c7.5 0 10 8.5 10 21s-2 28-10 28-10-16-10-28S36.5 8 44 8Z"
          fill="var(--tinta)"
        />
        <path
          d="M44 17l-8 16M44 17l8 16"
          stroke="var(--chancla)"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="44" cy="17" r="2.4" fill="var(--chancla)" />
      </g>
    </svg>
  );
}

export function Logo({
  className,
  tone = "dark",
}: {
  className?: string;
  tone?: "dark" | "light";
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <ChanclaMark className="size-9 transition-transform duration-500 group-hover:animate-wiggle" />
      <span
        className={cn(
          "font-display text-[1.05rem] leading-[0.95] font-extrabold tracking-tight",
          tone === "dark" ? "text-tinta" : "text-arena",
        )}
      >
        Negocios
        <span className="block font-serif text-[1.15rem] font-normal italic tracking-normal text-chancla">
          en Chanclas
        </span>
      </span>
    </span>
  );
}
