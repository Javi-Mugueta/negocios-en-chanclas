import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { contacto, nav } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-tinta text-arena">
      <div className="mx-auto max-w-7xl px-5 pt-20 pb-10 sm:px-8">
        <div className="grid gap-12 grid-cols-1 md:grid-cols-12">
          <div className="md:col-span-5">
            <Logo tone="light" />
            <p className="mt-6 max-w-sm text-arena/70">
              Gestión de LLC en Estados Unidos, explicada en español y sin prisas. Tú pones la
              idea; el papeleo lo llevamos con calma.
            </p>
          </div>

          <div className="md:col-span-3">
            <h2 className="font-mono text-xs font-medium tracking-[0.18em] text-arena/50 uppercase">
              Navegar
            </h2>
            <ul className="mt-5 space-y-3">
              <li>
                <Link className="text-arena/85 transition hover:text-chancla" href="/">
                  Inicio
                </Link>
              </li>
              {nav.map((item) => (
                <li key={item.href}>
                  <Link className="text-arena/85 transition hover:text-chancla" href={item.href}>
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link className="text-arena/85 transition hover:text-chancla" href="/legal">
                  Avisos legales
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <h2 className="font-mono text-xs font-medium tracking-[0.18em] text-arena/50 uppercase">
              Contacto
            </h2>
            <ul className="mt-5 space-y-3 text-arena/85">
              <li>
                <a className="transition hover:text-chancla" href={`mailto:${contacto.email}`}>
                  {contacto.email}
                </a>
              </li>
              <li>
                <a className="transition hover:text-chancla" href={contacto.telefonoESP.href}>
                  España · {contacto.telefonoESP.visible}
                </a>
              </li>
              <li>
                <a className="transition hover:text-chancla" href={contacto.telefonoUSA.href}>
                  EE. UU. · {contacto.telefonoUSA.visible}
                </a>
              </li>
              <li className="pt-2 text-sm text-arena/60">
                {contacto.direccion.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </li>
            </ul>
          </div>
        </div>

        <p
          aria-hidden="true"
          className="mt-20 font-display text-[18vw] leading-[0.8] font-extrabold tracking-tighter text-arena/[0.06] select-none md:text-[11.5rem]"
        >
          en chanclas
        </p>

        <div className="mt-8 flex flex-col gap-3 border-t border-arena/10 pt-6 text-sm text-arena/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Negocios en Chanclas. Todos los derechos reservados.</p>
          <p>
            La información de esta web es general y no sustituye el asesoramiento fiscal o legal.
          </p>
        </div>
      </div>
    </footer>
  );
}
