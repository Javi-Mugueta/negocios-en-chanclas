/**
 * Reglas del asistente /empezar: a qué servicio lleva cada combinación de respuestas.
 * Se usan en el cliente (pantalla de resultado) y en el servidor (servicio del lead).
 *
 * Variables de carril (se preguntan al principio de cada flujo):
 * - V1 entidad: LLC online; C-Corp, siempre a contacto.
 * - V2 socios: uno o de 2 a 10 online; más de 10, a contacto.
 * - V3 estado: los 7 estados de `precios.ts` online; otro estado o «Aún no lo sé», a contacto.
 * - V4 socio ciudadano o residente fiscal en EE. UU.: a contacto.
 * - V5 LLC al día (formularios y cierre): si no, a contacto.
 */
import { esEstadoLlc } from "@/lib/precios";

export const PUNTOS = ["crear", "anual", "cerrar"] as const;
export type Punto = (typeof PUNTOS)[number];

/** «corp» solo existe al crear: las C-Corp van siempre a contacto. */
export const TIPOS = ["llc-1", "llc-2", "corp"] as const;
export type Tipo = (typeof TIPOS)[number];

/** ¿Cumple los requisitos de /formularios-llc? Solo se pregunta en «Ya tengo una LLC». */
export const REQUISITOS = ["si", "no"] as const;
export type Requisitos = (typeof REQUISITOS)[number];

/** Respuesta sí/no (V4: ciudadano o residente fiscal en EE. UU.). */
export const SI_NO = ["si", "no"] as const;
export type SiNo = (typeof SI_NO)[number];

export type Caso =
  /** Plan Básico o Estándar: LLC de un socio en uno de los 7 estados. */
  | "plan"
  /** LLC de varios socios (2 a 10) en uno de los 7 estados. */
  | "varios"
  /** Formularios LLC (1120/5472): un socio y cumple los requisitos. */
  | "formularios"
  /** Fuera de los requisitos de Formularios LLC: contacto. */
  | "contacto"
  /** Cierre: tiene su propia página. */
  | "cierre";

export function casoAsistente(r: {
  punto: Punto | null;
  tipo: Tipo | null;
  estado: string | null;
  requisitos: Requisitos | null;
}): Caso | null {
  if (r.punto === "cerrar") return "cierre";
  if (r.punto === "crear") {
    // Fuera de los 7 estados, la C-Corp o «Aún no lo sé» se desvían a contacto antes del alta.
    if (!r.tipo || !esEstadoLlc(r.estado)) return null;
    if (r.tipo === "llc-1") return "plan";
    if (r.tipo === "llc-2") return "varios";
    return null;
  }
  if (r.punto === "anual") {
    if (!r.tipo) return null;
    return r.tipo === "llc-1" && r.requisitos === "si" ? "formularios" : "contacto";
  }
  return null;
}

export const SERVICIO_POR_CASO = {
  plan: "arranque",
  varios: "arranque",
  formularios: "en-regla",
  contacto: "en-regla",
  cierre: "cierre",
} as const;

export const ETIQUETA_CASO: Record<Caso, string> = {
  plan: "Plan Básico o Estándar",
  varios: "LLC de varios socios",
  formularios: "Formularios LLC",
  contacto: "Contacto (fuera de requisitos)",
  cierre: "Cierre de LLC",
};

/** Textos de los desvíos a contacto (patrón de la sección 0.3 de los flujos). */
export const DESVIOS = {
  otroEstado: {
    texto:
      "Abrimos LLC en Nuevo México, Delaware, Wyoming, Nevada, Utah, Florida y Texas. Si la quieres en otro estado, cuéntanos tu caso y te damos presupuesto.",
    mensaje: "Quiero abrir una LLC en otro estado: ",
  },
  residenteEeuu: {
    texto:
      "Si eres ciudadano o residente fiscal en EE. UU., tu caso necesita un análisis personalizado. Escríbenos y lo vemos.",
    mensaje: "Quiero abrir una LLC y soy ciudadano o residente fiscal en EE. UU.",
  },
  socioEeuu: {
    texto:
      "Si alguno de los socios es ciudadano o residente fiscal en EE. UU., tu caso necesita un análisis personalizado. Escríbenos y lo vemos.",
    mensaje: "Queremos abrir una LLC de varios socios y alguno es ciudadano o residente fiscal en EE. UU.",
  },
  socioEmpresa: {
    texto: "Si uno de los socios es una sociedad, lo estudiamos contigo antes de darte precio.",
    mensaje: "Queremos abrir una LLC de varios socios y uno de los socios es una sociedad.",
  },
  masDeDiez: {
    texto: "Con más de 10 socios preparamos la LLC a medida. Cuéntanos el proyecto.",
    mensaje: "Queremos abrir una LLC con más de 10 socios.",
  },
  noSe: {
    titulo: "¡Normal, es de las primeras dudas!",
    texto:
      "El estado influye en lo que pagas cada año y en cómo funciona tu LLC. Entonces quizá es mejor que hablemos primero: cuéntanos qué tienes en mente y te recomendamos el que mejor te encaja, sin compromiso.",
    mensaje: "Quiero abrir una LLC y no sé en qué estado.",
  },
} as const;

/** Enlace a contacto con el servicio marcado y el mensaje empezado. */
export function enlaceContacto(servicio: string, mensaje?: string): string {
  const params = new URLSearchParams({ servicio });
  if (mensaje) params.set("mensaje", mensaje);
  return `/contacto?${params.toString()}`;
}
