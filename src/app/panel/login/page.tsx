import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { LoginForm } from "@/components/panel/login-form";
import { sesionActual } from "@/lib/sesion-servidor";

export const metadata: Metadata = { title: "Acceso" };

export default async function LoginPage() {
  const sesion = await sesionActual();
  if (sesion) redirect("/panel");

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-[2rem] border border-tinta/10 bg-card p-8 shadow-[0_30px_60px_-40px_rgba(19,41,61,0.45)]">
        <Logo />
        <p className="mt-6 font-mono text-xs tracking-[0.16em] text-chancla-2 uppercase">Panel privado</p>
        <h1 className="mt-2 text-3xl font-bold">Consultas de Negocios en Chanclas</h1>
        <p className="mt-2 text-sm text-tinta/65">Solo para el equipo. Esta página no se indexa.</p>
        <LoginForm />
      </div>
    </div>
  );
}
