import { z } from "zod";
import { estados } from "@/lib/site";
import {
  ETIQUETA_PUNTO,
  ETIQUETA_TIPO,
  SERVICIO_POR_PUNTO,
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

const PUNTOS = ["crear", "anual", "cerrar"] as const;
const TIPOS = ["llc-1", "llc-2"] as const;
type Punto = (typeof PUNTOS)[number];
type Tipo = (typeof TIPOS)[number];

export function validarEmpezar(body: unknown): { errores: Record<string, string> } | { datos: DatosLead } {
  const parsed = cuerpo.safeParse(body);
  if (!parsed.success) return { errores: { formulario: "Revisa los datos e inténtalo de nuevo." } };
  const raw = parsed.data;
  const errores: Record<string, string> = {};
  const punto = texto(raw.punto);
  const tipo = texto(raw.tipo);
  const estado = texto(raw.estado);
  const otro = texto(raw.otroEstado);
  const sinNombre = raw.sinNombre === true;
  const nombreLlc = texto(raw.nombreLLC);
  const nombre = texto(raw.nombre);
  const email = texto(raw.email).toLowerCase();

  if (!PUNTOS.includes(punto as Punto)) errores.punto = "Elige por dónde empezamos.";
  if (!TIPOS.includes(tipo as Tipo)) errores.tipo = "Elige el tipo de LLC.";

  let estadoVisible = "";
  if (!estado) {
    errores.estado = "Elige un estado (o dinos que aún no lo sabes).";
  } else if (estado === "otro") {
    if (!otro || !estados.includes(otro)) errores.otroEstado = "Elige el estado de la lista.";
    else estadoVisible = otro;
  } else if (estado === "no-se") {
    if (punto !== "crear") errores.estado = "Elige el estado en el que está registrada.";
    else estadoVisible = "Aún por decidir";
  } else if (!estados.includes(estado)) {
    errores.estado = "Elige un estado de la lista.";
  } else {
    estadoVisible = estado;
  }

  const necesitaNombre = punto !== "crear" || !sinNombre;
  if (necesitaNombre && (!nombreLlc || nombreLlc.length > 120)) {
    errores.nombreLLC =
      punto === "crear" ? "Escribe un nombre o marca que aún no lo tienes." : "Escribe el nombre de tu LLC.";
  } else if (nombreLlc.length > 120) {
    errores.nombreLLC = "El nombre es demasiado largo.";
  }

  if (!nombre || nombre.length > 120) errores.nombre = "Dinos cómo te llamas.";
  if (!email || email.length > 200 || !emailValido(email)) {
    errores.email = "Escribe un email válido.";
  }
  if (raw.consentimiento !== true) errores.consentimiento = "Necesitamos tu consentimiento.";
  const telefono = telefonoDe(raw.telefono, errores);
  if (Object.keys(errores).length) return { errores };

  const puntoOk = punto as Punto;
  const tipoOk = tipo as Tipo;
  return {
    datos: {
      origen: "empezar",
      servicio: SERVICIO_POR_PUNTO[puntoOk],
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
        nombreLlc: necesitaNombre ? nombreLlc : null,
        sinNombre: puntoOk === "crear" && sinNombre,
      },
    },
  };
}
