/**
 * Reglas del asistente /empezar: a qué servicio lleva cada combinación de respuestas.
 * Se usan en el cliente (pantalla de resultado) y en el servidor (servicio del lead).
 */

export const PUNTOS = ["crear", "anual", "cerrar"] as const;
export type Punto = (typeof PUNTOS)[number];

/** «corp» solo existe al crear: las C-Corp van siempre por encargo personalizado. */
export const TIPOS = ["llc-1", "llc-2", "corp"] as const;
export type Tipo = (typeof TIPOS)[number];

/** ¿Cumple los requisitos de /formularios-llc? Solo se pregunta en «Ya tengo una LLC». */
export const REQUISITOS = ["si", "no"] as const;
export type Requisitos = (typeof REQUISITOS)[number];

/** Estado en el que los planes Básico y Estándar registran la LLC. */
export const ESTADO_PLANES = "New Mexico";

export type Caso =
  /** Plan Básico o Estándar: LLC de un socio en Nuevo México. */
  | "plan"
  /** Encargo personalizado: otro estado, varios socios o C-Corp. */
  | "encargo"
  /** Formularios LLC (169 $): un socio y cumple los requisitos. */
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
    if (!r.tipo || !r.estado) return null;
    // «Aún no lo sé» se resuelve con el estado de los planes (Nuevo México).
    const enNuevoMexico = r.estado === ESTADO_PLANES || r.estado === "no-se";
    return r.tipo === "llc-1" && enNuevoMexico ? "plan" : "encargo";
  }
  if (r.punto === "anual") {
    if (!r.tipo) return null;
    return r.tipo === "llc-1" && r.requisitos === "si" ? "formularios" : "contacto";
  }
  return null;
}

export const SERVICIO_POR_CASO = {
  plan: "arranque",
  encargo: "encargo",
  formularios: "en-regla",
  contacto: "en-regla",
  cierre: "cierre",
} as const;

export const ETIQUETA_CASO: Record<Caso, string> = {
  plan: "Plan Básico o Estándar",
  encargo: "Encargo personalizado",
  formularios: "Formularios LLC",
  contacto: "Contacto (fuera de requisitos)",
  cierre: "Cierre de LLC",
};
