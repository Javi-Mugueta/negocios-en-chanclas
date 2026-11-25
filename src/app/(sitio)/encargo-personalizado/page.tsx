import type { Metadata } from "next";
import { Eyebrow } from "@/components/brand/cta";
import { EncargoForm } from "@/components/encargo-form";
import { planes } from "@/lib/site";

const encargo = planes.find((p) => p.id === "encargo")!;

export const metadata: Metadata = {
  title: "Encargo personalizado",
  description: "Constitución de tu sociedad en USA a medida: déjanos tu nombre y email y te contactamos.",
};

export default function EncargoPage() {
  return (
    <section className="relative overflow-hidden pb-24 md:pb-32">
      <div className="relative mx-auto max-w-3xl px-5 pt-12 sm:px-8 md:pt-16">
        <Eyebrow>{encargo.servicio}</Eyebrow>
        <h1 className="mt-5 text-5xl leading-[0.95] font-extrabold md:text-7xl">
          {encargo.nombre}
        </h1>
        <p className="mt-4 font-serif text-2xl text-chancla italic md:text-3xl">«{encargo.lema}»</p>
        <p className="mt-6 text-lg text-tinta/70">{encargo.incluye[0]}</p>
        <p className="mt-3 text-lg text-tinta/70">
          {encargo.precio}. Déjanos tu nombre y tu email y te escribimos para conocer tu caso.
        </p>
        <div className="mt-10">
          <EncargoForm />
        </div>
      </div>
    </section>
  );
}
