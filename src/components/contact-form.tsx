"use client";

import { useState } from "react";
import { ArrowRight, Info, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Confirmacion } from "@/components/confirmacion";
import { Honeypot } from "@/components/honeypot";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { leerAtribucion } from "@/lib/atribucion";
import { claseSelect } from "@/components/select-class";
import { avisosContacto, contacto } from "@/lib/site";
import { cn } from "@/lib/utils";

const opciones = [
  { value: "en-regla", label: "Presentación anual 1120 + 5472" },
  { value: "arranque", label: "Constituir una LLC" },
  { value: "cierre", label: "Cerrar mi LLC" },
  { value: "corporacion", label: "Corporación (C-Corp) a medida" },
  { value: "cambio-titularidad", label: "Cambio de titularidad" },
  { value: "operating-agreement", label: "Operating Agreement personalizado" },
  { value: "operaciones-societarias", label: "Operaciones societarias en USA" },
  { value: "web", label: "Web, tienda online o SEO" },
  { value: "otra", label: "Otra cosa" },
];

type Estado = "idle" | "sending" | "sent" | "error";

const field =
  "h-12 rounded-2xl border-tinta/15 bg-white px-4 text-base shadow-none focus-visible:border-chancla focus-visible:ring-chancla/20";

/** Enlaces antiguos: el encargo personalizado ahora llega como «Constituir una LLC». */
const ALIAS: Record<string, string> = { encargo: "arranque" };

export function ContactForm({ servicioInicial, mensajeInicial }: { servicioInicial?: string; mensajeInicial?: string }) {
  const [estado, setEstado] = useState<Estado>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [aviso, setAviso] = useState("");
  const pedido = servicioInicial ? (ALIAS[servicioInicial] ?? servicioInicial) : undefined;
  // Sin `?servicio=` (o con uno que no existe), el desplegable sale vacío y obliga a elegir.
  const inicial = opciones.some((o) => o.value === pedido) ? pedido! : "";
  const [servicio, setServicio] = useState(inicial);
  const avisoServicio = avisosContacto[servicio];

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setEstado("sending");
    setErrors({});
    setAviso("");
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
      setServicio(inicial);
    } catch {
      setEstado("error");
    }
  }

  if (estado === "sent") {
    return (
      <div role="status" className="flex min-h-[28rem] flex-col justify-center rounded-[2rem] bg-tinta p-10 text-arena animate-in fade-in zoom-in-95 duration-500">
        {/* Contacto: sin plazo comprometido (Santiago, 2026-11-26). */}
        <Confirmacion
          oscuro
          queAhora="Gracias por escribirnos: te escribimos para ver tu caso."
          cuando="Te responderemos por email lo antes posible. Mientras, tú a lo tuyo: chanclas y a la sombra."
        />
        <button
          type="button"
          onClick={() => setEstado("idle")}
          className="mt-8 self-start text-sm font-semibold text-sol underline underline-offset-4"
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
      className="relative rounded-[2rem] border border-tinta/10 bg-card p-6 shadow-[0_30px_60px_-40px_rgba(19,41,61,0.4)] sm:p-9"
    >
      <Honeypot />
      {avisoServicio && (
        <div role="note" className="mb-6 flex gap-3 rounded-[1.5rem] border-2 border-sol/70 bg-sol/15 p-5 text-sm text-tinta">
          <Info className="mt-0.5 size-5 shrink-0 text-chancla-2" aria-hidden="true" />
          <p>
            <strong>{avisoServicio.titulo}</strong> {avisoServicio.texto}
          </p>
        </div>
      )}
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
            value={servicio}
            onChange={(e) => setServicio(e.target.value)}
            required
            className={cn(field, claseSelect, !servicio && "text-tinta/50")}
            aria-invalid={!!errors.servicio}
          >
            <option value="" disabled>
              Elige una opción
            </option>
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
            defaultValue={mensajeInicial}
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
          <a href="/legal#privacidad" className="font-medium text-tinta underline underline-offset-2">
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
          {aviso || "No hemos podido guardar tu mensaje."}{" "}
          <a
            className="font-semibold underline"
            href={contacto.whatsapp.espana.href}
            target="_blank"
            rel="noopener noreferrer"
          >
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
