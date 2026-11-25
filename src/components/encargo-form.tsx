"use client";

import { useState } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Honeypot } from "@/components/honeypot";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { leerAtribucion } from "@/lib/atribucion";
import { contacto } from "@/lib/site";

type Estado = "idle" | "sending" | "sent" | "error";

const field =
  "h-12 rounded-2xl border-tinta/15 bg-white px-4 text-base shadow-none focus-visible:border-chancla focus-visible:ring-chancla/20";

export function EncargoForm() {
  const [estado, setEstado] = useState<Estado>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [aviso, setAviso] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setEstado("sending");
    setErrors({});
    setAviso("");
    try {
      const res = await fetch("/api/encargo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: data.get("nombre"),
          email: data.get("email"),
          consentimiento: data.get("consentimiento") === "on",
          nec_hp: data.get("nec_hp") ?? "",
          ...leerAtribucion(),
        }),
      });
      const json = (await res.json().catch(() => ({}))) as { errors?: Record<string, string>; error?: string };
      if (!res.ok) {
        if (json.errors && Object.keys(json.errors).length > 0) {
          setErrors(json.errors);
          setEstado("idle");
          toast.error("Revisa los campos marcados, porfa.");
          return;
        }
        setAviso(json.error ?? "");
        setEstado("error");
        return;
      }
      setEstado("sent");
      form.reset();
    } catch {
      setEstado("error");
    }
  }

  if (estado === "sent") {
    return (
      <div className="flex flex-col items-center justify-center rounded-[2rem] bg-tinta p-10 text-center text-arena animate-in fade-in zoom-in-95 duration-500">
        <span className="grid size-16 place-items-center rounded-full bg-chancla">
          <Check className="size-8" strokeWidth={3} aria-hidden="true" />
        </span>
        <h2 className="mt-6 text-3xl font-bold">¡Recibido!</h2>
        <p className="mt-3 max-w-sm text-arena/70">
          Gracias. Te escribiremos por email para conocer tu caso y prepararte una propuesta.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="relative rounded-[2rem] border border-tinta/10 bg-card p-6 shadow-[0_30px_60px_-40px_rgba(19,41,61,0.4)] sm:p-9"
    >
      <Honeypot />
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="nombre" className="text-sm font-semibold text-tinta">
            Nombre
          </Label>
          <Input id="nombre" name="nombre" autoComplete="name" maxLength={120} required className={field} aria-invalid={!!errors.nombre} />
          {errors.nombre && <p className="text-sm font-medium text-destructive">{errors.nombre}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-semibold text-tinta">
            Email
          </Label>
          <Input id="email" name="email" type="email" autoComplete="email" maxLength={200} required className={field} aria-invalid={!!errors.email} />
          {errors.email && <p className="text-sm font-medium text-destructive">{errors.email}</p>}
        </div>
      </div>

      <label className="mt-6 flex cursor-pointer items-start gap-3 text-sm text-tinta/70">
        <input
          type="checkbox"
          name="consentimiento"
          className="mt-0.5 size-5 shrink-0 rounded accent-[var(--chancla)]"
          aria-invalid={!!errors.consentimiento}
        />
        <span>
          Acepto que Negocios en Chanclas use estos datos para responder a mi consulta, según su{" "}
          <a href="/legal" className="font-medium text-tinta underline underline-offset-2">
            política de privacidad
          </a>
          .
          {errors.consentimiento && (
            <span className="mt-1 block font-medium text-destructive">{errors.consentimiento}</span>
          )}
        </span>
      </label>

      {estado === "error" && (
        <p role="alert" className="mt-5 rounded-2xl bg-destructive/10 p-4 text-sm text-destructive">
          {aviso || "No hemos podido guardar tus datos."}{" "}
          <a className="font-semibold underline" href={contacto.whatsapp.espana.href} target="_blank" rel="noopener noreferrer">
            Abrir WhatsApp
          </a>
          .
        </p>
      )}

      <button
        type="submit"
        disabled={estado === "sending"}
        className="group mt-7 inline-flex h-13 w-full items-center justify-center gap-2 rounded-full bg-chancla px-7 font-semibold text-white shadow-[0_8px_24px_-10px_var(--chancla)] transition-all duration-300 hover:bg-chancla-2 focus-visible:ring-4 focus-visible:ring-chancla/30 focus-visible:outline-none disabled:opacity-70 sm:w-auto"
      >
        {estado === "sending" ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Enviando…
          </>
        ) : (
          <>
            Quiero que me contactéis
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </>
        )}
      </button>
    </form>
  );
}
