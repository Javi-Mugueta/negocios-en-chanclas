import type { Metadata } from "next";
import { Eyebrow } from "@/components/brand/cta";
import { Confirmacion } from "@/components/confirmacion";
import { PLAZO } from "@/lib/site";

export const metadata: Metadata = {
  title: "Pago recibido",
  robots: { index: false },
};

/**
 * Página de vuelta tras pagar en Whop (`?servicio=`; la URL de vuelta se configura en Whop). Las cuatro piezas de la sección 0.4:
 * confirmación, qué pasa ahora, cuándo y WhatsApp.
 */
const TEXTOS: Record<string, { queAhora: string; cuando?: string; orientativo?: boolean }> = {
  apertura: {
    queAhora: "Empezamos con tu LLC: te escribimos por email con cada paso y lo que necesitemos de ti.",
    cuando: `Tu LLC estará lista en ${PLAZO}.`,
    orientativo: true,
  },
  varios: {
    queAhora:
      "Empezamos con vuestra LLC. Os escribimos con el borrador del Operating Agreement para que lo reviséis.",
    cuando: `La LLC estará lista en ${PLAZO}.`,
    orientativo: true,
  },
  formularios: {
    queAhora: "Preparamos tus formularios y te los enviamos para revisar antes de presentarlos.",
  },
  "formularios-1065": {
    queAhora: "Preparamos vuestro Form 1065 y los K-1 y os los enviamos para revisar antes de presentarlos.",
  },
  cierre: {
    queAhora: "Empezamos la disolución de tu LLC y te vamos contando cada paso por email.",
    cuando: `La LLC estará cerrada y con toda la documentación enviada en ${PLAZO}.`,
    orientativo: true,
  },
};

export default async function PagoRecibidoPage({
  searchParams,
}: {
  searchParams: Promise<{ servicio?: string }>;
}) {
  const { servicio } = await searchParams;
  const texto = (typeof servicio === "string" && TEXTOS[servicio]) || {
    queAhora: "Hemos recibido tu pago. Te escribimos por email con el siguiente paso.",
  };
  return (
    <section className="relative overflow-hidden pb-24 md:pb-32">
      <div className="relative mx-auto max-w-3xl px-5 pt-12 sm:px-8 md:pt-16">
        <Eyebrow>Pago recibido</Eyebrow>
        <h1 className="mt-5 text-5xl leading-[0.95] font-extrabold md:text-7xl">
          ¡Gracias! <span className="font-serif font-normal text-chancla italic">Ya está.</span>
        </h1>
        <div className="mt-10 rounded-[2rem] border border-tinta/10 bg-card p-7 sm:p-10">
          <Confirmacion
            titulo="¡Recibido!"
            queAhora={texto.queAhora}
            cuando={texto.cuando}
            orientativo={texto.orientativo}
          />
        </div>
      </div>
    </section>
  );
}
