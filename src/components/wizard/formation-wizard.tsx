"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Copy, Lock, MessageCircle, Plus, RotateCcw, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { CtaLink } from "@/components/brand/cta";
import { ChanclaMark } from "@/components/brand/logo";
import { Confirmacion, PagoPorContacto } from "@/components/confirmacion";
import { Honeypot } from "@/components/honeypot";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  desvioSocios,
  erroresPasoAlta,
  esPasoAlta,
  FACTURACION,
  FACTURACIONES,
  GESTION,
  limpiarOpciones,
  MAS_DE_DIEZ,
  MAX_OPCIONES_NOMBRE,
  MAX_SOCIOS,
  MIN_ACTIVIDAD,
  MIN_OPCIONES_NOMBRE,
  MIN_SOCIOS,
  pasosDe,
  porcentajeDe,
  REPARTO,
  socioVacio,
  TIPOS_SOCIO,
  type BorradorSocio,
  type Facturacion,
  type Gestion,
  type PasoAsistente,
  type PasoId,
  type Reparto,
} from "@/lib/alta";
import { leerAtribucion } from "@/lib/atribucion";
import {
  casoAsistente,
  DESVIOS,
  enlaceContacto,
  type Caso,
  type Punto,
  type Requisitos,
  type Tipo,
} from "@/lib/asistente";
import {
  dolares,
  enlacePago,
  ESTADO_REFERENCIA,
  ESTADOS_LLC,
  esEstadoLlc,
  nombreEstado,
  PLANES_APERTURA,
  precioApertura,
  precioAperturaVarios,
  precioRenovacion,
  TEXTOS_PRECIO,
  type ClaveEstadoLlc,
  type PlanApertura,
} from "@/lib/precios";
import {
  AVISO_PLAZO,
  avisoEmailPago,
  avisoPagoApertura,
  checklistPresentacion,
  cierreLlc,
  contacto,
  enlaceStripe,
  estadosConstitucionDestacados,
  estadosConstitucionResto,
  formularios1065,
  formulariosLlc,
  incluyeApertura,
  PLAZO,
  planes,
  PLANES_ASISTENTE,
  requisitosFormularios,
  type Plan,
  type PlanAsistente,
} from "@/lib/site";
import { cn } from "@/lib/utils";

export type { Punto };

type Respuestas = {
  punto: Punto | null;
  tipo: Tipo | null;
  requisitos: Requisitos | null;
  estado: string | null;
  otroEstado: string;
  nombreLLC: string;
  nombre: string;
  email: string;
  telefono: string;
  // Datos de alta (solo «crear»).
  opcionesNombre: string[];
  direccion: string;
  actividad: string;
  paisResidencia: string;
  facturacion: Facturacion | null;
  aceptaTerminos: boolean;
  /** V4 en la LLC de un socio. */
  residenteEeuu: "si" | "no" | null;
  // Varios socios.
  numSocios: number | typeof MAS_DE_DIEZ | null;
  socios: BorradorSocio[];
  interlocutor: number | null;
  gestion: Gestion | null;
  gestores: number[];
  reparto: Reparto | null;
  repartoOtro: string;
  pactoSalida: "si" | "no" | null;
  confirmaSocios: boolean;
};

const vacio: Respuestas = {
  punto: null,
  tipo: null,
  requisitos: null,
  estado: null,
  otroEstado: "",
  nombreLLC: "",
  nombre: "",
  email: "",
  telefono: "",
  opcionesNombre: Array.from({ length: MIN_OPCIONES_NOMBRE }, () => ""),
  direccion: "",
  actividad: "",
  paisResidencia: "",
  facturacion: null,
  aceptaTerminos: false,
  residenteEeuu: null,
  numSocios: null,
  socios: [],
  interlocutor: null,
  gestion: null,
  gestores: [],
  reparto: null,
  repartoOtro: "",
  pactoSalida: null,
  confirmaSocios: false,
};

const PLACEHOLDERS_NOMBRE = ["Ej. Mi Empresa LLC", "Ej. MiEmpresa LLC", "Ej. My Company LLC"];

/** A qué paso pertenece cada campo, para llevar a la persona al error que devuelva el servidor. */
const PASO_DE_CAMPO: Record<string, PasoId> = {
  punto: "punto",
  tipo: "tipo",
  requisitos: "tipo",
  estado: "estado",
  otroEstado: "estado",
  nombreLLC: "nombre",
  opcionesNombre: "opciones",
  direccion: "direccion",
  actividad: "actividad",
  paisResidencia: "pais",
  facturacion: "facturacion",
  aceptaTerminos: "aceptacion",
  confirmaSocios: "aceptacion",
  residenteEeuu: "tipo",
  numSocios: "numSocios",
  interlocutor: "interlocutor",
  gestion: "gestion",
  gestores: "gestion",
  reparto: "reparto",
  repartoOtro: "reparto",
  pactoSalida: "reparto",
};

const planBasico = planes.find((p) => p.id === "basico")!;
const planEstandar = planes.find((p) => p.id === "estandar")!;

const puntos: { value: Punto; titulo: string; texto: string; precio: string }[] = [
  {
    value: "crear",
    titulo: "Quiero crear mi LLC",
    texto: `En ${ESTADOS_LLC.length} estados, de uno o de varios socios. En Nuevo México, tasa del estado incluida.`,
    precio: TEXTOS_PRECIO.aperturaDesde,
  },
  {
    value: "anual",
    titulo: "Ya tengo una LLC",
    texto: "Me toca presentar los formularios anuales 1120/5472.",
    precio: formulariosLlc.precio,
  },
  {
    value: "cerrar",
    titulo: "Quiero cerrar mi LLC",
    texto: "Para LLC al día de los mismos 7 estados. ¿Otro estado? Escríbenos y te damos presupuesto.",
    precio: cierreLlc.precioCompleto,
  },
];

const tiposLlc: { value: Tipo; titulo: string; texto: string }[] = [
  { value: "llc-1", titulo: "LLC de un socio", texto: "Single member: una sola persona al mando." },
  { value: "llc-2", titulo: "LLC con varios socios", texto: "Multi-member: un proyecto compartido." },
];
const tipoCorp = {
  value: "corp" as const,
  titulo: "Corporación (C-Corp)",
  texto: "Para levantar inversión, emitir acciones o proyectos que no encajan en una LLC.",
};
const tiposDe = (punto: Punto | null) => (punto === "crear" ? [...tiposLlc, tipoCorp] : tiposLlc);

const otrosEstados = estadosConstitucionResto;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Destino de contacto de la regla de C-Corp. */
const CONTACTO_CORP = "/contacto?servicio=corporacion";

type Desvio = keyof typeof DESVIOS;

/** «Crear» + C-Corp: no sigue el alta, va a contacto. */
function esCorpAlCrear(r: { punto: Punto | null; tipo: Tipo | null }): boolean {
  return r.punto === "crear" && r.tipo === "corp";
}

export function FormationWizard({
  puntoInicial,
  tipoInicial,
  plan,
  formulariosAbiertos = true,
}: {
  puntoInicial?: Punto;
  /** `/empezar?tipo=llc-2`: arranca con «Quiero crear mi LLC» y varios socios marcados. */
  tipoInicial?: Tipo;
  plan?: PlanAsistente;
  /** /formularios-llc puede estar oculta (NEC_FORMULARIOS_LAUNCH): entonces el resultado lleva a contacto. */
  formulariosAbiertos?: boolean;
}) {
  const [paso, setPaso] = useState(0);
  const [maxPaso, setMaxPaso] = useState(0);
  const [r, setR] = useState<Respuestas>({
    ...vacio,
    punto: tipoInicial ? "crear" : (puntoInicial ?? null),
    tipo: tipoInicial ?? null,
  });
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [consentimiento, setConsentimiento] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState("");
  const [firmaGuardada, setFirmaGuardada] = useState<string | null>(null);
  /** Id del lead guardado: va como client_reference_id en Stripe. */
  const [referencia, setReferencia] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const router = useRouter();
  const caso = casoAsistente(r);
  const pasos = pasosDe(r.punto, r.tipo);
  const RESULTADO = pasos.length;
  const idPaso: PasoId | null = paso < RESULTADO ? pasos[paso].id : null;
  const primerRender = useRef(true);
  const estadoLlc: ClaveEstadoLlc | null = esEstadoLlc(r.estado) ? r.estado : null;
  const esCrear = r.punto === "crear";
  const esVarios = esCrear && r.tipo === "llc-2";

  /** Opción que saca al usuario del carril online en el paso actual (patrón de desvío de la 0.3). */
  const desvio: Desvio | null =
    idPaso === "tipo" && esCrear && r.tipo === "llc-1" && r.residenteEeuu === "si"
      ? "residenteEeuu"
      : idPaso === "estado" && esCrear && r.estado === "otro"
        ? "otroEstado"
        : idPaso === "estado" && esCrear && r.estado === "no-se"
          ? "noSe"
          : idPaso === "numSocios" && r.numSocios === MAS_DE_DIEZ
            ? "masDeDiez"
            : idPaso === "socios"
              ? desvioSocios(r.socios)
              : null;

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
    const id = pasos[i]?.id;
    if (!id) return e;
    if (esPasoAlta(id)) return erroresPasoAlta(id, { ...r, consentimiento });
    if (id === "punto" && !r.punto) e.punto = "Elige por dónde empezamos.";
    if (id === "tipo" && !r.tipo) e.tipo = "Elige el tipo de empresa.";
    if (id === "tipo" && r.punto === "anual" && !r.requisitos) e.requisitos = "Dinos si cumples los requisitos.";
    if (id === "tipo" && esCrear && r.tipo === "llc-1" && r.residenteEeuu !== "no") {
      e.residenteEeuu =
        r.residenteEeuu === "si" ? DESVIOS.residenteEeuu.texto : "Dinos si eres ciudadano o residente fiscal en EE. UU.";
    }
    if (id === "estado") {
      if (!r.estado) e.estado = "Elige un estado (o dinos que aún no lo sabes).";
      else if (esCrear && !esEstadoLlc(r.estado)) e.estado = "Elige uno de los estados de la lista.";
      else if (r.estado === "otro" && !r.otroEstado) e.otroEstado = "Elige el estado de la lista.";
    }
    if (id === "nombre" && !r.nombreLLC.trim()) e.nombreLLC = "Escribe el nombre de tu LLC.";
    if (id === "contacto") {
      if (!r.nombre.trim()) e.nombre = "Dinos cómo te llamas.";
      if (!EMAIL_RE.test(r.email.trim())) e.email = "Escribe un email válido.";
      if (r.telefono.trim() && (r.telefono.trim().length < 5 || !/\d/.test(r.telefono))) {
        e.telefono = "Revisa el teléfono.";
      }
      if (!consentimiento) e.consentimiento = "Necesitamos tu consentimiento.";
    }
    return e;
  }

  function irA(i: number) {
    setErrores({});
    setErrorEnvio("");
    setPaso(i);
    setMaxPaso((m) => Math.max(m, i));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function continuar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (desvio) return;
    const err = validar(paso);
    setErrores(err);
    if (Object.keys(err).length > 0) {
      const primero = Object.keys(err)[0];
      document.querySelector<HTMLElement>(`[data-campo="${primero}"]`)?.focus();
      return;
    }
    if (paso === 0 && r.punto === "cerrar") {
      // El cierre tiene su propia página (precio + tasa de disolución del estado).
      router.push("/cierra-tu-llc");
      return;
    }
    if (idPaso === "tipo" && esCorpAlCrear(r)) {
      // Las C-Corp no se contratan online: van a contacto con el aviso de estructura compleja.
      router.push(CONTACTO_CORP);
      return;
    }
    if (paso < pasos.length - 1) {
      irA(paso + 1);
      return;
    }

    const alta = esVarios
      ? {
          numSocios: r.numSocios,
          socios: r.socios,
          interlocutor: r.interlocutor,
          opcionesNombre: limpiarOpciones(r.opcionesNombre),
          gestion: r.gestion,
          gestores: r.gestion === "gestores" ? r.gestores : [],
          reparto: r.reparto,
          repartoOtro: r.reparto === "otro" ? r.repartoOtro : "",
          pactoSalida: r.pactoSalida,
          direccion: r.direccion,
          actividad: r.actividad,
          facturacion: r.facturacion,
          aceptaTerminos: r.aceptaTerminos,
          confirmaSocios: r.confirmaSocios,
        }
      : esCrear
        ? {
            opcionesNombre: limpiarOpciones(r.opcionesNombre),
            direccion: r.direccion,
            actividad: r.actividad,
            paisResidencia: r.paisResidencia,
            facturacion: r.facturacion,
            aceptaTerminos: r.aceptaTerminos,
          }
        : undefined;
    // En varios socios, la persona de contacto es uno de ellos.
    const interlocutor = esVarios && r.interlocutor != null ? r.socios[r.interlocutor] : null;
    const nombre = interlocutor ? interlocutor.nombre : r.nombre;
    const email = interlocutor ? interlocutor.email : r.email;
    const firma = JSON.stringify({
      punto: r.punto,
      tipo: r.tipo,
      requisitos: r.requisitos,
      residenteEeuu: r.residenteEeuu,
      estado: r.estado,
      otroEstado: r.otroEstado,
      nombreLLC: r.nombreLLC,
      nombre,
      email,
      telefono: r.telefono,
      alta,
      plan,
    });
    if (firma === firmaGuardada) {
      irA(paso + 1);
      return;
    }

    setEnviando(true);
    setErrorEnvio("");
    try {
      const res = await fetch("/api/empezar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          punto: r.punto,
          tipo: r.tipo,
          requisitos: r.punto === "anual" ? r.requisitos : undefined,
          residenteEeuu: esCrear && r.tipo === "llc-1" ? r.residenteEeuu : undefined,
          estado: r.estado,
          otroEstado: r.otroEstado,
          nombreLLC: esCrear ? undefined : r.nombreLLC,
          nombre,
          email,
          telefono: r.telefono,
          alta,
          plan: caso === "plan" ? plan : undefined,
          consentimiento: true,
          nec_hp: String(new FormData(e.currentTarget).get("nec_hp") ?? ""),
          ...leerAtribucion(),
        }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        errors?: Record<string, string>;
        error?: string;
        id?: string | null;
      };
      if (!res.ok) {
        if (json.errors) {
          // Llevamos a la persona al primer paso con un error.
          const indices = Object.keys(json.errors)
            .map((clave) => pasos.findIndex((p) => p.id === pasoDeCampo(clave, esCrear, esVarios)))
            .filter((i) => i >= 0);
          const destino = indices.length ? Math.min(...indices) : paso;
          if (destino !== paso) irA(destino);
          setErrores(json.errors);
        }
        setErrorEnvio(
          json.error ||
            (json.errors ? "Revisa los datos marcados." : "No hemos podido guardar tus respuestas."),
        );
        return;
      }
      setFirmaGuardada(firma);
      setReferencia(json.id ?? null);
      irA(paso + 1);
    } catch {
      setErrorEnvio("No hemos podido guardar tus respuestas.");
    } finally {
      setEnviando(false);
    }
  }

  function saltarA(destino: number) {
    if (destino > 0 && r.punto === "cerrar") {
      router.push("/cierra-tu-llc");
      return;
    }
    if (destino > indiceDe("tipo") && esCorpAlCrear(r)) {
      router.push(CONTACTO_CORP);
      return;
    }
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

  /** «Elegir Nuevo México» en la tarjeta de «Aún no lo sé»: marca el estado y sigue con el alta. */
  function elegirNuevoMexico() {
    set("estado", ESTADO_REFERENCIA);
    irA(paso + 1);
  }

  function cambiarNumSocios(n: number | typeof MAS_DE_DIEZ) {
    setR((prev) => {
      if (n === MAS_DE_DIEZ) return { ...prev, numSocios: n };
      const socios = Array.from({ length: n }, (_, i) => prev.socios[i] ?? socioVacio());
      const dentro = (i: number) => i < n;
      return {
        ...prev,
        numSocios: n,
        socios,
        interlocutor: prev.interlocutor != null && dentro(prev.interlocutor) ? prev.interlocutor : null,
        gestores: prev.gestores.filter(dentro),
      };
    });
    setErrores({});
  }

  function quitarSocio(i: number) {
    setR((prev) => {
      const socios = prev.socios.filter((_, j) => j !== i);
      const mover = (j: number) => (j > i ? j - 1 : j);
      return {
        ...prev,
        numSocios: socios.length,
        socios,
        interlocutor: prev.interlocutor == null || prev.interlocutor === i ? null : mover(prev.interlocutor),
        gestores: prev.gestores.filter((g) => g !== i).map(mover),
      };
    });
    setErrores({});
  }

  function cambiarSocio<K extends keyof BorradorSocio>(i: number, k: K, v: BorradorSocio[K]) {
    setR((prev) => ({ ...prev, socios: prev.socios.map((s, j) => (j === i ? { ...s, [k]: v } : s)) }));
    setErrores((prev) => {
      const clave = `socios.${i}.${k}`;
      if (!prev[clave] && !prev.socios) return prev;
      const next = { ...prev };
      delete next[clave];
      delete next.socios;
      return next;
    });
  }

  const estadoTexto =
    r.estado === "otro" ? r.otroEstado : r.estado === "no-se" ? "Aún por decidir" : nombreEstado(r.estado ?? "");
  const nombreSocio = (i: number) => r.socios[i]?.nombre.trim() || `Socio ${i + 1}`;

  const indiceDe = (id: PasoId) => Math.max(0, pasos.findIndex((p) => p.id === id));
  const resumen = [
    { paso: indiceDe("punto"), k: "Punto de partida", v: puntos.find((p) => p.value === r.punto)?.titulo ?? "" },
    {
      paso: indiceDe("tipo"),
      k: "Tipo de empresa",
      v: [
        tiposDe(r.punto).find((t) => t.value === r.tipo)?.titulo ?? "",
        r.punto === "anual" && r.requisitos
          ? r.requisitos === "si"
            ? "Cumplo los requisitos"
            : "No cumplo alguno o tengo dudas"
          : "",
      ]
        .filter(Boolean)
        .join(" · "),
    },
    { paso: indiceDe("estado"), k: "Estado", v: estadoTexto },
    ...(esVarios
      ? [
          { paso: indiceDe("numSocios"), k: "Número de socios", v: String(r.socios.length) },
          {
            paso: indiceDe("socios"),
            k: "Socios",
            v: r.socios
              .map((s, i) => `${nombreSocio(i)} (${porcentajeDe(s.porcentaje) ?? "?"} %, ${s.tipo ? TIPOS_SOCIO[s.tipo] : "?"})`)
              .join(" · "),
          },
          {
            paso: indiceDe("interlocutor"),
            k: "Persona de contacto",
            v: [r.interlocutor != null ? nombreSocio(r.interlocutor) : "", r.interlocutor != null ? r.socios[r.interlocutor]?.email : "", r.telefono.trim()]
              .filter(Boolean)
              .join(" · "),
          },
          {
            paso: indiceDe("opciones"),
            k: "Nombres de la LLC",
            v: limpiarOpciones(r.opcionesNombre)
              .map((o, i) => `${i + 1}. ${o}`)
              .join(" · "),
          },
          {
            paso: indiceDe("gestion"),
            k: "Gestión",
            v: r.gestion
              ? r.gestion === "gestores"
                ? `${GESTION.gestores}: ${r.gestores.map(nombreSocio).join(", ")}`
                : GESTION.todos
              : "",
          },
          {
            paso: indiceDe("reparto"),
            k: "Reparto y salida",
            v: [
              r.reparto === "otro" ? `${REPARTO.otro}: ${r.repartoOtro.trim()}` : r.reparto ? REPARTO[r.reparto] : "",
              r.pactoSalida ? (r.pactoSalida === "si" ? "Quieren pactar la salida" : "Sin pacto especial de salida") : "",
            ]
              .filter(Boolean)
              .join(" · "),
          },
          { paso: indiceDe("domicilio"), k: "Dirección", v: r.direccion.trim() },
          { paso: indiceDe("domicilio"), k: "Actividad", v: r.actividad.trim() },
          {
            paso: indiceDe("facturacion"),
            k: "Facturación esperada",
            v: r.facturacion ? FACTURACION[r.facturacion] : "",
          },
        ]
      : r.punto === "crear"
      ? [
          { paso: indiceDe("titular"), k: "Titular", v: r.nombre.trim() },
          { paso: indiceDe("email"), k: "Email", v: r.email.trim() },
          {
            paso: indiceDe("opciones"),
            k: "Nombres de la LLC",
            v: limpiarOpciones(r.opcionesNombre)
              .map((o, i) => `${i + 1}. ${o}`)
              .join(" · "),
          },
          { paso: indiceDe("telefono"), k: "Teléfono", v: r.telefono.trim() },
          { paso: indiceDe("direccion"), k: "Dirección", v: r.direccion.trim() },
          { paso: indiceDe("actividad"), k: "Actividad", v: r.actividad.trim() },
          { paso: indiceDe("pais"), k: "País de residencia", v: r.paisResidencia.trim() },
          {
            paso: indiceDe("facturacion"),
            k: "Facturación esperada",
            v: r.facturacion ? FACTURACION[r.facturacion] : "",
          },
        ]
      : [
          { paso: indiceDe("nombre"), k: "Nombre de la LLC", v: r.nombreLLC },
          {
            paso: indiceDe("contacto"),
            k: "Contacto",
            v: [r.nombre, r.email, r.telefono].filter(Boolean).join(" · "),
          },
        ]),
  ];

  async function copiarResumen() {
    const texto = [
      "Negocios en Chanclas · Resumen",
      ...resumen.map((x) => `${x.k}: ${x.v}`),
      caso ? `Siguiente paso: ${siguientePaso(caso, plan, estadoLlc, r.socios.length)}` : "",
    ].join("\n");
    try {
      await navigator.clipboard.writeText(texto);
      toast.success("Resumen copiado. Pégalo en el formulario de contacto o mándalo por WhatsApp.");
    } catch {
      toast.error("No hemos podido copiarlo. Selecciona el texto a mano.");
    }
  }

  const progreso = Math.round((Math.min(paso, RESULTADO) / RESULTADO) * 100);
  const pasoInvalido = idPaso != null && esPasoAlta(idPaso) && Object.keys(validar(paso)).length > 0;
  const textoBoton = enviando
    ? "Guardando…"
    : paso === pasos.length - 1
      ? "Ver mi siguiente paso"
      : "Continuar";

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
      <aside className="lg:col-span-4">
        <div className="lg:sticky lg:top-28">
          {plan && r.punto === "crear" && r.tipo !== "llc-2" && (
            <p className="mb-5 rounded-2xl bg-chancla/10 px-4 py-3 text-sm text-tinta">
              Plan elegido: <strong>{PLANES_ASISTENTE[plan]}</strong>
            </p>
          )}
          <StepIndicator pasos={pasos} paso={paso} maxPaso={maxPaso} onIr={saltarA} />
          <div className="mt-6 hidden items-start gap-3 rounded-3xl border border-dashed border-tinta/20 p-5 text-sm text-tinta/70 lg:flex">
            <Lock className="mt-0.5 size-4 shrink-0 text-chancla-2" aria-hidden="true" />
            <p>
              Al terminar guardamos tus respuestas para poder responderte. No las usamos para nada más.
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
            <span className="font-mono text-xs text-tinta/50">
              {Math.min(paso + 1, pasos.length)} / {pasos.length}
            </span>
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
            className="relative rounded-[2rem] border border-tinta/10 bg-card p-6 shadow-[0_30px_60px_-40px_rgba(19,41,61,0.4)] animate-in fade-in slide-in-from-bottom-2 duration-500 sm:p-10"
          >
            <Honeypot />
            {idPaso === "punto" && (
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
                        if (p.value !== r.punto) setMaxPaso(0);
                        set("punto", p.value);
                        if (p.value !== "crear" && r.estado === "no-se") set("estado", null);
                        if (p.value !== "crear" && r.tipo === "corp") set("tipo", null);
                      }}
                      titulo={p.titulo}
                      texto={p.texto}
                      precio={p.precio}
                    />
                  ))}
                </RadioGroup>
              </Paso>
            )}

            {idPaso === "tipo" && (
              <Paso
                headingRef={headingRef}
                titulo={r.punto === "crear" ? "¿Cómo será tu LLC?" : "¿Cómo es tu LLC?"}
                texto={
                  r.punto === "crear"
                    ? "Abrimos online LLC de un socio y de varios socios (hasta 10). Las C-Corp las vemos contigo."
                    : "El servicio de Formularios LLC es para LLC de un solo socio."
                }
              >
                <RadioGroup name="tipo" label="Tipo de empresa" error={errores.tipo}>
                  {tiposDe(r.punto).map((t) => (
                    <OptionCard
                      key={t.value}
                      name="tipo"
                      value={t.value}
                      checked={r.tipo === t.value}
                      onChange={() => {
                        if (t.value !== r.tipo) setMaxPaso((m) => Math.min(m, indiceDe("tipo")));
                        set("tipo", t.value);
                      }}
                      titulo={t.titulo}
                      texto={t.texto}
                    />
                  ))}
                </RadioGroup>
                {esVarios && (
                  <p className="mt-5 rounded-2xl bg-agua/40 p-4 text-tinta/80">
                    Una LLC de varios socios necesita un Operating Agreement hecho para vosotros. Te lo preparamos.
                  </p>
                )}
                {esCrear && r.tipo === "llc-1" && (
                  <div className="mt-8">
                    <p className="font-semibold text-tinta">¿Eres ciudadano estadounidense o residente fiscal en EE. UU.?</p>
                    <div className="mt-3">
                      <RadioGroup name="residenteEeuu" label="Ciudadano o residente fiscal en EE. UU." error={desvio ? undefined : errores.residenteEeuu} columns={2}>
                        <OptionCard
                          name="residenteEeuu"
                          value="no"
                          checked={r.residenteEeuu === "no"}
                          onChange={() => set("residenteEeuu", "no")}
                          titulo="No"
                          compact
                        />
                        <OptionCard
                          name="residenteEeuu"
                          value="si"
                          checked={r.residenteEeuu === "si"}
                          onChange={() => set("residenteEeuu", "si")}
                          titulo="Sí"
                          compact
                        />
                      </RadioGroup>
                    </div>
                  </div>
                )}
                {r.punto === "anual" && (
                  <div className="mt-8">
                    <p className="font-semibold text-tinta">
                      Antes de contratar este servicio, debes verificar que cumples los siguientes requisitos:
                    </p>
                    <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-tinta/70">
                      {requisitosFormularios.map((req) => (
                        <li key={req}>{req}</li>
                      ))}
                    </ol>
                    <div className="mt-5">
                      <RadioGroup name="requisitos" label="Requisitos" error={errores.requisitos}>
                        <OptionCard
                          name="requisitos"
                          value="si"
                          checked={r.requisitos === "si"}
                          onChange={() => set("requisitos", "si")}
                          titulo="Cumplo todos los requisitos"
                          compact
                        />
                        <OptionCard
                          name="requisitos"
                          value="no"
                          checked={r.requisitos === "no"}
                          onChange={() => set("requisitos", "no")}
                          titulo="No cumplo alguno o tengo dudas"
                          compact
                        />
                      </RadioGroup>
                    </div>
                  </div>
                )}
              </Paso>
            )}

            {idPaso === "estado" && (
              <Paso
                headingRef={headingRef}
                titulo={esCrear ? "¿En qué estado la registramos?" : "¿En qué estado está registrada?"}
                texto={
                  esCrear
                    ? "El precio es el del plan más la tasa del estado. En Nuevo México la tasa va incluida."
                    : "Lo encontrarás en tus Articles of Organization."
                }
              >
                {esCrear ? (
                  <RadioGroup name="estado" label="Estado" error={desvio ? undefined : errores.estado} columns={2}>
                    {ESTADOS_LLC.map((e) => (
                      <OptionCard
                        key={e.clave}
                        name="estado"
                        value={e.clave}
                        checked={r.estado === e.clave}
                        onChange={() => set("estado", e.clave)}
                        titulo={e.nombre}
                        texto={
                          esVarios
                            ? `${precioAperturaVarios(e.clave, MIN_SOCIOS).texto}, con ${MIN_SOCIOS} socios`
                            : precioApertura(e.clave, plan ?? "basico").texto
                        }
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
                    <OptionCard
                      name="estado"
                      value="no-se"
                      checked={r.estado === "no-se"}
                      onChange={() => set("estado", "no-se")}
                      titulo="Aún no lo sé"
                      compact
                    />
                  </RadioGroup>
                ) : (
                  <RadioGroup name="estado" label="Estado" error={errores.estado} columns={3}>
                    {estadosConstitucionDestacados.map((e) => (
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
                  </RadioGroup>
                )}

                {!esCrear && r.estado === "otro" && (
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

                {desvio === "noSe" && <TarjetaNoSe onElegirNuevoMexico={elegirNuevoMexico} />}
              </Paso>
            )}

            {idPaso === "numSocios" && (
              <Paso
                headingRef={headingRef}
                titulo="¿Cuántos socios sois?"
                texto={`De ${MIN_SOCIOS} a ${MAX_SOCIOS} socios. El precio se actualiza al cambiar el número.`}
              >
                <RadioGroup name="numSocios" label="Número de socios" error={desvio ? undefined : errores.numSocios} columns={3}>
                  {Array.from({ length: MAX_SOCIOS - MIN_SOCIOS + 1 }, (_, i) => i + MIN_SOCIOS).map((n) => (
                    <OptionCard
                      key={n}
                      name="numSocios"
                      value={String(n)}
                      checked={r.numSocios === n}
                      onChange={() => cambiarNumSocios(n)}
                      titulo={`${n} socios`}
                      compact
                    />
                  ))}
                  <OptionCard
                    name="numSocios"
                    value={MAS_DE_DIEZ}
                    checked={r.numSocios === MAS_DE_DIEZ}
                    onChange={() => cambiarNumSocios(MAS_DE_DIEZ)}
                    titulo={`Más de ${MAX_SOCIOS}`}
                    compact
                  />
                </RadioGroup>
                {estadoLlc && typeof r.numSocios === "number" && (
                  <PrecioVarios estado={estadoLlc} socios={r.numSocios} />
                )}
              </Paso>
            )}

            {idPaso === "socios" && (
              <Paso
                headingRef={headingRef}
                titulo="Datos de cada socio"
                texto="Sin pasaporte: solo lo que necesitamos para el alta y el Operating Agreement. Los porcentajes tienen que sumar 100 %."
              >
                <ol className="space-y-5">
                  {r.socios.map((socio, i) => (
                    <li key={i}>
                      <FichaSocio
                        indice={i}
                        socio={socio}
                        errores={errores}
                        onCambiar={(k, v) => cambiarSocio(i, k, v)}
                        onQuitar={r.socios.length > MIN_SOCIOS ? () => quitarSocio(i) : undefined}
                      />
                    </li>
                  ))}
                </ol>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  {r.socios.length < MAX_SOCIOS ? (
                    <button
                      type="button"
                      onClick={() => cambiarNumSocios(r.socios.length + 1)}
                      className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold text-chancla-2 ring-1 ring-chancla/30 transition hover:bg-chancla/10 focus-visible:ring-4 focus-visible:ring-chancla/30 focus-visible:outline-none"
                    >
                      <Plus className="size-4" aria-hidden="true" /> Añadir socio
                    </button>
                  ) : (
                    <span />
                  )}
                  <SumaPorcentajes socios={r.socios} />
                </div>
                {estadoLlc && <PrecioVarios estado={estadoLlc} socios={r.socios.length} />}
                {errores.socios && !desvio && (
                  <FieldError id="socios-error" className="mt-4">
                    {errores.socios}
                  </FieldError>
                )}
              </Paso>
            )}

            {idPaso === "interlocutor" && (
              <Paso
                headingRef={headingRef}
                titulo="¿Quién será nuestra persona de contacto?"
                texto="Recibe nuestros emails y acepta la solicitud en nombre de todos los socios."
              >
                <RadioGroup name="interlocutor" label="Persona de contacto" error={errores.interlocutor}>
                  {r.socios.map((s, i) => (
                    <OptionCard
                      key={i}
                      name="interlocutor"
                      value={String(i)}
                      checked={r.interlocutor === i}
                      onChange={() => set("interlocutor", i)}
                      titulo={nombreSocio(i)}
                      texto={s.email.trim()}
                      compact
                    />
                  ))}
                </RadioGroup>
                <div className="mt-6">
                  <TextField
                    id="telefono"
                    label="Su teléfono (con prefijo)"
                    optional
                    type="tel"
                    value={r.telefono}
                    onChange={(v) => set("telefono", v)}
                    error={errores.telefono}
                    autoComplete="tel"
                    inputMode="tel"
                    maxLength={40}
                    placeholder="+34 600 000 000"
                  />
                </div>
              </Paso>
            )}

            {idPaso === "gestion" && (
              <Paso
                headingRef={headingRef}
                titulo="¿Quién decide el día a día?"
                texto="Lo necesitamos para el Operating Agreement: quién firma, contrata y lleva la LLC en el día a día."
              >
                <RadioGroup name="gestion" label="Gestión de la LLC" error={errores.gestion}>
                  <OptionCard
                    name="gestion"
                    value="todos"
                    checked={r.gestion === "todos"}
                    onChange={() => set("gestion", "todos")}
                    titulo={GESTION.todos}
                    texto="Todos los socios deciden y pueden actuar por la LLC."
                  />
                  <OptionCard
                    name="gestion"
                    value="gestores"
                    checked={r.gestion === "gestores"}
                    onChange={() => set("gestion", "gestores")}
                    titulo={GESTION.gestores}
                    texto="Solo algunos socios llevan la gestión; el resto participa en la propiedad."
                  />
                </RadioGroup>
                {r.gestion === "gestores" && (
                  <fieldset className="mt-6" aria-describedby={errores.gestores ? "gestores-error" : undefined}>
                    <legend className="font-semibold text-tinta">¿Quiénes?</legend>
                    <div className="mt-3 space-y-2">
                      {r.socios.map((_, i) => (
                        <label key={i} className="flex cursor-pointer items-center gap-3 text-tinta/80">
                          <input
                            type="checkbox"
                            data-campo={i === 0 ? "gestores" : undefined}
                            checked={r.gestores.includes(i)}
                            onChange={(e) =>
                              set(
                                "gestores",
                                e.target.checked ? [...r.gestores, i] : r.gestores.filter((g) => g !== i),
                              )
                            }
                            className="size-5 shrink-0 accent-[var(--chancla)]"
                          />
                          {nombreSocio(i)}
                        </label>
                      ))}
                    </div>
                    {errores.gestores && (
                      <FieldError id="gestores-error" className="mt-3">
                        {errores.gestores}
                      </FieldError>
                    )}
                  </fieldset>
                )}
              </Paso>
            )}

            {idPaso === "reparto" && (
              <Paso
                headingRef={headingRef}
                titulo="Reparto y salida"
                texto="Dos preguntas más para el Operating Agreement. Lo que nos digáis lo revisamos con vosotros."
              >
                <p className="font-semibold text-tinta">¿Cómo os repartís los beneficios?</p>
                <div className="mt-3">
                  <RadioGroup name="reparto" label="Reparto de beneficios" error={errores.reparto}>
                    <OptionCard
                      name="reparto"
                      value="porcentaje"
                      checked={r.reparto === "porcentaje"}
                      onChange={() => set("reparto", "porcentaje")}
                      titulo={REPARTO.porcentaje}
                      compact
                    />
                    <OptionCard
                      name="reparto"
                      value="otro"
                      checked={r.reparto === "otro"}
                      onChange={() => set("reparto", "otro")}
                      titulo="Otro"
                      compact
                    />
                  </RadioGroup>
                </div>
                {r.reparto === "otro" && (
                  <div className="mt-4">
                    <AreaTexto
                      id="repartoOtro"
                      label="Cuéntanos cómo os vais a repartir los beneficios"
                      value={r.repartoOtro}
                      onChange={(v) => set("repartoOtro", v)}
                      error={errores.repartoOtro}
                      maxLength={2000}
                      rows={3}
                    />
                  </div>
                )}
                <p className="mt-8 font-semibold text-tinta">
                  ¿Queréis pactar algo especial si un socio quiere salir o vender su parte?
                </p>
                <div className="mt-3">
                  <RadioGroup name="pactoSalida" label="Pacto de salida" error={errores.pactoSalida} columns={2}>
                    <OptionCard
                      name="pactoSalida"
                      value="si"
                      checked={r.pactoSalida === "si"}
                      onChange={() => set("pactoSalida", "si")}
                      titulo="Sí"
                      compact
                    />
                    <OptionCard
                      name="pactoSalida"
                      value="no"
                      checked={r.pactoSalida === "no"}
                      onChange={() => set("pactoSalida", "no")}
                      titulo="No"
                      compact
                    />
                  </RadioGroup>
                </div>
              </Paso>
            )}

            {idPaso === "domicilio" && (
              <Paso
                headingRef={headingRef}
                titulo="Dirección y actividad"
                texto="La dirección de la persona de contacto (tiene que poder recibir correspondencia) y a qué se va a dedicar la LLC."
              >
                <div className="space-y-6">
                  <AreaTexto
                    id="direccion"
                    label="Dirección completa de la persona de contacto"
                    value={r.direccion}
                    onChange={(v) => set("direccion", v)}
                    error={errores.direccion}
                    maxLength={300}
                    rows={3}
                    placeholder="Calle, número, piso/puerta, CP, localidad, provincia y país"
                    hint="Calle, número, piso/puerta, código postal, localidad, provincia y país."
                  />
                  <AreaTexto
                    id="actividad"
                    label="Resumen de la actividad de la LLC"
                    value={r.actividad}
                    onChange={(v) => set("actividad", v)}
                    error={errores.actividad}
                    maxLength={2000}
                    rows={5}
                    placeholder="Por ejemplo: agencia de desarrollo web con clientes en Europa y Latinoamérica."
                    hint={
                      r.actividad.trim().length < MIN_ACTIVIDAD
                        ? `Mínimo ${MIN_ACTIVIDAD} caracteres · llevas ${r.actividad.trim().length}`
                        : `${r.actividad.trim().length} caracteres`
                    }
                  />
                </div>
              </Paso>
            )}

            {idPaso === "nombre" && (
              <Paso
                headingRef={headingRef}
                titulo="¿Cómo se llama tu LLC?"
                texto="Tal y como aparece en tus documentos oficiales."
              >
                <div className="space-y-2">
                  <Label htmlFor="nombreLLC" className="font-semibold">
                    {r.tipo === "corp" ? "Nombre de la empresa" : "Nombre de la LLC"}
                  </Label>
                  <div className="relative">
                    <Input
                      id="nombreLLC"
                      data-campo="nombreLLC"
                      value={r.nombreLLC}
                      maxLength={120}
                      onChange={(e) => set("nombreLLC", e.target.value)}
                      aria-invalid={!!errores.nombreLLC}
                      aria-describedby={errores.nombreLLC ? "nombreLLC-error" : "nombreLLC-hint"}
                      className="h-14 rounded-2xl border-tinta/15 bg-white pr-16 pl-4 text-lg focus-visible:border-chancla focus-visible:ring-chancla/20"
                    />
                    {r.tipo !== "corp" && (
                      <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 font-display font-bold text-tinta/35">
                        LLC
                      </span>
                    )}
                  </div>
                  {errores.nombreLLC ? (
                    <FieldError id="nombreLLC-error">{errores.nombreLLC}</FieldError>
                  ) : (
                    <p id="nombreLLC-hint" className="text-sm text-tinta/55">
                      Solo sirve para preparar tu caso.
                    </p>
                  )}
                </div>
              </Paso>
            )}

            {idPaso === "contacto" && (
              <Paso
                headingRef={headingRef}
                titulo="¿Cómo te llamamos?"
                texto="Para poder escribirte con el siguiente paso. Al continuar, guardamos estos datos."
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
                    error={errores.telefono}
                    autoComplete="tel"
                  />
                </div>
                <label className="mt-6 flex cursor-pointer items-start gap-3 text-sm text-tinta/70">
                  <input
                    type="checkbox"
                    data-campo="consentimiento"
                    checked={consentimiento}
                    onChange={(e) => {
                      setConsentimiento(e.target.checked);
                      setErrores((prev) => {
                        if (!prev.consentimiento) return prev;
                        const next = { ...prev };
                        delete next.consentimiento;
                        return next;
                      });
                    }}
                    className="mt-0.5 size-5 shrink-0 accent-[var(--chancla)]"
                    aria-invalid={!!errores.consentimiento}
                  />
                  <span>
                    Acepto que Negocios en Chanclas use estos datos para responder a mi consulta, según su{" "}
                    <Link href="/legal" className="font-medium text-tinta underline underline-offset-2">
                      política de privacidad
                    </Link>
                    .
                    {errores.consentimiento && (
                      <span className="mt-1 block font-medium text-destructive">{errores.consentimiento}</span>
                    )}
                  </span>
                </label>
                {errorEnvio && (
                  <p role="alert" className="mt-5 rounded-2xl bg-destructive/10 p-4 text-sm text-destructive">
                    {errorEnvio}{" "}
                    <a
                      className="font-semibold underline"
                      href={contacto.whatsapp.espana.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Escríbenos por WhatsApp
                    </a>
                    .
                  </p>
                )}
              </Paso>
            )}

            {idPaso === "titular" && (
              <Paso
                headingRef={headingRef}
                titulo="¿Quién será el titular de la LLC?"
                texto={
                  <>
                    Empezamos con los datos de alta. Tu nombre completo, tal y como aparece en el pasaporte.
                    {r.tipo !== "llc-1" && (
                      <span className="mt-2 block text-base">Si hay más socios, te pediremos sus datos después.</span>
                    )}
                  </>
                }
              >
                <TextField
                  id="nombre"
                  label="Nombre completo del titular"
                  value={r.nombre}
                  onChange={(v) => set("nombre", v)}
                  error={errores.nombre}
                  autoComplete="name"
                  maxLength={120}
                  placeholder="Nombre y apellidos"
                />
              </Paso>
            )}

            {idPaso === "email" && (
              <Paso
                headingRef={headingRef}
                titulo="¿A qué email te escribimos?"
                texto="Ahí te llegarán las novedades de tu LLC y los documentos que te pidamos."
              >
                <TextField
                  id="email"
                  label="Email de contacto"
                  type="email"
                  value={r.email}
                  onChange={(v) => set("email", v)}
                  error={errores.email}
                  autoComplete="email"
                  inputMode="email"
                  placeholder="tu@email.com"
                />
              </Paso>
            )}

            {idPaso === "opciones" && (
              <Paso
                headingRef={headingRef}
                titulo="¿Cómo te gustaría que se llamara?"
                texto="Danos al menos 3 opciones por si alguna no estuviera disponible. Las revisaremos en orden de preferencia."
              >
                <fieldset aria-describedby={errores.opcionesNombre ? "opcionesNombre-error" : undefined}>
                  <legend className="sr-only">Opciones de nombre para la LLC</legend>
                  <ol className="space-y-3">
                    {r.opcionesNombre.map((opcion, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-tinta/8 font-mono text-xs font-semibold text-tinta/60">
                          {i + 1}
                        </span>
                        <Label htmlFor={`opcion-${i}`} className="sr-only">
                          {`Opción ${i + 1}${i < MIN_OPCIONES_NOMBRE ? "" : " (opcional)"}`}
                        </Label>
                        <Input
                          id={`opcion-${i}`}
                          data-campo={i === 0 ? "opcionesNombre" : undefined}
                          value={opcion}
                          maxLength={120}
                          placeholder={PLACEHOLDERS_NOMBRE[i] ?? "Otra opción"}
                          onChange={(e) => {
                            const siguientes = [...r.opcionesNombre];
                            siguientes[i] = e.target.value;
                            set("opcionesNombre", siguientes);
                          }}
                          aria-invalid={!!errores.opcionesNombre}
                          className="h-12 rounded-2xl border-tinta/15 bg-white px-4 text-base focus-visible:border-chancla focus-visible:ring-chancla/20"
                        />
                        {i >= MIN_OPCIONES_NOMBRE && (
                          <button
                            type="button"
                            onClick={() =>
                              set(
                                "opcionesNombre",
                                r.opcionesNombre.filter((_, j) => j !== i),
                              )
                            }
                            className="grid size-10 shrink-0 place-items-center rounded-full text-tinta/55 ring-1 ring-tinta/15 transition hover:bg-tinta/5 hover:text-tinta focus-visible:ring-4 focus-visible:ring-chancla/30 focus-visible:outline-none"
                            aria-label={`Quitar la opción ${i + 1}`}
                          >
                            <X className="size-4" aria-hidden="true" />
                          </button>
                        )}
                      </li>
                    ))}
                  </ol>
                  {r.opcionesNombre.length < MAX_OPCIONES_NOMBRE && (
                    <button
                      type="button"
                      onClick={() => set("opcionesNombre", [...r.opcionesNombre, ""])}
                      className="mt-4 inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold text-chancla-2 ring-1 ring-chancla/30 transition hover:bg-chancla/10 focus-visible:ring-4 focus-visible:ring-chancla/30 focus-visible:outline-none"
                    >
                      <Plus className="size-4" aria-hidden="true" /> Añadir otra opción
                    </button>
                  )}
                  {errores.opcionesNombre && (
                    <FieldError id="opcionesNombre-error" className="mt-4">
                      {errores.opcionesNombre}
                    </FieldError>
                  )}
                </fieldset>
              </Paso>
            )}

            {idPaso === "telefono" && (
              <Paso
                headingRef={headingRef}
                titulo="¿Y un teléfono?"
                texto="Con el prefijo del país. Lo usaremos solo si hace falta aclarar algo de tu alta."
              >
                <TextField
                  id="telefono"
                  label="Teléfono de contacto (con prefijo)"
                  type="tel"
                  value={r.telefono}
                  onChange={(v) => set("telefono", v)}
                  error={errores.telefono}
                  autoComplete="tel"
                  inputMode="tel"
                  maxLength={40}
                  placeholder="+34 600 000 000"
                />
              </Paso>
            )}

            {idPaso === "direccion" && (
              <Paso
                headingRef={headingRef}
                titulo="¿Cuál es tu dirección?"
                texto="Tiene que poder recibir correspondencia. Puede ser la personal o la de tu negocio."
              >
                <AreaTexto
                  id="direccion"
                  label="Dirección completa"
                  value={r.direccion}
                  onChange={(v) => set("direccion", v)}
                  error={errores.direccion}
                  maxLength={300}
                  rows={3}
                  placeholder="Calle, número, piso/puerta, CP, localidad, provincia y país"
                  hint="Calle, número, piso/puerta, código postal, localidad, provincia y país."
                />
              </Paso>
            )}

            {idPaso === "actividad" && (
              <Paso
                headingRef={headingRef}
                titulo="¿A qué se va a dedicar tu LLC?"
                texto="Un resumen corto, con tus palabras. Nos sirve para describir la actividad en el alta."
              >
                <AreaTexto
                  id="actividad"
                  label="Resumen de la actividad de la LLC"
                  value={r.actividad}
                  onChange={(v) => set("actividad", v)}
                  error={errores.actividad}
                  maxLength={2000}
                  rows={5}
                  placeholder="Por ejemplo: consultoría de marketing digital para pequeñas empresas, con clientes en Europa y Latinoamérica."
                  hint={
                    r.actividad.trim().length < MIN_ACTIVIDAD
                      ? `Mínimo ${MIN_ACTIVIDAD} caracteres · llevas ${r.actividad.trim().length}`
                      : `${r.actividad.trim().length} caracteres`
                  }
                />
              </Paso>
            )}

            {idPaso === "pais" && (
              <Paso
                headingRef={headingRef}
                titulo="¿En qué país resides?"
                texto="El país donde vives ahora mismo."
              >
                <TextField
                  id="paisResidencia"
                  label="País de residencia"
                  value={r.paisResidencia}
                  onChange={(v) => set("paisResidencia", v)}
                  error={errores.paisResidencia}
                  autoComplete="country-name"
                  maxLength={80}
                  placeholder="Ej: España, México, Argentina..."
                />
              </Paso>
            )}

            {idPaso === "facturacion" && (
              <Paso
                headingRef={headingRef}
                titulo="¿Cuánto esperas facturar?"
                texto="La facturación anual media esperada en los primeros 2 años. Una estimación es suficiente."
              >
                <RadioGroup name="facturacion" label="Facturación anual media esperada" error={errores.facturacion}>
                  {FACTURACIONES.map((f) => (
                    <OptionCard
                      key={f}
                      name="facturacion"
                      value={f}
                      checked={r.facturacion === f}
                      onChange={() => set("facturacion", f)}
                      titulo={FACTURACION[f]}
                      compact
                    />
                  ))}
                </RadioGroup>
              </Paso>
            )}

            {idPaso === "aceptacion" && (
              <Paso
                headingRef={headingRef}
                titulo="Último paso"
                texto={
                  esVarios
                    ? "La persona de contacto acepta las condiciones en nombre de todos los socios. Al continuar, guardamos vuestros datos de alta."
                    : "Revisa y acepta las condiciones. Al continuar, guardamos tus datos de alta."
                }
              >
                <div className="space-y-4">
                  <label className="flex cursor-pointer items-start gap-3 text-tinta/80">
                    <input
                      type="checkbox"
                      data-campo="aceptaTerminos"
                      checked={r.aceptaTerminos}
                      onChange={(e) => set("aceptaTerminos", e.target.checked)}
                      className="mt-0.5 size-5 shrink-0 accent-[var(--chancla)]"
                      aria-invalid={!!errores.aceptaTerminos}
                    />
                    <span>
                      {esVarios ? "En nombre de todos los socios, acepto los" : "Acepto los"}{" "}
                      <Link
                        href="/legal"
                        target="_blank"
                        className="font-medium text-tinta underline underline-offset-2"
                      >
                        Términos y Condiciones del servicio de apertura de LLC
                      </Link>
                      .
                      {errores.aceptaTerminos && (
                        <span className="mt-1 block text-sm font-medium text-destructive">
                          {errores.aceptaTerminos}
                        </span>
                      )}
                    </span>
                  </label>
                  <label className="flex cursor-pointer items-start gap-3 text-sm text-tinta/70">
                    <input
                      type="checkbox"
                      data-campo="consentimiento"
                      checked={consentimiento}
                      onChange={(e) => {
                        setConsentimiento(e.target.checked);
                        setErrores((prev) => {
                          if (!prev.consentimiento) return prev;
                          const next = { ...prev };
                          delete next.consentimiento;
                          return next;
                        });
                      }}
                      className="mt-0.5 size-5 shrink-0 accent-[var(--chancla)]"
                      aria-invalid={!!errores.consentimiento}
                    />
                    <span>
                      Acepto que Negocios en Chanclas use estos datos para preparar {esVarios ? "el alta" : "mi alta"} y
                      responder a {esVarios ? "nuestra" : "mi"} consulta, según su{" "}
                      <Link href="/legal" className="font-medium text-tinta underline underline-offset-2">
                        política de privacidad
                      </Link>
                      .
                      {errores.consentimiento && (
                        <span className="mt-1 block font-medium text-destructive">{errores.consentimiento}</span>
                      )}
                    </span>
                  </label>
                  {esVarios && (
                    <label className="flex cursor-pointer items-start gap-3 text-sm text-tinta/70">
                      <input
                        type="checkbox"
                        data-campo="confirmaSocios"
                        checked={r.confirmaSocios}
                        onChange={(e) => set("confirmaSocios", e.target.checked)}
                        className="mt-0.5 size-5 shrink-0 accent-[var(--chancla)]"
                        aria-invalid={!!errores.confirmaSocios}
                      />
                      <span>
                        Confirmo que los demás socios conocen y aceptan esta solicitud.
                        {errores.confirmaSocios && (
                          <span className="mt-1 block font-medium text-destructive">{errores.confirmaSocios}</span>
                        )}
                      </span>
                    </label>
                  )}
                </div>
              </Paso>
            )}

            {desvio && desvio !== "noSe" && <TarjetaDesvio desvio={desvio} />}

            {errorEnvio && idPaso !== "contacto" && (
              <p role="alert" className="mt-5 rounded-2xl bg-destructive/10 p-4 text-sm text-destructive">
                {errorEnvio}{" "}
                <a
                  className="font-semibold underline"
                  href={contacto.whatsapp.espana.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Escríbenos por WhatsApp
                </a>
                .
              </p>
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
              {!desvio && (
              <button
                type="submit"
                disabled={enviando || pasoInvalido}
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-chancla px-7 font-semibold text-white shadow-[0_8px_24px_-10px_var(--chancla)] transition-all duration-300 hover:bg-chancla-2 focus-visible:ring-4 focus-visible:ring-chancla/30 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                {textoBoton}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </button>
              )}
            </div>
          </form>
        ) : (
          <Resultado
            headingRef={headingRef}
            r={r}
            estado={estadoLlc}
            caso={caso}
            plan={plan}
            referencia={referencia}
            formulariosAbiertos={formulariosAbiertos}
            resumen={resumen}
            onEditar={irA}
            onCopiar={copiarResumen}
            onReiniciar={reiniciar}
          />
        )}

        <p className="mt-6 flex items-start gap-2 text-sm text-tinta/60 lg:hidden">
          <Lock className="mt-0.5 size-4 shrink-0 text-chancla-2" aria-hidden="true" />
          Al terminar guardamos tus respuestas para poder responderte. No las usamos para nada más.
        </p>
      </div>
    </div>
  );
}

function StepIndicator({
  pasos,
  paso,
  maxPaso,
  onIr,
}: {
  pasos: readonly PasoAsistente[];
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
  texto: React.ReactNode;
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
  columns?: 1 | 2 | 3;
  children: React.ReactNode;
}) {
  return (
    <fieldset aria-describedby={error ? `${name}-error` : undefined}>
      <legend className="sr-only">{label}</legend>
      <div
        className={cn(
          "grid grid-cols-1 gap-3",
          columns === 2 && "sm:grid-cols-2",
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
  precio,
  compact,
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  titulo: string;
  texto?: string;
  precio?: string;
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
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
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
        </span>
        {texto && <span className="mt-0.5 block text-tinta/65">{texto}</span>}
      </span>
      {precio && (
        <span className="shrink-0 text-right font-display font-extrabold text-tinta">{precio}</span>
      )}
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
  placeholder,
  maxLength = 200,
  inputMode,
  campo,
}: {
  /** `data-campo` para enfocar el primer error (por defecto, el id). */
  campo?: string;
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  optional?: boolean;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  maxLength?: number;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
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
        data-campo={campo ?? id}
        type={type}
        value={value}
        maxLength={maxLength}
        autoComplete={autoComplete}
        placeholder={placeholder}
        inputMode={inputMode}
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

/** Texto corto del siguiente paso, para el resumen copiado. */
function siguientePaso(caso: Caso, plan: PlanAsistente | undefined, estado: ClaveEstadoLlc | null, socios: number): string {
  if (caso === "plan") {
    if (!estado) return "Plan Básico o Plan Estándar";
    const planes = plan ? [plan] : (["basico", "estandar"] as const);
    return planes.map((p) => `${PLANES_APERTURA[p].nombre}: ${precioApertura(estado, p).texto}`).join(" · ");
  }
  if (caso === "varios") {
    return estado ? `LLC de varios socios: ${precioAperturaVarios(estado, socios).texto}` : "LLC de varios socios";
  }
  if (caso === "formularios") return `${formulariosLlc.nombre} (${formulariosLlc.precio})`;
  if (caso === "cierre") return `Cierre de LLC (${cierreLlc.precioCompleto})`;
  return "Hablar con nosotros";
}

const AVISO_BANCO =
  "La apertura guiada de cuenta bancaria es un servicio adicional, no incluido en ningún plan. Se contrata aparte.";

function Resultado({
  headingRef,
  r,
  estado,
  caso,
  plan,
  referencia,
  formulariosAbiertos,
  resumen,
  onEditar,
  onCopiar,
  onReiniciar,
}: {
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  r: Respuestas;
  estado: ClaveEstadoLlc | null;
  caso: Caso | null;
  plan?: PlanAsistente;
  referencia: string | null;
  formulariosAbiertos: boolean;
  resumen: { paso: number; k: string; v: string }[];
  onEditar: (i: number) => void;
  onCopiar: () => void;
  onReiniciar: () => void;
}) {
  const [planElegido, setPlanElegido] = useState<PlanAsistente | undefined>(plan);
  if (!caso || caso === "cierre") return null;
  const interlocutor = caso === "varios" && r.interlocutor != null ? r.socios[r.interlocutor] : null;
  const nombreCompleto = interlocutor ? interlocutor.nombre : r.nombre;
  const nombrePila = nombreCompleto.trim().split(/\s+/)[0];
  const saludo = nombrePila ? `${nombrePila}, ` : "";
  const email = (interlocutor ? interlocutor.email : r.email).trim().toLowerCase();
  const planActual = planElegido === "estandar" ? planEstandar : planElegido === "basico" ? planBasico : null;
  const otroPlan = planElegido === "estandar" ? planBasico : planEstandar;

  let titular: React.ReactNode;
  let cuerpo: React.ReactNode;
  let confirmacion: React.ReactNode;
  if (caso === "plan" && estado) {
    const renovacion = precioRenovacion(estado);
    titular = planActual ? (
      <>
        {saludo}lo tuyo es el <span className="font-serif font-normal text-chancla italic">{planActual.nombre}.</span>
      </>
    ) : (
      <>
        {saludo}lo tuyo es constituir tu LLC en{" "}
        <span className="font-serif font-normal text-chancla italic">{nombreEstado(estado)}.</span>
      </>
    );
    cuerpo = (
      <>
        <p className="mt-3 max-w-xl text-arena/70">
          Registramos tu LLC en {nombreEstado(estado)}.
        </p>
        <div className={cn("mt-7 grid grid-cols-1 gap-4", !planActual && "md:grid-cols-2")}>
          {(planActual ? [planActual] : [planBasico, planEstandar]).map((p) => (
            <TarjetaPlan
              key={p.id}
              plan={p}
              estado={estado}
              renovacion={renovacion.texto}
              referencia={referencia}
              email={email}
            />
          ))}
        </div>
        {email && <p className="mt-4 max-w-xl text-sm text-arena/85">{avisoEmailPago(email)}</p>}
        <p className="mt-2 max-w-xl text-sm text-arena/60">{avisoPagoApertura}</p>
        {planActual && (
          <button
            type="button"
            onClick={() => setPlanElegido(otroPlan.id as PlanAsistente)}
            className="mt-4 text-sm font-semibold text-sol underline underline-offset-4"
          >
            Prefiero el {otroPlan.nombre} ({precioApertura(estado, otroPlan.id as PlanApertura).texto})
          </button>
        )}
        <p className="mt-6 text-sm text-arena/60">{AVISO_BANCO}</p>
      </>
    );
    confirmacion = (
      <Confirmacion
        titulo="¡Recibido! Ya tenemos tus datos de alta."
        queAhora={`Cuando pagues, empezamos con tu LLC y te escribimos a ${email} con cada paso.`}
        cuando={`Tu LLC estará lista en ${PLAZO} desde el pago.`}
        orientativo
      />
    );
  } else if (caso === "varios" && estado) {
    const socios = r.socios.length;
    const precio = precioAperturaVarios(estado, socios);
    const pago = enlacePago("varios", precio.total);
    titular = (
      <>
        {saludo}lo vuestro es una{" "}
        <span className="font-serif font-normal text-chancla italic">LLC de varios socios.</span>
      </>
    );
    cuerpo = (
      <>
        <p className="mt-7 font-display text-3xl font-extrabold md:text-4xl">{precio.texto}</p>
        <p className="mt-2 text-sm text-arena/70">
          {socios} socios en {nombreEstado(estado)}. Renovación anual: {precioRenovacion(estado).texto}/año, a partir del
          segundo año.
        </p>
        <ul className="mt-6 space-y-2.5">
          {[
            `Registro de la LLC en ${nombreEstado(estado)}`,
            "Agente registrador y dirección postal durante 1 año",
            "EIN",
            "Operating Agreement modelo para varios socios, con los porcentajes, la gestión y el reparto que nos habéis indicado",
            `${PLAZO.charAt(0).toUpperCase()}${PLAZO.slice(1)}. ${AVISO_PLAZO}`,
            "Entrega por email",
          ].map((item) => (
            <li key={item} className="flex gap-3 text-arena/85">
              <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-chancla text-white">
                <Check className="size-3" strokeWidth={3} aria-hidden="true" />
              </span>
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-6 rounded-2xl bg-sol/15 p-4 text-sm text-arena/90">
          Cada año, una LLC de varios socios presenta ante el IRS el <strong>Form 1065 y un K-1 por socio</strong>{" "}
          (antes del 15 de marzo). No está incluido en la apertura; te lo preparamos y presentamos aparte,{" "}
          {TEXTOS_PRECIO.formularios1065Desde}.
        </p>
        <p className="mt-4 text-sm text-arena/60">{AVISO_BANCO}</p>
        <div className="mt-7">
          {pago ? (
            <>
              <CtaLink href={enlaceStripe(pago, { id: referencia, email })}>Pagar {dolares(precio.total)}</CtaLink>
              {email && (
                <p className="mt-4 max-w-xl text-sm text-arena/85">
                  Usa en Stripe el mismo email que nos has dado ({email}). Así unimos vuestro pago con vuestros datos.
                </p>
              )}
              <p className="mt-2 max-w-xl text-sm text-arena/60">{avisoPagoApertura}</p>
            </>
          ) : (
            <PagoPorContacto
              email={email}
              contactoHref={enlaceContacto(
                "arranque",
                `Queremos pagar la LLC de varios socios (${socios} socios, ${nombreEstado(estado)}): ${dolares(precio.total)}.`,
              )}
            />
          )}
        </div>
      </>
    );
    confirmacion = (
      <Confirmacion
        titulo="¡Recibido! Ya tenemos vuestros datos de alta."
        queAhora="Cuando paguéis, empezamos con vuestra LLC y os escribimos con el borrador del Operating Agreement para que lo reviséis."
        cuando={`La LLC estará lista en ${PLAZO} desde el pago.`}
        orientativo
      />
    );
  } else if (caso === "formularios") {
    titular = (
      <>
        {saludo}lo tuyo son los{" "}
        <span className="font-serif font-normal text-chancla italic">{formulariosLlc.nombre}.</span>
      </>
    );
    cuerpo = (
      <>
        <p className="mt-3 max-w-xl text-arena/70">{formulariosLlc.descripcion}</p>
        <p className="mt-7 font-display text-3xl font-extrabold">{formulariosLlc.precio}</p>
        <p className="mt-2 max-w-xl text-sm text-arena/70">{formulariosLlc.alcance}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          {formulariosAbiertos ? (
            <CtaLink href="/formularios-llc">Presentar mis formularios</CtaLink>
          ) : (
            <CtaLink href="/contacto?servicio=en-regla">Preparar con nosotros</CtaLink>
          )}
        </div>
      </>
    );
    confirmacion = (
      <Confirmacion
        queAhora={`Hemos guardado tus respuestas. Si tienes cualquier duda, te escribimos a ${email}.`}
      />
    );
  } else {
    titular = (
      <>
        {saludo}lo tuyo es{" "}
        <span className="font-serif font-normal text-chancla italic">hablar con nosotros.</span>
      </>
    );
    cuerpo = (
      <>
        <p className="mt-3 max-w-xl text-arena/70">
          {r.tipo === "llc-2"
            ? `${formularios1065.texto} Escríbenos y lo preparamos contigo.`
            : "Si incumples alguno de los requisitos o tienes dudas, lo mejor es que te pongas en contacto con nosotros."}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <CtaLink href="/contacto?servicio=en-regla">Ponte en contacto con nosotros</CtaLink>
          <CtaLink href={contacto.whatsapp.espana.href} variant="light" arrow={false}>
            WhatsApp {contacto.whatsapp.espana.visible}
          </CtaLink>
        </div>
      </>
    );
    confirmacion = <Confirmacion queAhora={`Hemos guardado tus respuestas: te escribimos a ${email}.`} />;
  }

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
            {titular}
          </h2>
          {cuerpo}
        </div>
      </section>

      {caso === "formularios" && (
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

      <section className="rounded-[2rem] border border-tinta/10 bg-card p-7 sm:p-9">{confirmacion}</section>

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
      </section>
    </div>
  );
}

/** Plan Básico o Estándar con el precio del estado elegido. Sin enlace de Stripe para ese importe, a contacto. */
function TarjetaPlan({
  plan,
  estado,
  renovacion,
  referencia,
  email,
}: {
  plan: Plan;
  estado: ClaveEstadoLlc;
  renovacion: string;
  referencia: string | null;
  email: string;
}) {
  const id = plan.id as PlanApertura;
  const precio = precioApertura(estado, id);
  const pago = enlacePago(id, precio.total);
  return (
    <article className="flex flex-col rounded-3xl bg-arena/10 p-6">
      <p className="font-mono text-xs tracking-[0.16em] text-sol uppercase">{plan.servicio}</p>
      <h3 className="mt-2 text-2xl font-bold">{plan.nombre}</h3>
      <p className="mt-1 text-arena/70">«{plan.lema}»</p>
      <p className="mt-5 font-display text-2xl font-extrabold">
        {precio.texto}
        <span className="ml-2 font-sans text-base font-semibold text-arena/70">(primer año)*</span>
      </p>
      <p className="mt-2 text-xs text-arena/60">*Renovación anual: {renovacion}/año, a partir del segundo año.</p>
      <ul className="mt-5 flex-1 space-y-2.5">
        {[`Registro de la LLC en ${nombreEstado(estado)}`, ...plan.incluye.filter((i) => i !== incluyeApertura[0])].map((item) => (
          <li key={item} className="flex gap-3 text-arena/85">
            <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-chancla text-white">
              <Check className="size-3" strokeWidth={3} aria-hidden="true" />
            </span>
            {item}
          </li>
        ))}
      </ul>
      {pago ? (
        <CtaLink href={enlaceStripe(pago, { id: referencia, email })} className="mt-6 w-full">
          {plan.cta}
        </CtaLink>
      ) : (
        <div className="mt-6">
          <PagoPorContacto
            email={email}
            contactoHref={enlaceContacto(
              "arranque",
              `Quiero pagar el ${plan.nombre} en ${nombreEstado(estado)}: ${dolares(precio.total)}.`,
            )}
          />
        </div>
      )}
    </article>
  );
}

/** Desvío a contacto con el servicio marcado y el mensaje empezado, y WhatsApp. */
function TarjetaDesvio({ desvio }: { desvio: Exclude<Desvio, "noSe"> }) {
  const d = DESVIOS[desvio];
  return (
    <div role="status" className="mt-8 rounded-[1.5rem] border-2 border-sol/70 bg-sol/15 p-5 animate-in fade-in duration-300">
      <p className="text-tinta/85">{d.texto}</p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <CtaLink href={enlaceContacto("arranque", d.mensaje)}>Escríbenos</CtaLink>
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

/** «Aún no lo sé» en el estado: tarjeta amable en lugar de «Continuar», con la salida «Elegir Nuevo México». */
function TarjetaNoSe({ onElegirNuevoMexico }: { onElegirNuevoMexico: () => void }) {
  const nm = precioApertura(ESTADO_REFERENCIA, "basico");
  return (
    <div role="status" className="mt-8 rounded-[1.5rem] bg-agua/40 p-6 animate-in fade-in duration-300">
      <p className="text-tinta/85">
        <strong className="text-tinta">{DESVIOS.noSe.titulo}</strong> {DESVIOS.noSe.texto}
      </p>
      <div className="mt-5 flex flex-col items-start gap-2">
        <CtaLink href={enlaceContacto("arranque", DESVIOS.noSe.mensaje)}>Escríbenos</CtaLink>
        <a
          href={contacto.whatsapp.espana.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-chancla-2 underline underline-offset-4"
        >
          o por WhatsApp
        </a>
      </div>
      <p className="mt-6 text-sm text-tinta/75">
        Pista: la mayoría de nuestros clientes la abren en {nombreEstado(ESTADO_REFERENCIA)} ({nm.texto}).
      </p>
      <button
        type="button"
        onClick={onElegirNuevoMexico}
        className="mt-3 inline-flex h-11 items-center gap-2 rounded-full px-5 font-semibold text-tinta ring-1 ring-tinta/20 transition hover:bg-white/70 focus-visible:ring-4 focus-visible:ring-chancla/30 focus-visible:outline-none"
      >
        Elegir {nombreEstado(ESTADO_REFERENCIA)} <ArrowRight className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}

function PrecioVarios({ estado, socios }: { estado: ClaveEstadoLlc; socios: number }) {
  const precio = precioAperturaVarios(estado, socios);
  return (
    <p className="mt-6 rounded-2xl bg-tinta p-4 text-arena" aria-live="polite">
      <span className="block font-mono text-xs tracking-[0.16em] text-sol uppercase">
        {socios} socios · {nombreEstado(estado)}
      </span>
      <span className="mt-1 block font-display text-2xl font-extrabold">{precio.texto}</span>
    </p>
  );
}

function SumaPorcentajes({ socios }: { socios: BorradorSocio[] }) {
  const suma = socios.reduce((a, s) => a + (porcentajeDe(s.porcentaje) ?? 0), 0);
  const ok = Math.abs(suma - 100) < 0.05;
  return (
    <p className={cn("text-sm font-semibold", ok ? "text-tinta/70" : "text-chancla-2")} aria-live="polite">
      Suma: {Number(suma.toFixed(2)).toLocaleString("es-ES")} %{ok ? " ✓" : " (tiene que ser 100 %)"}
    </p>
  );
}

function FichaSocio({
  indice,
  socio,
  errores,
  onCambiar,
  onQuitar,
}: {
  indice: number;
  socio: BorradorSocio;
  errores: Record<string, string>;
  onCambiar: <K extends keyof BorradorSocio>(k: K, v: BorradorSocio[K]) => void;
  onQuitar?: () => void;
}) {
  const e = (campo: string) => errores[`socios.${indice}.${campo}`];
  const id = (campo: string) => `socio-${indice}-${campo}`;
  return (
    <fieldset className="rounded-[1.5rem] border border-tinta/10 bg-white/60 p-5">
      <div className="flex items-center justify-between gap-3">
        <legend className="font-display text-lg font-bold text-tinta">Socio {indice + 1}</legend>
        {onQuitar && (
          <button
            type="button"
            onClick={onQuitar}
            className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-tinta/60 ring-1 ring-tinta/15 transition hover:bg-tinta/5 hover:text-tinta"
            aria-label={`Quitar el socio ${indice + 1}`}
          >
            <Trash2 className="size-4" aria-hidden="true" /> Quitar
          </button>
        )}
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField id={id("nombre")} label="Nombre completo" value={socio.nombre} onChange={(v) => onCambiar("nombre", v)} error={e("nombre")} maxLength={120} campo={indice === 0 ? "socios" : undefined} />
        <TextField id={id("email")} label="Email" type="email" value={socio.email} onChange={(v) => onCambiar("email", v)} error={e("email")} inputMode="email" />
        <TextField id={id("paisResidencia")} label="País de residencia" value={socio.paisResidencia} onChange={(v) => onCambiar("paisResidencia", v)} error={e("paisResidencia")} maxLength={80} />
        <TextField id={id("nacionalidad")} label="Nacionalidad" value={socio.nacionalidad} onChange={(v) => onCambiar("nacionalidad", v)} error={e("nacionalidad")} maxLength={80} />
        <TextField id={id("porcentaje")} label="Participación (%)" value={socio.porcentaje} onChange={(v) => onCambiar("porcentaje", v)} error={e("porcentaje")} maxLength={6} inputMode="decimal" placeholder="50" />
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <MiniRadio
          name={id("tipo")}
          label="¿Persona o empresa?"
          value={socio.tipo}
          opciones={Object.entries(TIPOS_SOCIO) as [BorradorSocio["tipo"] & string, string][]}
          onChange={(v) => onCambiar("tipo", v)}
          error={e("tipo")}
        />
        <MiniRadio
          name={id("residenteEeuu")}
          label="¿Ciudadano o residente fiscal en EE. UU.?"
          value={socio.residenteEeuu}
          opciones={[
            ["no", "No"],
            ["si", "Sí"],
          ]}
          onChange={(v) => onCambiar("residenteEeuu", v)}
          error={e("residenteEeuu")}
        />
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
}: {
  name: string;
  label: string;
  value: T | null;
  opciones: [T, string][];
  onChange: (v: T) => void;
  error?: string;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-tinta">{label}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {opciones.map(([v, texto]) => (
          <label
            key={v}
            className={cn(
              "inline-flex h-10 cursor-pointer items-center rounded-full px-4 text-sm font-semibold ring-1 transition has-focus-visible:ring-4 has-focus-visible:ring-chancla/30",
              value === v ? "bg-tinta text-arena ring-tinta" : "text-tinta/75 ring-tinta/20 hover:bg-tinta/5",
            )}
          >
            <input type="radio" name={name} value={v} checked={value === v} onChange={() => onChange(v)} className="sr-only" />
            {texto}
          </label>
        ))}
      </div>
      {error && <p className="mt-2 text-sm font-medium text-destructive">{error}</p>}
    </fieldset>
  );
}

function pasoDeCampo(clave: string, esCrear: boolean, esVarios: boolean): PasoId | undefined {
  if (clave.startsWith("socios")) return "socios";
  if (clave === "nombre") return esCrear ? "titular" : "contacto";
  if (clave === "email") return esCrear ? "email" : "contacto";
  if (clave === "telefono") return esVarios ? "interlocutor" : esCrear ? "telefono" : "contacto";
  if (clave === "consentimiento") return esCrear ? "aceptacion" : "contacto";
  if ((clave === "direccion" || clave === "actividad") && esVarios) return "domicilio";
  return PASO_DE_CAMPO[clave];
}

function AreaTexto({
  id,
  label,
  value,
  onChange,
  error,
  hint,
  placeholder,
  maxLength,
  rows = 4,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  hint?: React.ReactNode;
  placeholder?: string;
  maxLength: number;
  rows?: number;
}) {
  const errorId = useId();
  const hintId = useId();
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="font-semibold">
        {label}
      </Label>
      <textarea
        id={id}
        data-campo={id}
        value={value}
        rows={rows}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        className="w-full rounded-2xl border border-tinta/15 bg-white px-4 py-3 text-base outline-none placeholder:text-muted-foreground focus-visible:border-chancla focus-visible:ring-3 focus-visible:ring-chancla/20 aria-invalid:border-destructive"
      />
      {error ? (
        <FieldError id={errorId}>{error}</FieldError>
      ) : (
        hint && (
          <p id={hintId} className="text-sm text-tinta/55" aria-live="polite">
            {hint}
          </p>
        )
      )}
    </div>
  );
}
