import { timingSafeEqual } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";

export const COOKIE_SESION = "nec_sesion";
const MAX_EDAD = 8 * 60 * 60;

export type Sesion = { usuario: string; csrf: string };

function clave(): Uint8Array | null {
  const secret = process.env.NEC_SESSION_SECRET ?? "";
  if (secret.length < 32) return null;
  return new TextEncoder().encode(secret);
}

export async function firmarSesion(usuario: string): Promise<Sesion & { token: string }> {
  const key = clave();
  if (!key) throw new Error("NEC_SESSION_SECRET debe tener al menos 32 caracteres");
  const csrf = crypto.randomUUID().replaceAll("-", "") + crypto.randomUUID().replaceAll("-", "");
  const token = await new SignJWT({ csrf })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(usuario)
    .setIssuedAt()
    .setExpirationTime("8h")
    .setIssuer("nec")
    .setAudience("panel")
    .sign(key);
  return { usuario, csrf, token };
}

export async function verificarToken(token: string | null | undefined): Promise<Sesion | null> {
  if (!token) return null;
  const key = clave();
  if (!key) return null;
  try {
    const { payload } = await jwtVerify(token, key, { issuer: "nec", audience: "panel" });
    if (typeof payload.sub !== "string" || payload.sub.length === 0) return null;
    if (typeof payload.csrf !== "string" || payload.csrf.length < 16) return null;
    return { usuario: payload.sub, csrf: payload.csrf };
  } catch {
    return null;
  }
}

export function cabeceraCookie(token: string, seguro = process.env.NODE_ENV === "production"): string {
  const secure = seguro ? "; Secure" : "";
  return `${COOKIE_SESION}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${MAX_EDAD}${secure}`;
}

export function cabeceraCerrarSesion(seguro = process.env.NODE_ENV === "production"): string {
  const secure = seguro ? "; Secure" : "";
  return `${COOKIE_SESION}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${secure}`;
}

export function leerCookie(header: string | null, nombre: string): string | null {
  if (!header) return null;
  for (const parte of header.split(";")) {
    const [claveCookie, ...resto] = parte.trim().split("=");
    if (claveCookie === nombre) return resto.join("=") || null;
  }
  return null;
}

export async function sesionDeLaPeticion(request: Request): Promise<Sesion | null> {
  return verificarToken(leerCookie(request.headers.get("cookie"), COOKIE_SESION));
}

export function csrfValido(request: Request, csrf: string): boolean {
  const enviado = request.headers.get("x-nec-csrf") ?? "";
  const a = Buffer.from(enviado);
  const b = Buffer.from(csrf);
  if (a.length === 0 || a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function origenPermitido(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function json(data: unknown, status = 200, extra?: HeadersInit): Response {
  const headers = new Headers(extra);
  if (!headers.has("Cache-Control")) headers.set("Cache-Control", "no-store");
  return Response.json(data, { status, headers });
}

export async function exigirSesion(
  request: Request,
): Promise<{ ok: true; sesion: Sesion } | { ok: false; response: Response }> {
  const sesion = await sesionDeLaPeticion(request);
  if (!sesion) return { ok: false, response: json({ ok: false, error: "No autorizado." }, 401) };
  return { ok: true, sesion };
}

export function exigirCsrf(request: Request, sesion: Sesion): Response | null {
  if (!origenPermitido(request)) return json({ ok: false, error: "Origen no permitido." }, 403);
  if (!csrfValido(request, sesion.csrf)) {
    return json({ ok: false, error: "La sesión no coincide. Recarga la página." }, 403);
  }
  return null;
}
