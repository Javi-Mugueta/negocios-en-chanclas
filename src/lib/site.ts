/**
 * Contenido central del sitio.
 *
 * Los números de WhatsApp viven solo en `contacto.whatsapp`.
 * Para cambiarlos, actualiza `visible` y los dígitos de `href` (wa.me, sin + ni espacios).
 */

import {
  dolares,
  enlacePago,
  FORMULARIOS_1065,
  FORMULARIOS_1120,
  ID_FORMULARIOS_1120,
  LISTA_ESTADOS_CON_TASA,
  LISTA_ESTADOS_LLC,
  PLANES_APERTURA,
  RENOVACION,
  TEXTOS_PRECIO,
  type PlanApertura,
} from "@/lib/precios";

export const contacto = {
  direccion: ["500 4th St NW, Suite 102 #1272", "Albuquerque, New Mexico 87102", "EE. UU."],
  whatsapp: {
    espana: { visible: "+34 722 31 18 18", href: "https://wa.me/34722311818" },
    eeuu: { visible: "+1 (505) 441 3252", href: "https://wa.me/15054413252" },
  },
};

export type ItemNav = { href: string; label: string };

const navCompleta: (ItemNav & { soloConFormularios?: boolean })[] = [
  { href: "/como-funciona-una-llc", label: "Cómo funciona una LLC" },
  { href: "/servicios", label: "Servicios" },
  { href: "/formularios-llc", label: "Formularios LLC", soloConFormularios: true },
  { href: "/#preguntas", label: "Preguntas" },
  { href: "/contacto", label: "Contacto" },
];

/** Menú principal. «Formularios LLC» solo aparece cuando la página está abierta (ver visibilidad.ts). */
export function navegacion(formulariosAbiertos: boolean): ItemNav[] {
  return navCompleta
    .filter((item) => formulariosAbiertos || !item.soloConFormularios)
    .map(({ href, label }) => ({ href, label }));
}

/** Estados que acepta el formulario de presentación de la web actual. */
export const estadosDestacados = ["New Mexico", "Wyoming", "Delaware"];
export const estados = [
  "New Mexico", "Wyoming", "Delaware", "Florida", "Texas", "Nevada", "California",
  "Nueva York", "Colorado", "Arizona", "Georgia", "Illinois", "Washington", "Utah",
  "Oregón", "Pensilvania", "Carolina del Norte", "Massachusetts", "Tennessee", "Ohio",
  "Virginia", "Minnesota", "Míchigan", "Montana", "Idaho", "Nueva Jersey",
];

/**
 * Estado de constitución en /formularios-llc: los 50 estados + D.C.,
 * con New Mexico, Wyoming y Delaware arriba.
 */
export const estadosConstitucionDestacados = ["New Mexico", "Wyoming", "Delaware"];
export const estadosConstitucionResto = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
  "District of Columbia", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
  "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey",
  "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania",
  "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont",
  "Virginia", "Washington", "West Virginia", "Wisconsin",
];
export const estadosConstitucion = [...estadosConstitucionDestacados, ...estadosConstitucionResto];

export type Plan = {
  id: "basico" | "estandar" | "encargo";
  servicio: string;
  nombre: string;
  lema: string;
  precio: string;
  /** Texto pequeño junto al precio, p. ej. «(primer año)*». */
  precioNota?: string;
  /** Aviso bajo el precio. */
  aviso?: string;
  destacado?: boolean;
  incluye: string[];
  cta: string;
  /** Adónde lleva el botón de la tarjeta de la home. */
  href: string;
};

export const incluyeApertura = [
  `Registro de la LLC en ${LISTA_ESTADOS_LLC.replace(" y ", " o ")}`,
  "Agente registrador y dirección postal durante 1 año",
  "EIN express (48 h)",
  "Operating Agreement (modelo estándar)",
  "Entrega vía email",
];

const avisoPlanes = `*En Nuevo México, tasa del estado incluida. En ${LISTA_ESTADOS_CON_TASA} se suma la tasa del estado. Renovación anual: ${dolares(RENOVACION)}/año + tasa anual del estado (en Nuevo México, sin tasa) a partir del segundo año.`;

/** Propuesta comercial: constitución de la LLC. Precio «desde» = Nuevo México. */
export const planes: Plan[] = [
  {
    id: "basico",
    servicio: "Constitución de tu LLC",
    nombre: PLANES_APERTURA.basico.nombre,
    lema: "Rápida, sencilla y autogestionada",
    precio: `Desde ${dolares(PLANES_APERTURA.basico.precio)}`,
    precioNota: "(primer año)*",
    aviso: avisoPlanes,
    incluye: incluyeApertura,
    cta: "Empezar con el Plan Básico",
    href: "/empezar?plan=basico",
  },
  {
    id: "estandar",
    servicio: "Constitución de tu LLC",
    nombre: PLANES_APERTURA.estandar.nombre,
    lema: "Rápida, sencilla y con acompañamiento",
    precio: `Desde ${dolares(PLANES_APERTURA.estandar.precio)}`,
    precioNota: "(primer año)*",
    aviso: "*Igual que el Plan Básico.",
    destacado: true,
    incluye: [...incluyeApertura, "Consultoría de 45 min en la que resolvemos 1 a 1 tus dudas"],
    cta: "Empezar con el Plan Estándar",
    href: "/empezar?plan=estandar",
  },
  {
    id: "encargo",
    servicio: "Constitución de tu sociedad en USA",
    nombre: "Encargo personalizado",
    lema: "Si necesitas que un experto de verdad se siente contigo",
    precio: "Precio por encargo",
    incluye: [
      "Para personas que quieran abrir una LLC en otro estado, una C-Corp o que tengan una situación más compleja.",
    ],
    cta: "Quiero un encargo personalizado",
    href: "/contacto?servicio=arranque",
  },
];

/** Plan elegido en la home (`/empezar?plan=`). */
export const PLANES_ASISTENTE: Record<PlanApertura, string> = {
  basico: PLANES_APERTURA.basico.nombre,
  estandar: PLANES_APERTURA.estandar.nombre,
};
export type PlanAsistente = PlanApertura;

/** Plazo de apertura y cierre: nunca una fecha comprometida. */
export const PLAZO = "aproximadamente 20 días";
export const AVISO_PLAZO =
  "Este plazo es orientativo: puede variar por periodos vacacionales y festivos en Estados Unidos.";

const AVISO_LEAVING =
  "El pago se realizará a Leaving Vorkuta LLC directamente a través de Whop, mercantil responsable de la prestación del servicio.";

/** Formularios LLC del ejercicio 2026. */
export const formulariosLlc = {
  ejercicio: 2026,
  nombre: "Formularios anuales 1120/5472",
  precio: dolares(FORMULARIOS_1120),
  descripcion:
    "Si tu LLC es de un solo socio y no resides en EE. UU., cada año tienes que presentar al IRS el formulario 5472 junto a un 1120 pro forma. Nos pasas los datos y los movimientos del año, los preparamos y los presentamos por ti.",
  /** Mismo precio en cualquier estado: son formularios federales. */
  alcance:
    "Incluye la preparación y presentación de los formularios federales 1120 y 5472 ante el IRS, sea cual sea el estado de tu LLC. No incluye las obligaciones de tu estado (informe anual, franchise tax u otras), que son aparte.",
  /** Plan NEC-401 de Whop. */
  pago: enlacePago(ID_FORMULARIOS_1120)!,
  avisoPago: AVISO_LEAVING,
};

/** Formularios de varios socios: Form 1065 + K-1 (`formularios-1065.md`). */
export const formularios1065 = {
  ejercicio: 2026,
  nombre: "Form 1065 + K-1 (LLC de varios socios)",
  titulo: "Formularios de tu LLC de varios socios: Form 1065 + K-1",
  precio: TEXTOS_PRECIO.formularios1065,
  texto:
    "Si tu LLC tiene dos o más socios, cada año presenta ante el IRS el Form 1065 y un K-1 por cada socio, antes del 15 de marzo. Nos pasas los datos del año, los preparamos y los presentamos por vosotros.",
  alcance:
    "Para LLC de cualquier estado. Solo formularios federales: las obligaciones de tu estado (informe anual, franchise tax…) van aparte.",
  avisoPlazo:
    "El Form 1065 vence el 15 de marzo. Para presentarlo a tiempo, necesitamos vuestros datos antes del 1 de marzo.",
  plazoCerrado: "El plazo para este año está cerrado. Escríbenos y vemos qué podemos hacer.",
  /** Fecha límite para recibir los datos (hora de Madrid). Sin prórroga (Form 7004) por ahora. */
  fechaLimite: "2027-03-01T00:00",
  minSocios: FORMULARIOS_1065.minSocios,
  maxSocios: FORMULARIOS_1065.maxSocios,
  masDeDiez: "¿Sois más de 10? Escríbenos y lo preparamos a medida.",
  mensajeContacto: "Mi LLC tiene varios socios y necesito el Form 1065 + K-1.",
  desvioRequisitos: "Tu caso necesita un análisis personalizado. Escríbenos y lo vemos.",
  desvioCambios:
    "Si hubo cambios de socios durante el año, el Form 1065 se complica: escríbenos y lo preparamos contigo.",
  avisoPago: AVISO_LEAVING,
  confirmacion:
    "Preparamos vuestro Form 1065 y los K-1 y os los enviamos para revisar antes de presentarlos.",
};

/** Requisitos del Form 1065 (`formularios-1065.md`, sección 3). Un «No» o «No lo sé» va a contacto. */
export const requisitos1065 = [
  {
    clave: "sociosPersonas",
    texto:
      "La LLC tiene entre 2 y 10 socios, y todos son personas físicas. Si algún socio es una empresa, este servicio no es para vosotros: escríbenos y lo preparamos a medida.",
  },
  { clave: "ningunoEeuu", texto: "Ningún socio es ciudadano estadounidense ni residente fiscal en EE. UU." },
  {
    clave: "partnership",
    texto:
      "La LLC tributa como partnership, que es lo normal en una LLC de varios socios: no habéis pedido que tribute como corporación.",
  },
  { clave: "sinPresencia", texto: "La LLC no tiene oficina, empleados ni almacén en EE. UU." },
  {
    clave: "alDia",
    texto:
      "La LLC está al día: activa en su estado, con los formularios de años anteriores presentados y el registered agent contratado.",
  },
  { clave: "sinCartasIrs", texto: "No habéis recibido cartas ni multas del IRS pendientes." },
] as const;
export type ClaveRequisito1065 = (typeof requisitos1065)[number]["clave"];

/** Requisitos para contratar Formularios LLC (disclaimer de /formularios-llc). */
export const requisitosFormularios = [
  "Tu LLC tiene un solo socio: si tienes dos o más, requieres compliance adicional. Ponte en contacto con nosotros para que te informemos.",
  "El socio no es ciudadano estadounidense ni residente fiscal en EE. UU.",
  "La LLC no tiene oficina, empleados ni almacén físico en USA.",
  "La LLC está al día: has presentado formularios otros años si debías y tienes un agente registrador activo y contratado.",
  "No has recibido ninguna carta o multa de la IRS que haya que tener en cuenta.",
];

/** Cierre de LLC (/cierra-tu-llc): los 7 estados, un socio y solo LLC al día. */
export const cierreLlc = {
  precioCompleto: TEXTOS_PRECIO.cierre,
  avisoPago: `${AVISO_LEAVING} Con el pago aceptamos tu encargo: cerramos tu LLC en ${PLAZO} y te enviamos toda la documentación. ${AVISO_PLAZO}`,
  avisoAlDia:
    "Este servicio es solo para LLC que estén al día: no disueltas administrativamente ni en situación de «delinquent», y sin declaraciones al IRS ni tasas del estado pendientes. Si tu LLC no está al día o tienes dudas, escríbenos antes y lo vemos contigo.",
  avisoTexas:
    "En Texas, antes de cerrar hay que presentar el informe final de franchise tax y pedir al Comptroller un certificado de cuenta al día. El plazo puede ser mayor.",
};

/** Aviso del pago a Leaving Vorkuta LLC (apertura). */
export const avisoPagoApertura = AVISO_LEAVING;

/**
 * Aviso junto a cada botón de pago: el pago de Whop se une con la ficha por el email
 * (Whop no documenta cómo pasar una referencia en el enlace). `vosotros` en varios socios.
 */
export function avisoEmailPago(email: string, { vosotros = false }: { vosotros?: boolean } = {}): string {
  return vosotros
    ? `Usa en Whop el mismo email que nos has dado (${email.trim()}). Así unimos vuestro pago con vuestros datos.`
    : `Usa en Whop el mismo email que nos has dado (${email.trim()}). Así unimos tu pago con tus datos.`;
}

/** Avisos encima del formulario de contacto según el servicio marcado (`?servicio=`). */
export const avisosContacto: Partial<Record<string, { titulo: string; texto: string }>> = {
  corporacion: {
    titulo: "Una C-Corp es una estructura compleja.",
    texto:
      "Antes de darte precio necesitamos analizar tu caso de forma personalizada: socios, inversión, acciones y dónde vas a operar. Cuéntanos tu proyecto y te escribimos para verlo contigo.",
  },
  // Encargo personalizado (regla 2). Ya no menciona las LLC de varios socios: se encargan online.
  arranque: {
    titulo: "Tu caso necesita un análisis personalizado.",
    texto:
      "Las LLC en otros estados, las C-Corp y las situaciones más complejas las estudiamos contigo antes de darte precio. Cuéntanos tu caso y te escribimos.",
  },
};

/** Llamada gratuita de 15 min. */
export const AGENDA_15MIN = "https://calendly.com/santiago-5udv/discovery-call";

/** Servicios complementarios. Ninguno muestra precio. */
export const serviciosComplementarios = [
  {
    id: "single-member",
    nombre: "LLC single member",
    texto: "LLC de un socio: una sola persona constituye la empresa y la dirige.",
    href: "/empezar?paquete=arranque",
    cta: "Empezar",
  },
  {
    id: "multi-member",
    nombre: "LLC con varios socios",
    texto: "Multi-member: la empresa es de más de un socio. Dejamos claras las reglas desde el primer día.",
    href: "/empezar?tipo=llc-2",
    cta: "Empezar",
  },
  {
    id: "banco",
    nombre: "Apertura guiada de cuenta bancaria",
    texto: "Un extra: te acompañamos paso a paso en la apertura de la cuenta de la empresa.",
    href: "/contacto?servicio=otra",
    cta: "Preguntar",
  },
];

/** Datos que pide el formulario de /formularios-llc. */
export const checklistPresentacion = [
  {
    grupo: "Tus datos",
    items: [
      "Nombre y apellidos, tal como aparecen en el pasaporte",
      "Número de pasaporte y país de nacionalidad",
      "Dirección, ciudad, país y código postal de residencia",
      "Email para recibir los formularios",
    ],
  },
  {
    grupo: "Tu LLC",
    items: [
      "Nombre de la LLC (terminado en «LLC»)",
      "Estado de constitución de la LLC",
      "Número EIN",
      "Dirección de la LLC en EE. UU. (mailbox o registered agent)",
      "Fecha de constitución (la encontrarás en los Articles of Organization)",
      "Actividad, en una frase en inglés",
    ],
  },
  {
    grupo: "Tus números del año",
    items: [
      "Dinero que has sacado de la LLC para ti",
      "Dinero que has transferido tú a la LLC",
      "Saldo total de las cuentas de la LLC a 31 de diciembre",
    ],
  },
];
