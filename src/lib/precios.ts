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

// --- Pagos en Whop: un ID de servicio por combinación (precios.md, sección 9) ---

/**
 * Planes del negocio NEC en Whop (beneficiario: Leaving Vorkuta LLC), copiados de `precios.md`,
 * sección 9. En Whop cada plan se llama solo por su ID. La web busca el enlace **por ID**
 * (familia + estado + socios), nunca por importe: hay importes repetidos (p. ej. 497 $ es
 * NEC-103 y NEC-201). `importe` está solo para comprobar en los tests que coincide con el precio.
 */
export const PLANES_WHOP = {
  "NEC-101": { importe: 397, enlace: "https://whop.com/checkout/plan_5VH3J5ftPqXzW" },
  "NEC-102": { importe: 456, enlace: "https://whop.com/checkout/plan_EMBI4bh6XGTqq" },
  "NEC-103": { importe: 497, enlace: "https://whop.com/checkout/plan_ORsgwVkmVpJji" },
  "NEC-104": { importe: 507, enlace: "https://whop.com/checkout/plan_u0XXY86TaPT8D" },
  "NEC-105": { importe: 522, enlace: "https://whop.com/checkout/plan_C6SBLpJvpFVae" },
  "NEC-106": { importe: 697, enlace: "https://whop.com/checkout/plan_OLyaEkoEtczrF" },
  "NEC-107": { importe: 822, enlace: "https://whop.com/checkout/plan_moDNaawBHCS0E" },
  "NEC-201": { importe: 497, enlace: "https://whop.com/checkout/plan_oNfJVdjDNJbFv" },
  "NEC-202": { importe: 556, enlace: "https://whop.com/checkout/plan_QpHOuTPaQe8YB" },
  "NEC-203": { importe: 597, enlace: "https://whop.com/checkout/plan_87307h9TzKYQ7" },
  "NEC-204": { importe: 607, enlace: "https://whop.com/checkout/plan_T1ZRTg4O1vTX6" },
  "NEC-205": { importe: 622, enlace: "https://whop.com/checkout/plan_mNyvQk2I60Ux2" },
  "NEC-206": { importe: 797, enlace: "https://whop.com/checkout/plan_fsaZtr1X8pg9q" },
  "NEC-207": { importe: 922, enlace: "https://whop.com/checkout/plan_ZKaptPR3TzNj5" },
  "NEC-301": { importe: 467, enlace: "https://whop.com/checkout/plan_moy6kQ0Oxbkje" },
  "NEC-302": { importe: 467, enlace: "https://whop.com/checkout/plan_mFUdfdDHx5K3r" },
  "NEC-303": { importe: 527, enlace: "https://whop.com/checkout/plan_DwB1xcy2umhan" },
  "NEC-304": { importe: 687, enlace: "https://whop.com/checkout/plan_iIhfpWdmvyYEy" },
  "NEC-305": { importe: 492, enlace: "https://whop.com/checkout/plan_2dCGV9xgHdIwK" },
  "NEC-306": { importe: 507, enlace: "https://whop.com/checkout/plan_EMBY40dzjB6Oh" },
  "NEC-307": { importe: 567, enlace: "https://whop.com/checkout/plan_WUmszr7uAmZzb" },
  "NEC-401": { importe: 169, enlace: "https://whop.com/checkout/plan_3POGOwXrWoG72" },
  "NEC-5021": { importe: 547, enlace: "https://whop.com/checkout/plan_n5Mr7z0MqmmhZ" },
  "NEC-5022": { importe: 606, enlace: "https://whop.com/checkout/plan_4QlJsaXpP2jBo" },
  "NEC-5023": { importe: 647, enlace: "https://whop.com/checkout/plan_ltWxc2KsXXnfj" },
  "NEC-5024": { importe: 657, enlace: "https://whop.com/checkout/plan_mHzf0eqmardE5" },
  "NEC-5025": { importe: 672, enlace: "https://whop.com/checkout/plan_SCy8nuAr1KRaO" },
  "NEC-5026": { importe: 847, enlace: "https://whop.com/checkout/plan_HL44aMqhqBWfc" },
  "NEC-5027": { importe: 972, enlace: "https://whop.com/checkout/plan_fFFcnF0WMLiaq" },
  "NEC-5031": { importe: 626, enlace: "https://whop.com/checkout/plan_33XLnxaEQ4cqU" },
  "NEC-5032": { importe: 685, enlace: "https://whop.com/checkout/plan_ueTzg6aEqbLOs" },
  "NEC-5033": { importe: 726, enlace: "https://whop.com/checkout/plan_dCXeWePJUTqB3" },
  "NEC-5034": { importe: 736, enlace: "https://whop.com/checkout/plan_1aUVkvOUgMiCB" },
  "NEC-5035": { importe: 751, enlace: "https://whop.com/checkout/plan_PJZgyjqHOptWd" },
  "NEC-5036": { importe: 926, enlace: "https://whop.com/checkout/plan_5swsptzVVVTXV" },
  "NEC-5037": { importe: 1051, enlace: "https://whop.com/checkout/plan_kjZDou8jknURI" },
  "NEC-5041": { importe: 705, enlace: "https://whop.com/checkout/plan_GaBisYMv0shry" },
  "NEC-5042": { importe: 764, enlace: "https://whop.com/checkout/plan_RoYr7GyS5i75N" },
  "NEC-5043": { importe: 805, enlace: "https://whop.com/checkout/plan_aQe4J2qtyZ4QY" },
  "NEC-5044": { importe: 815, enlace: "https://whop.com/checkout/plan_L8lExRs4eaEYw" },
  "NEC-5045": { importe: 830, enlace: "https://whop.com/checkout/plan_Us2f8028eTzWg" },
  "NEC-5046": { importe: 1005, enlace: "https://whop.com/checkout/plan_GbGNmtiTWYnXR" },
  "NEC-5047": { importe: 1130, enlace: "https://whop.com/checkout/plan_wMUqrls96MQUq" },
  "NEC-5051": { importe: 784, enlace: "https://whop.com/checkout/plan_L8MZogup1Q2dP" },
  "NEC-5052": { importe: 843, enlace: "https://whop.com/checkout/plan_xIOluR6HABht1" },
  "NEC-5053": { importe: 884, enlace: "https://whop.com/checkout/plan_covjoh3QWC4lj" },
  "NEC-5054": { importe: 894, enlace: "https://whop.com/checkout/plan_FNJimmtRPbeAe" },
  "NEC-5055": { importe: 909, enlace: "https://whop.com/checkout/plan_ISuxQbyhWePxy" },
  "NEC-5056": { importe: 1084, enlace: "https://whop.com/checkout/plan_XPoVrrJ51VOm1" },
  "NEC-5057": { importe: 1209, enlace: "https://whop.com/checkout/plan_WQpBSJiKA0rqj" },
  "NEC-5061": { importe: 863, enlace: "https://whop.com/checkout/plan_pwclTzTWRUkGP" },
  "NEC-5062": { importe: 922, enlace: "https://whop.com/checkout/plan_cy3hx6FUea9W2" },
  "NEC-5063": { importe: 963, enlace: "https://whop.com/checkout/plan_87d4hIezZ7Vlp" },
  "NEC-5064": { importe: 973, enlace: "https://whop.com/checkout/plan_d8q103S7tAer8" },
  "NEC-5065": { importe: 988, enlace: "https://whop.com/checkout/plan_OK5KOFgEmm0To" },
  "NEC-5066": { importe: 1163, enlace: "https://whop.com/checkout/plan_uFt1GmTytu4LK" },
  "NEC-5067": { importe: 1288, enlace: "https://whop.com/checkout/plan_63oCxZcApSLSN" },
  "NEC-5071": { importe: 942, enlace: "https://whop.com/checkout/plan_SS7cZmn6kpHVX" },
  "NEC-5072": { importe: 1001, enlace: "https://whop.com/checkout/plan_Q7s9ECqLBGMAj" },
  "NEC-5073": { importe: 1042, enlace: "https://whop.com/checkout/plan_wAk3jg2qf28vJ" },
  "NEC-5074": { importe: 1052, enlace: "https://whop.com/checkout/plan_Zd4hT7AHgWLcr" },
  "NEC-5075": { importe: 1067, enlace: "https://whop.com/checkout/plan_CxD2XPnvT0Ptz" },
  "NEC-5076": { importe: 1242, enlace: "https://whop.com/checkout/plan_bdgZq7WY9fonc" },
  "NEC-5077": { importe: 1367, enlace: "https://whop.com/checkout/plan_ee7xo6Yff7awL" },
  "NEC-5081": { importe: 1021, enlace: "https://whop.com/checkout/plan_zKXN4ANxpEBr6" },
  "NEC-5082": { importe: 1080, enlace: "https://whop.com/checkout/plan_sSB5jamdRd6Cw" },
  "NEC-5083": { importe: 1121, enlace: "https://whop.com/checkout/plan_mQQti6QpOcQal" },
  "NEC-5084": { importe: 1131, enlace: "https://whop.com/checkout/plan_6HfLNgVzmiHbC" },
  "NEC-5085": { importe: 1146, enlace: "https://whop.com/checkout/plan_wNGgz3adHv8LN" },
  "NEC-5086": { importe: 1321, enlace: "https://whop.com/checkout/plan_Qhnl6byUiYTot" },
  "NEC-5087": { importe: 1446, enlace: "https://whop.com/checkout/plan_3OPEk6A3vsUhO" },
  "NEC-5091": { importe: 1100, enlace: "https://whop.com/checkout/plan_FIOe3zhus8VUk" },
  "NEC-5092": { importe: 1159, enlace: "https://whop.com/checkout/plan_k6EHuhMXkPkIl" },
  "NEC-5093": { importe: 1200, enlace: "https://whop.com/checkout/plan_sAY1KgqO3abGP" },
  "NEC-5094": { importe: 1210, enlace: "https://whop.com/checkout/plan_aoo1SnL4vmiu7" },
  "NEC-5095": { importe: 1225, enlace: "https://whop.com/checkout/plan_EyqOunnF1sW4J" },
  "NEC-5096": { importe: 1400, enlace: "https://whop.com/checkout/plan_QjV5c4F9kAiQY" },
  "NEC-5097": { importe: 1525, enlace: "https://whop.com/checkout/plan_kvpsD7TVuFvKT" },
  "NEC-5101": { importe: 1179, enlace: "https://whop.com/checkout/plan_Cc0BmyBbOpbCE" },
  "NEC-5102": { importe: 1238, enlace: "https://whop.com/checkout/plan_CDQuTF1TRkpRb" },
  "NEC-5103": { importe: 1279, enlace: "https://whop.com/checkout/plan_x7lm3V6mWtCgR" },
  "NEC-5104": { importe: 1289, enlace: "https://whop.com/checkout/plan_mfAULSXRDzq8z" },
  "NEC-5105": { importe: 1304, enlace: "https://whop.com/checkout/plan_pBkSxHgM3NOfR" },
  "NEC-5106": { importe: 1479, enlace: "https://whop.com/checkout/plan_Esb9dF9lXg2lc" },
  "NEC-5107": { importe: 1604, enlace: "https://whop.com/checkout/plan_Cv3rQfN5Eawpj" },
  "NEC-602": { importe: 449, enlace: "https://whop.com/checkout/plan_tlMRolJXDof4x" },
  "NEC-603": { importe: 498, enlace: "https://whop.com/checkout/plan_unK1luHwTqsJr" },
  "NEC-604": { importe: 547, enlace: "https://whop.com/checkout/plan_U1BLtBrvMFNEU" },
  "NEC-605": { importe: 596, enlace: "https://whop.com/checkout/plan_nmA4R6KBaKnNp" },
  "NEC-606": { importe: 645, enlace: "https://whop.com/checkout/plan_D2sbG1HF5AOfy" },
  "NEC-607": { importe: 694, enlace: "https://whop.com/checkout/plan_VVuFYIspd4cBY" },
  "NEC-608": { importe: 743, enlace: "https://whop.com/checkout/plan_EdArcuh6oO0Qg" },
  "NEC-609": { importe: 792, enlace: "https://whop.com/checkout/plan_qWyPqinVjDSDw" },
  "NEC-610": { importe: 841, enlace: "https://whop.com/checkout/plan_pnfkXTVm5SSsb" },
} as const satisfies Record<string, { importe: number; enlace: string }>;
export type IdServicio = keyof typeof PLANES_WHOP;

/** Dígito del estado en el ID: 1 Nuevo México, 2 Utah, 3 Wyoming, 4 Delaware, 5 Florida, 6 Texas, 7 Nevada. */
const DIGITO_ESTADO: Record<ClaveEstadoLlc, number> = {
  "New Mexico": 1,
  Utah: 2,
  Wyoming: 3,
  Delaware: 4,
  Florida: 5,
  Texas: 6,
  Nevada: 7,
};

const FAMILIA_PLAN: Record<PlanApertura, number> = { basico: 1, estandar: 2 };

function sociosEnRango(socios: number, rango: { minSocios: number; maxSocios: number }): number | null {
  const n = Math.trunc(socios);
  return Number.isFinite(n) && n >= rango.minSocios && n <= rango.maxSocios ? n : null;
}

function idSiExiste(id: string): IdServicio | null {
  return Object.prototype.hasOwnProperty.call(PLANES_WHOP, id) ? (id as IdServicio) : null;
}

/** Apertura de un socio: 1xx (Plan Básico) o 2xx (Plan Estándar). */
export function idApertura(clave: ClaveEstadoLlc, plan: PlanApertura): IdServicio | null {
  return idSiExiste(`NEC-${FAMILIA_PLAN[plan]}0${DIGITO_ESTADO[clave]}`);
}

/** Apertura de varios socios: 5SSE (SS = socios, de 02 a 10; E = estado). */
export function idAperturaVarios(clave: ClaveEstadoLlc, socios: number): IdServicio | null {
  const n = sociosEnRango(socios, VARIOS_SOCIOS);
  return n == null ? null : idSiExiste(`NEC-5${String(n).padStart(2, "0")}${DIGITO_ESTADO[clave]}`);
}

/** Cierre: 3xx. */
export function idCierre(clave: ClaveEstadoLlc): IdServicio | null {
  return idSiExiste(`NEC-30${DIGITO_ESTADO[clave]}`);
}

/** Formularios 1120/5472: 401, en cualquier estado. */
export const ID_FORMULARIOS_1120: IdServicio = "NEC-401";

/** Form 1065 + K-1: 6SS (SS = socios, de 02 a 10), en cualquier estado. */
export function id1065(socios: number): IdServicio | null {
  const n = sociosEnRango(socios, FORMULARIOS_1065);
  return n == null ? null : idSiExiste(`NEC-6${String(n).padStart(2, "0")}`);
}

/**
 * Enlace de pago de Whop de ese ID, tal cual está en `precios.md`, o null si no hay (entonces
 * la web guarda el lead y el enlace se envía por email). Whop no documenta parámetros de URL
 * para el email del cliente ni para una referencia: el cruce se hace por email + ID del plan.
 */
export function enlacePago(id: IdServicio | null | undefined): string | null {
  return id ? (PLANES_WHOP[id]?.enlace ?? null) : null;
}
