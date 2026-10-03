"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Phone } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { CtaLink } from "@/components/brand/cta";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { contacto, nav } from "@/lib/site";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-500",
        scrolled
          ? "border-b border-tinta/10 bg-arena/80 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
        <Link href="/" className="group rounded-lg" aria-label="Negocios en Chanclas, inicio">
          <Logo />
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-1 lg:flex">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative rounded-full px-4 py-2 text-[0.92rem] font-medium text-tinta/75 transition-colors hover:text-tinta",
                  active && "text-tinta",
                )}
              >
                {item.label}
                {active && (
                  <span className="absolute inset-x-4 -bottom-0.5 h-0.5 rounded-full bg-chancla" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href={contacto.telefonoESP.href}
            className="inline-flex items-center gap-2 text-sm font-medium text-tinta/70 transition-colors hover:text-tinta"
          >
            <Phone className="size-4" aria-hidden="true" />
            {contacto.telefonoESP.visible}
          </a>
          <CtaLink href="/contacto" className="h-10 px-5 text-sm">
            Hablemos
          </CtaLink>
        </div>

        <Sheet>
          <SheetTrigger
            className="inline-flex size-11 items-center justify-center rounded-full ring-1 ring-tinta/15 transition hover:bg-tinta/5 lg:hidden"
            aria-label="Abrir menú"
          >
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="right" className="w-[88vw] max-w-sm bg-arena p-0">
            <div className="flex h-full flex-col p-6">
              <SheetTitle className="sr-only">Menú</SheetTitle>
              <SheetDescription className="sr-only">
                Navegación principal de Negocios en Chanclas
              </SheetDescription>
              <Logo />
              <nav aria-label="Móvil" className="mt-10 flex flex-col">
                <SheetClose
                  render={<Link href="/" />}
                  className="border-b border-tinta/10 py-4 font-display text-2xl font-bold"
                >
                  Inicio
                </SheetClose>
                {nav.map((item) => (
                  <SheetClose
                    key={item.href}
                    render={<Link href={item.href} />}
                    className="border-b border-tinta/10 py-4 font-display text-2xl font-bold"
                  >
                    {item.label}
                  </SheetClose>
                ))}
              </nav>
              <div className="mt-auto space-y-3 text-sm text-tinta/70">
                <p className="font-mono text-xs tracking-widest uppercase">Hablamos en español</p>
                <a className="block font-medium text-tinta" href={contacto.telefonoESP.href}>
                  España · {contacto.telefonoESP.visible}
                </a>
                <a className="block font-medium text-tinta" href={contacto.telefonoUSA.href}>
                  EE. UU. · {contacto.telefonoUSA.visible}
                </a>
                <a className="block font-medium text-tinta" href={`mailto:${contacto.email}`}>
                  {contacto.email}
                </a>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
