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

export const nav = [
  { href: "/como-funciona-una-llc", label: "Cómo funciona una LLC" },
  { href: "/servicios", label: "Servicios" },
  { href: "/formularios-llc", label: "Formularios LLC" },
  { href: "/#preguntas", label: "Preguntas" },
  { href: "/contacto", label: "Contacto" },
];

/** Estados que acepta el formulario de presentación de la web actual. */
export const estadosDestacados = ["New Mexico", "Wyoming", "Delaware"];
export const estados = [
  "New Mexico", "Wyoming", "Delaware", "Florida", "Texas", "Nevada", "California",
  "Nueva York", "Colorado", "Arizona", "Georgia", "Illinois", "Washington", "Utah",
  "Oregón", "Pensilvania", "Carolina del Norte", "Massachusetts", "Tennessee", "Ohio",
  "Virginia", "Minnesota", "Míchigan", "Montana", "Idaho", "Nueva Jersey",
];

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
    nombre: "Cierre tranquilo",
    lema: "Porque cerrar bien también es de buenos negocios.",
    servicio: "Baja de tu LLC con la última presentación",
    incluye: [
      "Marcas tu presentación como «Última presentación»",
      "Recogemos los datos del último ejercicio",
      "Presentamos la declaración final",
    ],
    cta: "Cerrar mi LLC",
  },
];

export type Plan = {
  id: "basico" | "estandar" | "encargo";
  servicio: string;
  nombre: string;
  lema: string;
  precio: string;
  destacado?: boolean;
  incluye: string[];
  cta: string;
  href: string;
};

const incluyeBasico = [
  "Registro de la LLC en el Estado de Nuevo México",
  "Agente registrador y dirección postal durante 1 año",
  "EIN express (48 h)",
  "Entrega vía email",
];

/** Propuesta comercial: constitución de la LLC. */
export const planes: Plan[] = [
  {
    id: "basico",
    servicio: "Constitución de tu LLC",
    nombre: "Plan Básico",
    lema: "Rápida, sencilla y autogestionada",
    precio: "397$",
    incluye: incluyeBasico,
    cta: "Empezar con el Plan Básico",
    href: "/empezar?paquete=arranque&plan=basico",
  },
  {
    id: "estandar",
    servicio: "Constitución de tu LLC",
    nombre: "Plan Estándar",
    lema: "Rápida, sencilla y con acompañamiento",
    precio: "497$",
    destacado: true,
    incluye: [...incluyeBasico, "Consultoría de 45 min en la que resolvemos 1 a 1 tus dudas"],
    cta: "Empezar con el Plan Estándar",
    href: "/empezar?paquete=arranque&plan=estandar",
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

/** Comparación de tipos de LLC en la página de servicios. Sin precios. */
export const tiposLlc = [
  {
    id: "single",
    etiqueta: "Single member",
    nombre: "LLC de un socio",
    texto:
      "Una sola persona constituye la empresa y la dirige. Es la opción habitual de quien emprende por su cuenta. Si no resides en EE. UU., cada año lo habitual es informar al IRS con el formulario 5472 junto a un 1120 pro forma.",
    href: "/empezar?paquete=arranque",
    cta: "Empezar",
  },
  {
    id: "multi",
    etiqueta: "Multi-member",
    nombre: "LLC con varios socios",
    texto:
      "La empresa es de más de una persona. Hay que acordar quién es dueño de qué y cómo se decide. Las obligaciones anuales cambian respecto a la LLC de un socio: lo revisamos contigo antes de empezar.",
    href: "/contacto?servicio=arranque",
    cta: "Preguntar",
  },
];

/** Servicios digitales y precios tal y como aparecen en la tienda de la web actual. */
export const serviciosDigitales = [
  {
    nombre: "Diseño Web Avanzado",
    precio: "950 €",
    descripcion:
      "Web a medida y responsive para negocios con mucho contenido que no necesitan tienda online. Incluye primer año de dominio y hosting, correo ilimitado, optimización SEO, seguridad, un año de mantenimiento y formación.",
  },
  {
    nombre: "Diseño Tienda Online",
    precio: "1.900 €",
    descripcion:
      "Tienda online personalizada con chat en tiempo real, herramientas de facturación y CRM. Incluye primer año de dominio y hosting, SEO, seguridad, un año de mantenimiento y formación.",
  },
  {
    nombre: "Auditoría SEO",
    precio: "150 €",
    precioAnterior: "190 €",
    descripcion:
      "Primero, saber dónde está tu web. Después, un plan de acciones SEO. Y luego, ejecutarlo.",
  },
  {
    nombre: "Mantenimiento Anual Web Básico",
    precio: "295 €",
    descripcion:
      "Contenido actualizado (10 asistencias al mes), actualizaciones, limpieza y optimización, copias de seguridad semanales e informe mensual.",
  },
  {
    nombre: "Pack Hosting Pro + Dominio",
    precio: "180 €/año",
    descripcion:
      "Dominio, hasta 10 cuentas de correo de capacidad ilimitada, copias de seguridad semanales y cPanel profesional.",
  },
  {
    nombre: "Formación WordPress",
    precio: "490 € · 1.400 €",
    descripcion:
      "Clases particulares por videoconferencia, un profesor y un alumno. 10 horas para gestionar tu web o 30 horas para crearla desde cero. Las sesiones quedan grabadas.",
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

export const faqs = [
  {
    q: "¿Qué son los formularios 1120 y 5472?",
    a: "Si tienes una LLC de un solo socio y no resides en EE. UU., lo habitual es que cada año tengas que informar al IRS de las operaciones entre tú y tu empresa. Se hace con el formulario 5472, que se presenta junto a un formulario 1120 «pro forma». Es una declaración informativa: no suele haber impuesto que pagar, pero sí hay que presentarla.",
  },
  {
    q: "¿Quién presenta mis formularios?",
    a: "Lo hacemos todo directamente. Recogemos tus datos con un formulario guiado, los revisamos contigo y presentamos los formularios ante el IRS.",
  },
  {
    q: "Mi LLC no ha tenido actividad este año. ¿Tengo que presentar igual?",
    a: "En general, sí. En el formulario escribe «0» en los campos sin actividad: no se pueden dejar vacíos. Si dudas sobre tu caso concreto, escríbenos antes de empezar.",
  },
  {
    q: "¿Sacar dinero en un cajero cuenta como transferencia?",
    a: "Sí. Las disposiciones de efectivo en cajeros desde la cuenta de la empresa se consideran transferencias al socio, así que súmalas a ese apartado.",
  },
  {
    q: "¿Dónde encuentro la fecha de creación de mi LLC?",
    a: "En los Articles of Organization, el documento con el que el estado registró tu LLC. Ahí figura la fecha de creación.",
  },
  {
    q: "Quiero cerrar mi LLC. ¿Cómo lo hago?",
    a: "Al preparar tu presentación anual, marca la casilla «Última presentación». Así la declaración se tramita como la última de la empresa.",
  },
  {
    q: "¿Trabajáis con LLC de cualquier estado?",
    a: "Nuestro formulario acepta LLC de New Mexico, Wyoming, Delaware y de la mayoría de los estados. Si el tuyo no aparece, pregúntanos.",
  },
  {
    q: "¿Y con corporaciones (C-Corp)?",
    a: "Sí. La corporación la preparamos a medida, bajo petición. Cuéntanos qué necesitas y lo vemos contigo.",
  },
  {
    q: "¿Cuánto cuesta?",
    a: "Depende del servicio y de tu caso. Empieza el asistente o escríbenos por WhatsApp y te decimos el precio que te corresponde.",
  },
];
