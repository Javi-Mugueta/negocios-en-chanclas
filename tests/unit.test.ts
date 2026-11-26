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
  erroresSocios,
  MAX_OPCIONES_NOMBRE,
  pasosDe,
  PASOS_ALTA,
  PASOS_ALTA_SOCIOS,
  porcentajeDe,
  socioVacio,
  telefonoConPrefijo,
  validarAlta,
  validarAltaSocios,
  type BorradorAlta,
} from "@/lib/alta";
import {
  dolares,
  enlacePago,
  ESTADOS_LLC,
  precio1065,
  precioApertura,
  precioAperturaVarios,
  precioCierre,
  precioRenovacion,
} from "@/lib/precios";
import { avisoEmailPago, avisosContacto, enlaceStripe, estadosConstitucion, navegacion, planes } from "@/lib/site";
import { formulariosAbiertos, leerLanzamiento } from "@/lib/visibilidad";

process.env.NEC_IP_SALT = "sal-de-prueba-nec";
process.env.NEC_SESSION_SECRET = "secreto-de-sesion-de-prueba-32chars";

export const SOCIOS_OK = [
  { nombre: "Ana Pérez", email: "ana@example.com", paisResidencia: "España", nacionalidad: "española", porcentaje: "50", tipo: "persona", residenteEeuu: "no" },
  { nombre: "Luis Gómez", email: "luis@example.com", paisResidencia: "México", nacionalidad: "mexicana", porcentaje: "30", tipo: "persona", residenteEeuu: "no" },
  { nombre: "Eva Ruiz", email: "eva@example.com", paisResidencia: "Chile", nacionalidad: "chilena", porcentaje: "20", tipo: "persona", residenteEeuu: "no" },
] as const;

const ALTA_SOCIOS_OK = {
  numSocios: 3,
  socios: SOCIOS_OK,
  interlocutor: 0,
  opcionesNombre: ["Tres Chanclas LLC", "Three Flip Flops LLC", "Chanclas Trio LLC"],
  gestion: "gestores",
  gestores: [0, 1],
  reparto: "porcentaje",
  pactoSalida: "no",
  direccion: "Calle Mayor 1, 2º B, 28013 Madrid, Madrid, España",
  actividad: "Agencia de desarrollo web con clientes en Europa y América.",
  facturacion: "50k-100k",
  aceptaTerminos: true,
  confirmaSocios: true,
};

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

  test("crear solo sigue online en los 7 estados, sin C-Corp y sin persona de EE. UU.", () => {
    const base = {
      punto: "crear",
      nombre: "Ana García",
      email: "ana@example.com",
      telefono: "+34 600 000 000",
      consentimiento: true,
      residenteEeuu: "no",
      alta: ALTA_OK,
    };
    for (const e of ESTADOS_LLC) {
      expect(validarEmpezar({ ...base, tipo: "llc-1", estado: e.clave, plan: "basico" })).toMatchObject({
        datos: { servicio: "arranque", datos: { caso: "plan", estado: e.nombre } },
      });
    }
    for (const extra of [
      { tipo: "llc-1", estado: "no-se" },
      { tipo: "llc-1", estado: "otro", otroEstado: "California" },
      { tipo: "llc-1", estado: "California" },
      { tipo: "corp", estado: "Delaware" },
      { tipo: "llc-1", estado: "Delaware", residenteEeuu: "si" },
      { tipo: "llc-1", estado: "Delaware", residenteEeuu: undefined },
    ]) {
      expect("errores" in validarEmpezar({ ...base, ...extra })).toBe(true);
    }
    expect("errores" in validarEmpezar({ ...base, punto: "anual", tipo: "corp", estado: "Wyoming", nombreLLC: "X", requisitos: "si" })).toBe(true);
  });

  test("el precio que se guarda es el del estado y dice si hay enlace de Stripe", () => {
    const base = {
      punto: "crear",
      tipo: "llc-1",
      nombre: "Ana García",
      email: "ana@example.com",
      telefono: "+34 600 000 000",
      consentimiento: true,
      residenteEeuu: "no",
      alta: ALTA_OK,
    };
    expect(validarEmpezar({ ...base, estado: "New Mexico", plan: "basico" })).toMatchObject({
      datos: { datos: { precioTotal: 397, pagoOnline: true } },
    });
    expect(validarEmpezar({ ...base, estado: "Texas", plan: "estandar" })).toMatchObject({
      datos: { datos: { precioTotal: 797, pagoOnline: false, precio: "Plan Estándar: 797 $ = 497 $ + 300 $ (tasa del estado de Texas)" } },
    });
    const sinPlan = validarEmpezar({ ...base, estado: "New Mexico" });
    if ("datos" in sinPlan) {
      expect(sinPlan.datos.datos.precioTotal).toBeUndefined();
      expect(sinPlan.datos.datos.precio).toBe("Plan Básico: 397 $ (tasa del estado incluida) · Plan Estándar: 497 $ (tasa del estado incluida)");
    }
  });

  test("varios socios: alta completa, persona de contacto en la raíz y precio por socios", () => {
    const res = validarEmpezar({ punto: "crear", tipo: "llc-2", estado: "Delaware", alta: ALTA_SOCIOS_OK, consentimiento: true });
    expect(res).toMatchObject({
      datos: {
        servicio: "arranque",
        nombre: "Ana Pérez",
        email: "ana@example.com",
        telefono: null,
        datos: {
          caso: "varios",
          estado: "Delaware",
          nombreLlc: "Tres Chanclas LLC",
          precioTotal: 736,
          pagoOnline: false,
          altaCompleta: true,
          alta: {
            numSocios: 3,
            gestores: ["Ana Pérez", "Luis Gómez"],
            pactoSalida: false,
            interlocutorNombre: "Ana Pérez",
            socios: [{ porcentaje: 50, tipo: "persona", tipoEtiqueta: "Persona" }, {}, {}],
          },
        },
      },
    });
    const desvios: Record<string, unknown>[] = [
      { numSocios: "mas-10" },
      { socios: [{ ...SOCIOS_OK[0], tipo: "empresa" }, SOCIOS_OK[1], SOCIOS_OK[2]] },
      { socios: [{ ...SOCIOS_OK[0], residenteEeuu: "si" }, SOCIOS_OK[1], SOCIOS_OK[2]] },
      { socios: [{ ...SOCIOS_OK[0], porcentaje: "40" }, SOCIOS_OK[1], SOCIOS_OK[2]] },
      { socios: [SOCIOS_OK[0], { ...SOCIOS_OK[1], email: "ana@example.com" }, SOCIOS_OK[2]] },
      { numSocios: 2 },
      { confirmaSocios: false },
      { gestores: [] },
      { reparto: "otro", repartoOtro: "" },
    ];
    for (const extra of desvios) {
      expect("errores" in validarAltaSocios({ ...ALTA_SOCIOS_OK, ...extra })).toBe(true);
    }
    expect("errores" in validarEmpezar({ punto: "crear", tipo: "llc-2", estado: "otro", alta: ALTA_SOCIOS_OK, consentimiento: true })).toBe(true);
  });

  test("casoAsistente decide el resultado", () => {
    expect(casoAsistente({ punto: "anual", tipo: "llc-1", estado: "Texas", requisitos: "si" })).toBe("formularios");
    expect(casoAsistente({ punto: "anual", tipo: "llc-1", estado: "Texas", requisitos: "no" })).toBe("contacto");
    expect(casoAsistente({ punto: "anual", tipo: "llc-2", estado: "Texas", requisitos: "si" })).toBe("contacto");
    expect(casoAsistente({ punto: "cerrar", tipo: null, estado: null, requisitos: null })).toBe("cierre");
    expect(casoAsistente({ punto: "crear", tipo: "llc-1", estado: "Nevada", requisitos: null })).toBe("plan");
    expect(casoAsistente({ punto: "crear", tipo: "llc-2", estado: "Utah", requisitos: null })).toBe("varios");
    expect(casoAsistente({ punto: "crear", tipo: "llc-1", estado: "no-se", requisitos: null })).toBeNull();
    expect(casoAsistente({ punto: "crear", tipo: "corp", estado: "Delaware", requisitos: null })).toBeNull();
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
      expect(plan.incluye).toContain("Operating Agreement (modelo estándar)");
      expect(plan.incluye[0]).toBe("Registro de la LLC en Nuevo México, Delaware, Wyoming, Nevada, Utah, Florida o Texas");
    }
    expect(planes[0].precio).toBe("Desde 397 $");
    expect(planes[1].precio).toBe("Desde 497 $");
    expect(planes[0].aviso).toContain("Renovación anual: 197 $/año + tasa anual del estado");
    expect(enlacePago("basico", 397)).toMatch(/^https:\/\/buy\.stripe\.com\//);
    expect(enlacePago("estandar", 497)).toMatch(/^https:\/\/buy\.stripe\.com\//);
    expect(planes.find((p) => p.id === "encargo")!.href).toBe("/contacto?servicio=arranque");
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
    expect(avisosContacto.arranque?.titulo).toBe("Tu caso necesita un análisis personalizado.");
    expect(avisosContacto.arranque?.texto).not.toContain("varios socios");
    expect(avisosContacto["en-regla"]).toBeUndefined();
  });
});

describe("precios (precios.md)", () => {
  test("apertura de un socio: plan + tasa del estado, con Nuevo México incluido", () => {
    const tabla: Record<string, [number, number]> = {
      "New Mexico": [397, 497],
      Utah: [456, 556],
      Wyoming: [497, 597],
      Delaware: [507, 607],
      Florida: [522, 622],
      Texas: [697, 797],
      Nevada: [822, 922],
    };
    for (const [estado, [basico, estandar]] of Object.entries(tabla)) {
      expect(precioApertura(estado as never, "basico").total).toBe(basico);
      expect(precioApertura(estado as never, "estandar").total).toBe(estandar);
    }
    expect(precioApertura("New Mexico", "basico").texto).toBe("397 $ (tasa del estado incluida)");
    expect(precioApertura("Delaware", "basico").texto).toBe("397 $ + 110 $ (tasa del estado de Delaware)");
    expect(precioApertura("Nevada", "basico").texto).toBe("397 $ + 425 $ (tasas del estado de Nevada)");
  });

  test("varios socios: 547 $ con 2 + 79 $ por socio adicional + tasa", () => {
    expect(precioAperturaVarios("New Mexico", 2).total).toBe(547);
    expect(precioAperturaVarios("Delaware", 3).texto).toBe("626 $ + 110 $ (tasa del estado de Delaware)");
    expect(precioAperturaVarios("Nevada", 3).total).toBe(1051);
    expect(precioAperturaVarios("Nevada", 10).total).toBe(1604);
    expect(precioAperturaVarios("Texas", 10).total).toBe(1479);
    expect(dolares(1051)).toBe("1.051 $");
    expect(precio1065(2)).toBe(449);
    expect(precio1065(10)).toBe(841);
  });

  test("renovación: 197 $ + tasa anual; cierre: 467 $ + tasa de disolución", () => {
    const renovacion: Record<string, number> = { "New Mexico": 197, Texas: 197, Utah: 215, Wyoming: 257, Florida: 335.75, Delaware: 597, Nevada: 547 };
    for (const [estado, total] of Object.entries(renovacion)) expect(precioRenovacion(estado as never).total).toBe(total);
    expect(precioRenovacion("Florida").texto).toBe("197 $ + 138,75 $ (tasa anual del estado de Florida)");
    expect(precioRenovacion("New Mexico").texto).toBe("197 $");
    const cierre: Record<string, number> = { Utah: 467, "New Mexico": 467, Florida: 492, Texas: 507, Wyoming: 527, Nevada: 567, Delaware: 687 };
    for (const [estado, total] of Object.entries(cierre)) expect(precioCierre(estado as never).total).toBe(total);
    expect(precioCierre("New Mexico").texto).toBe("467 $ (tasa del estado incluida)");
    expect(precioCierre("Utah").texto).toBe("467 $ (Utah no cobra tasa de disolución)");
    expect(precioCierre("Delaware").texto).toBe("467 $ + 220 $ (tasa del estado de Delaware)");
    // Solo hay enlace de 467 $: Nuevo México y Utah pagan online; el resto, por contacto.
    expect(enlacePago("cierre", 467)).not.toBeNull();
    expect(enlacePago("cierre", 687)).toBeNull();
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
    const socios = pasosDe("crear", "llc-2").map((p) => p.id);
    expect(socios.slice(3)).toEqual(PASOS_ALTA_SOCIOS.map((p) => p.id));
    expect(socios).toHaveLength(12);
  });

  test("datos de los socios: porcentajes que suman 100 y desvío con empresa o persona de EE. UU.", () => {
    expect(porcentajeDe("33,33")).toBe(33.33);
    expect(porcentajeDe("100")).toBeNull();
    expect(porcentajeDe("0")).toBeNull();
    const tres = SOCIOS_OK.map((s) => ({ ...s })) as unknown as Parameters<typeof erroresSocios>[0];
    expect(erroresSocios(tres)).toEqual({});
    expect(erroresSocios([...tres.slice(0, 2), { ...tres[2], porcentaje: "10" }])).toHaveProperty("socios");
    expect(erroresSocios([...tres.slice(0, 2), { ...tres[2], tipo: "empresa" }])).toHaveProperty("socios");
    expect(erroresSocios([tres[0], socioVacio()])).toHaveProperty(["socios.1.nombre"]);
    expect(erroresPasoAlta("numSocios", { ...borrador, numSocios: "mas-10" })).toHaveProperty("numSocios");
    expect(erroresPasoAlta("aceptacion", { ...borrador, tipo: "llc-2", confirmaSocios: false })).toHaveProperty("confirmaSocios");
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
      residenteEeuu: "no",
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
