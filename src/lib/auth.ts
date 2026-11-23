import bcrypt from "bcryptjs";
import { timingSafeEqual } from "node:crypto";
import type { BaseDatos } from "@/lib/db";

const VENTANA_MS = 15 * 60 * 1000;
const MAX_FALLOS = 5;
const DUMMY_HASH = "$2b$12$HwM.Yu6F.jL1USbmX/.VfeSML6FqEoOGQuKGKPnIMfwtquwIPTB4u";

export type ResultadoAcceso = "ok" | "fallo" | "bloqueado";

export class AuthConfigError extends Error {
  constructor() {
    super("Falta la configuración de acceso al panel");
    this.name = "AuthConfigError";
  }
}

function iguales(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) {
    timingSafeEqual(ba, ba);
    return false;
  }
  return timingSafeEqual(ba, bb);
}

async function registrar(
  db: BaseDatos,
  usuario: string,
  resultado: ResultadoAcceso,
  ipHash: string,
  userAgent: string | null,
) {
  await db.query(
    `insert into nec.accesos_panel (created_at, usuario, resultado, ip_hash, user_agent)
     values (now(), $1, $2, $3, $4)`,
    [usuario.slice(0, 80), resultado, ipHash, userAgent],
  );
}

export async function intentarAcceso(
  db: BaseDatos,
  usuarioBruto: string,
  clave: string,
  ipHash: string,
  userAgent: string | null,
): Promise<{ ok: true; usuario: string } | { ok: false; bloqueado: boolean }> {
  const usuario = usuarioBruto.trim().slice(0, 80);
  const esperado = process.env.NEC_ADMIN_USER ?? "";
  const hash = (process.env.NEC_ADMIN_PASSWORD_HASH ?? "").trim();
  if (!esperado || !hash) throw new AuthConfigError();

  const desde = new Date(Date.now() - VENTANA_MS).toISOString();
  const conteo = await db.query<{ n: number | string }>(
    `select count(*) as n
     from nec.accesos_panel
     where resultado = 'fallo'
       and created_at > $1
       and (ip_hash = $2 or lower(usuario) = lower($3))`,
    [desde, ipHash, usuario],
  );
  if (Number(conteo[0]?.n ?? 0) >= MAX_FALLOS) {
    await registrar(db, usuario || "—", "bloqueado", ipHash, userAgent);
    return { ok: false, bloqueado: true };
  }

  const usuarioOk = iguales(usuario, esperado);
  let claveOk = false;
  try {
    claveOk = await bcrypt.compare(clave.slice(0, 200), usuarioOk ? hash : DUMMY_HASH);
  } catch {
    claveOk = false;
  }
  if (!usuarioOk || !claveOk || clave.length === 0 || clave.length > 200) {
    await registrar(db, usuario || "—", "fallo", ipHash, userAgent);
    return { ok: false, bloqueado: false };
  }

  await registrar(db, esperado, "ok", ipHash, userAgent);
  return { ok: true, usuario: esperado };
}
