import { beforeAll, beforeEach, expect, test, vi } from "vitest";
import bcrypt from "bcryptjs";
import type { BaseDatos } from "@/lib/db";
import { crearDbPrueba, vaciar } from "./db";
import { FORMULARIO_1065_OK } from "./formulario-1065";

process.env.NEC_IP_SALT = "sal-de-prueba-nec";
process.env.NEC_SESSION_SECRET = "secreto-de-sesion-de-prueba-32chars";
process.env.NEC_ADMIN_USER = "nec";

const estado = vi.hoisted(() => ({ db: null as BaseDatos | null }));

vi.mock("@/lib/db", () => ({
  getDb: () => {
    if (!estado.db) throw new Error("sin base de prueba");
    return estado.db;
  },
}));

const { POST: contacto } = await import("@/app/api/contacto/route");
const { POST: empezar } = await import("@/app/api/empezar/route");
const { POST: encargo } = await import("@/app/api/encargo/route");
const { POST: formularios } = await import("@/app/api/formularios-llc/route");
const { POST: cierre } = await import("@/app/api/cierra-tu-llc/route");
const { POST: formularios1065 } = await import("@/app/api/formularios-1065/route");
const { POST: login } = await import("@/app/api/panel/login/route");
const { POST: logout } = await import("@/app/api/panel/logout/route");
const { GET: listar } = await import("@/app/api/panel/leads/route");

const ALTA = {
  opcionesNombre: ["Sombrilla Studio LLC", "Sombrilla LLC", "Sunshade Studio LLC"],
  direccion: "Calle Mayor 1, 2º B, 28013 Madrid, Madrid, España",
  actividad: "Consultoría de marketing digital para pequeñas empresas de Europa.",
  paisResidencia: "España",
  facturacion: "menos-25k",
  aceptaTerminos: true,
};
const ALTA_SOCIOS = {
  numSocios: 3,
  socios: [
    { nombre: "Marta López", email: "marta@example.com", paisResidencia: "Argentina", nacionalidad: "argentina", porcentaje: "33,34", tipo: "persona", residenteEeuu: "no" },
    { nombre: "Pablo Díaz", email: "pablo@example.com", paisResidencia: "España", nacionalidad: "española", porcentaje: "33,33", tipo: "persona", residenteEeuu: "no" },
    { nombre: "Sara Gil", email: "sara@example.com", paisResidencia: "Uruguay", nacionalidad: "uruguaya", porcentaje: "33,33", tipo: "persona", residenteEeuu: "no" },
  ],
  interlocutor: 0,
  opcionesNombre: ["Tres Chanclas LLC", "Three Flip Flops LLC", "Chanclas Trio LLC"],
  gestion: "todos",
  reparto: "otro",
  repartoOtro: "Marta cobra un 10 % extra por la gestión.",
  pactoSalida: "si",
  direccion: "Av. Corrientes 1000, C1043 Buenos Aires, Argentina",
  actividad: "Agencia de desarrollo web con clientes en Europa y América.",
  facturacion: "mas-100k",
  aceptaTerminos: true,
  confirmaSocios: true,
};
const { GET: exportar } = await import("@/app/api/panel/leads/export/route");
const detalle = await import("@/app/api/panel/leads/[id]/route");
const { verificarToken } = await import("@/lib/sesion");

beforeAll(async () => {
  process.env.NEC_ADMIN_PASSWORD_HASH = bcrypt.hashSync("clave-panel", 4);
  estado.db = await crearDbPrueba();
});

beforeEach(async () => {
  if (estado.db) await vaciar(estado.db);
});

function post(ruta: string, body: unknown, headers: Record<string, string> = {}) {
  return new Request(`https://negociosenchanclas.com${ruta}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": "203.0.113.8",
      host: "negociosenchanclas.com",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

const contactoOk = {
  nombre: "Ana Pérez",
  email: "ana@example.com",
  telefono: "659308119",
  servicio: "en-regla",
  mensaje: "Tengo una LLC en Wyoming.",
  consentimiento: true,
  pagina: "/contacto",
  utm: { utm_source: "boletin" },
};

async function entrar() {
  const res = await login(post("/api/panel/login", { usuario: "nec", clave: "clave-panel" }));
  expect(res.status).toBe(200);
  const cookie = res.headers.get("set-cookie") ?? "";
  const token = cookie.split(";")[0]?.split("=")[1] ?? "";
  const sesion = await verificarToken(token);
  return { cookie: cookie.split(";")[0], csrf: sesion?.csrf ?? "" };
}

test("contacto guarda la consulta y el evento, y no la IP", async () => {
  const res = await contacto(post("/api/contacto", contactoOk, { "user-agent": "Prueba" }));
  expect(res.status).toBe(200);
  expect(await res.json()).toEqual({ ok: true });
  const filas = await estado.db!.query("select email, consentimiento_version, ip_hash, utm, origen from nec.leads");
  expect(filas).toHaveLength(1);
  expect(filas[0].email).toBe("ana@example.com");
  expect(filas[0].consentimiento_version).toBe("2026-11-25");
  expect(filas[0].origen).toBe("contacto");
  expect(String(filas[0].ip_hash)).not.toContain("203.0.113.8");
  const utm = filas[0].utm;
  expect(JSON.stringify(utm)).toContain("boletin");
  const eventos = await estado.db!.query("select accion from nec.lead_eventos");
  expect(eventos[0].accion).toBe("creado");
});

test("contacto no guarda el señuelo y valida el consentimiento", async () => {
  const hueco = await contacto(post("/api/contacto", { ...contactoOk, nec_hp: "http://spam.test" }));
  expect(hueco.status).toBe(200);
  const vacio = await estado.db!.query("select id from nec.leads");
  expect(vacio).toHaveLength(0);

  const sin = await contacto(post("/api/contacto", { ...contactoOk, consentimiento: false }));
  expect(sin.status).toBe(422);
  const json = await sin.json();
  expect(json.errors.consentimiento).toBeTruthy();
});

test("contacto limita a 5 envíos por IP en la ventana", async () => {
  for (let i = 0; i < 5; i += 1) {
    const res = await contacto(post("/api/contacto", { ...contactoOk, email: `ana${i}@example.com` }));
    expect(res.status).toBe(200);
  }
  const sexto = await contacto(post("/api/contacto", contactoOk));
  expect(sexto.status).toBe(429);
  const filas = await estado.db!.query("select id from nec.leads");
  expect(filas).toHaveLength(5);
});

test("el asistente guarda las respuestas en datos", async () => {
  const res = await empezar(
    post("/api/empezar", {
      punto: "crear",
      tipo: "llc-1",
      residenteEeuu: "no",
      estado: "Florida",
      nombre: "Luis Pérez",
      email: "luis@example.com",
      telefono: "+34 611 222 333",
      alta: ALTA,
      consentimiento: true,
      pagina: "/empezar",
    }),
  );
  expect(res.status).toBe(200);
  const filas = await estado.db!.query("select origen, servicio, datos, mensaje from nec.leads");
  expect(filas[0].origen).toBe("empezar");
  expect(filas[0].servicio).toBe("arranque");
  expect(filas[0].mensaje).toBeNull();
  expect(JSON.stringify(filas[0].datos)).toContain("Florida");

  // «Aún no lo sé» no llega a guardarse: el asistente desvía a contacto antes del alta.
  const noSe = await empezar(
    post("/api/empezar", {
      punto: "crear",
      tipo: "llc-1",
      residenteEeuu: "no",
      estado: "no-se",
      nombre: "Luis Pérez",
      email: "luis@example.com",
      telefono: "+34 611 222 333",
      alta: ALTA,
      consentimiento: true,
    }),
  );
  expect(noSe.status).toBe(422);
});

test("el acceso falla, se bloquea y luego deja entrar", async () => {
  for (let i = 0; i < 5; i += 1) {
    const res = await login(post("/api/panel/login", { usuario: "nec", clave: "mal" }));
    expect(res.status).toBe(401);
  }
  const bloqueado = await login(post("/api/panel/login", { usuario: "nec", clave: "clave-panel" }));
  expect(bloqueado.status).toBe(429);
  const accesos = await estado.db!.query("select resultado from nec.accesos_panel order by id");
  expect(accesos.map((fila) => fila.resultado)).toEqual(["fallo", "fallo", "fallo", "fallo", "fallo", "bloqueado"]);

  await vaciar(estado.db!);
  const { cookie, csrf } = await entrar();
  expect(csrf.length).toBeGreaterThan(16);

  const anonimo = await listar(new Request("https://negociosenchanclas.com/api/panel/leads"));
  expect(anonimo.status).toBe(401);

  await contacto(post("/api/contacto", contactoOk));
  const lista = await listar(
    new Request("https://negociosenchanclas.com/api/panel/leads?q=ana@example", {
      headers: { cookie },
    }),
  );
  expect(lista.status).toBe(200);
  const json = await lista.json();
  expect(json.total).toBe(1);
  expect(json.leads[0].email).toBe("ana@example.com");
  expect(json.contadores.hoy).toBe(1);

  const id = json.leads[0].id as string;
  const sinCsrf = await detalle.PATCH(
    new Request(`https://negociosenchanclas.com/api/panel/leads/${id}`, {
      method: "PATCH",
      headers: { cookie, "content-type": "application/json", host: "negociosenchanclas.com" },
      body: JSON.stringify({ estado: "contactado" }),
    }),
    { params: Promise.resolve({ id }) },
  );
  expect(sinCsrf.status).toBe(403);

  const origenMalo = await detalle.PATCH(
    new Request(`https://negociosenchanclas.com/api/panel/leads/${id}`, {
      method: "PATCH",
      headers: {
        cookie,
        "content-type": "application/json",
        "x-nec-csrf": csrf,
        origin: "https://otro.example",
        host: "negociosenchanclas.com",
      },
      body: JSON.stringify({ estado: "contactado" }),
    }),
    { params: Promise.resolve({ id }) },
  );
  expect(origenMalo.status).toBe(403);

  const cambio = await detalle.PATCH(
    new Request(`https://negociosenchanclas.com/api/panel/leads/${id}`, {
      method: "PATCH",
      headers: {
        cookie,
        "content-type": "application/json",
        "x-nec-csrf": csrf,
        origin: "https://negociosenchanclas.com",
        host: "negociosenchanclas.com",
      },
      body: JSON.stringify({ estado: "contactado", notas: "Llamar el martes" }),
    }),
    { params: Promise.resolve({ id }) },
  );
  expect(cambio.status).toBe(200);

  const borrado = await detalle.PATCH(
    new Request(`https://negociosenchanclas.com/api/panel/leads/${id}`, {
      method: "PATCH",
      headers: {
        cookie,
        "content-type": "application/json",
        "x-nec-csrf": csrf,
        host: "negociosenchanclas.com",
      },
      body: JSON.stringify({ borrar: true }),
    }),
    { params: Promise.resolve({ id }) },
  );
  expect(borrado.status).toBe(200);
  const oculto = await listar(new Request("https://negociosenchanclas.com/api/panel/leads", { headers: { cookie } }));
  expect((await oculto.json()).total).toBe(0);

  const csv = await exportar(
    new Request("https://negociosenchanclas.com/api/panel/leads/export?borrados=1", { headers: { cookie } }),
  );
  expect(csv.headers.get("content-type")).toContain("text/csv");
  const texto = await csv.text();
  expect(texto).toContain("ana@example.com");
  expect(texto).not.toContain("203.0.113.8");

  const salir = await logout(
    new Request("https://negociosenchanclas.com/api/panel/logout", {
      method: "POST",
      headers: { cookie, "x-nec-csrf": csrf, host: "negociosenchanclas.com" },
    }),
  );
  expect(salir.headers.get("set-cookie")).toContain("Max-Age=0");
});

test("una búsqueda con comillas no rompe el listado", async () => {
  await contacto(post("/api/contacto", contactoOk));
  const { cookie } = await entrar();
  const res = await listar(
    new Request("https://negociosenchanclas.com/api/panel/leads?q=" + encodeURIComponent("' or 1=1 --"), {
      headers: { cookie },
    }),
  );
  expect(res.status).toBe(200);
  expect((await res.json()).total).toBe(0);
});

const formularioOk = {
  nombre: "Ana Pérez García",
  pasaporte: "pab123456",
  nacionalidad: "España",
  direccion: "Calle Mayor 1, 2º",
  ciudad: "Barcelona",
  paisResidencia: "España",
  codigoPostal: "08001",
  email: "Ana@Example.com",
  nombreLlc: "Playa Digital LLC",
  estadoConstitucion: "Wyoming",
  ein: "12-3456789",
  direccionLlc: "500 4th St NW, Suite 102, Albuquerque, NM 87102",
  fechaConstitucion: "2024-03-15",
  actividad: "Online marketing consulting",
  retiros: "1200,5",
  aportaciones: "0",
  saldo: "3400",
  unicoSocio: true,
  resideFuera: true,
  datosCorrectos: true,
  consentimiento: true,
  pagina: "/formularios-llc",
};

test("formularios LLC no admite envíos antes de NEC_FORMULARIOS_LAUNCH (hora de Madrid)", async () => {
  process.env.NEC_FORMULARIOS_LAUNCH = "2027-01-01T00:00";
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-12-31T22:59:59.000Z"));
  const antes = await formularios(post("/api/formularios-llc", formularioOk));
  expect(antes.status).toBe(404);
  vi.setSystemTime(new Date("2026-12-31T23:00:00.000Z"));
  const despues = await formularios(post("/api/formularios-llc", formularioOk));
  expect(despues.status).toBe(200);
  vi.useRealTimers();
  delete process.env.NEC_FORMULARIOS_LAUNCH;
});

test("formularios LLC guarda los datos, mantiene el cero del código postal y no los escribe en el log", async () => {
  delete process.env.NEC_FORMULARIOS_LAUNCH;
  const log = vi.spyOn(console, "error").mockImplementation(() => {});
  const info = vi.spyOn(console, "log").mockImplementation(() => {});
  const res = await formularios(post("/api/formularios-llc", formularioOk));
  expect(res.status).toBe(200);
  const cuerpo = (await res.json()) as { ok: boolean; id: string };
  expect(cuerpo.ok).toBe(true);
  expect(cuerpo.id).toMatch(/^[0-9a-f-]{36}$/);
  const filas = await estado.db!.query("select id, origen, servicio, email, datos from nec.leads");
  expect(filas).toHaveLength(1);
  expect(filas[0].id).toBe(cuerpo.id);
  expect(filas[0].origen).toBe("contacto");
  expect(filas[0].servicio).toBe("formularios-llc");
  expect(filas[0].email).toBe("ana@example.com");
  const datos = (typeof filas[0].datos === "string" ? JSON.parse(filas[0].datos) : filas[0].datos) as Record<string, unknown>;
  expect(datos.codigoPostal).toBe("08001");
  expect(datos.pasaporte).toBe("PAB123456");
  expect(datos.ein).toBe("12-3456789");
  expect(datos.retiros).toBe("1200.50");
  expect(datos.saldo).toBe("3400.00");
  expect(datos.ejercicio).toBe(2026);
  expect(datos.estadoConstitucion).toBe("Wyoming");
  const escrito = JSON.stringify([...log.mock.calls, ...info.mock.calls]);
  expect(escrito).not.toContain("PAB123456");
  expect(escrito).not.toContain("123456789");
  log.mockRestore();
  info.mockRestore();
});

test("formularios LLC valida EIN, nombre de la LLC, estado, importes y las tres casillas", async () => {
  delete process.env.NEC_FORMULARIOS_LAUNCH;
  const res = await formularios(
    post("/api/formularios-llc", {
      ...formularioOk,
      estadoConstitucion: "Narnia",
      ein: "123456789",
      nombreLlc: "Playa Digital",
      retiros: "mil",
      codigoPostal: "SW1A 1AA",
      unicoSocio: false,
      resideFuera: undefined,
      datosCorrectos: "true",
    }),
  );
  expect(res.status).toBe(422);
  const { errors } = (await res.json()) as { errors: Record<string, string> };
  expect(Object.keys(errors).sort()).toEqual(
    ["datosCorrectos", "ein", "estadoConstitucion", "nombreLlc", "resideFuera", "retiros", "unicoSocio"].sort(),
  );
  expect(JSON.stringify(errors)).not.toContain("PAB123456");
  const filas = await estado.db!.query("select id from nec.leads");
  expect(filas).toHaveLength(0);
});

test("Form 1065 guarda la LLC y los socios sin escribirlos en el log", async () => {
  delete process.env.NEC_FORMULARIOS_LAUNCH;
  const log = vi.spyOn(console, "error").mockImplementation(() => {});
  const res = await formularios1065(post("/api/formularios-1065", FORMULARIO_1065_OK));
  expect(res.status).toBe(200);
  const cuerpo = (await res.json()) as { ok: boolean; id: string };
  expect(cuerpo.id).toMatch(/^[0-9a-f-]{36}$/);
  const filas = await estado.db!.query("select origen, servicio, nombre, email, telefono, datos from nec.leads");
  expect(filas).toHaveLength(1);
  expect(filas[0]).toMatchObject({ origen: "contacto", servicio: "formularios-1065", nombre: "Lucía Martín", email: "lucia@example.com" });
  const datos = (typeof filas[0].datos === "string" ? JSON.parse(filas[0].datos) : filas[0].datos) as Record<string, unknown>;
  expect(datos).toMatchObject({ numSocios: 3, idServicio: "NEC-603", precioTotal: 498, ein: "98-7654321" });
  expect((datos.socios as unknown[]).length).toBe(3);
  expect(JSON.stringify(log.mock.calls)).not.toContain("PAA111111");
  log.mockRestore();
});

test("Form 1065 no admite datos desde el 1 de marzo (sin prórroga) ni requisitos sin cumplir", async () => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2027-02-28T23:00:00.000Z"));
  const tarde = await formularios1065(post("/api/formularios-1065", FORMULARIO_1065_OK));
  expect(tarde.status).toBe(410);
  expect(((await tarde.json()) as { error: string }).error).toBe(
    "El plazo para este año está cerrado. Escríbenos y vemos qué podemos hacer.",
  );
  vi.useRealTimers();
  const noCumple = await formularios1065(
    post("/api/formularios-1065", { ...FORMULARIO_1065_OK, requisitos: { ...FORMULARIO_1065_OK.requisitos, alDia: "no" } }),
  );
  expect(noCumple.status).toBe(422);
  expect(await estado.db!.query("select id from nec.leads")).toHaveLength(0);
});

const cierreOk = {
  nombre: "Ana Pérez García",
  email: "Ana@Example.com",
  telefono: "+34 659 30 81 19",
  paisResidencia: "España",
  nombreLlc: "Playa Digital LLC",
  estadoConstitucion: "New Mexico",
  ein: "12-3456789",
  fechaConstitucion: "2023-05-10",
  socios: "uno",
  activa: "si",
  formulariosPrevios: "si",
  agenteAlDia: "si",
  cuentas: "Mercury y Stripe",
  cuando: "otra",
  cuandoOtra: "Marzo de 2027",
  notas: "Tengo una carta del IRS.",
  datosCorrectos: true,
  confirmaAlDia: true,
  aceptaPrecio: true,
  consentimiento: true,
  pagina: "/cierra-tu-llc",
};

test("cierre de LLC guarda la consulta con servicio cierre-llc", async () => {
  const res = await cierre(post("/api/cierra-tu-llc", cierreOk));
  expect(res.status).toBe(200);
  const cuerpo = (await res.json()) as { ok: boolean; id: string };
  expect(cuerpo.id).toMatch(/^[0-9a-f-]{36}$/);
  const filas = await estado.db!.query("select origen, servicio, email, telefono, mensaje, datos from nec.leads");
  expect(filas).toHaveLength(1);
  expect(filas[0].origen).toBe("contacto");
  expect(filas[0].servicio).toBe("cierre-llc");
  expect(filas[0].email).toBe("ana@example.com");
  expect(filas[0].mensaje).toBe("Tengo una carta del IRS.");
  const datos = (typeof filas[0].datos === "string" ? JSON.parse(filas[0].datos) : filas[0].datos) as Record<string, unknown>;
  expect(datos.estadoConstitucion).toBe("Nuevo México");
  expect(datos.socios).toBe("Solo yo");
  expect(datos.agenteAlDia).toBe("Sí");
  expect(datos.cuando).toBe("Otra fecha: Marzo de 2027");
  expect(datos).toMatchObject({ precioTotal: 467, pagoOnline: true, precio: "467 $ (tasa del estado incluida)" });

  const delaware = await cierre(
    post("/api/cierra-tu-llc", { ...cierreOk, estadoConstitucion: "Delaware" }, { "x-forwarded-for": "203.0.113.20" }),
  );
  expect(delaware.status).toBe(200);
  const [fila] = await estado.db!.query("select datos from nec.leads order by created_at desc limit 1");
  expect(JSON.stringify(fila.datos)).toContain('"precioTotal":687');
  expect(JSON.stringify(fila.datos)).toContain('"pagoOnline":true');
  expect(JSON.stringify(fila.datos)).toContain('"idServicio":"NEC-304"');
});

test("cierre de LLC no admite otro estado, dos o más socios ni faltar las casillas", async () => {
  const res = await cierre(
    post("/api/cierra-tu-llc", {
      ...cierreOk,
      estadoConstitucion: "otro",
      socios: "varios",
      telefono: "",
      aceptaPrecio: false,
      confirmaAlDia: false,
      activa: "no",
      agenteAlDia: "no-se",
      cuando: "otra",
      cuandoOtra: "",
    }),
  );
  expect(res.status).toBe(422);
  const { errors } = (await res.json()) as { errors: Record<string, string> };
  expect(Object.keys(errors).sort()).toEqual(
    ["aceptaPrecio", "activa", "agenteAlDia", "confirmaAlDia", "cuandoOtra", "estadoConstitucion", "socios", "telefono"].sort(),
  );
  expect(await estado.db!.query("select id from nec.leads")).toHaveLength(0);
});

test("encargo personalizado guarda nombre y email", async () => {
  const res = await encargo(
    post("/api/encargo", { nombre: "Luis", email: "luis@example.com", consentimiento: true, pagina: "/encargo-personalizado" }),
  );
  expect(res.status).toBe(200);
  const filas = await estado.db!.query("select origen, servicio, nombre, email from nec.leads");
  expect(filas).toEqual([{ origen: "contacto", servicio: "encargo", nombre: "Luis", email: "luis@example.com" }]);

  const sinConsentimiento = await encargo(post("/api/encargo", { nombre: "Luis", email: "luis@example.com" }));
  expect(sinConsentimiento.status).toBe(422);
});

test("el asistente guarda el plan elegido solo al crear una LLC", async () => {
  const res = await empezar(
    post("/api/empezar", {
      punto: "crear",
      tipo: "llc-1",
      residenteEeuu: "no",
      estado: "New Mexico",
      nombre: "Eva Ruiz",
      email: "eva@example.com",
      telefono: "+52 55 1234 5678",
      alta: ALTA,
      plan: "estandar",
      consentimiento: true,
    }),
  );
  expect(res.status).toBe(200);
  const cuerpo = (await res.json()) as { ok: boolean; id: string };
  expect(cuerpo.id).toMatch(/^[0-9a-f-]{36}$/);
  const filas = await estado.db!.query("select datos from nec.leads");
  const datos = (typeof filas[0].datos === "string" ? JSON.parse(filas[0].datos) : filas[0].datos) as Record<string, unknown>;
  expect(datos.plan).toBe("estandar");
  expect(datos.planEtiqueta).toBe("Plan Estándar");
  expect(datos.precioTotal).toBe(497);
  expect(datos.caso).toBe("plan");
});

test("fuentes incluye combinaciones vacías y cuenta por origen y servicio en hora de Madrid", async () => {
  const { contadoresFuentes, filtrosDesdeUrl, listarLeads } = await import("@/lib/leads");
  const db = estado.db!;
  await contacto(post("/api/contacto", contactoOk));
  await db.query("update nec.leads set created_at = $1", ["2026-11-25T10:00:00Z"]);
  const fuentes = await contadoresFuentes(db, new Date("2026-11-25T12:00:00Z"));
  expect(fuentes.find((f) => f.origen === "contacto" && f.servicio === "en-regla")).toMatchObject({ total: 1, hoy: 1, semana: 1 });
  expect(fuentes.find((f) => f.origen === "empezar" && f.servicio === "en-regla")).toMatchObject({ total: 0, hoy: 0, semana: 0 });
  expect(fuentes.find((f) => f.origen === "contacto" && f.servicio === "encargo")?.url).toBe("/contacto?servicio=arranque");
  const filtros = filtrosDesdeUrl(new URL("https://negociosenchanclas.com/panel?origen=empezar&servicio=en-regla"));
  expect((await listarLeads(db, filtros)).total).toBe(0);
});

test("el asistente guarda los datos de alta y el panel los cuenta en fuentes", async () => {
  const { contadoresFuentes, obtenerLead, tieneAltaCompleta } = await import("@/lib/leads");
  const db = estado.db!;
  const res = await empezar(
    post("/api/empezar", {
      punto: "crear",
      tipo: "llc-2",
      estado: "Wyoming",
      telefono: "+54 11 2345 6789",
      alta: ALTA_SOCIOS,
      consentimiento: true,
    }),
  );
  expect(res.status).toBe(200);
  // Un lead antiguo del asistente, sin datos de alta.
  await db.query(
    `insert into nec.leads (id, origen, servicio, nombre, email, datos, consentimiento)
     values ('00000000-0000-4000-8000-000000000001', 'empezar', 'encargo', 'Antiguo', 'antiguo@example.com', '{"punto":"crear","sinNombre":true}', true)`,
  );
  const filas = await db.query<{ id: string; servicio: string; telefono: string }>(
    "select id, servicio, telefono from nec.leads where email = 'marta@example.com'",
  );
  expect(filas[0]).toMatchObject({ servicio: "arranque", telefono: "+54 11 2345 6789" });
  const lead = await obtenerLead(db, filas[0].id);
  expect(tieneAltaCompleta(lead!)).toBe(true);
  expect(lead!.datos).toMatchObject({ caso: "varios", precioTotal: 726, estado: "Wyoming" });
  expect(lead!.datos.alta).toMatchObject({
    numSocios: 3,
    facturacionEtiqueta: "Más de 100.000 $",
    opcionesNombre: ALTA_SOCIOS.opcionesNombre,
  });
  const antiguo = await obtenerLead(db, "00000000-0000-4000-8000-000000000001");
  expect(tieneAltaCompleta(antiguo!)).toBe(false);

  const fuentes = await contadoresFuentes(db);
  expect(fuentes.find((f) => f.origen === "empezar" && f.servicio === "arranque")).toMatchObject({ total: 1, conAlta: 1 });
  expect(fuentes.find((f) => f.origen === "empezar" && f.servicio === "encargo")).toMatchObject({ total: 1, conAlta: 0 });
  expect(fuentes.find((f) => f.origen === "empezar" && f.servicio === "en-regla")?.conAlta).toBeNull();
  expect(fuentes.find((f) => f.origen === "contacto" && f.servicio === "encargo")?.conAlta).toBeNull();
});

test("el asistente rechaza crear sin aceptar los términos", async () => {
  const res = await empezar(
    post("/api/empezar", {
      punto: "crear",
      tipo: "llc-1",
      residenteEeuu: "no",
      estado: "New Mexico",
      nombre: "Eva Ruiz",
      email: "eva@example.com",
      telefono: "+34 600 000 000",
      alta: { ...ALTA, aceptaTerminos: false },
      consentimiento: true,
    }),
  );
  expect(res.status).toBe(422);
  const json = (await res.json()) as { errors: Record<string, string> };
  expect(json.errors.aceptaTerminos).toBeTruthy();
  expect(await estado.db!.query("select id from nec.leads")).toHaveLength(0);
});

test("si Resend falla, el lead se guarda igual y la respuesta es correcta", async () => {
  const antes = { ...process.env };
  process.env.RESEND_API_KEY = "re_prueba";
  process.env.NEC_AVISO_FROM = "Avisos <avisos@example.com>";
  process.env.NEC_AVISO_TO = "equipo@example.com";
  const log = vi.spyOn(console, "error").mockImplementation(() => {});
  const fetchFalso = vi.fn(async () => {
    throw new TypeError("fetch failed");
  });
  vi.stubGlobal("fetch", fetchFalso);
  try {
    const res = await empezar(
      post("/api/empezar", {
        punto: "crear",
        tipo: "llc-1",
        residenteEeuu: "no",
        estado: "New Mexico",
        nombre: "Marta López",
        email: "marta@example.com",
        telefono: "+34 600 000 000",
        plan: "basico",
        alta: ALTA,
        consentimiento: true,
      }),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true, id: expect.stringMatching(/^[0-9a-f-]{36}$/) });
    expect(fetchFalso).toHaveBeenCalledTimes(1);
    const filas = await estado.db!.query("select servicio from nec.leads where email = 'marta@example.com'");
    expect(filas).toEqual([{ servicio: "arranque" }]);

    const res2 = await contacto(post("/api/contacto", contactoOk, { "x-forwarded-for": "203.0.113.9" }));
    expect(res2.status).toBe(200);
    expect(fetchFalso).toHaveBeenCalledTimes(2);
  } finally {
    vi.unstubAllGlobals();
    log.mockRestore();
    process.env = antes;
  }
});
