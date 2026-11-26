"use client";

import { useRef, useState } from "react";
import { ArrowRight, CreditCard, Loader2, Lock, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { CtaLink } from "@/components/brand/cta";
import { Honeypot } from "@/components/honeypot";
import { claseSelect } from "@/components/select-class";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { leerAtribucion } from "@/lib/atribucion";
import { avisoEmailPago, cierreLlc, contacto, enlaceStripe } from "@/lib/site";
import { cn } from "@/lib/utils";

type Estado = "idle" | "sending" | "pago" | "error";

const field =
  "h-12 rounded-2xl border-tinta/15 bg-white px-4 text-base shadow-none focus-visible:border-chancla focus-visible:ring-chancla/20";

const ESTADOS = [
  { value: "wyoming", label: "Wyoming" },
  { value: "nuevo-mexico", label: "Nuevo México" },
  { value: "otro", label: "Otro estado" },
];
const SOCIOS = [
  { value: "uno", label: "Solo yo" },
  { value: "varios", label: "Dos o más" },
];
const SI_NO = [
  { value: "si", label: "Sí" },
  { value: "no", label: "No" },
  { value: "no-se", label: "No lo sé" },
];
const CUANDO = [
  { value: "cuanto-antes", label: "Cuanto antes" },
  { value: "final-ano", label: "A final de año" },
  { value: "otra", label: "Otra fecha" },
];

const CHECKS = [
  { name: "datosCorrectos", label: "Los datos son correctos y completos y soy el responsable de su veracidad." },
  {
    name: "aceptaPrecio",
    label: "Entiendo que el precio es 467 $ más las tasas del estado, que dependen del estado de mi LLC.",
  },
] as const;

/** «123456789» → «12-3456789». */
function formatoEin(valor: string): string {
  const cifras = valor.replace(/\D/g, "").slice(0, 9);
  return cifras.length > 2 ? `${cifras.slice(0, 2)}-${cifras.slice(2)}` : cifras;
}

export function CierraTuLlcForm() {
  const [estado, setEstado] = useState<Estado>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [aviso, setAviso] = useState("");
  const [ein, setEin] = useState("");
  const [estadoLlc, setEstadoLlc] = useState("");
  const [socios, setSocios] = useState("");
  const [cuando, setCuando] = useState("");
  const [referencia, setReferencia] = useState<string | null>(null);
  const [emailPago, setEmailPago] = useState("");
  const pagoRef = useRef<HTMLHeadingElement>(null);

  const otroEstado = estadoLlc === "otro";
  const variosSocios = !otroEstado && socios === "varios";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (otroEstado || variosSocios) return;
    const form = e.currentTarget;
    const data = new FormData(form);
    const valor = (k: string) => String(data.get(k) ?? "");
    setEstado("sending");
    setErrors({});
    setAviso("");
    try {
      const res = await fetch("/api/cierra-tu-llc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: valor("nombre"),
          email: valor("email"),
          telefono: valor("telefono"),
          paisResidencia: valor("paisResidencia"),
          nombreLlc: valor("nombreLlc"),
          estadoConstitucion: valor("estadoConstitucion"),
          ein: valor("ein"),
          fechaConstitucion: valor("fechaConstitucion"),
          socios: valor("socios"),
          formulariosPrevios: valor("formulariosPrevios"),
          agenteAlDia: valor("agenteAlDia"),
          cuentas: valor("cuentas"),
          cuando: valor("cuando"),
          cuandoOtra: valor("cuandoOtra"),
          notas: valor("notas"),
          datosCorrectos: data.get("datosCorrectos") === "on",
          aceptaPrecio: data.get("aceptaPrecio") === "on",
          consentimiento: data.get("consentimiento") === "on",
          nec_hp: valor("nec_hp"),
          ...leerAtribucion(),
        }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        errors?: Record<string, string>;
        error?: string;
        id?: string | null;
      };
      if (!res.ok) {
        if (json.errors && Object.keys(json.errors).length > 0) {
          setErrors(json.errors);
          setEstado("idle");
          toast.error("Revisa los campos marcados, porfa.");
          const primero = Object.keys(json.errors)[0];
          form.querySelector<HTMLElement>(`[name="${primero}"]`)?.focus();
          return;
        }
        setAviso(json.error ?? "");
        setEstado("error");
        return;
      }
      setReferencia(json.id ?? null);
      setEmailPago(valor("email").trim().toLowerCase());
      setEstado("pago");
      form.reset();
      setEin("");
      window.scrollTo({ top: 0, behavior: "smooth" });
      requestAnimationFrame(() => pagoRef.current?.focus());
    } catch {
      setEstado("error");
    }
  }

  if (estado === "pago") {
    return (
      <div className="rounded-[2rem] bg-tinta p-7 text-arena animate-in fade-in zoom-in-95 duration-500 sm:p-10">
        <span className="grid size-14 place-items-center rounded-full bg-chancla">
          <CreditCard className="size-7" aria-hidden="true" />
        </span>
        <p className="mt-6 font-mono text-xs tracking-[0.18em] text-sol uppercase">Datos recibidos · Último paso</p>
        <h2 ref={pagoRef} tabIndex={-1} className="mt-3 text-3xl font-bold outline-none md:text-4xl">
          Abona {cierreLlc.precio} para que cerremos tu LLC
        </h2>
        <p className="mt-4 max-w-xl text-arena/75">
          Hemos guardado tus datos. Para completar la contratación del servicio, paga {cierreLlc.precio} con
          tarjeta en Stripe.
        </p>
        <a
          href={enlaceStripe(cierreLlc.pago, { id: referencia, email: emailPago })}
          className="group mt-8 inline-flex h-13 w-full items-center justify-center gap-2 rounded-full bg-chancla px-7 font-semibold text-white shadow-[0_8px_24px_-10px_var(--chancla)] transition-all duration-300 hover:bg-chancla-2 focus-visible:ring-4 focus-visible:ring-chancla/30 focus-visible:outline-none sm:w-auto"
        >
          Pagar {cierreLlc.precio}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </a>
        {emailPago && <p className="mt-4 max-w-xl text-sm text-arena/85">{avisoEmailPago(emailPago)}</p>}
        <p className="mt-6 max-w-xl text-sm text-arena/65">{cierreLlc.avisoPago}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="relative space-y-8 rounded-[2rem] border border-tinta/10 bg-card p-6 shadow-[0_30px_60px_-40px_rgba(19,41,61,0.4)] sm:p-9"
    >
      <Honeypot />

      <Grupo titulo="Tus datos">
        <Field label="Nombre y apellidos" name="nombre" error={errors.nombre} wide>
          <Input id="nombre" name="nombre" autoComplete="name" maxLength={120} required className={field} aria-invalid={!!errors.nombre} />
        </Field>
        <Field label="Email" name="email" error={errors.email}>
          <Input id="email" name="email" type="email" autoComplete="email" maxLength={200} required className={field} aria-invalid={!!errors.email} />
        </Field>
        <Field label="Teléfono con WhatsApp" name="telefono" error={errors.telefono}>
          <Input id="telefono" name="telefono" type="tel" autoComplete="tel" maxLength={40} required className={field} aria-invalid={!!errors.telefono} />
        </Field>
        <Field label="País de residencia" name="paisResidencia" error={errors.paisResidencia} wide>
          <Input id="paisResidencia" name="paisResidencia" autoComplete="country-name" maxLength={80} required className={field} aria-invalid={!!errors.paisResidencia} />
        </Field>
      </Grupo>

      <Grupo titulo="Tu LLC">
        <Field label="Nombre de la LLC" hint="Terminado en «LLC»." name="nombreLlc" error={errors.nombreLlc}>
          <Input id="nombreLlc" name="nombreLlc" maxLength={120} required placeholder="Mi Empresa LLC" className={field} aria-invalid={!!errors.nombreLlc} />
        </Field>
        <Field label="Estado de constitución" name="estadoConstitucion" error={errors.estadoConstitucion}>
          <Desplegable
            name="estadoConstitucion"
            opciones={ESTADOS}
            value={estadoLlc}
            onChange={setEstadoLlc}
            invalid={!!errors.estadoConstitucion}
          />
        </Field>
        {otroEstado && (
          <Desvio>
            Por este precio cerramos LLC de Wyoming y Nuevo México. Si tu LLC es de otro estado, contacta con
            nosotros y te damos presupuesto.
          </Desvio>
        )}
        <div hidden={otroEstado} className={otroEstado ? "hidden" : "contents"}>
          <Field label="EIN" hint="Formato XX-XXXXXXX." name="ein" error={errors.ein}>
            <Input
              id="ein"
              name="ein"
              inputMode="numeric"
              autoComplete="off"
              required
              placeholder="12-3456789"
              pattern="\d{2}-\d{7}"
              value={ein}
              onChange={(e) => setEin(formatoEin(e.target.value))}
              className={field}
              aria-invalid={!!errors.ein}
            />
          </Field>
          <Field label="Fecha de constitución" name="fechaConstitucion" error={errors.fechaConstitucion}>
            <Input id="fechaConstitucion" name="fechaConstitucion" type="date" required className={field} aria-invalid={!!errors.fechaConstitucion} />
          </Field>
          <Field label="Número de socios" name="socios" error={errors.socios}>
            <Desplegable name="socios" opciones={SOCIOS} value={socios} onChange={setSocios} invalid={!!errors.socios} />
          </Field>
          {variosSocios && (
            <Desvio>
              Si tu LLC tiene dos o más socios, no la contrates aquí: contacta con nosotros y te damos
              presupuesto.
            </Desvio>
          )}
        </div>
      </Grupo>

      <div hidden={otroEstado || variosSocios} className="space-y-8">
        <Grupo titulo="Situación actual">
          <Field
            label="¿Has presentado los formularios 1120/5472 de todos los años anteriores?"
            name="formulariosPrevios"
            error={errors.formulariosPrevios}
            wide
          >
            <Desplegable name="formulariosPrevios" opciones={SI_NO} invalid={!!errors.formulariosPrevios} />
          </Field>
          <Field
            label="¿Tienes el registered agent activo y el informe anual del estado al día?"
            name="agenteAlDia"
            error={errors.agenteAlDia}
            wide
          >
            <Desplegable name="agenteAlDia" opciones={SI_NO} invalid={!!errors.agenteAlDia} />
          </Field>
          <Field
            label="¿Qué cuentas tiene abiertas la LLC?"
            hint="Bancos, Stripe, PayPal, etc."
            name="cuentas"
            error={errors.cuentas}
            wide
          >
            <Input id="cuentas" name="cuentas" maxLength={500} required className={field} aria-invalid={!!errors.cuentas} />
          </Field>
          <Field label="¿Cuándo quieres cerrarla?" name="cuando" error={errors.cuando}>
            <Desplegable name="cuando" opciones={CUANDO} value={cuando} onChange={setCuando} invalid={!!errors.cuando} />
          </Field>
          {cuando === "otra" && (
            <Field label="Fecha" name="cuandoOtra" error={errors.cuandoOtra}>
              <Input id="cuandoOtra" name="cuandoOtra" maxLength={120} required className={field} aria-invalid={!!errors.cuandoOtra} />
            </Field>
          )}
          <Field
            label="¿Algo más que debamos saber?"
            hint="Cartas o multas del IRS, deudas pendientes, contratos en vigor…"
            name="notas"
            error={errors.notas}
            optional
            wide
          >
            <Textarea
              id="notas"
              name="notas"
              rows={4}
              maxLength={4000}
              className="rounded-2xl border-tinta/15 bg-white px-4 py-3 text-base shadow-none focus-visible:border-chancla focus-visible:ring-chancla/20"
              aria-invalid={!!errors.notas}
            />
          </Field>
        </Grupo>

        <fieldset className="space-y-3 rounded-[1.5rem] bg-arena/70 p-5">
          <legend className="sr-only">Confirmaciones obligatorias</legend>
          {CHECKS.map((c) => (
            <Check key={c.name} name={c.name} error={errors[c.name]}>
              {c.label}
            </Check>
          ))}
          <Check name="consentimiento" error={errors.consentimiento}>
            Acepto que Negocios en Chanclas use estos datos para preparar y tramitar el cierre de mi LLC,
            según su{" "}
            <a href="/legal" className="font-medium text-tinta underline underline-offset-2">
              política de privacidad
            </a>
            .
          </Check>
        </fieldset>

        {estado === "error" && (
          <p role="alert" className="rounded-2xl bg-destructive/10 p-4 text-sm text-destructive">
            {aviso || "No hemos podido guardar tus datos."}{" "}
            <a className="font-semibold underline" href={contacto.whatsapp.espana.href} target="_blank" rel="noopener noreferrer">
              Abrir WhatsApp
            </a>
            .
          </p>
        )}

        <div>
          <button
            type="submit"
            disabled={estado === "sending"}
            className="group inline-flex h-13 w-full items-center justify-center gap-2 rounded-full bg-chancla px-7 font-semibold text-white shadow-[0_8px_24px_-10px_var(--chancla)] transition-all duration-300 hover:bg-chancla-2 focus-visible:ring-4 focus-visible:ring-chancla/30 focus-visible:outline-none disabled:opacity-70 sm:w-auto"
          >
            {estado === "sending" ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Guardando…
              </>
            ) : (
              <>
                Proceder al pago
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </>
            )}
          </button>
          <p className="mt-4 flex items-start gap-2 text-sm text-tinta/65">
            <Lock className="mt-0.5 size-4 shrink-0 text-chancla-2" aria-hidden="true" />
            <span>{cierreLlc.avisoPago}</span>
          </p>
        </div>
      </div>
    </form>
  );
}

function Desvio({ children }: { children: React.ReactNode }) {
  return (
    <div role="status" className="rounded-[1.5rem] border-2 border-sol/70 bg-sol/15 p-5 sm:col-span-2">
      <p className="text-tinta/85">{children}</p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <CtaLink href="/contacto?servicio=cierre">Contactar con nosotros</CtaLink>
        <a
          href={contacto.whatsapp.espana.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 font-semibold text-tinta ring-1 ring-tinta/20 transition hover:bg-tinta/5"
        >
          <MessageCircle className="size-4" aria-hidden="true" />
          WhatsApp {contacto.whatsapp.espana.visible}
        </a>
      </div>
    </div>
  );
}

function Desplegable({
  name,
  opciones,
  value,
  onChange,
  invalid,
}: {
  name: string;
  opciones: { value: string; label: string }[];
  value?: string;
  onChange?: (v: string) => void;
  invalid: boolean;
}) {
  const controlado = value !== undefined && onChange;
  return (
    <select
      id={name}
      name={name}
      required
      {...(controlado ? { value, onChange: (e) => onChange(e.target.value) } : { defaultValue: "" })}
      className={cn(field, claseSelect)}
      aria-invalid={invalid}
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
  );
}

function Grupo({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="text-xl font-bold text-tinta">{titulo}</legend>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function Check({ name, error, children }: { name: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-sm text-tinta/80">
      <input
        type="checkbox"
        name={name}
        required
        className="mt-0.5 size-5 shrink-0 rounded accent-[var(--chancla)]"
        aria-invalid={!!error}
      />
      <span>
        {children}
        {error && <span className="mt-1 block font-medium text-destructive">{error}</span>}
      </span>
    </label>
  );
}

function Field({
  label,
  hint,
  name,
  error,
  wide,
  optional,
  children,
}: {
  label: string;
  hint?: string;
  name: string;
  error?: string;
  wide?: boolean;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-2", wide && "sm:col-span-2")}>
      <Label htmlFor={name} className="text-sm font-semibold text-tinta">
        {label}
        {optional && <span className="ml-1 font-normal text-tinta/50">(opcional)</span>}
      </Label>
      {hint && <p className="-mt-1 text-xs text-tinta/55">{hint}</p>}
      {children}
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
    </div>
  );
}
