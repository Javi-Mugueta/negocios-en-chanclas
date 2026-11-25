import { Suspense } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { GuardarUtm } from "@/components/guardar-utm";
import { navegacion } from "@/lib/site";
import { formulariosVisibles } from "@/lib/visibilidad";

export default async function SitioLayout({ children }: { children: React.ReactNode }) {
  const nav = navegacion(await formulariosVisibles());
  return (
    <>
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-full focus:bg-tinta focus:px-4 focus:py-2 focus:text-arena"
      >
        Saltar al contenido
      </a>
      <SiteHeader nav={nav} />
      <main id="contenido" className="flex-1">
        {children}
      </main>
      <SiteFooter nav={nav} />
      <Suspense fallback={null}>
        <GuardarUtm />
      </Suspense>
    </>
  );
}
