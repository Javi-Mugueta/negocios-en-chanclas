/**
 * Contenido central del sitio.
 *
 * Los números de WhatsApp viven solo en `contacto.whatsapp`.
 * Para cambiarlos, actualiza `visible` y los dígitos de `href` (wa.me, sin + ni espacios).
 */

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

export type Paquete = {
  id: string;
  nombre: string;
  lema: string;
  servicio: string;
  precio?: string;
  destacado?: boolean;
  incluye: string[];
  cta: string;
};

export const paquetes: Paquete[] = [
  {
    id: "arranque",
    nombre: "Arranque",
    lema: "Para quien todavía está con la toalla en la mano.",
    servicio: "Constitución de tu LLC",
    incluye: [
      "Ayuda para elegir estado (New Mexico, Wyoming, Delaware…)",
      "Registro de la LLC y los Articles of Organization, el documento de constitución",
      "Número EIN listo en 48 horas",
      "Atención en español e inglés durante el proceso",
    ],
    cta: "Quiero empezar",
  },
  {
    id: "en-regla",
    nombre: "En regla",
    lema: "La cita anual con el IRS, sin sudores.",
    servicio: "Presentación de los formularios 1120 y 5472",
    destacado: true,
    incluye: [
      "Formulario guiado para recoger tus datos",
      "Revisión contigo y presentación de los formularios ante el IRS",
      "Para LLC de un socio (single member)",
      "Si es tu primera presentación, también se declara el coste de constitución",
      "Pago con tarjeta en el propio formulario",
    ],
    cta: "Preparar mi presentación",
  },
  {
    id: "cierre",
    nombre: "Cierre de LLC",
    lema: "Nos encargamos de cerrarla bien, de principio a fin.",
    servicio: "Cierre de tu LLC",
    precio: "467 $ + tasas del estado",
    incluye: [
      "Disolución de la LLC ante su estado",
      "Última declaración ante el IRS: los formularios 1120 y 5472 finales",
      "Cierre del EIN ante el IRS",
    ],
    cta: "Cierra tu LLC",
  },
];

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
  href: string;
};

const incluyeBasico = [
  "Registro de la LLC en el Estado de Nuevo México",
  "Agente registrador y dirección postal durante 1 año",
  "EIN express (48 h)",
  "Operating Agreement (modelo estándar)",
  "Entrega vía email",
];

const avisoRenovacion = "*Renovación anual: 197 $/año a partir del segundo año.";

/** Propuesta comercial: constitución de la LLC. */
export const planes: Plan[] = [
  {
    id: "basico",
    servicio: "Constitución de tu LLC",
    nombre: "Plan Básico",
    lema: "Rápida, sencilla y autogestionada",
    precio: "397 $",
    precioNota: "(primer año)*",
    aviso: avisoRenovacion,
    incluye: incluyeBasico,
    cta: "Empezar con el Plan Básico",
    href: "https://buy.stripe.com/7sY00j1KN2Ru8fp1NVcV22n",
  },
  {
    id: "estandar",
    servicio: "Constitución de tu LLC",
    nombre: "Plan Estándar",
    lema: "Rápida, sencilla y con acompañamiento",
    precio: "497 $",
    precioNota: "(primer año)*",
    aviso: avisoRenovacion,
    destacado: true,
    incluye: [...incluyeBasico, "Consultoría de 45 min en la que resolvemos 1 a 1 tus dudas"],
    cta: "Empezar con el Plan Estándar",
    href: "https://buy.stripe.com/3cI8wP3SV2Ru7bl2RZcV22o",
  },
  {
    id: "encargo",
    servicio: "Constitución de tu sociedad en USA",
    nombre: "Encargo personalizado",
    lema: "Si necesitas que un experto de verdad se siente contigo",
    precio: "Precio por encargo",
    incluye: [
      "Para personas que quieran abrir una LLC de dos o más miembros, en otros estados, que quieran abrir una C Corp o que tengan una situación más compleja.",
    ],
    cta: "Quiero un encargo personalizado",
    href: "/encargo-personalizado",
  },
];

export const PLANES_ASISTENTE = {
  basico: "Plan Básico (397$)",
  estandar: "Plan Estándar (497$)",
} as const;
export type PlanAsistente = keyof typeof PLANES_ASISTENTE;

/** Formularios LLC del ejercicio 2026. */
export const formulariosLlc = {
  ejercicio: 2026,
  precio: "169$",
  pago: "https://buy.stripe.com/dRm00j7572Ru0MX2RZcV22k",
  avisoPago:
    "El pago se realizará a Leaving Vorkuta LLC directamente a través de Stripe, mercantil responsable de la prestación del servicio.",
};

/** Cierre de LLC (/cierra-tu-llc). Solo Wyoming y Nuevo México, un socio. */
export const cierreLlc = {
  precio: "467 $",
  precioCompleto: "467 $ + tasas del estado",
  pago: "https://buy.stripe.com/cNibJ1757gIk67h2RZcV22p",
  avisoPago:
    "El pago se realizará a Leaving Vorkuta LLC directamente a través de Stripe, mercantil responsable de la prestación del servicio. Con el pago aceptamos tu encargo: cerramos tu LLC en un máximo de 30 días naturales (sin contar festivos) y te enviamos toda la documentación.",
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
    href: "/contacto?servicio=arranque",
    cta: "Preguntar",
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
