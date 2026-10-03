"use client";

import { useState } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { contacto } from "@/lib/site";
import { cn } from "@/lib/utils";

const opciones = [
  { value: "en-regla", label: "Presentación anual 1120 + 5472" },
  { value: "arranque", label: "Constituir una LLC" },
  { value: "cierre", label: "Cerrar mi LLC" },
  { value: "corporacion", label: "Corporación (próximamente)" },
  { value: "web", label: "Web, tienda online o SEO" },
  { value: "otra", label: "Otra cosa" },
];

type Estado = "idle" | "sending" | "sent" | "error";

const field =
  "h-12 rounded-2xl border-tinta/15 bg-white px-4 text-base shadow-none focus-visible:border-chancla focus-visible:ring-chancla/20";

export function ContactForm({ servicioInicial }: { servicioInicial?: string }) {
  const [estado, setEstado] = useState<Estado>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const inicial = opciones.some((o) => o.value === servicioInicial) ? servicioInicial : "en-regla";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setEstado("sending");
    setErrors({});
    try {
      const res = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: data.get("nombre"),
          email: data.get("email"),
          telefono: data.get("telefono"),
          servicio: data.get("servicio"),
          mensaje: data.get("mensaje"),
          consentimiento: data.get("consentimiento") === "on",
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setErrors(json.errors ?? {});
        setEstado("idle");
        toast.error("Revisa los campos marcados, porfa.");
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
      <div className="flex min-h-[28rem] flex-col items-center justify-center rounded-[2rem] bg-tinta p-10 text-center text-arena animate-in fade-in zoom-in-95 duration-500">
        <span className="grid size-16 place-items-center rounded-full bg-chancla">
          <Check className="size-8" strokeWidth={3} />
        </span>
        <h2 className="mt-6 text-3xl font-bold">¡Recibido!</h2>
        <p className="mt-3 max-w-sm text-arena/70">
          Gracias por escribirnos. Te responderemos por email lo antes posible. Mientras, tú a lo
          tuyo: chanclas y a la sombra.
        </p>
        <button
          type="button"
          onClick={() => setEstado("idle")}
          className="mt-8 text-sm font-semibold text-sol underline underline-offset-4"
        >
          Enviar otro mensaje
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="rounded-[2rem] border border-tinta/10 bg-card p-6 shadow-[0_30px_60px_-40px_rgba(19,41,61,0.4)] sm:p-9"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nombre" name="nombre" error={errors.nombre}>
          <Input id="nombre" name="nombre" autoComplete="name" required className={field} aria-invalid={!!errors.nombre} />
        </Field>
        <Field label="Email" name="email" error={errors.email}>
          <Input id="email" name="email" type="email" autoComplete="email" required className={field} aria-invalid={!!errors.email} />
        </Field>
        <Field label="Teléfono" name="telefono" optional error={errors.telefono}>
          <Input id="telefono" name="telefono" type="tel" autoComplete="tel" className={field} aria-invalid={!!errors.telefono} />
        </Field>
        <Field label="¿Qué necesitas?" name="servicio" error={errors.servicio}>
          <select
            id="servicio"
            name="servicio"
            defaultValue={inicial}
            className={cn(field, "w-full appearance-none border bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 20 20%22 fill=%22%2313293d%22><path d=%22M5.5 7.5 10 12l4.5-4.5%22 stroke=%22%2313293d%22 stroke-width=%221.6%22 fill=%22none%22 stroke-linecap=%22round%22/></svg>')] bg-[length:1.1rem] bg-[right_1rem_center] bg-no-repeat pr-10 outline-none focus-visible:ring-3")}
          >
            {opciones.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="mt-5">
        <Field label="Cuéntanos" name="mensaje" error={errors.mensaje}>
          <Textarea
            id="mensaje"
            name="mensaje"
            rows={5}
            required
            placeholder="Por ejemplo: tengo una LLC en New Mexico desde el año pasado y es mi primera presentación…"
            className={cn(field, "h-auto min-h-36 py-3")}
            aria-invalid={!!errors.mensaje}
          />
        </Field>
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
          No hemos podido enviar tu mensaje. Prueba de nuevo o escríbenos a{" "}
          <a className="font-semibold underline" href={`mailto:${contacto.email}`}>
            {contacto.email}
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
            <Loader2 className="size-4 animate-spin" /> Enviando…
          </>
        ) : (
          <>
            Enviar mensaje
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </>
        )}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  optional,
  error,
  children,
}: {
  label: string;
  name: string;
  optional?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-sm font-semibold text-tinta">
        {label}
        {optional && <span className="font-normal text-tinta/45"> (opcional)</span>}
      </Label>
      {children}
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
    </div>
  );
}
