/**
 * Datos de alta de la LLC que pide el asistente /empezar cuando el caso es «crear».
 * Se usa en el cliente (qué paso es válido, botón Continuar) y en el servidor (validación con zod).
 */
import { z } from "zod";
import { ERROR_ACEPTA_TERMINOS } from "@/lib/privacidad";

export const FACTURACION = {
  "menos-25k": "Menos de 25.000 $",
  "25k-50k": "Entre 25.000 $ y 50.000 $",
  "50k-100k": "Entre 50.000 $ y 100.000 $",
  "mas-100k": "Más de 100.000 $",
} as const;
export type Facturacion = keyof typeof FACTURACION;
export const FACTURACIONES = Object.keys(FACTURACION) as Facturacion[];

export const MIN_OPCIONES_NOMBRE = 3;
export const MAX_OPCIONES_NOMBRE = 6;
export const MIN_ACTIVIDAD = 30;
export const MAX_ACTIVIDAD = 2000;
export const MIN_DIRECCION = 15;
export const MAX_DIRECCION = 300;

/** Pasos del alta de una LLC de un socio, en orden. Van después de punto, tipo y estado. */
export const PASOS_ALTA = [
  { id: "titular", label: "Titular" },
  { id: "email", label: "Email" },
  { id: "opciones", label: "Nombres de la LLC" },
  { id: "telefono", label: "Teléfono" },
  { id: "direccion", label: "Dirección" },
  { id: "actividad", label: "Actividad" },
  { id: "pais", label: "País de residencia" },
  { id: "facturacion", label: "Facturación" },
  { id: "aceptacion", label: "Aceptación" },
] as const;

/** Pasos del alta de una LLC de varios socios (`llc-varios-socios.md`, sección 4). */
export const PASOS_ALTA_SOCIOS = [
  { id: "numSocios", label: "Socios" },
  { id: "socios", label: "Datos de los socios" },
  { id: "interlocutor", label: "Persona de contacto" },
  { id: "opciones", label: "Nombres de la LLC" },
  { id: "gestion", label: "Gestión" },
  { id: "reparto", label: "Reparto y salida" },
  { id: "domicilio", label: "Dirección y actividad" },
  { id: "facturacion", label: "Facturación" },
  { id: "aceptacion", label: "Aceptación" },
] as const;

export type PasoAlta = (typeof PASOS_ALTA)[number]["id"] | (typeof PASOS_ALTA_SOCIOS)[number]["id"];

/** Pasos del resto de casos («ya tengo LLC»): los de siempre. */
export const PASOS_BASE = [
  { id: "punto", label: "Punto de partida" },
  { id: "tipo", label: "Tipo de empresa" },
  { id: "estado", label: "Estado" },
] as const;
export const PASOS_CONSULTA = [
  ...PASOS_BASE,
  { id: "nombre", label: "Nombre" },
  { id: "contacto", label: "Contacto" },
] as const;
export const PASOS_CREAR = [...PASOS_BASE, ...PASOS_ALTA] as const;
export const PASOS_CREAR_SOCIOS = [...PASOS_BASE, ...PASOS_ALTA_SOCIOS] as const;

export type PasoId = (typeof PASOS_CONSULTA)[number]["id"] | PasoAlta;
export type PasoAsistente = { id: PasoId; label: string };

export function pasosDe(punto: string | null, tipo?: string | null): readonly PasoAsistente[] {
  if (punto !== "crear") return PASOS_CONSULTA;
  return tipo === "llc-2" ? PASOS_CREAR_SOCIOS : PASOS_CREAR;
}

const IDS_ALTA = new Set<string>([...PASOS_ALTA, ...PASOS_ALTA_SOCIOS].map((p) => p.id));
export function esPasoAlta(id: PasoId): id is PasoAlta {
  return IDS_ALTA.has(id);
}

// --- Varios socios ---

export const MIN_SOCIOS = 2;
export const MAX_SOCIOS = 10;
/** «Más de 10» en el selector de socios: desvía a contacto. */
export const MAS_DE_DIEZ = "mas-10";

export const TIPOS_SOCIO = { persona: "Persona", empresa: "Empresa" } as const;
export type TipoSocio = keyof typeof TIPOS_SOCIO;
export const GESTION = { todos: "Todos los socios", gestores: "Uno o varios gestores" } as const;
export type Gestion = keyof typeof GESTION;
export const REPARTO = { porcentaje: "Según el porcentaje de cada uno", otro: "Otro reparto" } as const;
export type Reparto = keyof typeof REPARTO;

export type BorradorSocio = {
  nombre: string;
  email: string;
  paisResidencia: string;
  nacionalidad: string;
  /** Tal y como se escribe en el campo («33,33»). */
  porcentaje: string;
  tipo: TipoSocio | null;
  /** V4: ciudadano o residente fiscal en EE. UU. */
  residenteEeuu: "si" | "no" | null;
};

export function socioVacio(): BorradorSocio {
  return { nombre: "", email: "", paisResidencia: "", nacionalidad: "", porcentaje: "", tipo: null, residenteEeuu: null };
}

/** «33,33» → 33.33. Null si no es un porcentaje válido (mayor que 0 y menor que 100, hasta 2 decimales). */
export function porcentajeDe(valor: unknown): number | null {
  const bruto = (typeof valor === "number" ? String(valor) : typeof valor === "string" ? valor : "")
    .replace(/\s|%/g, "")
    .replace(",", ".");
  if (!/^\d{1,2}(?:\.\d{1,2})?$/.test(bruto)) return null;
  const n = Number(bruto);
  return n > 0 && n < 100 ? n : null;
}

/** Los porcentajes suman 100 (con margen de redondeo de los decimales). */
export function sumaCien(porcentajes: readonly number[]): boolean {
  const suma = porcentajes.reduce((a, b) => a + b, 0);
  return Math.abs(suma - 100) < 0.05;
}

/** Algún socio saca el alta del carril online (empresa o persona de EE. UU.). */
export function desvioSocios(socios: readonly Pick<BorradorSocio, "tipo" | "residenteEeuu">[]): "socioEmpresa" | "socioEeuu" | null {
  if (socios.some((s) => s.tipo === "empresa")) return "socioEmpresa";
  if (socios.some((s) => s.residenteEeuu === "si")) return "socioEeuu";
  return null;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Teléfono internacional: empieza por «+», de 8 a 15 cifras; admite espacios, guiones y paréntesis. */
export function telefonoConPrefijo(value: string): boolean {
  const tel = value.trim();
  if (!/^\+[\d\s().-]+$/.test(tel) || tel.length > 40) return false;
  const cifras = tel.replace(/\D/g, "").length;
  return cifras >= 8 && cifras <= 15;
}

/** Quita huecos de más y deja las opciones vacías fuera (salvo las 3 obligatorias, que cuentan). */
export function limpiarOpciones(opciones: readonly string[]): string[] {
  return opciones.map((o) => o.replace(/\s+/g, " ").trim()).filter(Boolean);
}

export type BorradorAlta = {
  tipo?: string | null;
  nombre: string;
  email: string;
  opcionesNombre: string[];
  telefono: string;
  direccion: string;
  actividad: string;
  paisResidencia: string;
  facturacion: Facturacion | null;
  aceptaTerminos: boolean;
  consentimiento: boolean;
  // Varios socios.
  numSocios?: number | typeof MAS_DE_DIEZ | null;
  socios?: BorradorSocio[];
  interlocutor?: number | null;
  gestion?: Gestion | null;
  gestores?: number[];
  reparto?: Reparto | null;
  repartoOtro?: string;
  pactoSalida?: "si" | "no" | null;
  confirmaSocios?: boolean;
};

const MSG = {
  nombre: "Escribe tu nombre completo.",
  email: "Escribe un email válido.",
  opciones: `Danos al menos ${MIN_OPCIONES_NOMBRE} opciones de nombre.`,
  opcionesRepetidas: "Las opciones tienen que ser distintas.",
  opcionLarga: "Cada opción puede tener hasta 120 caracteres.",
  telefono: "Escribe el teléfono con el prefijo del país, por ejemplo +34 600 000 000.",
  direccion: "Escribe tu dirección completa: calle, número, CP, localidad, provincia y país.",
  actividad: `Cuéntanos la actividad en al menos ${MIN_ACTIVIDAD} caracteres.`,
  paisResidencia: "Escribe tu país de residencia.",
  facturacion: "Elige una opción.",
  aceptaTerminos: ERROR_ACEPTA_TERMINOS,
  consentimiento: "Necesitamos tu consentimiento.",
  numSocios: "Dinos cuántos socios sois.",
  masDeDiez: "Con más de 10 socios preparamos la LLC a medida: escríbenos.",
  socioNombre: "Escribe el nombre completo de cada socio.",
  socioEmail: "Escribe un email válido para cada socio.",
  socioPais: "Escribe el país de residencia de cada socio.",
  socioNacionalidad: "Escribe la nacionalidad de cada socio.",
  socioPorcentaje: "Escribe el porcentaje de cada socio (mayor que 0 y menor que 100).",
  socioTipo: "Dinos si cada socio es una persona o una empresa.",
  socioEeuu: "Dinos si cada socio es ciudadano o residente fiscal en EE. UU.",
  socioDesvio: "Con un socio empresa o de EE. UU. el alta no se hace online: escríbenos.",
  sumaCien: "Los porcentajes tienen que sumar 100 %.",
  emailsRepetidos: "Cada socio necesita su propio email.",
  interlocutor: "Elige quién de vosotros será la persona de contacto.",
  gestion: "Elige quién decide el día a día.",
  gestores: "Marca quién o quiénes serán los gestores.",
  reparto: "Elige cómo os repartís los beneficios.",
  repartoOtro: "Cuéntanos cómo os vais a repartir los beneficios.",
  pactoSalida: "Elige una opción.",
  confirmaSocios: "Confirma que los demás socios conocen y aceptan la solicitud.",
} as const;

function erroresOpciones(opciones: readonly string[]): string | null {
  const obligatorias = opciones.slice(0, MIN_OPCIONES_NOMBRE).map((o) => o.trim());
  if (obligatorias.length < MIN_OPCIONES_NOMBRE || obligatorias.some((o) => !o)) return MSG.opciones;
  const limpias = limpiarOpciones(opciones);
  if (limpias.length > MAX_OPCIONES_NOMBRE) return MSG.opciones;
  if (limpias.some((o) => o.length > 120)) return MSG.opcionLarga;
  const unicas = new Set(limpias.map((o) => o.toLowerCase()));
  if (unicas.size !== limpias.length) return MSG.opcionesRepetidas;
  return null;
}

/** Errores de un paso del alta. Vacío = el paso es válido y se puede continuar. */
export function erroresPasoAlta(paso: PasoAlta, a: BorradorAlta): Record<string, string> {
  const e: Record<string, string> = {};
  switch (paso) {
    case "titular": {
      const n = a.nombre.trim();
      if (n.length < 3 || n.length > 120) e.nombre = MSG.nombre;
      break;
    }
    case "email":
      if (!EMAIL_RE.test(a.email.trim()) || a.email.trim().length > 200) e.email = MSG.email;
      break;
    case "opciones": {
      const err = erroresOpciones(a.opcionesNombre);
      if (err) e.opcionesNombre = err;
      break;
    }
    case "telefono":
      if (!telefonoConPrefijo(a.telefono)) e.telefono = MSG.telefono;
      break;
    case "direccion": {
      const d = a.direccion.trim();
      if (d.length < MIN_DIRECCION || d.length > MAX_DIRECCION) e.direccion = MSG.direccion;
      break;
    }
    case "actividad": {
      const t = a.actividad.trim();
      if (t.length < MIN_ACTIVIDAD || t.length > MAX_ACTIVIDAD) e.actividad = MSG.actividad;
      break;
    }
    case "pais": {
      const p = a.paisResidencia.trim();
      if (p.length < 2 || p.length > 80) e.paisResidencia = MSG.paisResidencia;
      break;
    }
    case "facturacion":
      if (!a.facturacion || !FACTURACIONES.includes(a.facturacion)) e.facturacion = MSG.facturacion;
      break;
    case "aceptacion":
      if (!a.aceptaTerminos) e.aceptaTerminos = MSG.aceptaTerminos;
      if (!a.consentimiento) e.consentimiento = MSG.consentimiento;
      if (a.tipo === "llc-2" && !a.confirmaSocios) e.confirmaSocios = MSG.confirmaSocios;
      break;
    case "numSocios":
      if (a.numSocios === MAS_DE_DIEZ) e.numSocios = MSG.masDeDiez;
      else if (typeof a.numSocios !== "number" || a.numSocios < MIN_SOCIOS || a.numSocios > MAX_SOCIOS) {
        e.numSocios = MSG.numSocios;
      }
      break;
    case "socios":
      Object.assign(e, erroresSocios(a.socios ?? []));
      break;
    case "interlocutor": {
      const n = a.socios?.length ?? 0;
      if (typeof a.interlocutor !== "number" || a.interlocutor < 0 || a.interlocutor >= n) {
        e.interlocutor = MSG.interlocutor;
      }
      if (a.telefono.trim() && !telefonoConPrefijo(a.telefono)) e.telefono = MSG.telefono;
      break;
    }
    case "gestion":
      if (!a.gestion || !(a.gestion in GESTION)) e.gestion = MSG.gestion;
      else if (a.gestion === "gestores" && !(a.gestores ?? []).length) e.gestores = MSG.gestores;
      break;
    case "reparto":
      if (!a.reparto || !(a.reparto in REPARTO)) e.reparto = MSG.reparto;
      else if (a.reparto === "otro" && !(a.repartoOtro ?? "").trim()) e.repartoOtro = MSG.repartoOtro;
      if (a.pactoSalida !== "si" && a.pactoSalida !== "no") e.pactoSalida = MSG.pactoSalida;
      break;
    case "domicilio": {
      const d = a.direccion.trim();
      if (d.length < MIN_DIRECCION || d.length > MAX_DIRECCION) e.direccion = MSG.direccion;
      const t = a.actividad.trim();
      if (t.length < MIN_ACTIVIDAD || t.length > MAX_ACTIVIDAD) e.actividad = MSG.actividad;
      break;
    }
  }
  return e;
}

/** Errores de los datos de los socios. Claves `socios.{i}.{campo}` y `socios` para lo común. */
export function erroresSocios(socios: readonly BorradorSocio[]): Record<string, string> {
  const e: Record<string, string> = {};
  if (socios.length < MIN_SOCIOS || socios.length > MAX_SOCIOS) {
    e.socios = MSG.numSocios;
    return e;
  }
  socios.forEach((s, i) => {
    const n = s.nombre.trim();
    if (n.length < 3 || n.length > 120) e[`socios.${i}.nombre`] = MSG.socioNombre;
    if (!EMAIL_RE.test(s.email.trim()) || s.email.trim().length > 200) e[`socios.${i}.email`] = MSG.socioEmail;
    const p = s.paisResidencia.trim();
    if (p.length < 2 || p.length > 80) e[`socios.${i}.paisResidencia`] = MSG.socioPais;
    const nac = s.nacionalidad.trim();
    if (nac.length < 2 || nac.length > 80) e[`socios.${i}.nacionalidad`] = MSG.socioNacionalidad;
    if (porcentajeDe(s.porcentaje) == null) e[`socios.${i}.porcentaje`] = MSG.socioPorcentaje;
    if (s.tipo !== "persona" && s.tipo !== "empresa") e[`socios.${i}.tipo`] = MSG.socioTipo;
    if (s.residenteEeuu !== "si" && s.residenteEeuu !== "no") e[`socios.${i}.residenteEeuu`] = MSG.socioEeuu;
  });
  if (desvioSocios(socios)) e.socios = MSG.socioDesvio;
  const porcentajes = socios.map((s) => porcentajeDe(s.porcentaje));
  if (!e.socios && porcentajes.every((p): p is number => p != null) && !sumaCien(porcentajes)) {
    e.socios = MSG.sumaCien;
  }
  const emails = socios.map((s) => s.email.trim().toLowerCase()).filter(Boolean);
  if (!e.socios && new Set(emails).size !== emails.length) e.socios = MSG.emailsRepetidos;
  return e;
}

/** Esquema del bloque `alta` que manda el asistente. Nombre, email y teléfono van en la raíz del lead. */
const esquemaAlta = z.object({
  opcionesNombre: z
    .array(z.string().max(200, MSG.opcionLarga), { error: MSG.opciones })
    .max(MAX_OPCIONES_NOMBRE, MSG.opciones)
    .superRefine((opciones, ctx) => {
      const err = erroresOpciones(opciones);
      if (err) ctx.addIssue({ code: "custom", message: err });
    })
    .transform(limpiarOpciones),
  direccion: z
    .string({ error: MSG.direccion })
    .transform((v) => v.trim())
    .pipe(z.string().min(MIN_DIRECCION, MSG.direccion).max(MAX_DIRECCION, MSG.direccion)),
  actividad: z
    .string({ error: MSG.actividad })
    .transform((v) => v.trim())
    .pipe(z.string().min(MIN_ACTIVIDAD, MSG.actividad).max(MAX_ACTIVIDAD, MSG.actividad)),
  paisResidencia: z
    .string({ error: MSG.paisResidencia })
    .transform((v) => v.replace(/\s+/g, " ").trim())
    .pipe(z.string().min(2, MSG.paisResidencia).max(80, MSG.paisResidencia)),
  facturacion: z.enum(FACTURACIONES as [Facturacion, ...Facturacion[]], { error: MSG.facturacion }),
  aceptaTerminos: z.literal(true, { error: MSG.aceptaTerminos }),
});

export type DatosAlta = z.output<typeof esquemaAlta>;

export function validarAlta(value: unknown): { errores: Record<string, string> } | { alta: DatosAlta } {
  const parsed = esquemaAlta.safeParse(value ?? {});
  if (parsed.success) return { alta: parsed.data };
  const errores: Record<string, string> = {};
  for (const issue of parsed.error.issues) {
    const clave = typeof issue.path[0] === "string" ? issue.path[0] : "alta";
    errores[clave] ??= issue.message;
  }
  return { errores };
}

/** Socio de una LLC de varios socios, ya validado. */
export type DatosSocio = {
  nombre: string;
  email: string;
  paisResidencia: string;
  nacionalidad: string;
  porcentaje: number;
  tipo: TipoSocio;
  residenteEeuu: false;
};

export type DatosAltaSocios = {
  numSocios: number;
  socios: DatosSocio[];
  /** Índice del socio que es la persona de contacto. */
  interlocutor: number;
  opcionesNombre: string[];
  gestion: Gestion;
  /** Nombres de los gestores (solo con «Uno o varios gestores»). */
  gestores: string[];
  reparto: Reparto;
  repartoOtro: string | null;
  pactoSalida: boolean;
  direccion: string;
  actividad: string;
  facturacion: Facturacion;
  aceptaTerminos: true;
  confirmaSocios: true;
};

function textoLimpio(v: unknown): string {
  return typeof v === "string" ? v.replace(/\s+/g, " ").trim() : "";
}

/** Bloque `alta` de una LLC de varios socios. Sin zod: los socios llegan como lista con desvíos propios. */
export function validarAltaSocios(value: unknown): { errores: Record<string, string> } | { alta: DatosAltaSocios } {
  const raw = value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
  const errores: Record<string, string> = {};

  if (raw.numSocios === MAS_DE_DIEZ) errores.numSocios = MSG.masDeDiez;
  const numSocios = typeof raw.numSocios === "number" ? raw.numSocios : NaN;
  const sociosRaw = Array.isArray(raw.socios) ? raw.socios.slice(0, MAX_SOCIOS + 1) : [];
  if (!errores.numSocios && (!Number.isInteger(numSocios) || numSocios < MIN_SOCIOS || numSocios > MAX_SOCIOS || sociosRaw.length !== numSocios)) {
    errores.numSocios = MSG.numSocios;
  }
  const borradores: BorradorSocio[] = sociosRaw.map((s) => {
    const o = s && typeof s === "object" ? (s as Record<string, unknown>) : {};
    return {
      nombre: textoLimpio(o.nombre),
      email: textoLimpio(o.email).toLowerCase(),
      paisResidencia: textoLimpio(o.paisResidencia),
      nacionalidad: textoLimpio(o.nacionalidad),
      porcentaje: typeof o.porcentaje === "number" ? String(o.porcentaje) : textoLimpio(o.porcentaje),
      tipo: o.tipo === "persona" || o.tipo === "empresa" ? o.tipo : null,
      residenteEeuu: o.residenteEeuu === "si" || o.residenteEeuu === "no" ? o.residenteEeuu : null,
    };
  });
  if (!errores.numSocios) Object.assign(errores, erroresSocios(borradores));

  const interlocutor = typeof raw.interlocutor === "number" ? raw.interlocutor : -1;
  if (!Number.isInteger(interlocutor) || interlocutor < 0 || interlocutor >= borradores.length) {
    errores.interlocutor = MSG.interlocutor;
  }

  const opciones = Array.isArray(raw.opcionesNombre) ? raw.opcionesNombre.filter((o): o is string => typeof o === "string") : [];
  const errOpciones = opciones.length > MAX_OPCIONES_NOMBRE ? MSG.opciones : erroresOpciones(opciones);
  if (errOpciones) errores.opcionesNombre = errOpciones;

  const gestion = raw.gestion === "todos" || raw.gestion === "gestores" ? raw.gestion : null;
  if (!gestion) errores.gestion = MSG.gestion;
  const indicesGestores = Array.isArray(raw.gestores)
    ? [...new Set(raw.gestores.filter((g): g is number => Number.isInteger(g) && g >= 0 && g < borradores.length))]
    : [];
  if (gestion === "gestores" && !indicesGestores.length) errores.gestores = MSG.gestores;

  const reparto = raw.reparto === "porcentaje" || raw.reparto === "otro" ? raw.reparto : null;
  if (!reparto) errores.reparto = MSG.reparto;
  const repartoOtro = typeof raw.repartoOtro === "string" ? raw.repartoOtro.trim() : "";
  if (reparto === "otro" && (!repartoOtro || repartoOtro.length > 2000)) errores.repartoOtro = MSG.repartoOtro;
  if (raw.pactoSalida !== "si" && raw.pactoSalida !== "no") errores.pactoSalida = MSG.pactoSalida;

  const direccion = typeof raw.direccion === "string" ? raw.direccion.trim() : "";
  if (direccion.length < MIN_DIRECCION || direccion.length > MAX_DIRECCION) errores.direccion = MSG.direccion;
  const actividad = typeof raw.actividad === "string" ? raw.actividad.trim() : "";
  if (actividad.length < MIN_ACTIVIDAD || actividad.length > MAX_ACTIVIDAD) errores.actividad = MSG.actividad;
  const facturacion = FACTURACIONES.includes(raw.facturacion as Facturacion) ? (raw.facturacion as Facturacion) : null;
  if (!facturacion) errores.facturacion = MSG.facturacion;
  if (raw.aceptaTerminos !== true) errores.aceptaTerminos = MSG.aceptaTerminos;
  if (raw.confirmaSocios !== true) errores.confirmaSocios = MSG.confirmaSocios;

  if (Object.keys(errores).length) return { errores };
  const socios: DatosSocio[] = borradores.map((s) => ({
    nombre: s.nombre,
    email: s.email,
    paisResidencia: s.paisResidencia,
    nacionalidad: s.nacionalidad,
    porcentaje: porcentajeDe(s.porcentaje)!,
    tipo: s.tipo!,
    residenteEeuu: false,
  }));
  return {
    alta: {
      numSocios,
      socios,
      interlocutor,
      opcionesNombre: limpiarOpciones(opciones),
      gestion: gestion!,
      gestores: gestion === "gestores" ? indicesGestores.sort((a, b) => a - b).map((i) => socios[i].nombre) : [],
      reparto: reparto!,
      repartoOtro: reparto === "otro" ? repartoOtro : null,
      pactoSalida: raw.pactoSalida === "si",
      direccion,
      actividad,
      facturacion: facturacion!,
      aceptaTerminos: true,
      confirmaSocios: true,
    },
  };
}

export { MSG as MENSAJES_ALTA };
