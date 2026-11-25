export const ESTADOS = ["nuevo", "contactado", "en_curso", "ganado", "perdido", "spam"] as const;
export type EstadoLead = (typeof ESTADOS)[number];

export const ORIGENES = ["contacto", "empezar"] as const;
export type OrigenLead = (typeof ORIGENES)[number];

export const SERVICIOS = [
  "arranque",
  "en-regla",
  "formularios-llc",
  "encargo",
  "cierre",
  "corporacion",
  "web",
  "otra",
] as const;
export type ServicioLead = (typeof SERVICIOS)[number];

export const ETIQUETA_ESTADO: Record<EstadoLead, string> = {
  nuevo: "Nuevo",
  contactado: "Contactado",
  en_curso: "En curso",
  ganado: "Ganado",
  perdido: "Perdido",
  spam: "Spam",
};

export const ETIQUETA_ORIGEN: Record<OrigenLead, string> = {
  contacto: "Contacto",
  empezar: "Asistente",
};

export const ETIQUETA_SERVICIO: Record<string, string> = {
  arranque: "Constituir una LLC",
  "en-regla": "Presentación anual 1120 + 5472",
  "formularios-llc": "Formularios LLC 2026",
  encargo: "Encargo personalizado",
  cierre: "Cerrar la LLC",
  corporacion: "Corporación (C-Corp)",
  web: "Web, tienda o SEO",
  otra: "Otra consulta",
};

export const ETIQUETA_PUNTO = {
  crear: "Quiere crear una LLC",
  anual: "Ya tiene una LLC",
  cerrar: "Quiere cerrar la LLC",
} as const;

export const ETIQUETA_TIPO = {
  "llc-1": "LLC de un socio",
  "llc-2": "LLC con varios socios",
} as const;

export const SERVICIO_POR_PUNTO = {
  crear: "arranque",
  anual: "en-regla",
  cerrar: "cierre",
} as const;

export function esEstado(value: string | null | undefined): value is EstadoLead {
  return !!value && (ESTADOS as readonly string[]).includes(value);
}

export function esOrigen(value: string | null | undefined): value is OrigenLead {
  return !!value && (ORIGENES as readonly string[]).includes(value);
}

export function esServicio(value: string | null | undefined): value is ServicioLead {
  return !!value && (SERVICIOS as readonly string[]).includes(value);
}

export function etiquetaServicio(servicio: string | null): string {
  if (!servicio) return "—";
  return ETIQUETA_SERVICIO[servicio] ?? servicio;
}
