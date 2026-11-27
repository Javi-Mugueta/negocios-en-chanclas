/** Versión de la política de privacidad publicada en /legal#privacidad. Queda asociada a cada envío. */
export const CONSENTIMIENTO_VERSION = "2026-11-27";

/**
 * Versión de los Términos y Condiciones y de la Política de devoluciones (/legal#terminos y
 * /legal#devoluciones). Es la fecha de publicación y queda guardada con cada contratación.
 */
export const TERMINOS_VERSION = "2026-11-27";

/** Enlaces de la casilla de aceptación (se abren en otra pestaña para no perder lo rellenado). */
export const ENLACE_TERMINOS = "/legal#terminos";
export const ENLACE_DEVOLUCIONES = "/legal#devoluciones";
export const ENLACE_PRIVACIDAD = "/legal#privacidad";

/** Mensaje si falta la casilla de Términos (cliente y servidor). */
export const ERROR_ACEPTA_TERMINOS = "Tienes que aceptar los Términos y Condiciones y la Política de devoluciones.";

export const SITIO_URL = "https://negociosenchanclas.com";

export const PAGINAS_PUBLICAS = [
  "/",
  "/empezar",
  "/como-funciona-una-llc",
  "/servicios",
  "/formularios-llc",
  "/cierra-tu-llc",
  "/contacto",
  "/terminos",
] as const;
