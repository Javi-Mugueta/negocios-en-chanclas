import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, Check } from "lucide-react";
import { Eyebrow } from "@/components/brand/cta";
import { CierraTuLlcForm } from "@/components/cierra-tu-llc-form";
import { cierreLlc, contacto } from "@/lib/site";

export const metadata: Metadata = {
  title: "Cierra tu LLC",
  description: `Cerramos tu LLC de Wyoming o Nuevo México de principio a fin: disolución ante el estado, 1120 y 5472 finales y cierre del EIN. ${cierreLlc.precioCompleto}.`,
};

const enlace = "font-semibold text-chancla-2 underline decoration-chancla/40 underline-offset-4";

const incluye = [
  <>
    <strong className="text-tinta">Disolución de la LLC ante su estado</strong> (<em>Articles of Dissolution</em> o{" "}
    <em>Certificate of Cancellation</em>, según el estado).
  </>,
  <>
    <strong className="text-tinta">Última declaración ante el IRS:</strong> los formularios 1120 y 5472 finales.
  </>,
  <>
    <strong className="text-tinta">Cierre del EIN</strong> ante el IRS.
  </>,
  <>
    <strong className="text-tinta">Te guiamos</strong> para cerrar la cuenta bancaria y dar de baja el registered
    agent.
  </>,
  <>
    <strong className="text-tinta">En un máximo de 30 días naturales</strong> (sin contar festivos) desde el pago,
    con la LLC cerrada y toda la documentación enviada a tu email.
  </>,
];

export default function CierraTuLlcPage() {
  return (
    <section className="relative overflow-hidden pb-24 md:pb-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -right-32 size-[38rem] rounded-full bg-[radial-gradient(circle,var(--sol)_0%,transparent_60%)] opacity-30 blur-2xl"
      />
      <div className="relative mx-auto max-w-4xl px-5 pt-12 sm:px-8 md:pt-16">
        <Eyebrow>Cierre de LLC</Eyebrow>
        <h1 className="mt-5 text-5xl leading-[0.95] font-extrabold md:text-7xl">
          Cierra tu <span className="font-serif font-normal text-chancla italic">LLC.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-tinta/70 md:text-xl">
          Si ya no usas tu LLC, dejar de pagar no la cierra: siguen corriendo tasas y obligaciones con
          el estado y con el IRS. Nos encargamos de cerrarla bien, de principio a fin.
        </p>

        <div className="mt-8">
          <p className="font-display text-4xl font-extrabold md:text-5xl">{cierreLlc.precioCompleto}</p>
          <p className="mt-3 text-tinta/80">
            Para LLC de <strong className="text-tinta">Wyoming</strong> y{" "}
            <strong className="text-tinta">Nuevo México</strong>. ¿Tu LLC es de otro estado?{" "}
            <Link href="/contacto?servicio=cierre" className={enlace}>
              Escríbenos
            </Link>{" "}
            y te damos presupuesto.
          </p>
          <p className="mt-2 text-sm text-tinta/60">
            Las tasas públicas dependen del estado donde está registrada tu LLC.
          </p>
        </div>

        <div className="mt-10 rounded-[2rem] border border-tinta/10 bg-card p-6 sm:p-8">
          <h2 className="text-2xl font-bold">Qué incluye</h2>
          <ul className="mt-5 space-y-3">
            {incluye.map((item, i) => (
              <li key={i} className="flex gap-3 text-tinta/80">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-chancla/15 text-chancla-2">
                  <Check className="size-3" strokeWidth={3} aria-hidden="true" />
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 rounded-[2rem] border-2 border-sol/70 bg-sol/15 p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-1 size-6 shrink-0 text-[#b07a00]" aria-hidden="true" />
            <h2 className="text-2xl font-bold">Antes de empezar</h2>
          </div>
          <ul className="mt-5 space-y-3">
            <li className="flex gap-3 text-tinta/85">
              <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-chancla" />
              <span>
                El servicio es para <strong>LLC de Wyoming o Nuevo México</strong> con{" "}
                <strong>un solo socio</strong> que no es ciudadano ni residente fiscal en EE. UU.
              </span>
            </li>
            <li className="flex gap-3 text-tinta/85">
              <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-chancla" />
              <span>
                Si tu LLC es <strong>de otro estado</strong> o tiene <strong>dos o más socios</strong>, no
                la contrates aquí:{" "}
                <Link href="/contacto?servicio=cierre" className={enlace}>
                  contacta con nosotros
                </Link>{" "}
                (formulario o WhatsApp{" "}
                <a href={contacto.whatsapp.espana.href} target="_blank" rel="noopener noreferrer" className={enlace}>
                  {contacto.whatsapp.espana.visible}
                </a>
                ) y te damos presupuesto.
              </span>
            </li>
            <li className="flex gap-3 text-tinta/85">
              <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-chancla" />
              <span>
                Si tu LLC <strong>no está al día</strong> (formularios de otros años sin presentar, informe
                anual del estado pendiente o registered agent dado de baja), hay que regularizarlo antes
                de cerrar. Lo revisamos y te decimos qué hace falta y cuánto cuesta antes de empezar.
              </span>
            </li>
          </ul>
        </div>

        <div className="mt-10">
          <CierraTuLlcForm />
        </div>
      </div>
    </section>
  );
}
