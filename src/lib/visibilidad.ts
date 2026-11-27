import { connection } from "next/server";
import { formularios1065, formulariosLlc } from "@/lib/site";

/**
 * /formularios-llc está a la vista por defecto.
 *
 * Si se define NEC_FORMULARIOS_LAUNCH con una fecha ISO (p. ej. `2027-01-01T00:00`), queda
 * oculta hasta ese momento. Sin zona horaria, la hora se entiende en Europe/Madrid; con `Z`
 * o un desfase (`+01:00`), se respeta tal cual. Se evalúa en cada petición, así que aparece
 * sola, sin volver a desplegar. Un valor que no se pueda leer la mantiene oculta.
 */
const ZONA = "Europe/Madrid";
const CON_ZONA = /(Z|[+-]\d{2}:?\d{2})$/i;
const LOCAL = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?)?$/;

/** Minutos que Madrid va por delante de UTC en el instante dado. */
function desfaseMadrid(instante: number): number {
  const partes = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: ZONA,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
      .formatToParts(new Date(instante))
      .map((p) => [p.type, p.value]),
  );
  const comoUtc = Date.UTC(
    Number(partes.year),
    Number(partes.month) - 1,
    Number(partes.day),
    Number(partes.hour),
    Number(partes.minute),
    Number(partes.second),
  );
  return Math.round((comoUtc - Math.floor(instante / 1000) * 1000) / 60000);
}

/** Convierte el valor de NEC_FORMULARIOS_LAUNCH en un instante. `null` si no se puede leer. */
export function leerLanzamiento(valor: string): Date | null {
  const texto = valor.trim();
  if (CON_ZONA.test(texto)) {
    const fecha = new Date(texto);
    return Number.isNaN(fecha.getTime()) ? null : fecha;
  }
  const m = LOCAL.exec(texto);
  if (!m) return null;
  const [, a, mes, d, h = "0", min = "0", s = "0", ms = "0"] = m;
  const pared = Date.UTC(+a, +mes - 1, +d, +h, +min, +s, +ms.padEnd(3, "0"));
  const comprobada = new Date(pared);
  if (comprobada.getUTCMonth() !== +mes - 1 || comprobada.getUTCDate() !== +d) return null;
  // Dos pasadas para acertar también en los días de cambio de hora.
  let instante = pared - desfaseMadrid(pared) * 60000;
  instante = pared - desfaseMadrid(instante) * 60000;
  return new Date(instante);
}

export function formulariosAbiertos(ahora: Date = new Date()): boolean {
  const valor = process.env.NEC_FORMULARIOS_LAUNCH?.trim();
  if (!valor) return true;
  const lanzamiento = leerLanzamiento(valor);
  if (!lanzamiento) return false;
  return ahora.getTime() >= lanzamiento.getTime();
}

/**
 * Form 1065 + K-1: se admiten datos hasta la fecha límite (1 de marzo, hora de Madrid), sin prórroga.
 * Desde ese momento la opción «Tiene varios socios» muestra el aviso de plazo cerrado.
 */
export function plazo1065Abierto(ahora: Date = new Date(), limite: string = formularios1065.fechaLimite): boolean {
  const fin = leerLanzamiento(limite);
  return !!fin && ahora.getTime() < fin.getTime();
}

/**
 * Formularios 1120/5472 (un socio): se admiten datos hasta la fecha límite (1 de abril, hora de Madrid).
 * Desde ese momento la opción «Mi LLC tiene un socio» muestra el aviso de plazo cerrado.
 */
export function plazo1120Abierto(ahora: Date = new Date(), limite: string = formulariosLlc.fechaLimite): boolean {
  const fin = leerLanzamiento(limite);
  return !!fin && ahora.getTime() < fin.getTime();
}

/** Igual que `formulariosAbiertos`, pero obliga a renderizar en cada petición (no en el build). */
export async function formulariosVisibles(): Promise<boolean> {
  await connection();
  return formulariosAbiertos();
}
