"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Copy, Lock, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { CtaLink } from "@/components/brand/cta";
import { ChanclaMark } from "@/components/brand/logo";
import { Pending } from "@/components/brand/pending";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { checklistPresentacion, estados, estadosDestacados, paquetes } from "@/lib/site";
import { cn } from "@/lib/utils";

export type Punto = "crear" | "anual" | "cerrar";
type Tipo = "llc-1" | "llc-2";

type Respuestas = {
  punto: Punto | null;
  tipo: Tipo | null;
  estado: string | null;
  otroEstado: string;
  nombreLLC: string;
  sinNombre: boolean;
  nombre: string;
  email: string;
  telefono: string;
};

const vacio: Respuestas = {
  punto: null,
  tipo: null,
  estado: null,
  otroEstado: "",
  nombreLLC: "",
  sinNombre: false,
  nombre: "",
  email: "",
  telefono: "",
};

const pasos = [
  { id: "punto", label: "Punto de partida" },
  { id: "tipo", label: "Tipo de empresa" },
  { id: "estado", label: "Estado" },
  { id: "nombre", label: "Nombre" },
  { id: "contacto", label: "Contacto" },
] as const;
const RESULTADO = pasos.length;

const puntos: { value: Punto; titulo: string; texto: string; paquete: string }[] = [
  {
    value: "crear",
    titulo: "Quiero crear mi LLC",
    texto: "Tengo la idea y quiero montar mi empresa en EE. UU.",
    paquete: "arranque",
  },
  {
    value: "anual",
    titulo: "Ya tengo una LLC",
    texto: "Me toca la presentación anual de los formularios 1120 y 5472.",
    paquete: "en-regla",
  },
  {
    value: "cerrar",
    titulo: "Quiero cerrar mi LLC",
    texto: "Toca la última presentación y despedirse con todo en orden.",
    paquete: "cierre",
  },
];

const tipos: { value: Tipo; titulo: string; texto: string }[] = [
  { value: "llc-1", titulo: "LLC de 1 miembro", texto: "Una sola persona al mando." },
  { value: "llc-2", titulo: "LLC de 2 miembros", texto: "Un proyecto compartido con socio." },
];

const otrosEstados = estados.filter((e) => !estadosDestacados.includes(e)).sort((a, b) =>
  a.localeCompare(b, "es"),
);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function FormationWizard({ puntoInicial }: { puntoInicial?: Punto }) {
  const [paso, setPaso] = useState(0);
  const [maxPaso, setMaxPaso] = useState(0);
  const [r, setR] = useState<Respuestas>({ ...vacio, punto: puntoInicial ?? null });
  const [errores, setErrores] = useState<Record<string, string>>({});
  const headingRef = useRef<HTMLHeadingElement>(null);
  const primerRender = useRef(true);

  useEffect(() => {
    if (primerRender.current) {
      primerRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [paso]);

  const set = <K extends keyof Respuestas>(k: K, v: Respuestas[K]) => {
    setR((prev) => ({ ...prev, [k]: v }));
    setErrores((prev) => {
      if (!prev[k as string]) return prev;
      const next = { ...prev };
      delete next[k as string];
      return next;
    });
  };

  function validar(i: number): Record<string, string> {
    const e: Record<string, string> = {};
    if (i === 0 && !r.punto) e.punto = "Elige por dónde empezamos.";
    if (i === 1 && !r.tipo) e.tipo = "Elige el tipo de LLC.";
    if (i === 2) {
      if (!r.estado) e.estado = "Elige un estado (o dinos que aún no lo sabes).";
      else if (r.estado === "otro" && !r.otroEstado) e.otroEstado = "Elige el estado de la lista.";
    }
    if (i === 3) {
      const necesitaNombre = r.punto !== "crear" || !r.sinNombre;
      if (necesitaNombre && !r.nombreLLC.trim())
        e.nombreLLC =
          r.punto === "crear"
            ? "Escribe un nombre o marca que aún no lo tienes."
            : "Escribe el nombre de tu LLC.";
    }
    if (i === 4) {
      if (!r.nombre.trim()) e.nombre = "Dinos cómo te llamas.";
      if (!EMAIL_RE.test(r.email.trim())) e.email = "Escribe un email válido.";
    }
    return e;
  }

  function irA(i: number) {
    setErrores({});
    setPaso(i);
    setMaxPaso((m) => Math.max(m, i));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function continuar(e: React.FormEvent) {
    e.preventDefault();
    const err = validar(paso);
    setErrores(err);
    if (Object.keys(err).length > 0) {
      const primero = Object.keys(err)[0];
      document.querySelector<HTMLElement>(`[data-campo="${primero}"]`)?.focus();
      return;
    }
    irA(paso + 1);
  }

  function saltarA(destino: number) {
    if (destino > paso) {
      for (let i = 0; i < destino; i++) {
        const err = validar(i);
        if (Object.keys(err).length > 0) {
          irA(i);
          setErrores(err);
          return;
        }
      }
    }
    irA(destino);
  }

  function reiniciar() {
    setR({ ...vacio });
    setMaxPaso(0);
    irA(0);
  }

  const estadoTexto =
    r.estado === "otro" ? r.otroEstado : r.estado === "no-se" ? "Aún por decidir" : (r.estado ?? "");
  const paquete = paquetes.find(
    (p) => p.id === puntos.find((pt) => pt.value === r.punto)?.paquete,
  );

  const resumen = [
    { paso: 0, k: "Punto de partida", v: puntos.find((p) => p.value === r.punto)?.titulo ?? "" },
    { paso: 1, k: "Tipo de empresa", v: tipos.find((t) => t.value === r.tipo)?.titulo ?? "" },
    { paso: 2, k: "Estado", v: estadoTexto },
    { paso: 3, k: "Nombre de la LLC", v: r.sinNombre && r.punto === "crear" ? "Aún por decidir" : r.nombreLLC },
    {
      paso: 4,
      k: "Contacto",
      v: [r.nombre, r.email, r.telefono].filter(Boolean).join(" · "),
    },
  ];

  async function copiarResumen() {
    const texto = [
      "Negocios en Chanclas · Resumen",
      ...resumen.map((x) => `${x.k}: ${x.v}`),
      paquete ? `Siguiente paso: ${paquete.nombre} (${paquete.servicio})` : "",
    ].join("\n");
    try {
      await navigator.clipboard.writeText(texto);
      toast.success("Resumen copiado. Pégalo en tu email o en el formulario de contacto.");
    } catch {
      toast.error("No hemos podido copiarlo. Selecciona el texto a mano.");
    }
  }

  const progreso = Math.round((Math.min(paso, RESULTADO) / RESULTADO) * 100);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
      <aside className="lg:col-span-4">
        <div className="lg:sticky lg:top-28">
          <StepIndicator paso={paso} maxPaso={maxPaso} onIr={saltarA} />
          <div className="mt-6 hidden items-start gap-3 rounded-3xl border border-dashed border-tinta/20 p-5 text-sm text-tinta/70 lg:flex">
            <Lock className="mt-0.5 size-4 shrink-0 text-chancla-2" aria-hidden="true" />
            <p>
              Tus respuestas se quedan en esta página. No se envían ni se guardan en ningún sitio.
            </p>
          </div>
        </div>
      </aside>

      <div className="lg:col-span-8">
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm">
            <p className="font-mono text-xs tracking-[0.16em] text-tinta/55 uppercase" aria-live="polite">
              {paso < RESULTADO
                ? `Paso ${paso + 1} de ${pasos.length} · ${pasos[paso].label}`
                : "Tu siguiente paso"}
            </p>
            <span className="font-mono text-xs text-tinta/50">{progreso}%</span>
          </div>
          <div
            className="relative mt-3 h-2 rounded-full bg-tinta/10"
            role="progressbar"
            aria-label="Progreso del asistente"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progreso}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-sol to-chancla transition-[width] duration-700 ease-out"
              style={{ width: `${Math.max(progreso, 4)}%` }}
            />
            <span
              aria-hidden="true"
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 transition-[left] duration-700 ease-out"
              style={{ left: `${Math.max(progreso, 4)}%` }}
            >
              <ChanclaMark className="size-7" />
            </span>
          </div>
        </div>

        {paso < RESULTADO ? (
          <form
            noValidate
            onSubmit={continuar}
            key={paso}
            className="rounded-[2rem] border border-tinta/10 bg-card p-6 shadow-[0_30px_60px_-40px_rgba(19,41,61,0.4)] animate-in fade-in slide-in-from-bottom-2 duration-500 sm:p-10"
          >
            {paso === 0 && (
              <Paso
                headingRef={headingRef}
                titulo="¿En qué punto estás?"
                texto="Empezamos por lo básico. Elige la opción que mejor te describe ahora mismo."
              >
                <RadioGroup name="punto" label="Punto de partida" error={errores.punto}>
                  {puntos.map((p) => (
                    <OptionCard
                      key={p.value}
                      name="punto"
                      value={p.value}
                      checked={r.punto === p.value}
                      onChange={() => {
                        set("punto", p.value);
                        if (p.value !== "crear" && r.estado === "no-se") set("estado", null);
                      }}
                      titulo={p.titulo}
                      texto={p.texto}
                    />
                  ))}
                </RadioGroup>
              </Paso>
            )}

            {paso === 1 && (
              <Paso
                headingRef={headingRef}
                titulo={r.punto === "crear" ? "¿Cómo será tu LLC?" : "¿Cómo es tu LLC?"}
                texto="Trabajamos con LLC de uno o dos miembros. Las corporaciones llegan pronto."
              >
                <RadioGroup name="tipo" label="Tipo de empresa" error={errores.tipo}>
                  {tipos.map((t) => (
                    <OptionCard
                      key={t.value}
                      name="tipo"
                      value={t.value}
                      checked={r.tipo === t.value}
                      onChange={() => set("tipo", t.value)}
                      titulo={t.titulo}
                      texto={t.texto}
                    />
                  ))}
                  <OptionCard
                    name="tipo"
                    value="corporacion"
                    checked={false}
                    onChange={() => {}}
                    disabled
                    titulo="Corporación (C-Corp)"
                    texto="Todavía no la ofrecemos."
                    badge="Próximamente"
                  />
                </RadioGroup>
                <p className="mt-4 text-sm text-tinta/60">
                  ¿Te interesa una corporación?{" "}
                  <Link
                    href="/contacto?servicio=corporacion"
                    className="font-semibold text-chancla-2 underline underline-offset-4"
                  >
                    Escríbenos y te avisamos
                  </Link>
                  .
                </p>
              </Paso>
            )}

            {paso === 2 && (
              <Paso
                headingRef={headingRef}
                titulo={
                  r.punto === "crear" ? "¿En qué estado la registramos?" : "¿En qué estado está registrada?"
                }
                texto={
                  r.punto === "crear"
                    ? "Estos tres son de los más elegidos por quien no reside en EE. UU. Si dudas, lo vemos juntos."
                    : "Lo encontrarás en tus Articles of Organization."
                }
              >
                <RadioGroup name="estado" label="Estado" error={errores.estado} columns={3}>
                  {estadosDestacados.map((e) => (
                    <OptionCard
                      key={e}
                      name="estado"
                      value={e}
                      checked={r.estado === e}
                      onChange={() => set("estado", e)}
                      titulo={e}
                      compact
                    />
                  ))}
                  <OptionCard
                    name="estado"
                    value="otro"
                    checked={r.estado === "otro"}
                    onChange={() => set("estado", "otro")}
                    titulo="Otro estado"
                    compact
                  />
                  {r.punto === "crear" && (
                    <OptionCard
                      name="estado"
                      value="no-se"
                      checked={r.estado === "no-se"}
                      onChange={() => set("estado", "no-se")}
                      titulo="Aún no lo sé"
                      compact
                    />
                  )}
                </RadioGroup>

                {r.estado === "otro" && (
                  <div className="mt-5 space-y-2 animate-in fade-in slide-in-from-top-1 duration-300">
                    <Label htmlFor="otroEstado" className="font-semibold">
                      Elige el estado
                    </Label>
                    <select
                      id="otroEstado"
                      data-campo="otroEstado"
                      value={r.otroEstado}
                      onChange={(e) => set("otroEstado", e.target.value)}
                      aria-invalid={!!errores.otroEstado}
                      aria-describedby={errores.otroEstado ? "otroEstado-error" : undefined}
                      className="h-12 w-full rounded-2xl border border-tinta/15 bg-white px-4 text-base outline-none focus-visible:border-chancla focus-visible:ring-3 focus-visible:ring-chancla/20 sm:max-w-sm"
                    >
                      <option value="">Selecciona un estado</option>
                      {otrosEstados.map((e) => (
                        <option key={e} value={e}>
                          {e}
                        </option>
                      ))}
                    </select>
                    {errores.otroEstado && <FieldError id="otroEstado-error">{errores.otroEstado}</FieldError>}
                  </div>
                )}

                {r.punto === "crear" && (
                  <p className="mt-6 flex flex-wrap items-center gap-2 text-sm text-tinta/60">
                    Tasa del estado: <Pending>Importe pendiente</Pending>
                  </p>
                )}
              </Paso>
            )}

            {paso === 3 && (
              <Paso
                headingRef={headingRef}
                titulo={r.punto === "crear" ? "¿Cómo se llamará?" : "¿Cómo se llama tu LLC?"}
                texto={
                  r.punto === "crear"
                    ? "Si ya tienes un nombre en mente, apúntalo. Si no, no pasa nada: lo pensamos juntos."
                    : "Tal y como aparece en tus documentos oficiales."
                }
              >
                <div className="space-y-2">
                  <Label htmlFor="nombreLLC" className="font-semibold">
                    Nombre de la LLC
                  </Label>
                  <div className="relative">
                    <Input
                      id="nombreLLC"
                      data-campo="nombreLLC"
                      value={r.nombreLLC}
                      maxLength={120}
                      disabled={r.punto === "crear" && r.sinNombre}
                      onChange={(e) => set("nombreLLC", e.target.value)}
                      placeholder={r.punto === "crear" ? "Por ejemplo: Sombrilla Studio" : ""}
                      aria-invalid={!!errores.nombreLLC}
                      aria-describedby={errores.nombreLLC ? "nombreLLC-error" : "nombreLLC-hint"}
                      className="h-14 rounded-2xl border-tinta/15 bg-white pr-16 pl-4 text-lg focus-visible:border-chancla focus-visible:ring-chancla/20"
                    />
                    <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 font-display font-bold text-tinta/35">
                      LLC
                    </span>
                  </div>
                  {errores.nombreLLC ? (
                    <FieldError id="nombreLLC-error">{errores.nombreLLC}</FieldError>
                  ) : (
                    <p id="nombreLLC-hint" className="text-sm text-tinta/55">
                      Solo sirve para preparar tu caso. Aquí no se registra nada.
                    </p>
                  )}
                </div>
                {r.punto === "crear" && (
                  <label className="mt-5 flex cursor-pointer items-center gap-3 text-tinta/75">
                    <input
                      type="checkbox"
                      checked={r.sinNombre}
                      onChange={(e) => set("sinNombre", e.target.checked)}
                      className="size-5 rounded accent-[var(--chancla)]"
                    />
                    Todavía no lo tengo claro
                  </label>
                )}
              </Paso>
            )}

            {paso === 4 && (
              <Paso
                headingRef={headingRef}
                titulo="¿Cómo te llamamos?"
                texto="Para que el resumen final vaya a tu nombre. Recuerda: de momento, nada sale de esta página."
              >
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <TextField
                    id="nombre"
                    label="Tu nombre"
                    value={r.nombre}
                    onChange={(v) => set("nombre", v)}
                    error={errores.nombre}
                    autoComplete="name"
                  />
                  <TextField
                    id="email"
                    label="Email"
                    type="email"
                    value={r.email}
                    onChange={(v) => set("email", v)}
                    error={errores.email}
                    autoComplete="email"
                  />
                  <TextField
                    id="telefono"
                    label="Teléfono"
                    optional
                    type="tel"
                    value={r.telefono}
                    onChange={(v) => set("telefono", v)}
                    autoComplete="tel"
                  />
                </div>
                <p className="mt-6 flex items-start gap-2 rounded-2xl bg-arena-2 p-4 text-sm text-tinta/70">
                  <Lock className="mt-0.5 size-4 shrink-0 text-chancla-2" aria-hidden="true" />
                  No enviamos ni guardamos estos datos. Al recargar la página, desaparecen.
                </p>
              </Paso>
            )}

            <div className="mt-10 flex flex-col-reverse gap-3 border-t border-tinta/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
              {paso > 0 ? (
                <button
                  type="button"
                  onClick={() => irA(paso - 1)}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full px-5 font-semibold text-tinta/70 ring-1 ring-tinta/15 transition hover:bg-tinta/5 hover:text-tinta focus-visible:ring-4 focus-visible:ring-chancla/30 focus-visible:outline-none"
                >
                  <ArrowLeft className="size-4" aria-hidden="true" /> Atrás
                </button>
              ) : (
                <span className="hidden sm:block" />
              )}
              <button
                type="submit"
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-chancla px-7 font-semibold text-white shadow-[0_8px_24px_-10px_var(--chancla)] transition-all duration-300 hover:bg-chancla-2 focus-visible:ring-4 focus-visible:ring-chancla/30 focus-visible:outline-none"
              >
                {paso === pasos.length - 1 ? "Ver mi siguiente paso" : "Continuar"}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </button>
            </div>
          </form>
        ) : (
          <Resultado
            headingRef={headingRef}
            r={r}
            paquete={paquete}
            resumen={resumen}
            onEditar={irA}
            onCopiar={copiarResumen}
            onReiniciar={reiniciar}
          />
        )}

        <p className="mt-6 flex items-start gap-2 text-sm text-tinta/60 lg:hidden">
          <Lock className="mt-0.5 size-4 shrink-0 text-chancla-2" aria-hidden="true" />
          Tus respuestas se quedan en esta página. No se envían ni se guardan en ningún sitio.
        </p>
      </div>
    </div>
  );
}

function StepIndicator({
  paso,
  maxPaso,
  onIr,
}: {
  paso: number;
  maxPaso: number;
  onIr: (i: number) => void;
}) {
  const items = [...pasos.map((p) => p.label), "Tu siguiente paso"];
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const list = listRef.current;
    const current = list?.children[paso] as HTMLElement | undefined;
    if (!list || !current || list.scrollWidth <= list.clientWidth) return;
    list.scrollTo({ left: current.offsetLeft - 16, behavior: "smooth" });
  }, [paso]);

  return (
    <nav aria-label="Pasos del asistente">
      <ol ref={listRef} className="relative flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:gap-1 lg:overflow-visible">
        {items.map((label, i) => {
          const hecho = i < paso;
          const actual = i === paso;
          const alcanzable = i <= maxPaso && !actual;
          const contenido = (
            <>
              <span
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-full font-mono text-xs font-semibold transition-colors duration-300",
                  actual && "bg-chancla text-white",
                  hecho && "bg-tinta text-arena",
                  !actual && !hecho && "bg-tinta/8 text-tinta/50",
                )}
              >
                {hecho ? <Check className="size-4" strokeWidth={3} aria-hidden="true" /> : i + 1}
              </span>
              <span
                className={cn(
                  "text-sm whitespace-nowrap",
                  actual ? "font-semibold text-tinta" : "text-tinta/60",
                )}
              >
                {label}
                {hecho && <span className="sr-only"> (completado)</span>}
              </span>
            </>
          );
          const base =
            "flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors";
          return (
            <li key={label} className="shrink-0">
              {alcanzable ? (
                <button
                  type="button"
                  onClick={() => onIr(i)}
                  className={cn(
                    base,
                    "hover:bg-white/70 focus-visible:ring-4 focus-visible:ring-chancla/30 focus-visible:outline-none",
                  )}
                >
                  {contenido}
                </button>
              ) : (
                <div
                  aria-current={actual ? "step" : undefined}
                  className={cn(base, actual && "bg-white shadow-sm ring-1 ring-tinta/10")}
                >
                  {contenido}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function Paso({
  headingRef,
  titulo,
  texto,
  children,
}: {
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  titulo: string;
  texto: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2
        ref={headingRef}
        tabIndex={-1}
        className="text-3xl leading-tight font-bold outline-none md:text-4xl"
      >
        {titulo}
      </h2>
      <p className="mt-3 text-tinta/65 md:text-lg">{texto}</p>
      <div className="mt-8">{children}</div>
    </div>
  );
}

function RadioGroup({
  name,
  label,
  error,
  columns = 1,
  children,
}: {
  name: string;
  label: string;
  error?: string;
  columns?: 1 | 3;
  children: React.ReactNode;
}) {
  return (
    <fieldset aria-describedby={error ? `${name}-error` : undefined}>
      <legend className="sr-only">{label}</legend>
      <div
        className={cn(
          "grid grid-cols-1 gap-3",
          columns === 3 && "sm:grid-cols-2 md:grid-cols-3",
        )}
      >
        {children}
      </div>
      {error && (
        <FieldError id={`${name}-error`} className="mt-4">
          {error}
        </FieldError>
      )}
    </fieldset>
  );
}

function OptionCard({
  name,
  value,
  checked,
  onChange,
  titulo,
  texto,
  badge,
  disabled,
  compact,
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  titulo: string;
  texto?: string;
  badge?: string;
  disabled?: boolean;
  compact?: boolean;
}) {
  return (
    <label
      className={cn(
        "group relative flex cursor-pointer items-center gap-4 rounded-2xl border-2 bg-white/60 transition-all duration-200",
        compact ? "p-4" : "p-5",
        checked
          ? "border-chancla bg-white shadow-[0_12px_30px_-18px_var(--chancla)]"
          : "border-tinta/10 hover:border-tinta/25 hover:bg-white",
        "has-focus-visible:ring-4 has-focus-visible:ring-chancla/30",
        disabled && "cursor-not-allowed border-dashed opacity-60 hover:border-tinta/10 hover:bg-white/60",
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        data-campo={name}
        className="sr-only"
      />
      <span
        aria-hidden="true"
        className={cn(
          "grid size-6 shrink-0 place-items-center rounded-full border-2 transition-colors",
          checked ? "border-chancla bg-chancla text-white" : "border-tinta/25",
        )}
      >
        {checked && <Check className="size-3.5" strokeWidth={3.5} />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2 font-display text-lg font-bold text-tinta">
          {titulo}
          {badge && (
            <span className="rounded-full bg-sol px-2 py-0.5 font-sans text-[0.65rem] font-bold tracking-wide text-tinta uppercase">
              {badge}
            </span>
          )}
        </span>
        {texto && <span className="mt-0.5 block text-tinta/65">{texto}</span>}
      </span>
    </label>
  );
}

function TextField({
  id,
  label,
  value,
  onChange,
  error,
  optional,
  type = "text",
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  optional?: boolean;
  type?: string;
  autoComplete?: string;
}) {
  const errorId = useId();
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="font-semibold">
        {label}
        {optional && <span className="font-normal text-tinta/45"> (opcional)</span>}
      </Label>
      <Input
        id={id}
        data-campo={id}
        type={type}
        value={value}
        maxLength={200}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className="h-12 rounded-2xl border-tinta/15 bg-white px-4 text-base focus-visible:border-chancla focus-visible:ring-chancla/20"
      />
      {error && <FieldError id={errorId}>{error}</FieldError>}
    </div>
  );
}

function FieldError({
  id,
  className,
  children,
}: {
  id: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <p id={id} role="alert" className={cn("text-sm font-medium text-destructive", className)}>
      {children}
    </p>
  );
}

function Resultado({
  headingRef,
  r,
  paquete,
  resumen,
  onEditar,
  onCopiar,
  onReiniciar,
}: {
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  r: Respuestas;
  paquete: (typeof paquetes)[number] | undefined;
  resumen: { paso: number; k: string; v: string }[];
  onEditar: (i: number) => void;
  onCopiar: () => void;
  onReiniciar: () => void;
}) {
  if (!paquete) return null;
  const nombrePila = r.nombre.trim().split(/\s+/)[0];
  const intermediamos = r.punto === "anual" || r.punto === "cerrar";

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <section className="relative overflow-hidden rounded-[2rem] bg-tinta p-7 text-arena sm:p-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-[radial-gradient(circle,var(--chancla)_0%,transparent_65%)] opacity-40 blur-2xl"
        />
        <div className="relative">
          <p className="font-mono text-xs tracking-[0.18em] text-sol uppercase">Tu siguiente paso</p>
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="mt-3 text-3xl leading-tight font-bold outline-none md:text-5xl"
          >
            {nombrePila ? `${nombrePila}, ` : ""}lo tuyo es{" "}
            <span className="font-serif font-normal text-chancla italic">{paquete.nombre}.</span>
          </h2>
          <p className="mt-3 max-w-xl text-arena/70">
            {paquete.servicio}. {paquete.lema}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            {paquete.precio ? (
              <span className="font-display text-3xl font-extrabold">{paquete.precio}</span>
            ) : (
              <Pending size="lg">Precio pendiente</Pending>
            )}
            {r.punto === "crear" && <Pending size="lg">Tasa estatal pendiente</Pending>}
          </div>

          {paquete.alcancePendiente && (
            <Pending className="mt-7">Alcance por confirmar</Pending>
          )}
          <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {paquete.incluye.map((item) => (
              <li key={item} className="flex gap-3 text-arena/85">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-chancla text-white">
                  <Check className="size-3" strokeWidth={3} aria-hidden="true" />
                </span>
                {item}
              </li>
            ))}
          </ul>

          {intermediamos && (
            <p className="mt-7 rounded-2xl bg-arena/10 p-4 text-sm text-arena/80">
              <strong className="text-arena">Solo intermediamos:</strong> recogemos todos tus datos y
              los entregamos a contables autorizados, que son quienes presentan los formularios.
            </p>
          )}
          {r.punto === "cerrar" && (
            <p className="mt-3 text-sm text-arena/70">
              Al preparar la presentación, marca la casilla «Última presentación».
            </p>
          )}
          {r.tipo === "llc-2" && r.punto !== "crear" && (
            <p className="mt-3 text-sm text-arena/70">
              Con dos miembros las obligaciones pueden cambiar: lo revisamos contigo antes de empezar.
            </p>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <CtaLink href={`/contacto?servicio=${paquete.id}`}>
              {r.punto === "crear" ? "Hablar con una persona" : "Preparar con nosotros"}
            </CtaLink>
            <CtaLink
              href={r.punto === "crear" ? "/como-funciona-una-llc" : "/servicios#presentacion"}
              variant="light"
              arrow={false}
            >
              {r.punto === "crear" ? "Leer la guía de la LLC" : "Ver qué datos necesitas"}
            </CtaLink>
          </div>
        </div>
      </section>

      {r.punto !== "crear" && (
        <section className="rounded-[2rem] border border-tinta/10 bg-card p-7 sm:p-9">
          <h3 className="text-xl font-bold">Ve preparando esto</h3>
          <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-3">
            {checklistPresentacion.map((g) => (
              <div key={g.grupo}>
                <p className="font-mono text-xs tracking-[0.16em] text-chancla-2 uppercase">{g.grupo}</p>
                <ul className="mt-3 space-y-2 text-sm text-tinta/75">
                  {g.items.map((it) => (
                    <li key={it} className="flex gap-2">
                      <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-chancla" />
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-[2rem] border border-tinta/10 bg-card p-7 sm:p-9">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-xl font-bold">Tus respuestas</h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCopiar}
              className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold ring-1 ring-tinta/15 transition hover:bg-tinta/5 focus-visible:ring-4 focus-visible:ring-chancla/30 focus-visible:outline-none"
            >
              <Copy className="size-4" aria-hidden="true" /> Copiar resumen
            </button>
            <button
              type="button"
              onClick={onReiniciar}
              className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold text-tinta/70 ring-1 ring-tinta/15 transition hover:bg-tinta/5 focus-visible:ring-4 focus-visible:ring-chancla/30 focus-visible:outline-none"
            >
              <RotateCcw className="size-4" aria-hidden="true" /> Empezar de nuevo
            </button>
          </div>
        </div>
        <dl className="mt-5 divide-y divide-tinta/10">
          {resumen.map((x) => (
            <div key={x.k} className="flex items-start justify-between gap-4 py-3.5">
              <div className="min-w-0">
                <dt className="font-mono text-xs tracking-[0.14em] text-tinta/50 uppercase">{x.k}</dt>
                <dd className="mt-1 break-words text-tinta">{x.v}</dd>
              </div>
              <button
                type="button"
                onClick={() => onEditar(x.paso)}
                className="shrink-0 rounded-full px-3 py-1 text-sm font-semibold text-chancla-2 transition hover:bg-chancla/10 focus-visible:ring-4 focus-visible:ring-chancla/30 focus-visible:outline-none"
                aria-label={`Editar ${x.k.toLowerCase()}`}
              >
                Editar
              </button>
            </div>
          ))}
        </dl>
        <p className="mt-4 flex items-start gap-2 text-sm text-tinta/55">
          <Lock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          Nada de esto se ha enviado. Si quieres que lo veamos, copia el resumen y mándanoslo.
        </p>
      </section>
    </div>
  );
}
