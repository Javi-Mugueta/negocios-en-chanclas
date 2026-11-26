/**
 * Fuente única de precios de la web (copia de `precios.md`, cerrado el 2026-11-26).
 *
 * Todo precio que se enseña o se cobra sale de aquí. Si cambia un importe o una tasa,
 * se cambia solo en este fichero. Formato en la web: número, espacio y símbolo («397 $»).
 */

/** Los 7 estados en los que se abre (y se cierra) una LLC online. La clave es el nombre en inglés. */
export const CLAVES_ESTADOS_LLC = [
  "New Mexico",
  "Delaware",
  "Wyoming",
  "Nevada",
  "Utah",
  "Florida",
  "Texas",
] as const;
export type ClaveEstadoLlc = (typeof CLAVES_ESTADOS_LLC)[number];

export type EstadoLlc = {
  clave: ClaveEstadoLlc;
  /** Nombre en la web. */
  nombre: string;
  /** Tasa de constitución (USD). En Nevada son tres tasas obligatorias. */
  tasaConstitucion: number;
  /** Tasa anual obligatoria del estado (USD), a partir del segundo año. */
  tasaAnual: number;
  /** Tasa de disolución (USD). */
  tasaDisolucion: number;
  /** NEC asume las tasas de constitución y disolución (solo Nuevo México). */
  tasasIncluidas?: boolean;
  /** «tasas», en plural, cuando la constitución son varias tasas (Nevada). */
  tasasEnPlural?: boolean;
};

export const ESTADOS_LLC: readonly EstadoLlc[] = [
  { clave: "New Mexico", nombre: "Nuevo México", tasaConstitucion: 50, tasaAnual: 0, tasaDisolucion: 25, tasasIncluidas: true },
  { clave: "Delaware", nombre: "Delaware", tasaConstitucion: 110, tasaAnual: 400, tasaDisolucion: 220 },
  { clave: "Wyoming", nombre: "Wyoming", tasaConstitucion: 100, tasaAnual: 60, tasaDisolucion: 60 },
  // 75 $ de los Articles + 150 $ de la Initial List + 200 $ de la State Business License.
  { clave: "Nevada", nombre: "Nevada", tasaConstitucion: 425, tasaAnual: 350, tasaDisolucion: 100, tasasEnPlural: true },
  { clave: "Utah", nombre: "Utah", tasaConstitucion: 59, tasaAnual: 18, tasaDisolucion: 0 },
  { clave: "Florida", nombre: "Florida", tasaConstitucion: 125, tasaAnual: 138.75, tasaDisolucion: 25 },
  // Texas: sin tasa anual por debajo del umbral del franchise tax (Public Information Report sin coste).
  { clave: "Texas", nombre: "Texas", tasaConstitucion: 300, tasaAnual: 0, tasaDisolucion: 40 },
];

/** Estado de los precios «desde» (Nuevo México, con la tasa incluida). */
export const ESTADO_REFERENCIA: ClaveEstadoLlc = "New Mexico";

/** Lista legible de los 7 estados: «Nuevo México, Delaware, …, Florida y Texas». */
export const LISTA_ESTADOS_LLC = listaHumana(ESTADOS_LLC.map((e) => e.nombre));
/** Los 6 estados en los que se suma la tasa. */
export const LISTA_ESTADOS_CON_TASA = listaHumana(ESTADOS_LLC.filter((e) => !e.tasasIncluidas).map((e) => e.nombre));

export function esEstadoLlc(value: unknown): value is ClaveEstadoLlc {
  return typeof value === "string" && (CLAVES_ESTADOS_LLC as readonly string[]).includes(value);
}

export function estadoLlc(clave: ClaveEstadoLlc): EstadoLlc {
  return ESTADOS_LLC.find((e) => e.clave === clave)!;
}

/** Nombre en la web de un estado (los 7 en español; el resto, tal cual). */
export function nombreEstado(clave: string): string {
  return esEstadoLlc(clave) ? estadoLlc(clave).nombre : clave;
}

// --- Importes de los servicios (USD) ---

export const PLANES_APERTURA = {
  basico: { nombre: "Plan Básico", precio: 397 },
  estandar: { nombre: "Plan Estándar", precio: 497 },
} as const;
export type PlanApertura = keyof typeof PLANES_APERTURA;
export const PLANES = Object.keys(PLANES_APERTURA) as PlanApertura[];

export const VARIOS_SOCIOS = { base: 547, porSocioExtra: 79, minSocios: 2, maxSocios: 10 } as const;
export const RENOVACION = 197;
export const FORMULARIOS_1120 = 169;
export const FORMULARIOS_1065 = { base: 449, porSocioExtra: 49, minSocios: 2, maxSocios: 10 } as const;
export const CIERRE = 467;
export const CAMBIO_TITULARIDAD = 567;
export const OPERATING_AGREEMENT_DESDE = 697;

// --- Formato ---

/** «1051» → «1.051 $»; «138.75» → «138,75 $». */
export function dolares(importe: number): string {
  const [entero, decimales] = importe.toFixed(2).split(".");
  const conMiles = entero.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${decimales === "00" ? conMiles : `${conMiles},${decimales}`} $`;
}

function listaHumana(items: readonly string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} y ${items[items.length - 1]}`;
}

export type Precio = {
  /** Precio del servicio, sin tasas. */
  servicio: number;
  /** Tasa del estado que se suma (0 si no hay o si la asume NEC). */
  tasa: number;
  /** Lo que paga el cliente. */
  total: number;
  /** Cómo se escribe en la web: «397 $ + 110 $ (tasa del estado de Delaware)». */
  texto: string;
};

function precioConTasa(
  servicio: number,
  e: EstadoLlc,
  tasa: number,
  opciones: { incluida: boolean; plural?: boolean; tipo?: string; sinTasa?: string },
): Precio {
  if (opciones.incluida) {
    return { servicio, tasa: 0, total: servicio, texto: `${dolares(servicio)} (tasa del estado incluida)` };
  }
  if (tasa === 0) {
    return { servicio, tasa: 0, total: servicio, texto: opciones.sinTasa ? `${dolares(servicio)} (${opciones.sinTasa})` : dolares(servicio) };
  }
  const palabra = opciones.plural ? "tasas" : "tasa";
  const tipo = opciones.tipo ? `${palabra} ${opciones.tipo}` : palabra;
  return {
    servicio,
    tasa,
    total: servicio + tasa,
    texto: `${dolares(servicio)} + ${dolares(tasa)} (${tipo} del estado de ${e.nombre})`,
  };
}

/** Para avisos y fichas internas: «507 $ = 397 $ + 110 $ (tasa del estado de Delaware)». */
export function resumenPrecio(p: Precio): string {
  return p.tasa ? `${dolares(p.total)} = ${p.texto}` : p.texto;
}

/** Apertura de una LLC de un socio: plan + tasa de constitución (en Nuevo México, incluida). */
export function precioApertura(clave: ClaveEstadoLlc, plan: PlanApertura): Precio {
  const e = estadoLlc(clave);
  return precioConTasa(PLANES_APERTURA[plan].precio, e, e.tasaConstitucion, {
    incluida: !!e.tasasIncluidas,
    plural: e.tasasEnPlural,
  });
}

/** Precio del servicio de varios socios, sin tasa: 547 $ con 2 + 79 $ por socio adicional. */
export function servicioVariosSocios(socios: number): number {
  const n = Math.min(Math.max(Math.trunc(socios), VARIOS_SOCIOS.minSocios), VARIOS_SOCIOS.maxSocios);
  return VARIOS_SOCIOS.base + (n - VARIOS_SOCIOS.minSocios) * VARIOS_SOCIOS.porSocioExtra;
}

/** Apertura de una LLC de varios socios (2 a 10) + tasa de constitución (en Nuevo México, incluida). */
export function precioAperturaVarios(clave: ClaveEstadoLlc, socios: number): Precio {
  const e = estadoLlc(clave);
  return precioConTasa(servicioVariosSocios(socios), e, e.tasaConstitucion, {
    incluida: !!e.tasasIncluidas,
    plural: e.tasasEnPlural,
  });
}

/** Renovación anual: 197 $ + tasa anual del estado (igual con uno o con varios socios). */
export function precioRenovacion(clave: ClaveEstadoLlc): Precio {
  const e = estadoLlc(clave);
  return precioConTasa(RENOVACION, e, e.tasaAnual, { incluida: false, tipo: "anual" });
}

/** Cierre: 467 $ + tasa de disolución (en Nuevo México, incluida; en Utah no hay). */
export function precioCierre(clave: ClaveEstadoLlc): Precio {
  const e = estadoLlc(clave);
  return precioConTasa(CIERRE, e, e.tasaDisolucion, {
    incluida: !!e.tasasIncluidas,
    sinTasa: `${e.nombre} no cobra tasa de disolución`,
  });
}

/** Form 1065 + K-1: 449 $ con 2 socios + 49 $ por socio adicional, en cualquier estado. */
export function precio1065(socios: number): number {
  const n = Math.min(Math.max(Math.trunc(socios), FORMULARIOS_1065.minSocios), FORMULARIOS_1065.maxSocios);
  return FORMULARIOS_1065.base + (n - FORMULARIOS_1065.minSocios) * FORMULARIOS_1065.porSocioExtra;
}

// --- Textos fijos que salen de estos importes ---

export const TEXTOS_PRECIO = {
  /** Home y /servicios: el precio de Nuevo México. */
  aperturaDesde: `Desde ${dolares(PLANES_APERTURA.basico.precio)}`,
  renovacion: `Renovación anual: ${dolares(RENOVACION)}/año + tasa anual del estado, a partir del segundo año.`,
  renovacionCorta: `${dolares(RENOVACION)}/año + tasa anual del estado`,
  variosSocios: `${dolares(VARIOS_SOCIOS.base)} con ${VARIOS_SOCIOS.minSocios} socios + ${dolares(VARIOS_SOCIOS.porSocioExtra)} por socio adicional + tasa del estado`,
  formularios1065: `${dolares(FORMULARIOS_1065.base)} con ${FORMULARIOS_1065.minSocios} socios + ${dolares(FORMULARIOS_1065.porSocioExtra)} por socio adicional`,
  formularios1065Desde: `desde ${dolares(FORMULARIOS_1065.base)}`,
  cierre: `${dolares(CIERRE)} + tasa del estado`,
  cambioTitularidad: `${dolares(CAMBIO_TITULARIDAD)} + tasas del estado, si las hay`,
  operatingAgreement: `Desde ${dolares(OPERATING_AGREEMENT_DESDE)}`,
  formularios1120: dolares(FORMULARIOS_1120),
} as const;

/**
 * Enlaces de pago de Stripe que existen hoy, por producto e importe total.
 * Un enlace de Stripe cobra un importe fijo: si una combinación no está aquí,
 * no se puede pagar online todavía y la web lleva a contacto.
 */
const ENLACES_STRIPE: Record<"basico" | "estandar" | "varios" | "formularios" | "cierre", Record<number, string>> = {
  basico: { 397: "https://buy.stripe.com/7sY00j1KN2Ru8fp1NVcV22n" },
  estandar: { 497: "https://buy.stripe.com/3cI8wP3SV2Ru7bl2RZcV22o" },
  varios: {},
  formularios: { 169: "https://buy.stripe.com/dRm00j7572Ru0MX2RZcV22k" },
  // 467 $: Nuevo México (tasa incluida) y Utah (sin tasa de disolución).
  cierre: { 467: "https://buy.stripe.com/cNibJ1757gIk67h2RZcV22p" },
};
export type ProductoPago = keyof typeof ENLACES_STRIPE;

/** Enlace de Stripe para ese producto e importe, o null si todavía no existe. */
export function enlacePago(producto: ProductoPago, total: number): string | null {
  return ENLACES_STRIPE[producto][total] ?? null;
}
