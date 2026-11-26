import { describe, expect, test } from "vitest";
import { aCsv } from "@/lib/csv";
import { inicioDiaMadrid, inicioSemanaMadrid } from "@/lib/fechas";
import { hashIp } from "@/lib/ip";
import { cabeceraCookie, firmarSesion, verificarToken } from "@/lib/sesion";
import { cabecerasSeguridad, valorCsp } from "@/lib/seguridad";
import { esLocal, quitarSslMode } from "@/lib/db";
import { enlaceWhatsapp } from "@/lib/telefono";
import { esHoneypot, validarContacto, validarEmpezar } from "@/lib/validacion";
import { casoAsistente } from "@/lib/asistente";
import {
  erroresPasoAlta,
  MAX_OPCIONES_NOMBRE,
  pasosDe,
  PASOS_ALTA,
  telefonoConPrefijo,
  validarAlta,
  type BorradorAlta,
} from "@/lib/alta";
import { avisoEmailPago, avisosContacto, enlaceStripe, estadosConstitucion, navegacion, planes } from "@/lib/site";
import { formulariosAbiertos, leerLanzamiento } from "@/lib/visibilidad";

process.env.NEC_IP_SALT = "sal-de-prueba-nec";
process.env.NEC_SESSION_SECRET = "secreto-de-sesion-de-prueba-32chars";

const ALTA_OK = {
  opcionesNombre: ["Sombrilla Studio LLC", "Sombrilla LLC", "Sunshade Studio LLC"],
  direccion: "Calle Mayor 1, 2º B, 28013 Madrid, Madrid, España",
  actividad: "Consultoría de marketing digital para pequeñas empresas de Europa.",
  paisResidencia: "España",
  facturacion: "25k-50k",
  aceptaTerminos: true,
};

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
      requisitos: "si",
      estado: "Wyoming",
      nombreLLC: "Sombrilla",
      nombre: "Ana",
      email: "ana@example.com",
      consentimiento: true,
    });
    expect(bueno).toMatchObject({
      datos: {
        origen: "empezar",
        servicio: "en-regla",
        datos: { estado: "Wyoming", tipo: "llc-2", caso: "contacto" },
      },
    });
    const sinRequisitos = validarEmpezar({
      punto: "anual",
      tipo: "llc-1",
      estado: "Wyoming",
      nombreLLC: "Sombrilla",
      nombre: "Ana",
      email: "ana@example.com",
      consentimiento: true,
    });
    expect(sinRequisitos).toMatchObject({ errores: { requisitos: expect.any(String) } });
  });

  test("el asistente manda a encargo lo que no cubren los planes", () => {
    const base = {
      punto: "crear",
      nombre: "Ana García",
      email: "ana@example.com",
      telefono: "+34 600 000 000",
      consentimiento: true,
      alta: ALTA_OK,
    };
    const casos: [Record<string, unknown>, string][] = [
      [{ tipo: "llc-1", estado: "New Mexico", plan: "basico" }, "arranque"],
      [{ tipo: "llc-1", estado: "no-se" }, "arranque"],
      [{ tipo: "llc-1", estado: "Wyoming", plan: "basico" }, "encargo"],
      [{ tipo: "llc-2", estado: "New Mexico" }, "encargo"],
      [{ tipo: "corp", estado: "Delaware" }, "encargo"],
    ];
    for (const [extra, servicio] of casos) {
      const res = validarEmpezar({ ...base, ...extra });
      expect(res).toMatchObject({ datos: { servicio } });
      if ("datos" in res && servicio === "encargo") expect(res.datos.datos.plan).toBeUndefined();
    }
    expect("errores" in validarEmpezar({ ...base, punto: "anual", tipo: "corp", estado: "Wyoming", nombreLLC: "X", requisitos: "si" })).toBe(true);
  });

  test("casoAsistente decide el resultado", () => {
    expect(casoAsistente({ punto: "anual", tipo: "llc-1", estado: "Texas", requisitos: "si" })).toBe("formularios");
    expect(casoAsistente({ punto: "anual", tipo: "llc-1", estado: "Texas", requisitos: "no" })).toBe("contacto");
    expect(casoAsistente({ punto: "anual", tipo: "llc-2", estado: "Texas", requisitos: "si" })).toBe("contacto");
    expect(casoAsistente({ punto: "cerrar", tipo: null, estado: null, requisitos: null })).toBe("cierre");
  });

  test("el señuelo solo salta si viene relleno", () => {
    expect(esHoneypot({ nec_hp: "" })).toBe(false);
    expect(esHoneypot({ nec_hp: "http://spam.test" })).toBe(true);
  });
});

describe("visibilidad de Formularios LLC", () => {
  test("sin NEC_FORMULARIOS_LAUNCH está siempre a la vista", () => {
    delete process.env.NEC_FORMULARIOS_LAUNCH;
    expect(formulariosAbiertos(new Date("2026-11-25T10:00:00.000Z"))).toBe(true);
    process.env.NEC_FORMULARIOS_LAUNCH = "  ";
    expect(formulariosAbiertos(new Date("2026-11-25T10:00:00.000Z"))).toBe(true);
    delete process.env.NEC_FORMULARIOS_LAUNCH;
  });

  test("con NEC_FORMULARIOS_LAUNCH se abre a esa hora de Madrid", () => {
    process.env.NEC_FORMULARIOS_LAUNCH = "2027-01-01T00:00";
    expect(formulariosAbiertos(new Date("2026-12-31T22:59:59.999Z"))).toBe(false);
    expect(formulariosAbiertos(new Date("2026-12-31T23:00:00.000Z"))).toBe(true);
    // Horario de verano (CEST = UTC+2).
    process.env.NEC_FORMULARIOS_LAUNCH = "2027-07-01T09:30:00";
    expect(formulariosAbiertos(new Date("2027-07-01T07:29:59.999Z"))).toBe(false);
    expect(formulariosAbiertos(new Date("2027-07-01T07:30:00.000Z"))).toBe(true);
    // Con zona explícita se respeta.
    process.env.NEC_FORMULARIOS_LAUNCH = "2027-01-01T00:00:00Z";
    expect(formulariosAbiertos(new Date("2026-12-31T23:30:00.000Z"))).toBe(false);
    expect(formulariosAbiertos(new Date("2027-01-01T00:00:00.000Z"))).toBe(true);
    delete process.env.NEC_FORMULARIOS_LAUNCH;
  });

  test("una fecha ilegible la mantiene oculta", () => {
    expect(leerLanzamiento("mañana")).toBeNull();
    expect(leerLanzamiento("2027-02-30T00:00")).toBeNull();
    process.env.NEC_FORMULARIOS_LAUNCH = "mañana";
    expect(formulariosAbiertos(new Date("2030-01-01T00:00:00.000Z"))).toBe(false);
    delete process.env.NEC_FORMULARIOS_LAUNCH;
  });

  test("el menú solo enseña Formularios LLC cuando está abierta", () => {
    expect(navegacion(false).map((i) => i.href)).not.toContain("/formularios-llc");
    expect(navegacion(true).map((i) => i.href)).toContain("/formularios-llc");
  });
});

describe("contenido", () => {
  test("50 estados + D.C., con New Mexico, Wyoming y Delaware arriba", () => {
    expect(estadosConstitucion).toHaveLength(51);
    expect(new Set(estadosConstitucion).size).toBe(51);
    expect(estadosConstitucion.slice(0, 3)).toEqual(["New Mexico", "Wyoming", "Delaware"]);
  });

  test("los planes Básico y Estándar pasan por el asistente, pagan al final en Stripe e incluyen el Operating Agreement", () => {
    for (const id of ["basico", "estandar"]) {
      const plan = planes.find((p) => p.id === id)!;
      expect(plan.href).toBe(`/empezar?plan=${id}`);
      expect(plan.pago).toMatch(/^https:\/\/buy\.stripe\.com\//);
      expect(plan.incluye).toContain("Operating Agreement (modelo estándar)");
      expect(plan.aviso).toBe("*Renovación anual: 197 $/año a partir del segundo año.");
    }
    expect(planes.find((p) => p.id === "encargo")!.href).toBe("/contacto?servicio=encargo");
  });

  test("todo enlace de Stripe lleva client_reference_id y prefilled_email codificado", () => {
    const base = "https://buy.stripe.com/abc";
    const id = "00000000-0000-4000-8000-000000000001";
    const url = new URL(enlaceStripe(base, { id, email: " ana+llc@example.com " }));
    expect(url.origin + url.pathname).toBe(base);
    expect(url.searchParams.get("client_reference_id")).toBe(id);
    expect(url.searchParams.get("prefilled_email")).toBe("ana+llc@example.com");
    expect(enlaceStripe(base, { id, email: "ana+llc@example.com" })).toContain("prefilled_email=ana%2Bllc%40example.com");
    expect(enlaceStripe(base, { id: null, email: "" })).toBe(base);
    expect(avisoEmailPago("ana@example.com")).toBe(
      "Usa en Stripe el mismo email que nos has dado (ana@example.com). Así unimos tu pago con tus datos.",
    );
  });

  test("contacto muestra aviso para C-Corp y encargo personalizado", () => {
    expect(avisosContacto.corporacion?.titulo).toBe("Una C-Corp es una estructura compleja.");
    expect(avisosContacto.encargo?.titulo).toBe("Tu caso necesita un análisis personalizado.");
    expect(avisosContacto["en-regla"]).toBeUndefined();
  });
});

describe("datos de alta del asistente", () => {
  const borrador: BorradorAlta = {
    nombre: "Ana García",
    email: "ana@example.com",
    opcionesNombre: [...ALTA_OK.opcionesNombre],
    telefono: "+34 600 000 000",
    direccion: ALTA_OK.direccion,
    actividad: ALTA_OK.actividad,
    paisResidencia: "España",
    facturacion: "25k-50k",
    aceptaTerminos: true,
    consentimiento: true,
  };

  test("crear añade los 9 pasos de alta después de punto, tipo y estado (sin pasaporte); el resto no cambia", () => {
    const crear = pasosDe("crear").map((p) => p.id);
    expect(crear.slice(0, 3)).toEqual(["punto", "tipo", "estado"]);
    expect(crear.slice(3)).toEqual(PASOS_ALTA.map((p) => p.id));
    expect(crear).toHaveLength(12);
    expect(crear).not.toContain("pasaporte");
    expect(crear.filter((id) => id === "email")).toHaveLength(1);
    expect(pasosDe("anual").map((p) => p.id)).toEqual(["punto", "tipo", "estado", "nombre", "contacto"]);
    expect(pasosDe(null)).toHaveLength(5);
  });

  test("cada paso del alta solo es válido con sus datos (Continuar deshabilitado si no)", () => {
    for (const { id } of PASOS_ALTA) expect(erroresPasoAlta(id, borrador)).toEqual({});
    const vacio: BorradorAlta = {
      nombre: "",
      email: "",
      opcionesNombre: ["", "", ""],
      telefono: "",
      direccion: "",
      actividad: "",
      paisResidencia: "",
      facturacion: null,
      aceptaTerminos: false,
      consentimiento: false,
    };
    const conError = PASOS_ALTA.filter(({ id }) => Object.keys(erroresPasoAlta(id, vacio)).length > 0).map((p) => p.id);
    expect(conError).toEqual(PASOS_ALTA.map((p) => p.id));
    expect(erroresPasoAlta("aceptacion", { ...borrador, consentimiento: false })).toHaveProperty("consentimiento");
    expect(erroresPasoAlta("aceptacion", { ...borrador, aceptaTerminos: false })).toHaveProperty("aceptaTerminos");
  });

  test("opciones de nombre: 3 obligatorias, hasta 6, sin repetir", () => {
    const con = (opcionesNombre: string[]) => erroresPasoAlta("opciones", { ...borrador, opcionesNombre });
    expect(con(["A LLC", "B LLC", ""])).toHaveProperty("opcionesNombre");
    expect(con(["A LLC", "B LLC", "C LLC", ""])).toEqual({});
    expect(con(["A LLC", "B LLC", "C LLC", "D LLC", "E LLC", "F LLC"])).toEqual({});
    expect(con(["A LLC", "B LLC", "C LLC", "D LLC", "E LLC", "F LLC", "G LLC"])).toHaveProperty("opcionesNombre");
    expect(con(["A LLC", "a llc", "C LLC"])).toHaveProperty("opcionesNombre");
    expect(MAX_OPCIONES_NOMBRE).toBe(6);
  });

  test("teléfono con prefijo y actividad de al menos 30 caracteres", () => {
    expect(telefonoConPrefijo("+34 600 000 000")).toBe(true);
    expect(telefonoConPrefijo("+52 (55) 1234-5678")).toBe(true);
    expect(telefonoConPrefijo("600 000 000")).toBe(false);
    expect(telefonoConPrefijo("+34 6")).toBe(false);
    expect(erroresPasoAlta("actividad", { ...borrador, actividad: "Venta online" })).toHaveProperty("actividad");
    expect(erroresPasoAlta("actividad", { ...borrador, actividad: "x".repeat(30) })).toEqual({});
  });

  test("el servidor valida el bloque de alta con zod", () => {
    expect(validarAlta(ALTA_OK)).toMatchObject({ alta: { facturacion: "25k-50k", aceptaTerminos: true } });
    const malo = validarAlta({ ...ALTA_OK, facturacion: "mucho", aceptaTerminos: false, actividad: "corta" });
    expect(malo).toMatchObject({
      errores: { facturacion: expect.any(String), aceptaTerminos: expect.any(String), actividad: expect.any(String) },
    });
    expect(validarAlta(undefined)).toHaveProperty("errores.opcionesNombre");
    expect(validarAlta({ ...ALTA_OK, opcionesNombre: "Sombrilla LLC" })).toHaveProperty("errores.opcionesNombre");
  });

  test("crear exige los datos de alta y los guarda en el lead", () => {
    const base = {
      punto: "crear",
      tipo: "llc-1",
      estado: "New Mexico",
      nombre: "Ana García",
      email: "Ana@Example.com",
      telefono: "+34 600 000 000",
      consentimiento: true,
      plan: "basico",
    };
    const sinAlta = validarEmpezar(base);
    expect(sinAlta).toMatchObject({ errores: { opcionesNombre: expect.any(String) } });
    const sinTelefono = validarEmpezar({ ...base, telefono: "", alta: ALTA_OK });
    expect(sinTelefono).toMatchObject({ errores: { telefono: expect.any(String) } });

    const bueno = validarEmpezar({ ...base, alta: { ...ALTA_OK, opcionesNombre: [...ALTA_OK.opcionesNombre, "  "] } });
    expect(bueno).toMatchObject({
      datos: {
        servicio: "arranque",
        nombre: "Ana García",
        email: "ana@example.com",
        telefono: "+34 600 000 000",
        datos: {
          caso: "plan",
          plan: "basico",
          nombreLlc: "Sombrilla Studio LLC",
          altaCompleta: true,
          alta: {
            opcionesNombre: ALTA_OK.opcionesNombre,
            facturacion: "25k-50k",
            facturacionEtiqueta: "Entre 25.000 $ y 50.000 $",
            aceptaTerminos: true,
          },
        },
      },
    });
    // En la apertura no se pide pasaporte.
    if ("datos" in bueno) expect(bueno.datos.datos.alta).not.toHaveProperty("pasaporte");
  });

  test("«ya tengo LLC» sigue igual: sin alta y con teléfono opcional", () => {
    const res = validarEmpezar({
      punto: "anual",
      tipo: "llc-1",
      requisitos: "si",
      estado: "Wyoming",
      nombreLLC: "Sombrilla LLC",
      nombre: "Ana",
      email: "ana@example.com",
      consentimiento: true,
    });
    expect(res).toMatchObject({ datos: { servicio: "en-regla", telefono: null } });
    if ("datos" in res) {
      expect(res.datos.datos.alta).toBeUndefined();
      expect(res.datos.datos.altaCompleta).toBeUndefined();
    }
  });
});
