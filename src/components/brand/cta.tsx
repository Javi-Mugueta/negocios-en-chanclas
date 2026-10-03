import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const variants = {
  primary:
    "bg-chancla text-white shadow-[0_8px_24px_-10px_var(--chancla)] hover:bg-chancla-2 hover:shadow-[0_12px_28px_-10px_var(--chancla)]",
  dark: "bg-tinta text-arena hover:bg-tinta-2",
  ghost:
    "bg-transparent text-tinta ring-1 ring-tinta/20 ring-inset hover:bg-tinta/5 hover:ring-tinta/40",
  light: "bg-arena text-tinta hover:bg-white",
};

export function CtaLink({
  href,
  children,
  variant = "primary",
  arrow = true,
  className,
}: {
  href: string;
  children: React.ReactNode;
  variant?: keyof typeof variants;
  arrow?: boolean;
  className?: string;
}) {
  const external = href.startsWith("mailto:") || href.startsWith("tel:");
  const classes = cn(
    "group/cta inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full px-6 text-[0.95rem] font-semibold transition-all duration-300 focus-visible:ring-4 focus-visible:ring-chancla/30 focus-visible:outline-none active:scale-[0.98]",
    variants[variant],
    className,
  );
  const content = (
    <>
      {children}
      {arrow && (
        <ArrowRight
          aria-hidden="true"
          className="size-4 transition-transform duration-300 group-hover/cta:translate-x-1"
        />
      )}
    </>
  );
  return external ? (
    <a href={href} className={classes}>
      {content}
    </a>
  ) : (
    <Link href={href} className={classes}>
      {content}
    </Link>
  );
}

export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "inline-flex items-center gap-2 font-mono text-[0.72rem] font-medium tracking-[0.18em] text-chancla-2 uppercase",
        className,
      )}
    >
      <span aria-hidden="true" className="h-px w-6 bg-current" />
      {children}
    </p>
  );
}
