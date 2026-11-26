"use client";

import { useRef, useState } from "react";
import { ArrowRight, CreditCard, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { Honeypot } from "@/components/honeypot";
import { claseSelect } from "@/components/select-class";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { leerAtribucion } from "@/lib/atribucion";
import {
  avisoEmailPago,
  contacto,
  enlaceStripe,
  estadosConstitucionDestacados,
  estadosConstitucionResto,
  formulariosLlc,
} from "@/lib/site";
import { cn } from "@/lib/utils";

type Estado = "idle" | "sending" | "pago" | "error";

const field =
  "h-12 rounded-2xl border-tinta/15 bg-white px-4 text-base shadow-none focus-visible:border-chancla focus-visible:ring-chancla/20";

const CHECKS = [
  { name: "unicoSocio", label: "Soy el único socio de la LLC" },
  { name: "resideFuera", label: "Resido fuera de EE. UU." },
  { name: "datosCorrectos", label: "Los datos son correctos y completos y soy el responsable de su veracidad" },
] as const;

/** «123456789» → «12-3456789». */
function formatoEin(valor: string): string {
  const cifras = valor.replace(/\D/g, "").slice(0, 9);
  return cifras.length > 2 ? `${cifras.slice(0, 2)}-${cifras.slice(2)}` : cifras;
}

export function FormulariosLlcForm() {
  const [estado, setEstado] = useState<Estado>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [aviso, setAviso] = useState("");
  const [ein, setEin] = useState("");
  const [referencia, setReferencia] = useState<string | null>(null);
  const [emailPago, setEmailPago] = useState("");
  const pagoRef = useRef<HTMLHeadingElement>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const valor = (k: string) => String(data.get(k) ?? "");
    setEstado("sending");
    setErrors({});
    setAviso("");
    try {
      const res = await fetch("/api/formularios-llc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: valor("nombre"),
          pasaporte: valor("pasaporte"),
          nacionalidad: valor("nacionalidad"),
          direccion: valor("direccion"),
          ciudad: valor("ciudad"),
          paisResidencia: valor("paisResidencia"),
          codigoPostal: valor("codigoPostal"),
          email: valor("email"),
          nombreLlc: valor("nombreLlc"),
          estadoConstitucion: valor("estadoConstitucion"),
          ein: valor("ein"),
          direccionLlc: valor("direccionLlc"),
          fechaConstitucion: valor("fechaConstitucion"),
          actividad: valor("actividad"),
          retiros: valor("retiros"),
          aportaciones: valor("aportaciones"),
          saldo: valor("saldo"),
          unicoSocio: data.get("unicoSocio") === "on",
          resideFuera: data.get("resideFuera") === "on",
          datosCorrectos: data.get("datosCorrectos") === "on",
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
          Abona {formulariosLlc.precio} para que preparemos tus formularios
        </h2>
        <p className="mt-4 max-w-xl text-arena/75">
          Hemos guardado tus datos. Para completar la contratación del servicio, paga{" "}
          {formulariosLlc.precio} con tarjeta en Stripe.
        </p>
        <a
          href={enlaceStripe(formulariosLlc.pago, { id: referencia, email: emailPago })}
          className="group mt-8 inline-flex h-13 w-full items-center justify-center gap-2 rounded-full bg-chancla px-7 font-semibold text-white shadow-[0_8px_24px_-10px_var(--chancla)] transition-all duration-300 hover:bg-chancla-2 focus-visible:ring-4 focus-visible:ring-chancla/30 focus-visible:outline-none sm:w-auto"
        >
          Pagar {formulariosLlc.precio}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </a>
        {emailPago && <p className="mt-4 max-w-xl text-sm text-arena/85">{avisoEmailPago(emailPago)}</p>}
        <p className="mt-6 max-w-xl text-sm text-arena/65">{formulariosLlc.avisoPago}</p>
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

      <Grupo titulo="Datos personales">
        <Field label="Nombre y apellidos" hint="Tal como aparecen en el pasaporte." name="nombre" error={errors.nombre} wide>
          <Input id="nombre" name="nombre" autoComplete="name" maxLength={120} required className={field} aria-invalid={!!errors.nombre} />
        </Field>
        <Field label="Número de pasaporte" name="pasaporte" error={errors.pasaporte}>
          <Input id="pasaporte" name="pasaporte" autoComplete="off" maxLength={30} required className={field} aria-invalid={!!errors.pasaporte} />
        </Field>
        <Field label="País de nacionalidad" hint="No siempre coincide con el de residencia." name="nacionalidad" error={errors.nacionalidad}>
          <Input id="nacionalidad" name="nacionalidad" maxLength={80} required className={field} aria-invalid={!!errors.nacionalidad} />
        </Field>
        <Field label="Dirección de residencia" hint="Calle, número, piso." name="direccion" error={errors.direccion} wide>
          <Input id="direccion" name="direccion" autoComplete="street-address" maxLength={200} required className={field} aria-invalid={!!errors.direccion} />
        </Field>
        <Field label="Ciudad de residencia" name="ciudad" error={errors.ciudad}>
          <Input id="ciudad" name="ciudad" autoComplete="address-level2" maxLength={80} required className={field} aria-invalid={!!errors.ciudad} />
        </Field>
        <Field label="País de residencia" name="paisResidencia" error={errors.paisResidencia}>
          <Input id="paisResidencia" name="paisResidencia" autoComplete="country-name" maxLength={80} required className={field} aria-invalid={!!errors.paisResidencia} />
        </Field>
        <Field label="Código postal" name="codigoPostal" error={errors.codigoPostal}>
          <Input
            id="codigoPostal"
            name="codigoPostal"
            type="text"
            inputMode="text"
            autoComplete="postal-code"
            maxLength={16}
            required
            placeholder="08001 · SW1A 1AA"
            className={field}
            aria-invalid={!!errors.codigoPostal}
          />
        </Field>
        <Field label="Email para recibir los formularios" name="email" error={errors.email}>
          <Input id="email" name="email" type="email" autoComplete="email" maxLength={200} required className={field} aria-invalid={!!errors.email} />
        </Field>
      </Grupo>

      <Grupo titulo="Tu LLC">
        <Field label="Nombre de la LLC" hint="Terminado en «LLC»." name="nombreLlc" error={errors.nombreLlc}>
          <Input id="nombreLlc" name="nombreLlc" maxLength={120} required placeholder="Mi Empresa LLC" className={field} aria-invalid={!!errors.nombreLlc} />
        </Field>
        <Field label="Estado de constitución de la LLC" name="estadoConstitucion" error={errors.estadoConstitucion}>
          <select
            id="estadoConstitucion"
            name="estadoConstitucion"
            required
            defaultValue=""
            className={cn(field, claseSelect)}
            aria-invalid={!!errors.estadoConstitucion}
          >
            <option value="" disabled>
              Elige el estado
            </option>
            {estadosConstitucionDestacados.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
            <option disabled>──────────</option>
            {estadosConstitucionResto.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </Field>
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
        <Field label="Dirección de la LLC en EE. UU." hint="Mailbox o registered agent." name="direccionLlc" error={errors.direccionLlc} wide>
          <Input id="direccionLlc" name="direccionLlc" maxLength={300} required className={field} aria-invalid={!!errors.direccionLlc} />
        </Field>
        <Field label="Fecha de constitución" hint="La encontrarás en los Articles of Organization." name="fechaConstitucion" error={errors.fechaConstitucion}>
          <Input id="fechaConstitucion" name="fechaConstitucion" type="date" required className={field} aria-invalid={!!errors.fechaConstitucion} />
        </Field>
        <Field label="Actividad, en una frase (en inglés)" name="actividad" error={errors.actividad}>
          <Input id="actividad" name="actividad" maxLength={200} required placeholder="Online marketing consulting" className={field} aria-invalid={!!errors.actividad} />
        </Field>
      </Grupo>

      <Grupo titulo="Actividad de la LLC" nota="Importes totales en dólares. Escribe 0 si no hay movimientos.">
        <Field
          label="Dinero que has sacado de la LLC para ti"
          hint="Transferencias a tu cuenta, cajero o gastos personales pagados con la tarjeta de la LLC."
          name="retiros"
          error={errors.retiros}
          wide
        >
          <Importe name="retiros" invalid={!!errors.retiros} />
        </Field>
        <Field
          label="Dinero que has transferido tú a la LLC"
          hint="Incluidos los gastos de la LLC pagados con tu dinero personal."
          name="aportaciones"
          error={errors.aportaciones}
          wide
        >
          <Importe name="aportaciones" invalid={!!errors.aportaciones} />
        </Field>
        <Field
          label="Saldo total de las cuentas de la LLC a 31 de diciembre"
          hint="El formulario 5472 lo requiere."
          name="saldo"
          error={errors.saldo}
          wide
        >
          <Importe name="saldo" invalid={!!errors.saldo} />
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
          Acepto que Negocios en Chanclas use estos datos para preparar y presentar los formularios de
          mi LLC, según su{" "}
          <a href="/legal" className="font-medium text-tinta underline underline-offset-2">
            política de privacidad
          </a>
          .
        </Check>
      </fieldset>

      {estado === "error" && (
        <p role="alert" className="rounded-2xl bg-destructive/10 p-4 text-sm text-destructive">
          {aviso || "No hemos podido guardar tus datos."}{" "}
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
          <span>
            Al continuar guardamos tus datos y te llevamos a la pantalla de pago ({formulariosLlc.precio}).{" "}
            {formulariosLlc.avisoPago}
          </span>
        </p>
      </div>
    </form>
  );
}

function Grupo({ titulo, nota, children }: { titulo: string; nota?: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="text-xl font-bold text-tinta">{titulo}</legend>
      {nota && <p className="mt-1 text-sm text-tinta/60">{nota}</p>}
      <div className="mt-5 grid gap-5 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function Importe({ name, invalid }: { name: string; invalid: boolean }) {
  return (
    <div className="relative">
      <span aria-hidden="true" className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-tinta/50">
        $
      </span>
      <Input
        id={name}
        name={name}
        inputMode="decimal"
        autoComplete="off"
        required
        placeholder="0"
        className={cn(field, "pl-8")}
        aria-invalid={invalid}
      />
    </div>
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
  children,
}: {
  label: string;
  hint?: string;
  name: string;
  error?: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-2", wide && "sm:col-span-2")}>
      <Label htmlFor={name} className="text-sm font-semibold text-tinta">
        {label}
      </Label>
      {hint && <p className="-mt-1 text-xs text-tinta/55">{hint}</p>}
      {children}
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
    </div>
  );
}
