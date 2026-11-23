import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { CerrarSesion } from "@/components/panel/cerrar-sesion";

export function PanelMarco({ csrf, children }: { csrf: string; children: React.ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-20 border-b border-tinta/10 bg-arena/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Logo />
            <span className="hidden rounded-full bg-white px-3 py-1 text-xs font-semibold text-tinta/70 ring-1 ring-tinta/10 sm:inline">
              Panel de consultas
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="hidden rounded-full px-3 py-2 text-sm font-semibold text-tinta/60 hover:text-tinta sm:inline"
            >
              Ver la web
            </Link>
            <CerrarSesion csrf={csrf} />
          </div>
        </div>
      </header>
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</div>
    </>
  );
}
