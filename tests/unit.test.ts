import { describe, expect, test } from "vitest";
import { aCsv } from "@/lib/csv";
import { inicioDiaMadrid, inicioSemanaMadrid } from "@/lib/fechas";
import { hashIp } from "@/lib/ip";
import { cabeceraCookie, firmarSesion, verificarToken } from "@/lib/sesion";
import { cabecerasSeguridad, valorCsp } from "@/lib/seguridad";
import { esLocal, quitarSslMode } from "@/lib/db";
import { enlaceWhatsapp } from "@/lib/telefono";
import { esHoneypot, validarContacto, validarEmpezar } from "@/lib/validacion";

process.env.NEC_IP_SALT = "sal-de-prueba-nec";
process.env.NEC_SESSION_SECRET = "secreto-de-sesion-de-prueba-32chars";

describe("conexión", () => {
  test("quita sslmode sin tocar el resto de la URL", () => {
    const url = "postgres://nec:p%40ss@pooler.example:6543/postgres?sslmode=require&application_name=nec";
    expect(quitarSslMode(url)).toBe(
      "postgres://nec:p%40ss@pooler.example:6543/postgres?application_name=nec",
    );
    expect(quitarSslMode("postgres://nec@127.0.0.1:5432/nec?sslmode=require")).toBe(
      "postgres://nec@127.0.0.1:5432/nec",
    );
    expect(esLocal("postgres://nec@127.0.0.1:5432/nec")).toBe(true);
    expect(esLocal("postgres://nec:p%40ss@pooler.example:6543/postgres")).toBe(false);
  });
});

describe("fechas de Madrid", () => {
  test("el 23 de noviembre de 2026 es lunes y el día empieza a las 23:00 UTC", () => {
    const instante = new Date("2026-11-23T09:00:00.000Z");
    expect(inicioDiaMadrid(instante).toISOString()).toBe("2026-11-22T23:00:00.000Z");
    expect(inicioSemanaMadrid(instante).toISOString()).toBe("2026-11-22T23:00:00.000Z");
  });
});

describe("utilidades", () => {
  test("el hash de la IP no es la IP", () => {
    const hash = hashIp("203.0.113.8");
    expect(hash).toHaveLength(64);
    expect(hash).not.toContain("203.0.113.8");
    expect(hashIp("203.0.113.8")).toBe(hash);
    expect(hashIp("203.0.113.9")).not.toBe(hash);
  });

  test("whatsapp añade el prefijo de España a un móvil de 9 cifras", () => {
    expect(enlaceWhatsapp("659 308 119")).toBe("https://wa.me/34659308119");
    expect(enlaceWhatsapp("+1 (505) 295-4040")).toBe("https://wa.me/15052954040");
    expect(enlaceWhatsapp("123")).toBeNull();
  });

  test("el csv neutraliza fórmulas", () => {
    const csv = aCsv(["nombre"], [["=cmd", 'dice "hola"']]);
    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain("'=cmd");
    expect(csv).toContain('"dice ""hola"""');
  });

  test("la cookie de sesión es httpOnly y strict", async () => {
    const sesion = await firmarSesion("nec");
    const cabecera = cabeceraCookie(sesion.token, true);
    expect(cabecera).toContain("HttpOnly");
    expect(cabecera).toContain("SameSite=Strict");
    expect(cabecera).toContain("Secure");
    expect(cabecera).toContain("Max-Age=28800");
    expect(await verificarToken(sesion.token)).toEqual({ usuario: "nec", csrf: sesion.csrf });
    expect(await verificarToken("no-es-un-token")).toBeNull();
  });

  test("las cabeceras del panel impiden iframes", () => {
    const csp = valorCsp();
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    const fuentes = cabecerasSeguridad().map((regla) => regla.source);
    expect(fuentes).toEqual(expect.arrayContaining(["/panel", "/api/:path*"]));
    const nosniff = cabecerasSeguridad()[0].headers.find((h) => h.key === "X-Content-Type-Options");
    expect(nosniff?.value).toBe("nosniff");
  });
});

describe("validación", () => {
  test("el contacto exige consentimiento y email", () => {
    const malo = validarContacto({ nombre: "Ana", email: "no", servicio: "arranque", mensaje: "Hola", consentimiento: false });
    expect("errores" in malo).toBe(true);
    const bueno = validarContacto({
      nombre: " Ana ",
      email: "Ana@Example.com",
      servicio: "arranque",
      mensaje: "Quiero una LLC",
      consentimiento: true,
      pagina: "/contacto?servicio=arranque",
      utm: { utm_source: "boletin", ruido: "no" },
    });
    expect(bueno).toMatchObject({
      datos: { email: "ana@example.com", origen: "contacto", pagina: "/contacto?servicio=arranque" },
    });
    if ("datos" in bueno) expect(bueno.datos.utm).toEqual({ utm_source: "boletin" });
  });

  test("el asistente guarda las respuestas y rechaza un estado inventado", () => {
    const malo = validarEmpezar({
      punto: "crear",
      tipo: "llc-1",
      estado: "Marte",
      nombreLLC: "Sombrilla",
      nombre: "Ana",
      email: "ana@example.com",
      consentimiento: true,
    });
    expect("errores" in malo).toBe(true);
    const bueno = validarEmpezar({
      punto: "anual",
      tipo: "llc-2",
      estado: "Wyoming",
      nombreLLC: "Sombrilla",
      nombre: "Ana",
      email: "ana@example.com",
      consentimiento: true,
    });
    expect(bueno).toMatchObject({
      datos: { origen: "empezar", servicio: "en-regla", datos: { estado: "Wyoming", tipo: "llc-2" } },
    });
  });

  test("el señuelo solo salta si viene relleno", () => {
    expect(esHoneypot({ nec_hp: "" })).toBe(false);
    expect(esHoneypot({ nec_hp: "http://spam.test" })).toBe(true);
  });
});
