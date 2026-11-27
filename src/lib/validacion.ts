import { z } from "zod";
import {
  casoAsistente,
  ETIQUETA_CASO,
  PUNTOS,
  REQUISITOS,
  SERVICIO_POR_CASO,
  TIPOS,
  type Punto,
  type Requisitos,
  type Tipo,
} from "@/lib/asistente";
import {
  FACTURACION,
  GESTION,
  MENSAJES_ALTA,
  porcentajeDe,
  REPARTO,
  sumaCien,
  telefonoConPrefijo,
  TIPOS_SOCIO,
  validarAlta,
  validarAltaSocios,
  type DatosAlta,
  type DatosAltaSocios,
} from "@/lib/alta";
import {
  CLAVES_ESTADOS_LLC,
  dolares,
  enlacePago,
  esEstadoLlc,
  FORMULARIOS_1065,
  ID_FORMULARIOS_1120,
  id1065,
  idApertura,
  idAperturaVarios,
  idCierre,
  LISTA_ESTADOS_LLC,
  nombreEstado,
  PLANES,
  precio1065,
  PLANES_APERTURA,
  precioApertura,
  precioAperturaVarios,
  precioCierre,
  resumenPrecio,
  type ClaveEstadoLlc,
  type PlanApertura,
} from "@/lib/precios";
import { ERROR_ACEPTA_TERMINOS, TERMINOS_VERSION } from "@/lib/privacidad";
import { estadosConstitucion, PLANES_ASISTENTE, requisitos1065 } from "@/lib/site";
import {
  ETIQUETA_PUNTO,
  ETIQUETA_TIPO,
  SERVICIOS,
  type OrigenLead,
  type ServicioLead,
} from "@/lib/etiquetas";

const CLAVES_UTM = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;

const cuerpo = z.object({
  nombre: z.unknown().optional(),
  email: z.unknown().optional(),
  telefono: z.unknown().optional(),
  servicio: z.unknown().optional(),
  mensaje: z.unknown().optional(),
  consentimiento: z.unknown().optional(),
  pagina: z.unknown().optional(),
  utm: z.unknown().optional(),
  nec_hp: z.unknown().optional(),
  punto: z.unknown().optional(),
  tipo: z.unknown().optional(),
  estado: z.unknown().optional(),
  otroEstado: z.unknown().optional(),
  nombreLLC: z.unknown().optional(),
  sinNombre: z.unknown().optional(),
  plan: z.unknown().optional(),
  requisitos: z.unknown().optional(),
  residenteEeuu: z.unknown().optional(),
  alta: z.unknown().optional(),
});

/** Casilla de Términos y Política de devoluciones: se guarda que se aceptó y qué versión. */
function terminosAceptados(): { aceptaTerminos: true; terminosVersion: string } {
  return { aceptaTerminos: true, terminosVersion: TERMINOS_VERSION };
}

export type DatosLead = {
  origen: OrigenLead;
  servicio: ServicioLead;
  nombre: string;
  email: string;
  telefono: string | null;
  mensaje: string | null;
  datos: Record<string, unknown>;
  pagina: string | null;
  utm: Record<string, string> | null;
};

export function esHoneypot(body: unknown): boolean {
  if (!body || typeof body !== "object" || Array.isArray(body)) return false;
  const hp = (body as Record<string, unknown>).nec_hp;
  if (hp == null || hp === "") return false;
  return true;
}

function texto(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function emailValido(value: string): boolean {
  return z.email().safeParse(value).success;
}

export function limpiarPagina(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const pagina = value.trim();
  if (!pagina.startsWith("/") || pagina.startsWith("//") || pagina.length > 500) return null;
  if (/[\n\r\\]/.test(pagina)) return null;
  return pagina;
}

export function limpiarUtm(value: unknown): Record<string, string> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const limpio: Record<string, string> = {};
  for (const clave of CLAVES_UTM) {
    const bruto = (value as Record<string, unknown>)[clave];
    if (typeof bruto !== "string") continue;
    const pieza = bruto.trim();
    if (!pieza) continue;
    limpio[clave] = pieza.slice(0, 200);
  }
  return Object.keys(limpio).length ? limpio : null;
}

function telefonoDe(value: unknown, errores: Record<string, string>): string | null {
  if (value == null || value === "") return null;
  const tel = texto(value);
  if (!tel || tel.length > 40 || !/\d/.test(tel) || tel.length < 5) {
    errores.telefono = "Revisa el teléfono.";
    return null;
  }
  return tel;
}

export function validarContacto(body: unknown): { errores: Record<string, string> } | { datos: DatosLead } {
  const parsed = cuerpo.safeParse(body);
  if (!parsed.success) return { errores: { formulario: "Revisa los datos e inténtalo de nuevo." } };
  const raw = parsed.data;
  const errores: Record<string, string> = {};
  const nombre = texto(raw.nombre);
  const email = texto(raw.email).toLowerCase();
  const mensaje = texto(raw.mensaje);
  const servicio = texto(raw.servicio);
  if (!nombre || nombre.length > 120) errores.nombre = "Dinos cómo te llamas.";
  if (!email || email.length > 200 || !emailValido(email)) {
    errores.email = "Necesitamos un email válido para responderte.";
  }
  if (!SERVICIOS.includes(servicio as ServicioLead)) errores.servicio = "Elige una opción.";
  if (!mensaje || mensaje.length > 4000) errores.mensaje = "Cuéntanos un poco qué necesitas.";
  if (raw.consentimiento !== true) errores.consentimiento = "Necesitamos tu consentimiento.";
  const telefono = telefonoDe(raw.telefono, errores);
  if (Object.keys(errores).length) return { errores };
  return {
    datos: {
      origen: "contacto",
      servicio: servicio as ServicioLead,
      nombre,
      email,
      telefono,
      mensaje,
      datos: {},
      pagina: limpiarPagina(raw.pagina),
      utm: limpiarUtm(raw.utm),
    },
  };
}


export function validarEmpezar(body: unknown): { errores: Record<string, string> } | { datos: DatosLead } {
  const parsed = cuerpo.safeParse(body);
  if (!parsed.success) return { errores: { formulario: "Revisa los datos e inténtalo de nuevo." } };
  const raw = parsed.data;
  const errores: Record<string, string> = {};
  const punto = texto(raw.punto);
  const tipo = texto(raw.tipo);
  const estado = texto(raw.estado);
  const otro = texto(raw.otroEstado);
  const nombreLlc = texto(raw.nombreLLC);
  const requisitos = texto(raw.requisitos);
  let nombre = texto(raw.nombre);
  let email = texto(raw.email).toLowerCase();
  const esAlta = punto === "crear";

  if (!PUNTOS.includes(punto as Punto)) errores.punto = "Elige por dónde empezamos.";
  if (!TIPOS.includes(tipo as Tipo) || (tipo === "corp" && punto !== "crear")) {
    errores.tipo = "Elige el tipo de LLC.";
  } else if (tipo === "corp") {
    // Regla 1: las C-Corp no se dan de alta online.
    errores.tipo = "Las C-Corp las vemos contigo: escríbenos desde el formulario de contacto.";
  }
  if (punto === "anual" && !REQUISITOS.includes(requisitos as Requisitos)) {
    errores.requisitos = "Dinos si cumples los requisitos.";
  }

  let estadoVisible = "";
  if (esAlta) {
    // V3: solo los 7 estados. Otro estado o «Aún no lo sé» se desvían a contacto en el asistente.
    if (!esEstadoLlc(estado)) errores.estado = "Elige uno de los estados de la lista.";
    else estadoVisible = nombreEstado(estado);
  } else if (!estado) {
    errores.estado = "Elige el estado en el que está registrada.";
  } else if (estado === "otro") {
    if (!otro || !estadosConstitucion.includes(otro)) errores.otroEstado = "Elige el estado de la lista.";
    else estadoVisible = otro;
  } else if (!estadosConstitucion.includes(estado)) {
    errores.estado = "Elige un estado de la lista.";
  } else {
    estadoVisible = estado;
  }

  // V4 en la LLC de un socio (en varios socios se pregunta por cada socio).
  if (esAlta && tipo === "llc-1" && raw.residenteEeuu !== "no") {
    errores.residenteEeuu =
      raw.residenteEeuu === "si"
        ? "Si eres ciudadano o residente fiscal en EE. UU., tu caso lo vemos por contacto."
        : "Dinos si eres ciudadano o residente fiscal en EE. UU.";
  }

  let alta: DatosAlta | null = null;
  let altaSocios: DatosAltaSocios | null = null;
  let telefono: string | null = null;
  if (esAlta && tipo === "llc-2") {
    // La persona de contacto es uno de los socios: su nombre y su email van en la raíz del lead.
    const resultado = validarAltaSocios(raw.alta);
    if ("errores" in resultado) Object.assign(errores, resultado.errores);
    else {
      altaSocios = resultado.alta;
      nombre = altaSocios.socios[altaSocios.interlocutor].nombre;
      email = altaSocios.socios[altaSocios.interlocutor].email;
    }
    const tel = texto(raw.telefono);
    if (tel && !telefonoConPrefijo(tel)) errores.telefono = MENSAJES_ALTA.telefono;
    telefono = tel || null;
  } else if (esAlta) {
    // Un socio: el nombre de la LLC sale de las opciones del alta y el teléfono es obligatorio.
    const resultado = validarAlta(raw.alta);
    if ("errores" in resultado) Object.assign(errores, resultado.errores);
    else alta = resultado.alta;
    if (nombre.length < 3) errores.nombre = MENSAJES_ALTA.nombre;
    if (!telefonoConPrefijo(texto(raw.telefono))) errores.telefono = MENSAJES_ALTA.telefono;
    telefono = texto(raw.telefono);
  } else {
    if (!nombreLlc || nombreLlc.length > 120) errores.nombreLLC = "Escribe el nombre de tu LLC.";
    telefono = telefonoDe(raw.telefono, errores);
  }

  if (!altaSocios) {
    if (!nombre || nombre.length > 120) errores.nombre ??= "Dinos cómo te llamas.";
    if (!email || email.length > 200 || !emailValido(email)) errores.email = "Escribe un email válido.";
  }
  if (raw.consentimiento !== true) errores.consentimiento = "Necesitamos tu consentimiento.";
  if (Object.keys(errores).length) return { errores };

  const puntoOk = punto as Punto;
  const tipoOk = tipo as Tipo;
  const requisitosOk = puntoOk === "anual" ? (requisitos as Requisitos) : null;
  const caso = casoAsistente({ punto: puntoOk, tipo: tipoOk, estado, requisitos: requisitosOk })!;
  const plan = caso === "plan" ? planDe(raw.plan) : null;
  return {
    datos: {
      origen: "empezar",
      servicio: SERVICIO_POR_CASO[caso],
      nombre,
      email,
      telefono,
      mensaje: null,
      pagina: limpiarPagina(raw.pagina),
      utm: limpiarUtm(raw.utm),
      datos: {
        punto: puntoOk,
        puntoEtiqueta: ETIQUETA_PUNTO[puntoOk],
        tipo: tipoOk,
        tipoEtiqueta: ETIQUETA_TIPO[tipoOk],
        estado: estadoVisible,
        nombreLlc: alta ? alta.opcionesNombre[0] : altaSocios ? altaSocios.opcionesNombre[0] : nombreLlc,
        ...(requisitosOk
          ? {
              requisitos: requisitosOk,
              requisitosEtiqueta: requisitosOk === "si" ? "Los cumple todos" : "No cumple alguno o tiene dudas",
            }
          : {}),
        ...(esAlta && tipoOk === "llc-1" ? { residenteEeuu: false } : {}),
        caso,
        casoEtiqueta: ETIQUETA_CASO[caso],
        ...(plan ? { plan, planEtiqueta: PLANES_ASISTENTE[plan] } : {}),
        ...(caso === "plan" ? preciosPlan(estado as ClaveEstadoLlc, plan) : {}),
        ...(caso === "varios" && altaSocios ? precioVarios(estado as ClaveEstadoLlc, altaSocios.numSocios) : {}),
        ...(alta
          ? {
              alta: {
                ...alta,
                facturacionEtiqueta: FACTURACION[alta.facturacion],
                terminosVersion: TERMINOS_VERSION,
              },
              altaCompleta: true,
            }
          : {}),
        ...(altaSocios
          ? {
              alta: {
                ...altaSocios,
                socios: altaSocios.socios.map((s) => ({ ...s, tipoEtiqueta: TIPOS_SOCIO[s.tipo] })),
                interlocutorNombre: altaSocios.socios[altaSocios.interlocutor].nombre,
                gestionEtiqueta: GESTION[altaSocios.gestion],
                repartoEtiqueta: REPARTO[altaSocios.reparto],
                facturacionEtiqueta: FACTURACION[altaSocios.facturacion],
                terminosVersion: TERMINOS_VERSION,
              },
              altaCompleta: true,
            }
          : {}),
      },
    },
  };
}

/** Precio que ve el cliente en la pantalla final (plan + tasa del estado) y si se puede pagar online. */
function preciosPlan(estado: ClaveEstadoLlc, plan: PlanApertura | null): Record<string, unknown> {
  const planes = plan ? [plan] : PLANES;
  const precios = planes.map((p) => ({ p, precio: precioApertura(estado, p) }));
  return {
    precio: precios
      .map(({ p, precio }) => `${PLANES_APERTURA[p].nombre}: ${resumenPrecio(precio)}`)
      .join(" · "),
    ...(plan ? { precioTotal: precios[0].precio.total, idServicio: idApertura(estado, plan) } : {}),
    // Plan de Whop por ID (familia + estado), nunca por importe.
    pagoOnline: precios.every(({ p }) => enlacePago(idApertura(estado, p)) != null),
  };
}

function precioVarios(estado: ClaveEstadoLlc, socios: number): Record<string, unknown> {
  const precio = precioAperturaVarios(estado, socios);
  const id = idAperturaVarios(estado, socios);
  return {
    precio: resumenPrecio(precio),
    precioTotal: precio.total,
    idServicio: id,
    pagoOnline: enlacePago(id) != null,
  };
}

export function planDe(value: unknown): PlanApertura | null {
  return PLANES.includes(value as PlanApertura) ? (value as PlanApertura) : null;
}

/** Encargo personalizado: solo nombre y email. */
export function validarEncargo(body: unknown): { errores: Record<string, string> } | { datos: DatosLead } {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { errores: { formulario: "Revisa los datos e inténtalo de nuevo." } };
  }
  const raw = body as Record<string, unknown>;
  const errores: Record<string, string> = {};
  const nombre = texto(raw.nombre);
  const email = texto(raw.email).toLowerCase();
  if (!nombre || nombre.length > 120) errores.nombre = "Dinos cómo te llamas.";
  if (!email || email.length > 200 || !emailValido(email)) errores.email = "Escribe un email válido.";
  if (raw.consentimiento !== true) errores.consentimiento = "Necesitamos tu consentimiento.";
  if (Object.keys(errores).length) return { errores };
  return {
    datos: {
      origen: "contacto",
      servicio: "encargo",
      nombre,
      email,
      telefono: null,
      mensaje: null,
      datos: {},
      pagina: limpiarPagina(raw.pagina),
      utm: limpiarUtm(raw.utm),
    },
  };
}

export const EIN_RE = /^\d{2}-\d{7}$/;
const IMPORTE_RE = /^\d{1,12}(?:[.,]\d{1,2})?$/;

/** Normaliza un importe en dólares: «1234,5» → «1234.50». Sin separador de miles. */
export function importeDe(value: unknown): string | null {
  const bruto = texto(value).replace(/\s|\$/g, "");
  if (!IMPORTE_RE.test(bruto)) return null;
  return Number(bruto.replace(",", ".")).toFixed(2);
}

function fechaPasada(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const fecha = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(fecha.getTime()) || fecha.toISOString().slice(0, 10) !== value) return false;
  return fecha.getUTCFullYear() >= 1990 && fecha.getTime() <= Date.now();
}

type CampoTexto = { clave: string; max: number; error: string };

const CAMPOS_FORMULARIO: CampoTexto[] = [
  { clave: "nombre", max: 120, error: "Escribe tu nombre y apellidos como aparecen en el pasaporte." },
  { clave: "pasaporte", max: 30, error: "Escribe el número de pasaporte." },
  { clave: "nacionalidad", max: 80, error: "Escribe tu país de nacionalidad." },
  { clave: "direccion", max: 200, error: "Escribe tu dirección de residencia." },
  { clave: "ciudad", max: 80, error: "Escribe tu ciudad de residencia." },
  { clave: "paisResidencia", max: 80, error: "Escribe tu país de residencia." },
  { clave: "codigoPostal", max: 16, error: "Escribe el código postal." },
  { clave: "nombreLlc", max: 120, error: "Escribe el nombre de la LLC." },
  { clave: "direccionLlc", max: 300, error: "Escribe la dirección de la LLC en EE. UU." },
  { clave: "actividad", max: 200, error: "Describe la actividad en una frase, en inglés." },
];

const CHECKS_FORMULARIO = {
  unicoSocio: "Debes confirmar que eres el único socio.",
  resideFuera: "Debes confirmar que resides fuera de EE. UU.",
  datosCorrectos: "Debes confirmar que los datos son correctos y completos.",
} as const;

/**
 * Formularios LLC del ejercicio 2026. Incluye pasaporte e importes:
 * los errores nunca repiten el valor recibido.
 */
export function validarFormulariosLlc(
  body: unknown,
): { errores: Record<string, string> } | { datos: DatosLead } {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { errores: { formulario: "Revisa los datos e inténtalo de nuevo." } };
  }
  const raw = body as Record<string, unknown>;
  const errores: Record<string, string> = {};
  const valores: Record<string, string> = {};

  for (const campo of CAMPOS_FORMULARIO) {
    const valor = texto(raw[campo.clave]).replace(/\s+/g, " ");
    if (!valor || valor.length > campo.max) errores[campo.clave] = campo.error;
    valores[campo.clave] = valor;
  }
  if (!errores.pasaporte && !/^[A-Za-z0-9 -]{4,30}$/.test(valores.pasaporte)) {
    errores.pasaporte = "El número de pasaporte solo lleva letras y números.";
  }
  if (!errores.codigoPostal && !/^[A-Za-z0-9 -]{2,16}$/.test(valores.codigoPostal)) {
    errores.codigoPostal = "Revisa el código postal.";
  }
  if (!errores.nombreLlc && !/\bLLC$/i.test(valores.nombreLlc)) {
    errores.nombreLlc = "El nombre tiene que terminar en «LLC».";
  }

  const email = texto(raw.email).toLowerCase();
  if (!email || email.length > 200 || !emailValido(email)) errores.email = "Escribe un email válido.";

  const estadoConstitucion = texto(raw.estadoConstitucion);
  if (!estadosConstitucion.includes(estadoConstitucion)) {
    errores.estadoConstitucion = "Elige el estado de constitución de la LLC.";
  }

  const ein = texto(raw.ein);
  if (!EIN_RE.test(ein)) errores.ein = "El EIN tiene el formato XX-XXXXXXX (9 cifras).";

  const fechaConstitucion = texto(raw.fechaConstitucion);
  if (!fechaPasada(fechaConstitucion)) errores.fechaConstitucion = "Escribe una fecha de constitución válida.";

  const retiros = importeDe(raw.retiros);
  if (retiros == null) errores.retiros = "Escribe el total en dólares, o 0.";
  const aportaciones = importeDe(raw.aportaciones);
  if (aportaciones == null) errores.aportaciones = "Escribe el total en dólares, o 0.";
  const saldo = importeDe(raw.saldo);
  if (saldo == null) errores.saldo = "Escribe el saldo en dólares, o 0.";

  for (const [clave, error] of Object.entries(CHECKS_FORMULARIO)) {
    if (raw[clave] !== true) errores[clave] = error;
  }
  if (raw.consentimiento !== true) errores.consentimiento = "Necesitamos tu consentimiento.";
  if (raw.aceptaTerminos !== true) errores.aceptaTerminos = ERROR_ACEPTA_TERMINOS;
  if (Object.keys(errores).length) return { errores };

  return {
    datos: {
      origen: "contacto",
      servicio: "formularios-llc",
      nombre: valores.nombre,
      email,
      telefono: null,
      mensaje: null,
      pagina: limpiarPagina(raw.pagina),
      utm: limpiarUtm(raw.utm),
      datos: {
        ejercicio: 2026,
        pasaporte: valores.pasaporte.toUpperCase(),
        nacionalidad: valores.nacionalidad,
        direccion: valores.direccion,
        ciudad: valores.ciudad,
        paisResidencia: valores.paisResidencia,
        codigoPostal: valores.codigoPostal.toUpperCase(),
        nombreLlc: valores.nombreLlc,
        estadoConstitucion,
        ein,
        direccionLlc: valores.direccionLlc,
        fechaConstitucion,
        actividad: valores.actividad,
        retiros,
        aportaciones,
        saldo,
        unicoSocio: true,
        resideFuera: true,
        datosCorrectos: true,
        ...terminosAceptados(),
        idServicio: ID_FORMULARIOS_1120,
        pagoOnline: enlacePago(ID_FORMULARIOS_1120) != null,
      },
    },
  };
}

/** Cierre de LLC: opciones de los desplegables. Los 7 estados, un socio y LLC al día llegan al pago. */
export const CIERRE_ESTADOS: Record<string, string> = {
  ...Object.fromEntries(CLAVES_ESTADOS_LLC.map((clave) => [clave, nombreEstado(clave)])),
  otro: "Otro estado",
};
export const CIERRE_SOCIOS = { uno: "Solo yo", varios: "Dos o más" } as const;
export const CIERRE_SI_NO = { si: "Sí", no: "No", "no-se": "No lo sé" } as const;
export const CIERRE_CUANDO = { "cuanto-antes": "Cuanto antes", "final-ano": "A final de año", otra: "Otra fecha" } as const;
/** Las tres preguntas de situación que deciden si la LLC está al día (V5). */
export const CIERRE_PREGUNTAS_AL_DIA = ["activa", "formulariosPrevios", "agenteAlDia"] as const;
export const DESVIO_CIERRE_ESTADO = `Cerramos LLC de ${LISTA_ESTADOS_LLC}. Si tu LLC es de otro estado, contacta con nosotros y te damos presupuesto.`;
export const DESVIO_CIERRE_AL_DIA =
  "Para cerrar tu LLC con este servicio tiene que estar al día. Escríbenos y vemos qué hace falta regularizar antes.";

function opcion<T extends Record<string, string>>(mapa: T, value: unknown): keyof T | null {
  const v = texto(value);
  return Object.prototype.hasOwnProperty.call(mapa, v) ? (v as keyof T) : null;
}

/**
 * Cierre de LLC (/cierra-tu-llc). Mismo tratamiento que Formularios LLC:
 * los errores nunca repiten el valor recibido.
 */
export function validarCierreLlc(body: unknown): { errores: Record<string, string> } | { datos: DatosLead } {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { errores: { formulario: "Revisa los datos e inténtalo de nuevo." } };
  }
  const raw = body as Record<string, unknown>;
  const errores: Record<string, string> = {};
  const limpio = (k: string) => texto(raw[k]).replace(/\s+/g, " ");

  const nombre = limpio("nombre");
  if (!nombre || nombre.length > 120) errores.nombre = "Escribe tu nombre y apellidos.";

  const email = texto(raw.email).toLowerCase();
  if (!email || email.length > 200 || !emailValido(email)) errores.email = "Escribe un email válido.";

  let telefono: string | null = null;
  if (raw.telefono == null || texto(raw.telefono) === "") errores.telefono = "Escribe tu teléfono con WhatsApp.";
  else telefono = telefonoDe(raw.telefono, errores);

  const paisResidencia = limpio("paisResidencia");
  if (!paisResidencia || paisResidencia.length > 80) errores.paisResidencia = "Escribe tu país de residencia.";

  const nombreLlc = limpio("nombreLlc");
  if (!nombreLlc || nombreLlc.length > 120) errores.nombreLlc = "Escribe el nombre de la LLC.";
  else if (!/\bLLC$/i.test(nombreLlc)) errores.nombreLlc = "El nombre tiene que terminar en «LLC».";

  const estado = opcion(CIERRE_ESTADOS, raw.estadoConstitucion);
  if (!estado) errores.estadoConstitucion = "Elige el estado de constitución.";
  else if (estado === "otro") errores.estadoConstitucion = DESVIO_CIERRE_ESTADO;

  const ein = texto(raw.ein);
  if (!EIN_RE.test(ein)) errores.ein = "El EIN tiene el formato XX-XXXXXXX (9 cifras).";

  const fechaConstitucion = texto(raw.fechaConstitucion);
  if (!fechaPasada(fechaConstitucion)) errores.fechaConstitucion = "Escribe una fecha de constitución válida.";

  const socios = opcion(CIERRE_SOCIOS, raw.socios);
  if (!socios) errores.socios = "Elige el número de socios.";
  else if (socios === "varios") {
    errores.socios = "Con dos o más socios no se contrata aquí: contacta con nosotros y te damos presupuesto.";
  }

  // V5: solo LLC al día. «No» o «No lo sé» en cualquiera de las tres preguntas va a contacto.
  for (const clave of CIERRE_PREGUNTAS_AL_DIA) {
    const valor = opcion(CIERRE_SI_NO, raw[clave]);
    if (!valor) errores[clave] = "Elige una opción.";
    else if (valor !== "si") errores[clave] = DESVIO_CIERRE_AL_DIA;
  }

  const cuentas = limpio("cuentas");
  if (!cuentas || cuentas.length > 500) errores.cuentas = "Dinos qué cuentas tiene abiertas la LLC.";

  const cuando = opcion(CIERRE_CUANDO, raw.cuando);
  const cuandoOtra = limpio("cuandoOtra");
  if (!cuando) errores.cuando = "Elige cuándo quieres cerrarla.";
  else if (cuando === "otra" && (!cuandoOtra || cuandoOtra.length > 120)) errores.cuandoOtra = "Indica la fecha.";

  const notas = texto(raw.notas);
  if (notas.length > 4000) errores.notas = "El texto es demasiado largo.";

  if (raw.datosCorrectos !== true) errores.datosCorrectos = "Debes confirmar que los datos son correctos y completos.";
  if (raw.confirmaAlDia !== true) errores.confirmaAlDia = "Debes confirmar que tu LLC está al día.";
  if (raw.aceptaPrecio !== true) errores.aceptaPrecio = "Debes confirmar que entiendes el precio.";
  if (raw.consentimiento !== true) errores.consentimiento = "Necesitamos tu consentimiento.";
  if (raw.aceptaTerminos !== true) errores.aceptaTerminos = ERROR_ACEPTA_TERMINOS;
  if (Object.keys(errores).length) return { errores };

  const estadoOk = estado as ClaveEstadoLlc;
  const precio = precioCierre(estadoOk);
  const cuandoOk = cuando as keyof typeof CIERRE_CUANDO;
  return {
    datos: {
      origen: "contacto",
      servicio: "cierre-llc",
      nombre,
      email,
      telefono,
      mensaje: notas || null,
      pagina: limpiarPagina(raw.pagina),
      utm: limpiarUtm(raw.utm),
      datos: {
        paisResidencia,
        nombreLlc,
        estadoConstitucion: CIERRE_ESTADOS[estadoOk],
        ein,
        fechaConstitucion,
        socios: CIERRE_SOCIOS.uno,
        activa: CIERRE_SI_NO.si,
        formulariosPrevios: CIERRE_SI_NO.si,
        agenteAlDia: CIERRE_SI_NO.si,
        cuentas,
        cuando: cuandoOk === "otra" ? `${CIERRE_CUANDO.otra}: ${cuandoOtra}` : CIERRE_CUANDO[cuandoOk],
        precio: resumenPrecio(precio),
        precioTotal: precio.total,
        idServicio: idCierre(estadoOk),
        pagoOnline: enlacePago(idCierre(estadoOk)) != null,
        datosCorrectos: true,
        confirmaAlDia: true,
        aceptaPrecio: true,
        ...terminosAceptados(),
      },
    },
  };
}

// --- Form 1065 + K-1 (LLC de varios socios, `formularios-1065.md`) ---

export const SI_NO_NOSE = { si: "Sí", no: "No", "no-se": "No lo sé" } as const;
export const SI_NO = { si: "Sí", no: "No" } as const;
export const ITIN_RE = /^9\d{2}-\d{2}-\d{4}$/;
export const DESVIO_1065_REQUISITOS =
  "Tu caso necesita un análisis personalizado. Escríbenos y lo vemos.";
export const DESVIO_1065_CAMBIOS =
  "Si hubo cambios de socios durante el año, el Form 1065 se complica: escríbenos y lo preparamos contigo.";

/** «912345678» o «912-34-5678» → «912-34-5678». */
export function formatoItin(valor: string): string {
  const cifras = valor.replace(/\D/g, "").slice(0, 9);
  if (cifras.length <= 3) return cifras;
  if (cifras.length <= 5) return `${cifras.slice(0, 3)}-${cifras.slice(3)}`;
  return `${cifras.slice(0, 3)}-${cifras.slice(3, 5)}-${cifras.slice(5)}`;
}

const CAMPOS_LLC_1065: CampoTexto[] = [
  { clave: "nombreLlc", max: 120, error: "Escribe el nombre de la LLC." },
  { clave: "direccionLlc", max: 300, error: "Escribe la dirección de la LLC en EE. UU." },
  { clave: "actividad", max: 200, error: "Describe la actividad en una frase, en inglés." },
  { clave: "nombre", max: 120, error: "Escribe el nombre de la persona de contacto." },
];

const CAMPOS_SOCIO_1065: CampoTexto[] = [
  { clave: "nombre", max: 120, error: "Escribe el nombre y apellidos como aparecen en el pasaporte." },
  { clave: "pasaporte", max: 30, error: "Escribe el número de pasaporte." },
  { clave: "nacionalidad", max: 80, error: "Escribe la nacionalidad." },
  { clave: "direccion", max: 300, error: "Escribe la dirección completa de residencia." },
];

const CHECKS_1065 = {
  datosCorrectos: "Debes confirmar que los datos son correctos y completos.",
  ningunoEeuuConfirma: "Debes confirmar que ningún socio es ciudadano ni residente fiscal en EE. UU.",
  sociosAceptan: "Debes confirmar que los demás socios conocen y aceptan esta solicitud.",
} as const;

export type Socio1065 = {
  nombre: string;
  pasaporte: string;
  nacionalidad: string;
  direccion: string;
  porcentajeInicio: number;
  porcentajeFin: number;
  sinCambios: boolean;
  aportaciones: string;
  retiros: string;
  itin: string | null;
};

/**
 * Form 1065 + K-1 del ejercicio 2026: de 2 a 10 socios, todos personas físicas y de fuera de EE. UU.
 * Lleva pasaportes e importes: los errores nunca repiten el valor recibido.
 */
export function validarFormularios1065(
  body: unknown,
): { errores: Record<string, string> } | { datos: DatosLead } {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { errores: { formulario: "Revisa los datos e inténtalo de nuevo." } };
  }
  const raw = body as Record<string, unknown>;
  const errores: Record<string, string> = {};
  const limpio = (v: unknown) => texto(v).replace(/\s+/g, " ");

  // Requisitos: todos «Sí». Un «No» o «No lo sé» va a contacto (el formulario no se envía).
  const req = raw.requisitos && typeof raw.requisitos === "object" ? (raw.requisitos as Record<string, unknown>) : {};
  for (const { clave } of requisitos1065) {
    const v = opcion(SI_NO_NOSE, req[clave]);
    if (!v) errores[`requisitos.${clave}`] = "Responde a este requisito.";
    else if (v !== "si") errores[`requisitos.${clave}`] = DESVIO_1065_REQUISITOS;
  }

  const valores: Record<string, string> = {};
  for (const campo of CAMPOS_LLC_1065) {
    const valor = limpio(raw[campo.clave]);
    if (!valor || valor.length > campo.max) errores[campo.clave] = campo.error;
    valores[campo.clave] = valor;
  }
  if (!errores.nombreLlc && !/\bLLC$/i.test(valores.nombreLlc)) {
    errores.nombreLlc = "El nombre tiene que terminar en «LLC».";
  }
  const estadoConstitucion = texto(raw.estadoConstitucion);
  if (!estadosConstitucion.includes(estadoConstitucion)) {
    errores.estadoConstitucion = "Elige el estado de constitución de la LLC.";
  }
  const ein = texto(raw.ein);
  if (!EIN_RE.test(ein)) errores.ein = "El EIN tiene el formato XX-XXXXXXX (9 cifras).";
  const fechaConstitucion = texto(raw.fechaConstitucion);
  if (!fechaPasada(fechaConstitucion)) errores.fechaConstitucion = "Escribe una fecha de constitución válida.";
  const primeraVez = opcion(SI_NO_NOSE, raw.primeraVez);
  if (!primeraVez) errores.primeraVez = "Elige una opción.";

  // Persona de contacto: nombre, email y teléfono con WhatsApp.
  const email = texto(raw.email).toLowerCase();
  if (!email || email.length > 200 || !emailValido(email)) errores.email = "Escribe un email válido.";
  const telefono = texto(raw.telefono);
  if (!telefonoConPrefijo(telefono)) errores.telefono = MENSAJES_ALTA.telefono;

  // Socios: de 2 a 10.
  const lista = Array.isArray(raw.socios) ? raw.socios : [];
  const socios: Socio1065[] = [];
  if (lista.length < FORMULARIOS_1065.minSocios || lista.length > FORMULARIOS_1065.maxSocios) {
    errores.socios = `El servicio online es para LLC de ${FORMULARIOS_1065.minSocios} a ${FORMULARIOS_1065.maxSocios} socios.`;
  } else {
    lista.forEach((bruto, i) => {
      const s = bruto && typeof bruto === "object" && !Array.isArray(bruto) ? (bruto as Record<string, unknown>) : {};
      const e = (campo: string, msg: string) => (errores[`socios.${i}.${campo}`] = msg);
      const v: Record<string, string> = {};
      for (const campo of CAMPOS_SOCIO_1065) {
        const valor = limpio(s[campo.clave]);
        if (!valor || valor.length > campo.max) e(campo.clave, campo.error);
        v[campo.clave] = valor;
      }
      if (!errores[`socios.${i}.pasaporte`] && !/^[A-Za-z0-9 -]{4,30}$/.test(v.pasaporte)) {
        e("pasaporte", "El número de pasaporte solo lleva letras y números.");
      }
      const sinCambios = s.sinCambios === true;
      const inicio = porcentajeDe(s.porcentajeInicio);
      if (inicio == null) e("porcentajeInicio", "Escribe un porcentaje entre 0 y 100.");
      const fin = sinCambios ? inicio : porcentajeDe(s.porcentajeFin);
      if (!sinCambios && fin == null) e("porcentajeFin", "Escribe un porcentaje entre 0 y 100.");
      const aportaciones = importeDe(s.aportaciones);
      if (aportaciones == null) e("aportaciones", "Escribe el total en dólares, o 0.");
      const retiros = importeDe(s.retiros);
      if (retiros == null) e("retiros", "Escribe el total en dólares, o 0.");
      // ITIN opcional: sin ITIN, el K-1 lleva el número de pasaporte.
      const tieneItin = opcion(SI_NO, s.tieneItin);
      let itin: string | null = null;
      if (tieneItin === "si") {
        itin = formatoItin(texto(s.itin));
        if (!ITIN_RE.test(itin)) e("itin", "El ITIN tiene el formato 9XX-XX-XXXX.");
      }
      socios.push({
        nombre: v.nombre,
        pasaporte: v.pasaporte.toUpperCase(),
        nacionalidad: v.nacionalidad,
        direccion: v.direccion,
        porcentajeInicio: inicio ?? 0,
        porcentajeFin: fin ?? 0,
        sinCambios,
        aportaciones: aportaciones ?? "",
        retiros: retiros ?? "",
        itin,
      });
    });
    const hayErrorPorcentaje = Object.keys(errores).some((k) => /^socios\.\d+\.porcentaje/.test(k));
    if (!hayErrorPorcentaje) {
      if (!sumaCien(socios.map((s) => s.porcentajeInicio))) {
        errores.socios = "Los porcentajes a 1 de enero tienen que sumar 100 %.";
      } else if (!sumaCien(socios.map((s) => s.porcentajeFin))) {
        errores.socios = "Los porcentajes a 31 de diciembre tienen que sumar 100 %.";
      }
    }
  }

  // Los números de la LLC del año.
  const importes = {
    ingresos: "Escribe los ingresos totales en dólares, o 0.",
    gastos: "Escribe los gastos totales en dólares, o 0.",
    saldoInicio: "Escribe el saldo a 1 de enero en dólares, o 0.",
    saldoFin: "Escribe el saldo a 31 de diciembre en dólares, o 0.",
  } as const;
  const numeros: Record<string, string> = {};
  for (const [clave, error] of Object.entries(importes)) {
    const valor = importeDe(raw[clave]);
    if (valor == null) errores[clave] = error;
    else numeros[clave] = valor;
  }
  const bienesPrestamos = opcion(SI_NO, raw.bienesPrestamos);
  const bienesDetalle = texto(raw.bienesDetalle);
  if (!bienesPrestamos) errores.bienesPrestamos = "Elige una opción.";
  else if (bienesPrestamos === "si" && (!bienesDetalle || bienesDetalle.length > 2000)) {
    errores.bienesDetalle = "Cuéntanos qué bienes compró la LLC o qué préstamos tiene.";
  }
  const cambiosSocios = opcion(SI_NO, raw.cambiosSocios);
  if (!cambiosSocios) errores.cambiosSocios = "Elige una opción.";
  else if (cambiosSocios === "si") errores.cambiosSocios = DESVIO_1065_CAMBIOS;

  for (const [clave, error] of Object.entries(CHECKS_1065)) {
    if (raw[clave] !== true) errores[clave] = error;
  }
  if (raw.consentimiento !== true) errores.consentimiento = "Necesitamos tu consentimiento.";
  if (raw.aceptaTerminos !== true) errores.aceptaTerminos = ERROR_ACEPTA_TERMINOS;
  if (Object.keys(errores).length) return { errores };

  const numSocios = socios.length;
  const id = id1065(numSocios);
  const total = precio1065(numSocios);
  return {
    datos: {
      origen: "contacto",
      servicio: "formularios-1065",
      nombre: valores.nombre,
      email,
      telefono,
      mensaje: null,
      pagina: limpiarPagina(raw.pagina),
      utm: limpiarUtm(raw.utm),
      datos: {
        ejercicio: 2026,
        nombreLlc: valores.nombreLlc,
        estadoConstitucion,
        ein,
        direccionLlc: valores.direccionLlc,
        fechaConstitucion,
        actividad: valores.actividad,
        primeraVez: SI_NO_NOSE[primeraVez!],
        numSocios,
        socios,
        ingresos: numeros.ingresos,
        gastos: numeros.gastos,
        saldoInicio: numeros.saldoInicio,
        saldoFin: numeros.saldoFin,
        bienesPrestamos: bienesPrestamos === "si" ? `Sí: ${bienesDetalle}` : "No",
        cambiosSocios: "No",
        requisitosCumplidos: true,
        datosCorrectos: true,
        ningunoEeuuConfirma: true,
        sociosAceptan: true,
        ...terminosAceptados(),
        precio: `${numSocios} socios · ${dolares(total)}`,
        precioTotal: total,
        idServicio: id,
        pagoOnline: enlacePago(id) != null,
      },
    },
  };
}
