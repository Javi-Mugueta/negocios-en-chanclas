/**
 * Datos de alta de la LLC que pide el asistente /empezar cuando el caso es «crear».
 * Se usa en el cliente (qué paso es válido, botón Continuar) y en el servidor (validación con zod).
 */
import { z } from "zod";

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

/** Pasos del alta, en orden. Van después de punto, tipo y estado. */
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
export type PasoAlta = (typeof PASOS_ALTA)[number]["id"];

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

export type PasoId = (typeof PASOS_CONSULTA)[number]["id"] | PasoAlta;
export type PasoAsistente = { id: PasoId; label: string };

export function pasosDe(punto: string | null): readonly PasoAsistente[] {
  return punto === "crear" ? PASOS_CREAR : PASOS_CONSULTA;
}

export function esPasoAlta(id: PasoId): id is PasoAlta {
  return PASOS_ALTA.some((p) => p.id === id);
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
  aceptaTerminos: "Tienes que aceptar los Términos y Condiciones.",
  consentimiento: "Necesitamos tu consentimiento.",
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
      break;
  }
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

export { MSG as MENSAJES_ALTA };
