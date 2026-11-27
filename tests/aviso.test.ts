import { afterEach, expect, test, vi } from "vitest";
import { avisarLead, avisoPago, AVISO_PAGO_MANUAL, componerAviso, configAviso, escaparHtml } from "@/lib/aviso";
import { validarFormularios1065 } from "@/lib/validacion";
import { FORMULARIO_1065_OK } from "./formulario-1065";
import { validarEmpezar } from "@/lib/validacion";
import type { DatosLead } from "@/lib/validacion";

const ENV = {
  RESEND_API_KEY: "re_prueba",
  NEC_AVISO_FROM: "Avisos <avisos@example.com>",
  NEC_AVISO_TO: " uno@example.com , dos@example.com,",
} as unknown as NodeJS.ProcessEnv;

const ID = "11111111-2222-4333-8444-555555555555";
// 25 de noviembre de 2026, 10:30 UTC = 11:30 en Madrid.
const FECHA = new Date("2026-11-25T10:30:00Z");

function leadPlan(plan?: string, estado = "New Mexico"): DatosLead {
  const r = validarEmpezar({
    punto: "crear",
    tipo: "llc-1",
    residenteEeuu: "no",
    estado,
    nombre: "Marta <b>López</b>",
    email: "marta@example.com",
    telefono: "+34 600 000 000",
    plan,
    alta: {
      opcionesNombre: ["Sombrilla Studio LLC", "Sombrilla & Co LLC", "Sunshade Studio LLC"],
      direccion: "Calle Mayor 1, 2º B, 28013 Madrid, Madrid, España",
      actividad: "Consultoría de marketing digital para pequeñas empresas de Europa.",
      paisResidencia: "España",
      facturacion: "menos-25k",
      aceptaTerminos: true,
    },
    consentimiento: true,
    pagina: "/empezar",
  });
  if ("errores" in r) throw new Error(JSON.stringify(r.errores));
  return r.datos;
}

const contacto: DatosLead = {
  origen: "contacto",
  servicio: "en-regla",
  nombre: "Ana Pérez",
  email: "ana@example.com",
  telefono: null,
  mensaje: "Hola\n<script>alert(1)</script>",
  datos: {},
  pagina: "/contacto",
  utm: { utm_source: "boletin" },
};

afterEach(() => {
  vi.restoreAllMocks();
});

test("el asunto del asistente con plan lleva servicio, caso, plan y nombre", () => {
  expect(componerAviso(leadPlan("basico"), ID, FECHA).asunto).toBe(
    "Nuevo lead NEC · Constituir una LLC · Plan Básico o Estándar · Plan Básico · Nuevo México · 397 $ · Marta <b>López</b>",
  );
  expect(componerAviso(leadPlan("estandar", "Delaware"), ID, FECHA).asunto).toContain(
    "Plan Estándar · Delaware · 607 $ · Marta",
  );
  expect(componerAviso(leadPlan(), ID, FECHA).asunto).toContain("Plan sin elegir · Nuevo México · Marta");
});

test("el asunto de contacto lleva servicio y nombre, sin plan", () => {
  expect(componerAviso(contacto, ID, FECHA).asunto).toBe(
    "Nuevo lead NEC · Presentación anual 1120 + 5472 · Ana Pérez",
  );
});

test("el cuerpo incluye fecha en Madrid, todos los datos de alta, enlaces y el aviso de pago", () => {
  const { html, texto } = componerAviso(leadPlan("estandar"), ID, FECHA);
  expect(texto).toContain("Fecha (Madrid): ");
  expect(texto).toContain("11:30");
  expect(texto).toContain("Fuente: Asistente");
  expect(texto).toContain("Servicio: Constituir una LLC");
  expect(texto).toContain("Caso: Plan Básico o Estándar");
  expect(texto).toContain("Plan elegido: Plan Estándar");
  expect(texto).toContain("Precio: Plan Estándar: 497 $ (tasa del estado incluida)");
  expect(texto).toContain("Email: marta@example.com");
  expect(texto).toContain("Teléfono: +34 600 000 000");
  expect(texto).toContain("Alta · Opciones de nombre de la LLC: Sombrilla Studio LLC, Sombrilla & Co LLC, Sunshade Studio LLC");
  expect(texto).toContain("Alta · Dirección: Calle Mayor 1");
  expect(texto).toContain("Alta · Actividad: Consultoría de marketing digital");
  expect(texto).toContain("Alta · País de residencia: España");
  expect(texto).toContain("Alta · Facturación anual esperada: Menos de 25.000 $");
  expect(texto).not.toContain("Pasaporte");
  expect(texto).toContain("Alta · Términos y Política de devoluciones aceptados: Sí");
  expect(texto).toContain("Alta · Versión de los términos: 2026-11-27");
  expect(texto).toContain("Datos de alta completos: Sí");
  expect(texto).toContain(avisoPago("NEC-201"));
  expect(texto).toContain("ID de servicio (plan de Whop): NEC-201");
  expect(texto).toContain(`Ficha del lead: https://negociosenchanclas.com/panel/leads/${ID}`);
  expect(texto).toContain("Panel: https://negociosenchanclas.com/panel");
  expect(html).toContain(escaparHtml(avisoPago("NEC-201")));
  expect(html).toContain(`href="https://negociosenchanclas.com/panel/leads/${ID}"`);
  expect(html).toContain('href="https://negociosenchanclas.com/panel"');
});

test("el HTML escapa los datos del usuario", () => {
  const plan = componerAviso(leadPlan("basico"), ID, FECHA).html;
  expect(plan).toContain("Marta &lt;b&gt;López&lt;/b&gt;");
  expect(plan).not.toContain("<b>López</b>");
  expect(plan).toContain("Sombrilla &amp; Co LLC");
  const { html, texto } = componerAviso(contacto, ID, FECHA);
  expect(html).not.toContain("<script>");
  expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
  expect(texto).toContain("utm_source: boletin");
  expect(escaparHtml(`"a'&`)).toBe("&quot;a&#39;&amp;");
});

test("solo lo que llega a un pago lleva el aviso de pago de Whop con su ID; sin enlace, el aviso de enlace manual", () => {
  expect(componerAviso(contacto, ID, FECHA).texto).not.toContain("PAGO NO CONFIRMADO");
  const delaware = componerAviso(leadPlan("basico", "Delaware"), ID, FECHA).texto;
  expect(delaware).toContain(avisoPago("NEC-104"));
  expect(delaware).not.toContain("Stripe");
  expect(delaware).toContain("Precio: Plan Básico: 507 $ = 397 $ + 110 $ (tasa del estado de Delaware)");
  const sinEnlace = componerAviso({ ...leadPlan("basico"), datos: { ...leadPlan("basico").datos, pagoOnline: false } }, ID, FECHA);
  expect(sinEnlace.texto).toContain(AVISO_PAGO_MANUAL);
  expect(sinEnlace.asunto).toContain("Pago por enlace manual");
});

test("el aviso del Form 1065 lleva socios, ID NEC-6SS y un socio por línea", () => {
  const r = validarFormularios1065(FORMULARIO_1065_OK);
  if ("errores" in r) throw new Error(JSON.stringify(r.errores));
  const { asunto, texto } = componerAviso(r.datos, ID, FECHA);
  expect(asunto).toBe("Nuevo lead NEC · Form 1065 + K-1 2026 (varios socios) · 3 socios · Wyoming · 498 $ · Lucía Martín");
  expect(texto).toContain(avisoPago("NEC-603"));
  expect(texto).toContain("Socio 1: Lucía Martín · pasaporte PAA111111 · nacionalidad española");
  expect(texto).toContain("50 % a 1-1 · 50 % a 31-12 · aportó 1000.00 USD · sacó 200.00 USD · sin ITIN");
  expect(texto).toContain("ITIN 912-34-5678");
  expect(texto).toContain("Ingresos totales del año (USD): 50000.00");
});

test("el aviso de varios socios lista cada socio en una línea", () => {
  const r = validarEmpezar({
    punto: "crear",
    tipo: "llc-2",
    estado: "Delaware",
    alta: {
      numSocios: 2,
      socios: [
        { nombre: "Ana Pérez", email: "ana@example.com", paisResidencia: "España", nacionalidad: "española", porcentaje: "60", tipo: "persona", residenteEeuu: "no" },
        { nombre: "Luis Gómez", email: "luis@example.com", paisResidencia: "México", nacionalidad: "mexicana", porcentaje: "40", tipo: "persona", residenteEeuu: "no" },
      ],
      interlocutor: 1,
      opcionesNombre: ["Dos Chanclas LLC", "Two Flip Flops LLC", "Chanclas Duo LLC"],
      gestion: "todos",
      reparto: "porcentaje",
      pactoSalida: "si",
      direccion: "Av. Reforma 100, 06600 Ciudad de México, México",
      actividad: "Agencia de desarrollo web con clientes en Europa y América.",
      facturacion: "25k-50k",
      aceptaTerminos: true,
      confirmaSocios: true,
    },
    consentimiento: true,
  });
  if ("errores" in r) throw new Error(JSON.stringify(r.errores));
  const { asunto, texto } = componerAviso(r.datos, ID, FECHA);
  expect(asunto).toBe("Nuevo lead NEC · Constituir una LLC · LLC de varios socios · 2 socios · Delaware · 657 $ · Luis Gómez");
  expect(texto).toContain("Alta · Socio 1: Ana Pérez · ana@example.com · reside en España · nacionalidad española · 60 % · Persona");
  expect(texto).toContain("Alta · Persona de contacto: Luis Gómez");
  expect(texto).toContain(avisoPago("NEC-5024"));
});

test("sin variables de entorno no se envía nada", async () => {
  const fetchFalso = vi.fn();
  expect(configAviso({} as NodeJS.ProcessEnv)).toBeNull();
  expect(configAviso({ ...ENV, NEC_AVISO_TO: " , " } as NodeJS.ProcessEnv)).toBeNull();
  expect(await avisarLead(contacto, ID, { env: {} as NodeJS.ProcessEnv, fetch: fetchFalso })).toBe(false);
  expect(fetchFalso).not.toHaveBeenCalled();
});

test("envía a Resend con remitente y destinatarios de las variables", async () => {
  const fetchFalso = vi.fn(async () => new Response("{}", { status: 200 }));
  expect(await avisarLead(leadPlan("basico"), ID, { env: ENV, fetch: fetchFalso as typeof fetch, fecha: FECHA })).toBe(true);
  expect(fetchFalso).toHaveBeenCalledTimes(1);
  const [url, init] = fetchFalso.mock.calls[0] as unknown as [string, RequestInit];
  expect(url).toBe("https://api.resend.com/emails");
  expect((init.headers as Record<string, string>).authorization).toBe("Bearer re_prueba");
  const cuerpo = JSON.parse(String(init.body)) as Record<string, unknown>;
  expect(cuerpo.from).toBe("Avisos <avisos@example.com>");
  expect(cuerpo.to).toEqual(["uno@example.com", "dos@example.com"]);
  expect(cuerpo.subject).toContain("Plan Básico · Nuevo México · 397 $");
  expect(typeof cuerpo.html).toBe("string");
  expect(typeof cuerpo.text).toBe("string");
});

test("un fallo de Resend no lanza y no escribe datos del lead en el log", async () => {
  const log = vi.spyOn(console, "error").mockImplementation(() => {});
  const rechaza = vi.fn(async () => {
    throw new TypeError("fetch failed");
  });
  await expect(avisarLead(contacto, ID, { env: ENV, fetch: rechaza as typeof fetch })).resolves.toBe(false);
  const error500 = vi.fn(async () => new Response("ana@example.com", { status: 500 }));
  await expect(avisarLead(contacto, ID, { env: ENV, fetch: error500 as typeof fetch })).resolves.toBe(false);
  expect(log).toHaveBeenCalledTimes(2);
  expect(JSON.stringify(log.mock.calls)).not.toContain("ana@example.com");
});
