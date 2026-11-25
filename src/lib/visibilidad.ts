import { connection } from "next/server";

/**
 * /formularios-llc se pone a la vista el 1 de enero de 2027 a las 00:00 (hora de Madrid,
 * CET = UTC+1). Se evalúa en cada petición, así que aparece sola, sin volver a desplegar.
 * Para verla antes (vista previa), define NEC_FORMULARIOS_PREVIEW=1.
 */
export const APERTURA_FORMULARIOS = new Date("2026-12-31T23:00:00.000Z");

export function formulariosAbiertos(ahora: Date = new Date()): boolean {
  if (process.env.NEC_FORMULARIOS_PREVIEW === "1") return true;
  return ahora.getTime() >= APERTURA_FORMULARIOS.getTime();
}

/** Igual que `formulariosAbiertos`, pero obliga a renderizar en cada petición (no en el build). */
export async function formulariosVisibles(): Promise<boolean> {
  await connection();
  return formulariosAbiertos();
}
