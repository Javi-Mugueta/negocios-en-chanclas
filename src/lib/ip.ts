import { createHmac } from "node:crypto";

export function ipDeLaPeticion(request: Request): string {
  const real = request.headers.get("x-real-ip")?.trim();
  if (real) return real.slice(0, 80);
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const primera = forwarded.split(",")[0]?.trim();
    if (primera) return primera.slice(0, 80);
  }
  return "desconocida";
}

export function hashIp(ip: string, salt = process.env.NEC_IP_SALT): string {
  if (!salt) throw new Error("NEC_IP_SALT no está configurada");
  return createHmac("sha256", salt).update(ip).digest("hex");
}

export function agente(request: Request): string | null {
  const ua = request.headers.get("user-agent")?.trim();
  if (!ua) return null;
  return ua.slice(0, 400);
}
