"use client";

import { useRef, useState } from "react";
import { AlertTriangle, ArrowRight, CalendarClock, CreditCard, Loader2, Lock, MessageCircle, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { CtaLink } from "@/components/brand/cta";
import { Confirmacion, PagoPorContacto } from "@/components/confirmacion";
import { Honeypot } from "@/components/honeypot";
import { claseSelect } from "@/components/select-class";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { porcentajeDe, sumaCien } from "@/lib/alta";
import { enlaceContacto } from "@/lib/asistente";
import { leerAtribucion } from "@/lib/atribucion";
import { dolares, enlacePago, id1065, precio1065 } from "@/lib/precios";
import {
  avisoEmailPago,
  contacto,
  estadosConstitucionDestacados,
  estadosConstitucionResto,
  formularios1065,
  requisitos1065,
  type ClaveRequisito1065,
} from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Form 1065 + K-1 (LLC de varios socios), según `formularios-1065.md`. Vive en /formularios-llc,
 * en la opción «Tiene varios socios». Los bloques de socio van solo aquí y en el alta de varios
 * socios del asistente, nunca en el formulario 1120/5472 de un socio.
 */

type Estado = "idle" | "sending" | "pago" | "error";
type SiNoNoSe = "" | "si" | "no" | "no-se";

type BorradorSocio1065 = {
  nombre: string;
  pasaporte: string;
  nacionalidad: string;
  direccion: string;
  porcentajeInicio: string;
  porcentajeFin: string;
  sinCambios: boolean;
  aportaciones: string;
  retiros: string;
  tieneItin: "" | "si" | "no";
  itin: string;
};

const { minSocios: MIN, maxSocios: MAX } = formularios1065;

function socioVacio(): BorradorSocio1065 {
  return {
    nombre: "",
    pasaporte: "",
    nacionalidad: "",
    direccion: "",
    porcentajeInicio: "",
    porcentajeFin: "",
    sinCambios: true,
    aportaciones: "",
    retiros: "",
    tieneItin: "",
    itin: "",
  };
}

const requisitosVacios = () =>
  Object.fromEntries(requisitos1065.map((r) => [r.clave, ""])) as Record<ClaveRequisito1065, SiNoNoSe>;

const field =
  "h-12 rounded-2xl border-tinta/15 bg-white px-4 text-base shadow-none focus-visible:border-chancla focus-visible:ring-chancla/20";

const CHECKS = [
  { name: "datosCorrectos", label: "Los datos son correctos y completos, y soy el responsable de su veracidad." },
  { name: "ningunoEeuuConfirma", label: "Ningún socio es ciudadano ni residente fiscal en EE. UU." },
  { name: "sociosAceptan", label: "Los demás socios conocen y aceptan esta solicitud." },
] as const;

/** «123456789» → «12-3456789». */
function formatoEin(valor: string): string {
  const cifras = valor.replace(/\D/g, "").slice(0, 9);
  return cifras.length > 2 ? `${cifras.slice(0, 2)}-${cifras.slice(2)}` : cifras;
}

function textoPrecio(n: number): string {
  return `${n} socios · ${dolares(precio1065(n))}`;
}

const mensajeContacto = formularios1065.mensajeContacto;

export function Formularios1065Form({ abierto }: { abierto: boolean }) {
  const [estado, setEstado] = useState<Estado>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [aviso, setAviso] = useState("");
  const [requisitos, setRequisitos] = useState(requisitosVacios);
  const [socios, setSocios] = useState<BorradorSocio1065[]>(() => [socioVacio(), socioVacio()]);
  const [ein, setEin] = useState("");
  const [bienes, setBienes] = useState<"" | "si" | "no">("");
  const [cambios, setCambios] = useState<"" | "si" | "no">("");
  const [pago, setPago] = useState<{ numSocios: number; email: string } | null>(null);
  const pagoRef = useRef<HTMLHeadingElement>(null);

  if (!abierto) return <PlazoCerrado />;

  const noCumple = Object.values(requisitos).some((v) => v === "no" || v === "no-se");

  function cambiarSocio<K extends keyof BorradorSocio1065>(i: number, k: K, v: BorradorSocio1065[K]) {
    setSocios((prev) => prev.map((s, j) => (j === i ? { ...s, [k]: v } : s)));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const valor = (k: string) => String(data.get(k) ?? "");
    setEstado("sending");
    setErrors({});
    setAviso("");
    try {
      const res = await fetch("/api/formularios-1065", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requisitos,
          nombreLlc: valor("nombreLlc"),
          estadoConstitucion: valor("estadoConstitucion"),
          ein: valor("ein"),
          direccionLlc: valor("direccionLlc"),
          fechaConstitucion: valor("fechaConstitucion"),
          actividad: valor("actividad"),
          primeraVez: valor("primeraVez"),
          nombre: valor("nombre"),
          email: valor("email"),
          telefono: valor("telefono"),
          socios: socios.map((s) => ({
            ...s,
            porcentajeFin: s.sinCambios ? s.porcentajeInicio : s.porcentajeFin,
            itin: s.tieneItin === "si" ? s.itin : "",
          })),
          ingresos: valor("ingresos"),
          gastos: valor("gastos"),
          saldoInicio: valor("saldoInicio"),
          saldoFin: valor("saldoFin"),
          bienesPrestamos: bienes,
          bienesDetalle: valor("bienesDetalle"),
          cambiosSocios: cambios,
          datosCorrectos: data.get("datosCorrectos") === "on",
          ningunoEeuuConfirma: data.get("ningunoEeuuConfirma") === "on",
          sociosAceptan: data.get("sociosAceptan") === "on",
          consentimiento: data.get("consentimiento") === "on",
          nec_hp: valor("nec_hp"),
          ...leerAtribucion(),
        }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        errors?: Record<string, string>;
        error?: string;
      };
      if (!res.ok) {
        if (json.errors && Object.keys(json.errors).length > 0) {
          setErrors(json.errors);
          setEstado("idle");
          toast.error("Revisa los campos marcados, porfa.");
          const primero = Object.keys(json.errors)[0];
          document.querySelector<HTMLElement>(`[name="${primero}"]`)?.focus();
          return;
        }
        setAviso(json.error ?? "");
        setEstado("error");
        return;
      }
      setPago({ numSocios: socios.length, email: valor("email").trim().toLowerCase() });
      setEstado("pago");
      form.reset();
      setEin("");
      setSocios([socioVacio(), socioVacio()]);
      setRequisitos(requisitosVacios());
      setBienes("");
      setCambios("");
      window.scrollTo({ top: 0, behavior: "smooth" });
      requestAnimationFrame(() => pagoRef.current?.focus());
    } catch {
      setEstado("error");
    }
  }

  if (estado === "pago" && pago) {
    const total = precio1065(pago.numSocios);
    const enlace = enlacePago(id1065(pago.numSocios));
    return (
      <div className="rounded-[2rem] bg-tinta p-7 text-arena animate-in fade-in zoom-in-95 duration-500 sm:p-10">
        <span className="grid size-14 place-items-center rounded-full bg-chancla">
          <CreditCard className="size-7" aria-hidden="true" />
        </span>
        <p className="mt-6 font-mono text-xs tracking-[0.18em] text-sol uppercase">Datos recibidos · Último paso</p>
        <h2 ref={pagoRef} tabIndex={-1} className="mt-3 text-3xl font-bold outline-none md:text-4xl">
          Abona {dolares(total)} para que preparemos vuestros formularios
        </h2>
        <p className="mt-3 text-arena/80">
          {formularios1065.nombre} · {textoPrecio(pago.numSocios)}
        </p>
        {enlace ? (
          <>
            <p className="mt-4 max-w-xl text-arena/75">
              Hemos guardado vuestros datos. Para completar la contratación del servicio, pagad {dolares(total)} con
              tarjeta en Whop.
            </p>
            <a
              href={enlace}
              className="group mt-8 inline-flex h-13 w-full items-center justify-center gap-2 rounded-full bg-chancla px-7 font-semibold text-white shadow-[0_8px_24px_-10px_var(--chancla)] transition-all duration-300 hover:bg-chancla-2 focus-visible:ring-4 focus-visible:ring-chancla/30 focus-visible:outline-none sm:w-auto"
            >
              Pagar {dolares(total)}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </a>
            {pago.email && (
              <p className="mt-4 max-w-xl text-sm text-arena/85">{avisoEmailPago(pago.email, { vosotros: true })}</p>
            )}
          </>
        ) : (
          <div className="mt-6">
            <PagoPorContacto
              email={pago.email}
              contactoHref={enlaceContacto(
                "en-regla",
                `Queremos pagar el Form 1065 + K-1 (${pago.numSocios} socios): ${dolares(total)}.`,
              )}
            />
          </div>
        )}
        <p className="mt-3 max-w-xl text-sm text-arena/75">{formularios1065.avisoPlazo}</p>
        <p className="mt-3 max-w-xl text-sm text-arena/65">{formularios1065.avisoPago}</p>
        <Confirmacion oscuro className="mt-8 border-t border-arena/15 pt-6" queAhora={formularios1065.confirmacion} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border-2 border-sol/70 bg-sol/15 p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-1 size-6 shrink-0 text-[#b07a00]" aria-hidden="true" />
          <div>
            <h3 className="text-2xl font-bold">Antes de contratar</h3>
            <p className="mt-2 text-tinta/80">
              Antes de contratar, comprueba que cumples todo esto. Si no cumples alguno o tienes dudas, escríbenos y lo
              vemos contigo:
            </p>
          </div>
        </div>
        <ol className="mt-5 space-y-5">
          {requisitos1065.map((r, i) => (
            <li key={r.clave} className="space-y-2">
              <p className="text-tinta/85">
                <span className="font-semibold">{i + 1}.</span> {r.texto}
              </p>
              <MiniRadio
                name={`requisitos.${r.clave}`}
                label={`¿Lo cumplís? (requisito ${i + 1})`}
                value={requisitos[r.clave]}
                opciones={[
                  ["si", "Sí"],
                  ["no", "No"],
                  ["no-se", "No lo sé"],
                ]}
                onChange={(v) => setRequisitos((prev) => ({ ...prev, [r.clave]: v }))}
                error={errors[`requisitos.${r.clave}`]}
                srLabel
              />
            </li>
          ))}
        </ol>
      </div>

      {noCumple ? (
        <Desvio texto={formularios1065.desvioRequisitos} />
      ) : (
        <form
          onSubmit={onSubmit}
          noValidate
          className="relative space-y-8 rounded-[2rem] border border-tinta/10 bg-card p-6 shadow-[0_30px_60px_-40px_rgba(19,41,61,0.4)] sm:p-9"
        >
          <Honeypot />

          <Grupo titulo="Tu LLC">
            <Field label="Nombre de la LLC" hint="Terminado en «LLC»." name="nombreLlc" error={errors.nombreLlc}>
              <Input id="nombreLlc" name="nombreLlc" maxLength={120} required placeholder="Mi Empresa LLC" className={field} aria-invalid={!!errors.nombreLlc} />
            </Field>
            <Field label="Estado de constitución" name="estadoConstitucion" error={errors.estadoConstitucion}>
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
            <Field label="Fecha de constitución" hint="La encontrarás en los Articles of Organization." name="fechaConstitucion" error={errors.fechaConstitucion}>
              <Input id="fechaConstitucion" name="fechaConstitucion" type="date" required className={field} aria-invalid={!!errors.fechaConstitucion} />
            </Field>
            <Field label="Dirección de la LLC en EE. UU." hint="Mailbox o registered agent." name="direccionLlc" error={errors.direccionLlc} wide>
              <Input id="direccionLlc" name="direccionLlc" maxLength={300} required className={field} aria-invalid={!!errors.direccionLlc} />
            </Field>
            <Field label="Actividad, en una frase (en inglés)" name="actividad" error={errors.actividad} wide>
              <Input id="actividad" name="actividad" maxLength={200} required placeholder="Online marketing consulting" className={field} aria-invalid={!!errors.actividad} />
            </Field>
            <div className="sm:col-span-2">
              <MiniRadio
                name="primeraVez"
                label="¿Es la primera vez que la LLC presenta el Form 1065?"
                opciones={[
                  ["si", "Sí"],
                  ["no", "No"],
                  ["no-se", "No lo sé"],
                ]}
                error={errors.primeraVez}
              />
            </div>
          </Grupo>

          <Grupo titulo="Persona de contacto" nota="¿Quién es nuestro interlocutor? A este email llegan los formularios para revisar. Puede ser uno de los socios.">
            <Field label="Nombre y apellidos" name="nombre" error={errors.nombre}>
              <Input id="nombre" name="nombre" autoComplete="name" maxLength={120} required className={field} aria-invalid={!!errors.nombre} />
            </Field>
            <Field label="Email" name="email" error={errors.email}>
              <Input id="email" name="email" type="email" autoComplete="email" maxLength={200} required className={field} aria-invalid={!!errors.email} />
            </Field>
            <Field label="Teléfono con WhatsApp" hint="Con el prefijo del país, por ejemplo +34 600 000 000." name="telefono" error={errors.telefono}>
              <Input id="telefono" name="telefono" type="tel" autoComplete="tel" maxLength={40} required placeholder="+34 600 000 000" className={field} aria-invalid={!!errors.telefono} />
            </Field>
          </Grupo>

          <fieldset>
            <legend className="text-xl font-bold text-tinta">Los socios (de {MIN} a {MAX})</legend>
            <p className="mt-1 text-sm text-tinta/60">
              Importes totales del año en dólares. Escribe 0 si no hay movimientos.
            </p>
            <ol className="mt-5 space-y-5">
              {socios.map((socio, i) => (
                <li key={i}>
                  <BloqueSocio
                    indice={i}
                    socio={socio}
                    errores={errors}
                    onCambiar={(k, v) => cambiarSocio(i, k, v)}
                    onQuitar={i >= MIN ? () => setSocios((prev) => prev.filter((_, j) => j !== i)) : undefined}
                  />
                </li>
              ))}
            </ol>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              {socios.length < MAX ? (
                <button
                  type="button"
                  onClick={() => setSocios((prev) => (prev.length < MAX ? [...prev, socioVacio()] : prev))}
                  className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold text-chancla-2 ring-1 ring-chancla/30 transition hover:bg-chancla/10 focus-visible:ring-4 focus-visible:ring-chancla/30 focus-visible:outline-none"
                >
                  <Plus className="size-4" aria-hidden="true" /> Añadir socio
                </button>
              ) : (
                <p className="text-sm text-tinta/75">
                  <a
                    href={enlaceContacto("en-regla", mensajeContacto)}
                    className="font-semibold text-chancla-2 underline decoration-chancla/40 underline-offset-4"
                  >
                    {formularios1065.masDeDiez}
                  </a>
                </p>
              )}
              <SumasPorcentajes socios={socios} />
            </div>
            <PrecioEnPantalla numSocios={socios.length} />
            {errors.socios && <p className="mt-3 text-sm font-medium text-destructive">{errors.socios}</p>}
          </fieldset>

          <Grupo titulo="Los números de la LLC del año" nota="Importes totales en dólares. Escribe 0 si no hay movimientos.">
            <Field label="Ingresos totales del año" hint="Todo lo que facturó la LLC." name="ingresos" error={errors.ingresos}>
              <Importe name="ingresos" invalid={!!errors.ingresos} />
            </Field>
            <Field label="Gastos totales del año" hint="Basta con el total." name="gastos" error={errors.gastos}>
              <Importe name="gastos" invalid={!!errors.gastos} />
            </Field>
            <Field label="Saldo total de las cuentas a 1 de enero" hint="Bancos, Stripe, PayPal…" name="saldoInicio" error={errors.saldoInicio}>
              <Importe name="saldoInicio" invalid={!!errors.saldoInicio} />
            </Field>
            <Field label="Saldo total de las cuentas a 31 de diciembre" hint="Bancos, Stripe, PayPal…" name="saldoFin" error={errors.saldoFin}>
              <Importe name="saldoFin" invalid={!!errors.saldoFin} />
            </Field>
            <div className="space-y-3 sm:col-span-2">
              <MiniRadio
                name="bienesPrestamos"
                label="¿La LLC compró algún bien de valor (equipos, vehículos…) o tiene préstamos?"
                value={bienes}
                opciones={[
                  ["si", "Sí"],
                  ["no", "No"],
                ]}
                onChange={setBienes}
                error={errors.bienesPrestamos}
              />
              {bienes === "si" && (
                <Field label="Cuéntanos" name="bienesDetalle" error={errors.bienesDetalle}>
                  <Textarea
                    id="bienesDetalle"
                    name="bienesDetalle"
                    rows={3}
                    maxLength={2000}
                    className={cn(field, "h-auto min-h-24 py-3")}
                    aria-invalid={!!errors.bienesDetalle}
                  />
                </Field>
              )}
            </div>
            <div className="sm:col-span-2">
              <MiniRadio
                name="cambiosSocios"
                label="¿Hubo cambios de socios durante el año (alguien entró, salió o vendió su parte)?"
                value={cambios}
                opciones={[
                  ["no", "No"],
                  ["si", "Sí"],
                ]}
                onChange={setCambios}
                error={cambios === "si" ? undefined : errors.cambiosSocios}
              />
            </div>
          </Grupo>

          {cambios === "si" ? (
            <Desvio texto={formularios1065.desvioCambios} claro />
          ) : (
            <>
              <fieldset className="space-y-3 rounded-[1.5rem] bg-arena/70 p-5">
                <legend className="sr-only">Confirmaciones obligatorias</legend>
                {CHECKS.map((c) => (
                  <Check key={c.name} name={c.name} error={errors[c.name]}>
                    {c.label}
                  </Check>
                ))}
                <Check name="consentimiento" error={errors.consentimiento}>
                  Acepto la{" "}
                  <a href="/legal" className="font-medium text-tinta underline underline-offset-2">
                    política de privacidad
                  </a>
                  .
                </Check>
              </fieldset>

              {estado === "error" && (
                <p role="alert" className="rounded-2xl bg-destructive/10 p-4 text-sm text-destructive">
                  {aviso || "No hemos podido guardar vuestros datos."}{" "}
                  <a className="font-semibold underline" href={contacto.whatsapp.espana.href} target="_blank" rel="noopener noreferrer">
                    Abrir WhatsApp
                  </a>
                  .
                </p>
              )}

              <div>
                <p className="mb-4 flex items-start gap-2 text-sm font-semibold text-tinta/80">
                  <CalendarClock className="mt-0.5 size-4 shrink-0 text-chancla-2" aria-hidden="true" />
                  {formularios1065.avisoPlazo}
                </p>
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
                    {formularios1065.alcance} Al continuar guardamos vuestros datos y os llevamos a la pantalla de pago (
                    {textoPrecio(socios.length)}). {formularios1065.avisoPago}
                  </span>
                </p>
              </div>
            </>
          )}
        </form>
      )}
    </div>
  );
}

/** Desvío a contacto (requisitos o cambios de socios): botón con el mensaje empezado y WhatsApp. */
function Desvio({ texto, claro = false }: { texto: string; claro?: boolean }) {
  return (
    <div
      role="status"
      className={cn("rounded-[2rem] p-6 sm:p-8", claro ? "border-2 border-sol/70 bg-sol/15 text-tinta" : "bg-tinta text-arena")}
    >
      <p className={cn("font-display text-xl font-bold", claro ? "text-tinta" : "text-arena")}>{texto}</p>
      <BotonesContacto oscuro={!claro} />
    </div>
  );
}

function PlazoCerrado() {
  return (
    <div role="status" className="rounded-[2rem] bg-tinta p-7 text-arena sm:p-10">
      <CalendarClock className="size-8 text-sol" aria-hidden="true" />
      <p className="mt-4 font-display text-2xl font-bold">{formularios1065.plazoCerrado}</p>
      <BotonesContacto oscuro />
    </div>
  );
}

function BotonesContacto({ oscuro }: { oscuro: boolean }) {
  return (
    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
      <CtaLink href={enlaceContacto("en-regla", mensajeContacto)} variant={oscuro ? "primary" : "dark"}>
        Escríbenos
      </CtaLink>
      <a
        href={contacto.whatsapp.espana.href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 font-semibold ring-1 transition",
          oscuro ? "text-arena ring-arena/30 hover:bg-arena/10" : "text-tinta ring-tinta/20 hover:bg-tinta/5",
        )}
      >
        <MessageCircle className="size-4" aria-hidden="true" />
        WhatsApp {contacto.whatsapp.espana.visible}
      </a>
    </div>
  );
}

function PrecioEnPantalla({ numSocios }: { numSocios: number }) {
  return (
    <p className="mt-5 rounded-2xl bg-tinta p-4 text-arena" aria-live="polite">
      <span className="block font-mono text-xs tracking-[0.16em] text-sol uppercase">Precio del servicio</span>
      <span className="mt-1 block font-display text-2xl font-extrabold">{textoPrecio(numSocios)}</span>
    </p>
  );
}

function SumasPorcentajes({ socios }: { socios: BorradorSocio1065[] }) {
  const inicio = socios.map((s) => porcentajeDe(s.porcentajeInicio) ?? 0);
  const fin = socios.map((s) => porcentajeDe(s.sinCambios ? s.porcentajeInicio : s.porcentajeFin) ?? 0);
  const fmt = (xs: number[]) => Number(xs.reduce((a, b) => a + b, 0).toFixed(2)).toLocaleString("es-ES");
  const ok = sumaCien(inicio) && sumaCien(fin);
  return (
    <p className={cn("text-sm font-semibold", ok ? "text-tinta/70" : "text-chancla-2")} aria-live="polite">
      Suma a 1 de enero: {fmt(inicio)} % · a 31 de diciembre: {fmt(fin)} %{ok ? " ✓" : " (cada una tiene que ser 100 %)"}
    </p>
  );
}

function BloqueSocio({
  indice,
  socio,
  errores,
  onCambiar,
  onQuitar,
}: {
  indice: number;
  socio: BorradorSocio1065;
  errores: Record<string, string>;
  onCambiar: <K extends keyof BorradorSocio1065>(k: K, v: BorradorSocio1065[K]) => void;
  onQuitar?: () => void;
}) {
  const n = (campo: string) => `socios.${indice}.${campo}`;
  const e = (campo: string) => errores[n(campo)];
  const texto = (campo: keyof BorradorSocio1065, label: string, props: React.ComponentProps<typeof Input> = {}, opciones: { hint?: string; wide?: boolean } = {}) => (
    <Field label={label} hint={opciones.hint} name={n(campo)} error={e(campo)} wide={opciones.wide}>
      <Input
        id={n(campo)}
        name={n(campo)}
        value={String(socio[campo])}
        onChange={(ev) => onCambiar(campo, ev.target.value as never)}
        className={field}
        aria-invalid={!!e(campo)}
        {...props}
      />
    </Field>
  );
  return (
    <fieldset className="rounded-[1.5rem] border border-tinta/10 bg-white/60 p-5">
      <div className="flex items-center justify-between gap-3">
        <legend className="font-display text-lg font-bold text-tinta">Socio {indice + 1}</legend>
        {onQuitar && (
          <button
            type="button"
            onClick={onQuitar}
            className="inline-flex size-9 items-center justify-center rounded-full text-tinta/60 ring-1 ring-tinta/15 transition hover:bg-tinta/5 hover:text-tinta"
            aria-label={`Quitar el socio ${indice + 1}`}
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        )}
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {texto("nombre", "Nombre y apellidos", { maxLength: 120, autoComplete: "off" }, { hint: "Tal como aparecen en el pasaporte.", wide: true })}
        {texto("pasaporte", "Número de pasaporte", { maxLength: 30, autoComplete: "off" })}
        {texto("nacionalidad", "Nacionalidad", { maxLength: 80 })}
        {texto("direccion", "Dirección completa de residencia", { maxLength: 300 }, { hint: "Calle, número, ciudad, código postal y país.", wide: true })}
        {texto("porcentajeInicio", "Participación a 1 de enero (%)", { inputMode: "decimal", maxLength: 6, placeholder: "50" })}
        <Field label="Participación a 31 de diciembre (%)" name={n("porcentajeFin")} error={socio.sinCambios ? undefined : e("porcentajeFin")}>
          <Input
            id={n("porcentajeFin")}
            name={n("porcentajeFin")}
            inputMode="decimal"
            maxLength={6}
            placeholder="50"
            value={socio.sinCambios ? socio.porcentajeInicio : socio.porcentajeFin}
            onChange={(ev) => onCambiar("porcentajeFin", ev.target.value)}
            disabled={socio.sinCambios}
            className={cn(field, "disabled:opacity-60")}
            aria-invalid={!socio.sinCambios && !!e("porcentajeFin")}
          />
          <label className="flex cursor-pointer items-center gap-2 text-sm text-tinta/75">
            <input
              type="checkbox"
              checked={socio.sinCambios}
              onChange={(ev) => onCambiar("sinCambios", ev.target.checked)}
              className="size-4 rounded accent-[var(--chancla)]"
            />
            No cambió durante el año
          </label>
        </Field>
        <Field
          label="Dinero que aportó a la LLC durante el año"
          hint="Transferencias suyas a la LLC o gastos de la LLC pagados con su dinero."
          name={n("aportaciones")}
          error={e("aportaciones")}
        >
          <Importe name={n("aportaciones")} invalid={!!e("aportaciones")} value={socio.aportaciones} onChange={(v) => onCambiar("aportaciones", v)} />
        </Field>
        <Field
          label="Dinero que sacó de la LLC para sí durante el año"
          hint="Transferencias a su cuenta, cajero o gastos personales con la tarjeta de la LLC."
          name={n("retiros")}
          error={e("retiros")}
        >
          <Importe name={n("retiros")} invalid={!!e("retiros")} value={socio.retiros} onChange={(v) => onCambiar("retiros", v)} />
        </Field>
        <div className="space-y-3 sm:col-span-2">
          <MiniRadio
            name={n("tieneItin")}
            label="¿Tiene número fiscal de EE. UU. (ITIN)? (opcional)"
            value={socio.tieneItin}
            opciones={[
              ["si", "Sí"],
              ["no", "No"],
            ]}
            onChange={(v) => onCambiar("tieneItin", v)}
          />
          {socio.tieneItin === "si" &&
            texto("itin", "ITIN", { inputMode: "numeric", maxLength: 11, placeholder: "9XX-XX-XXXX", autoComplete: "off" })}
          {socio.tieneItin === "no" && (
            <p className="text-xs text-tinta/55">Sin ITIN, su K-1 lleva el número de pasaporte.</p>
          )}
        </div>
      </div>
    </fieldset>
  );
}

function MiniRadio<T extends string>({
  name,
  label,
  value,
  opciones,
  onChange,
  error,
  srLabel = false,
}: {
  name: string;
  label: string;
  value?: T | "";
  opciones: [T, string][];
  onChange?: (v: T) => void;
  error?: string;
  srLabel?: boolean;
}) {
  return (
    <fieldset>
      <legend className={cn("text-sm font-semibold text-tinta", srLabel && "sr-only")}>{label}</legend>
      <div className={cn("flex flex-wrap gap-2", !srLabel && "mt-2")}>
        {opciones.map(([v, etiqueta]) => (
          <label
            key={v}
            className={cn(
              "inline-flex h-10 cursor-pointer items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold ring-1 ring-tinta/15 transition has-[:checked]:bg-tinta has-[:checked]:text-arena has-[:checked]:ring-tinta has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-chancla/30",
            )}
          >
            <input
              type="radio"
              name={name}
              value={v}
              {...(onChange ? { checked: value === v, onChange: () => onChange(v) } : {})}
              className="sr-only"
            />
            {etiqueta}
          </label>
        ))}
      </div>
      {error && <p className="mt-2 text-sm font-medium text-destructive">{error}</p>}
    </fieldset>
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

function Importe({
  name,
  invalid,
  value,
  onChange,
}: {
  name: string;
  invalid: boolean;
  value?: string;
  onChange?: (v: string) => void;
}) {
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
        {...(onChange ? { value: value ?? "", onChange: (ev: React.ChangeEvent<HTMLInputElement>) => onChange(ev.target.value) } : {})}
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
