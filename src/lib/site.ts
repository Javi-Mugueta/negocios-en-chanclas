/**
 * Contenido central del sitio.
 *
 * Los números de WhatsApp viven solo en `contacto.whatsapp`.
 * Para cambiarlos, actualiza `visible` y los dígitos de `href` (wa.me, sin + ni espacios).
 */

export const contacto = {
  direccion: ["500 4th St NW, Suite 102 #1272", "Albuquerque, New Mexico 87102", "EE. UU."],
  whatsapp: {
    espana: { visible: "+34 659 308 119", href: "https://wa.me/34659308119" },
    eeuu: { visible: "+1 505 295 4040", href: "https://wa.me/15052954040" },
  },
};

export const nav = [
  { href: "/como-funciona-una-llc", label: "Cómo funciona una LLC" },
  { href: "/servicios", label: "Servicios" },
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

/** Datos que pide el formulario de presentación 1120 + 5472 de la web actual. */
export const checklistPresentacion = [
  { grupo: "Tus datos", items: ["Nombre y apellidos", "Teléfono y tu mejor email", "Dirección de residencia completa"] },
  {
    grupo: "Tu LLC",
    items: [
      "Nombre de la empresa",
      "Actividad (código NAICS)",
      "Número de miembros (1 o 2)",
      "Dirección, ciudad, estado y código postal",
      "Número EIN",
      "Fecha de creación (la encontrarás en los Articles of Organization)",
    ],
  },
  {
    grupo: "Tus números del año",
    items: [
      "Total facturado",
      "Total de gastos",
      "Transferido de la empresa al miembro",
      "Transferido del miembro a la empresa",
      "Coste de constitución, solo si es tu primera presentación",
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
