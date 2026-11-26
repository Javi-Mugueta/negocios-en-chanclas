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
import { FACTURACION, MENSAJES_ALTA, telefonoConPrefijo, validarAlta, type DatosAlta } from "@/lib/alta";
import { CONSENTIMIENTO_VERSION } from "@/lib/privacidad";
import { estadosConstitucion, PLANES_ASISTENTE } from "@/lib/site";
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
  alta: z.unknown().optional(),
});

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
  const nombre = texto(raw.nombre);
  const email = texto(raw.email).toLowerCase();

  if (!PUNTOS.includes(punto as Punto)) errores.punto = "Elige por dónde empezamos.";
  if (!TIPOS.includes(tipo as Tipo) || (tipo === "corp" && punto !== "crear")) {
    errores.tipo = "Elige el tipo de LLC.";
  }
  if (punto === "anual" && !REQUISITOS.includes(requisitos as Requisitos)) {
    errores.requisitos = "Dinos si cumples los requisitos.";
  }

  let estadoVisible = "";
  if (!estado) {
    errores.estado = "Elige un estado (o dinos que aún no lo sabes).";
  } else if (estado === "otro") {
    if (!otro || !estadosConstitucion.includes(otro)) errores.otroEstado = "Elige el estado de la lista.";
    else estadoVisible = otro;
  } else if (estado === "no-se") {
    if (punto !== "crear") errores.estado = "Elige el estado en el que está registrada.";
    else estadoVisible = "Aún por decidir";
  } else if (!estadosConstitucion.includes(estado)) {
    errores.estado = "Elige un estado de la lista.";
  } else {
    estadoVisible = estado;
  }

  // Crear: el nombre de la LLC sale de las opciones del alta y el teléfono es obligatorio.
  const esAlta = punto === "crear";
  let alta: DatosAlta | null = null;
  if (esAlta) {
    const resultado = validarAlta(raw.alta);
    if ("errores" in resultado) Object.assign(errores, resultado.errores);
    else alta = resultado.alta;
    if (nombre.length < 3) errores.nombre = MENSAJES_ALTA.nombre;
    if (!telefonoConPrefijo(texto(raw.telefono))) errores.telefono = MENSAJES_ALTA.telefono;
  } else if (!nombreLlc || nombreLlc.length > 120) {
    errores.nombreLLC = "Escribe el nombre de tu LLC.";
  }

  if (!nombre || nombre.length > 120) errores.nombre ??= "Dinos cómo te llamas.";
  if (!email || email.length > 200 || !emailValido(email)) {
    errores.email = "Escribe un email válido.";
  }
  if (raw.consentimiento !== true) errores.consentimiento = "Necesitamos tu consentimiento.";
  const telefono = esAlta ? texto(raw.telefono) : telefonoDe(raw.telefono, errores);
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
        nombreLlc: alta ? alta.opcionesNombre[0] : nombreLlc,
        ...(requisitosOk
          ? {
              requisitos: requisitosOk,
              requisitosEtiqueta: requisitosOk === "si" ? "Los cumple todos" : "No cumple alguno o tiene dudas",
            }
          : {}),
        caso,
        casoEtiqueta: ETIQUETA_CASO[caso],
        ...(plan ? { plan, planEtiqueta: PLANES_ASISTENTE[plan] } : {}),
        ...(alta
          ? {
              alta: {
                ...alta,
                facturacionEtiqueta: FACTURACION[alta.facturacion],
                terminosVersion: CONSENTIMIENTO_VERSION,
              },
              altaCompleta: true,
            }
          : {}),
      },
    },
  };
}

const PLANES = ["basico", "estandar"] as const;

export function planDe(value: unknown): (typeof PLANES)[number] | null {
  return PLANES.includes(value as (typeof PLANES)[number]) ? (value as (typeof PLANES)[number]) : null;
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
      },
    },
  };
}

/** Cierre de LLC: opciones de los desplegables. Solo «Wyoming»/«Nuevo México» y un socio llegan al pago. */
export const CIERRE_ESTADOS = { wyoming: "Wyoming", "nuevo-mexico": "Nuevo México", otro: "Otro estado" } as const;
export const CIERRE_SOCIOS = { uno: "Solo yo", varios: "Dos o más" } as const;
export const CIERRE_SI_NO = { si: "Sí", no: "No", "no-se": "No lo sé" } as const;
export const CIERRE_CUANDO = { "cuanto-antes": "Cuanto antes", "final-ano": "A final de año", otra: "Otra fecha" } as const;

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
  else if (estado === "otro") {
    errores.estadoConstitucion =
      "Por este precio cerramos LLC de Wyoming y Nuevo México. Si tu LLC es de otro estado, contacta con nosotros y te damos presupuesto.";
  }

  const ein = texto(raw.ein);
  if (!EIN_RE.test(ein)) errores.ein = "El EIN tiene el formato XX-XXXXXXX (9 cifras).";

  const fechaConstitucion = texto(raw.fechaConstitucion);
  if (!fechaPasada(fechaConstitucion)) errores.fechaConstitucion = "Escribe una fecha de constitución válida.";

  const socios = opcion(CIERRE_SOCIOS, raw.socios);
  if (!socios) errores.socios = "Elige el número de socios.";
  else if (socios === "varios") {
    errores.socios = "Con dos o más socios no se contrata aquí: contacta con nosotros y te damos presupuesto.";
  }

  const formulariosPrevios = opcion(CIERRE_SI_NO, raw.formulariosPrevios);
  if (!formulariosPrevios) errores.formulariosPrevios = "Elige una opción.";
  const agenteAlDia = opcion(CIERRE_SI_NO, raw.agenteAlDia);
  if (!agenteAlDia) errores.agenteAlDia = "Elige una opción.";

  const cuentas = limpio("cuentas");
  if (!cuentas || cuentas.length > 500) errores.cuentas = "Dinos qué cuentas tiene abiertas la LLC.";

  const cuando = opcion(CIERRE_CUANDO, raw.cuando);
  const cuandoOtra = limpio("cuandoOtra");
  if (!cuando) errores.cuando = "Elige cuándo quieres cerrarla.";
  else if (cuando === "otra" && (!cuandoOtra || cuandoOtra.length > 120)) errores.cuandoOtra = "Indica la fecha.";

  const notas = texto(raw.notas);
  if (notas.length > 4000) errores.notas = "El texto es demasiado largo.";

  if (raw.datosCorrectos !== true) errores.datosCorrectos = "Debes confirmar que los datos son correctos y completos.";
  if (raw.aceptaPrecio !== true) errores.aceptaPrecio = "Debes confirmar que entiendes el precio.";
  if (raw.consentimiento !== true) errores.consentimiento = "Necesitamos tu consentimiento.";
  if (Object.keys(errores).length) return { errores };

  const estadoOk = estado as keyof typeof CIERRE_ESTADOS;
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
        formulariosPrevios: CIERRE_SI_NO[formulariosPrevios as keyof typeof CIERRE_SI_NO],
        agenteAlDia: CIERRE_SI_NO[agenteAlDia as keyof typeof CIERRE_SI_NO],
        cuentas,
        cuando: cuandoOk === "otra" ? `${CIERRE_CUANDO.otra}: ${cuandoOtra}` : CIERRE_CUANDO[cuandoOk],
        datosCorrectos: true,
        aceptaPrecio: true,
      },
    },
  };
}
