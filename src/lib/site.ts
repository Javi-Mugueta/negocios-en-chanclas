/**
 * Contenido central del sitio.
 *
 * Regla de oro: solo figuran como hechos los datos publicados en
 * negociosenchanclas.com. Todo lo demás usa `PENDIENTE` y se muestra en la
 * interfaz con el componente <Pending />, para que nadie lo confunda con
 * información confirmada.
 */

export const PENDIENTE = null;

export const contacto = {
  email: "contacto@negociosenchanclas.com",
  telefonoUSA: { visible: "+1 505 295 4040", href: "tel:+15052954040" },
  telefonoESP: { visible: "+34 659 308 119", href: "tel:+34659308119" },
  direccion: ["500 4th St NW, Suite 102 #1272", "Albuquerque, New Mexico 87102", "EE. UU."],
  horario: PENDIENTE as string | null,
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
  precio: string | null;
  destacado?: boolean;
  /** true si el alcance todavía no está publicado en la web actual. */
  alcancePendiente?: boolean;
  incluye: string[];
  cta: string;
};

export const paquetes: Paquete[] = [
  {
    id: "arranque",
    nombre: "Arranque",
    lema: "Para quien todavía está con la toalla en la mano.",
    servicio: "Constitución de tu LLC",
    precio: PENDIENTE,
    alcancePendiente: true,
    incluye: [
      "Ayuda para elegir estado (New Mexico, Wyoming, Delaware…)",
      "Registro de la LLC y Articles of Organization",
      "Solicitud del número EIN",
      "Acompañamiento en español durante el proceso",
    ],
    cta: "Quiero empezar",
  },
  {
    id: "en-regla",
    nombre: "En regla",
    lema: "La cita anual con el IRS, sin sudores.",
    servicio: "Presentación de los formularios 1120 y 5472",
    precio: PENDIENTE,
    destacado: true,
    incluye: [
      "Formulario guiado en español para recoger tus datos",
      "Revisión y entrega a contables autorizados, que presentan los formularios",
      "LLC de uno o dos miembros",
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
    precio: PENDIENTE,
    incluye: [
      "Marcas tu presentación como «Última presentación»",
      "Recogemos los datos del último ejercicio",
      "Los contables autorizados presentan la declaración final",
    ],
    cta: "Cerrar mi LLC",
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
    a: "Si tienes una LLC de un solo miembro y no resides en EE. UU., lo habitual es que cada año tengas que informar al IRS de las operaciones entre tú y tu empresa. Se hace con el formulario 5472, que se presenta junto a un formulario 1120 «pro forma». Es una declaración informativa: no suele haber impuesto que pagar, pero sí hay que presentarla.",
  },
  {
    q: "¿Quién presenta mis formularios?",
    a: "Lo decimos claro: nosotros intermediamos. Recogemos todos tus datos con un formulario guiado, los revisamos contigo y se los entregamos a contables autorizados, que son quienes presentan los formularios ante el IRS.",
  },
  {
    q: "Mi LLC no ha tenido actividad este año. ¿Tengo que presentar igual?",
    a: "En general, sí. En el formulario escribe «0» en los campos sin actividad: no se pueden dejar vacíos. Si dudas sobre tu caso concreto, escríbenos antes de empezar.",
  },
  {
    q: "¿Sacar dinero en un cajero cuenta como transferencia?",
    a: "Sí. Las disposiciones de efectivo en cajeros desde la cuenta de la empresa se consideran transferencias al miembro, así que súmalas a ese apartado.",
  },
  {
    q: "¿Dónde encuentro la fecha de creación de mi LLC?",
    a: "En tus Articles of Organization, el documento con el que el estado registró tu LLC. Ahí figura la fecha de activación.",
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
    a: "Todavía no. Las corporaciones llegarán próximamente; por ahora nos centramos en LLC de uno o dos miembros.",
  },
  {
    q: "¿Cuánto cuesta?",
    a: null,
  },
];
