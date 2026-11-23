import { cookies } from "next/headers";
import { COOKIE_SESION, verificarToken, type Sesion } from "@/lib/sesion";

export async function sesionActual(): Promise<Sesion | null> {
  const jar = await cookies();
  return verificarToken(jar.get(COOKIE_SESION)?.value);
}
