import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, CalendarClock, FileCheck2, IdCard, ScrollText, UserCheck } from "lucide-react";
import { CtaLink } from "@/components/brand/cta";
import { FinalCta } from "@/components/final-cta";
import {
  CIERRE,
  dolares,
  estadoLlc,
  FORMULARIOS_1120,
  LISTA_ESTADOS_LLC,
  PLANES_APERTURA,
  TEXTOS_PRECIO,
  type ClaveEstadoLlc,
} from "@/lib/precios";
import { AVISO_PLAZO, checklistPresentacion, PLAZO } from "@/lib/site";

export const metadata: Metadata = {
  title: "Cómo funciona una LLC",
  description:
    "Qué es una LLC, cómo elegir estado, qué documentos necesitas y qué obligaciones tienes cada año con el IRS. Explicado en español y sin tecnicismos.",
};

/** Copy validado por Santiago el 2026-11-27 (`como-funciona-una-llc.md`). */

const indice = [
  { id: "que-es", label: "Qué es una LLC" },
  { id: "por-que", label: "Por qué tanta gente la elige" },
  { id: "estado", label: "Elegir estado" },
  { id: "documentos", label: "Los documentos clave" },
  { id: "cada-ano", label: "Lo que toca cada año" },
  { id: "cerrar", label: "Cerrar una LLC" },
];

const enlace = "font-semibold text-tinta underline decoration-chancla/40 underline-offset-4";

/** Lo que pide cada estado al año (apartado 03). Los importes salen de precios.ts. */
function anualEstado(clave: ClaveEstadoLlc): string {
  const e = estadoLlc(clave);
  switch (clave) {
    case "New Mexico":
      return "Nada: las LLC no presentan informe anual estatal";
    case "Texas":
      return "Un informe informativo sin coste, mientras factures menos de 2.650.000 $ al año";
    case "Utah":
      return `Renovación anual: ${dolares(e.tasaAnual)}`;
    case "Wyoming":
      return `Informe anual: desde ${dolares(e.tasaAnual)}`;
    case "Florida":
      return `Informe anual: ${dolares(e.tasaAnual)}, antes del 1 de mayo`;
    case "Nevada":
      return `Lista anual y licencia: ${dolares(e.tasaAnual)}`;
    case "Delaware":
      return `Impuesto anual: ${dolares(e.tasaAnual)}, antes del 1 de junio`;
  }
}

/** Abrir la LLC con nosotros (Plan Básico; el Estándar suma 100 $). */
function aperturaEstado(clave: ClaveEstadoLlc): string {
  const e = estadoLlc(clave);
  const plan = dolares(PLANES_APERTURA.basico.precio);
  if (e.tasasIncluidas) return `Desde ${plan} (tasa del estado incluida)`;
  return `${plan} + ${dolares(e.tasaConstitucion)} de ${e.tasasEnPlural ? "tasas" : "tasa"} del estado`;
}

// Orden del documento validado.
const estadosGuia: ClaveEstadoLlc[] = ["New Mexico", "Texas", "Utah", "Wyoming", "Florida", "Nevada", "Delaware"];

const documentos = [
  {
    icon: ScrollText,
    titulo: "Articles of Organization",
    texto: (
      <>
        El documento con el que el estado registra tu LLC. Guárdalo bien: en él figura la fecha de constitución, que
        te pedirán cada año.
      </>
    ),
  },
  {
    icon: IdCard,
    titulo: "EIN",
    texto: (
      <>
        El número de identificación fiscal de tu empresa ante el IRS. Lo necesitas para el banco, para facturar y para
        presentar los formularios.
      </>
    ),
  },
  {
    icon: FileCheck2,
    titulo: "Operating Agreement",
    texto: (
      <>
        Las reglas internas de la LLC: de quién es cada parte y cómo se decide. Imprescindible si sois varios socios.
        Con nosotros va incluido: un modelo estándar si eres el único socio, y uno para varios socios. Si sois más de 10
        o queréis reglas a vuestra medida, podemos prepararos un{" "}
        <Link href="/servicios#operating-agreement" className={enlace}>
          Operating Agreement personalizado
        </Link>
        .
      </>
    ),
  },
  {
    icon: UserCheck,
    titulo: "Agente registrado (registered agent)",
    texto: (
      <>
        Toda LLC necesita una dirección y un representante en su estado para recibir las notificaciones oficiales. Con
        nosotros, el primer año va incluido en el precio que pagas al abrir la LLC.
      </>
    ),
  },
];

export default function ComoFuncionaPage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 left-1/2 size-[40rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,var(--agua)_0%,transparent_60%)] opacity-80 blur-2xl"
        />
        <div className="relative mx-auto max-w-4xl px-5 pt-14 pb-16 text-center sm:px-8 md:pt-20">
          <h1 className="text-5xl leading-[0.95] font-extrabold md:text-7xl">
            Cómo funciona una LLC,{" "}
            <span className="font-serif font-normal text-chancla italic">explicado en la toalla.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-tinta/70 md:text-xl">
            Todo lo que necesitas entender antes de montar (o mantener) tu empresa en Estados Unidos, en diez minutos
            de lectura.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-12 px-5 pb-24 sm:px-8 grid-cols-1 lg:grid-cols-12">
        <aside className="lg:col-span-3">
          <nav aria-label="Índice de la guía" className="lg:sticky lg:top-28">
            <p className="font-mono text-xs tracking-[0.18em] text-tinta/50 uppercase">En esta guía</p>
            <ol className="mt-4 flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:gap-0 lg:overflow-visible lg:border-l lg:border-tinta/10">
              {indice.map((item, i) => (
                <li key={item.id} className="shrink-0">
                  <a
                    href={`#${item.id}`}
                    className="block rounded-full border border-tinta/10 bg-card px-4 py-2 text-sm text-tinta/70 transition hover:text-tinta lg:-ml-px lg:rounded-none lg:border-0 lg:border-l-2 lg:border-transparent lg:bg-transparent lg:py-2.5 lg:hover:border-chancla"
                  >
                    <span className="mr-2 font-mono text-xs text-chancla-2">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {item.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>

        <article className="space-y-24 lg:col-span-9 lg:pl-6">
          <Section id="que-es" n="01" titulo="Qué es una LLC">
            <p>
              Una LLC (<em>Limited Liability Company</em>) es la forma más habitual de tener una pequeña empresa en
              Estados Unidos. Piensa en ella como una sociedad de responsabilidad limitada, pero más flexible y con
              menos formalidades.
            </p>
            <p>
              Su gran ventaja está en el nombre: <strong>responsabilidad limitada</strong>. Las deudas y obligaciones de
              la empresa son de la empresa, no tuyas. Igualmente, mantienes la privacidad ante terceros en tu gestión:
              cobros, facturas, pasarelas de pago, etc.
            </p>
            <p>
              Puede tener <strong>un solo socio</strong> (<em>single member</em>) o <strong>varios</strong> (
              <em>multi-member</em>). Esa diferencia cambia lo que hay que presentar cada año, como verás en el apartado
              05.
            </p>
            <Callout>
              una LLC se crea en un estado concreto, no «en Estados Unidos» en general. Por eso la primera gran
              decisión es dónde registrarla.
            </Callout>
          </Section>

          <Section id="por-que" n="02" titulo="Por qué tanta gente la elige">
            <ul className="grid gap-4 sm:grid-cols-2">
              {[
                ["No necesitas vivir allí.", "Puedes ser socio de una LLC sin residir en EE. UU. ni tener la nacionalidad estadounidense."],
                ["Poca burocracia.", "Sin juntas obligatorias ni contabilidad financiera tediosa. El día a día es sencillo."],
                ["Flexible.", "Puede tener un socio o varios, y repartir la propiedad y las decisiones como acordéis."],
                ["Puerta al mercado de EE. UU.", "Facilita trabajar con clientes, plataformas y proveedores estadounidenses."],
              ].map(([t, d]) => (
                <li key={t} className="rounded-3xl border border-tinta/10 bg-card p-6">
                  <p className="font-display text-lg font-bold text-tinta">{t}</p>
                  <p className="mt-2 text-base">{d}</p>
                </li>
              ))}
            </ul>
            <div className="flex gap-4 rounded-3xl border border-chancla/30 bg-chancla/5 p-6 text-base text-tinta/85">
              <AlertTriangle className="mt-0.5 size-6 shrink-0 text-chancla-2" aria-hidden="true" />
              <p>
                <span className="font-display font-bold text-tinta">
                  Ojo, que esto no va (siempre) de no pagar impuestos.
                </span>{" "}
                Si no tienes actividad física en EE. UU., normalmente tu LLC no paga impuesto federal allí. Pero tú sigues
                tributando en tu país de residencia por lo que gana la LLC. Cómo tributa en tu caso depende de dónde vivas
                y de cómo uses la LLC, y eso conviene mirarlo con un asesor de tu país antes de empezar.
              </p>
            </div>
          </Section>

          <Section id="estado" n="03" titulo="Elegir estado">
            <p>
              Cada estado tiene sus tasas y sus obligaciones anuales. Aunque podríamos abrir una LLC en cualquier estado,
              los únicos <em>chancla friendly</em> son estos siete:
            </p>
            <div className="overflow-x-auto rounded-3xl border border-tinta/10 bg-card">
              <table className="w-full min-w-[34rem] text-left text-base">
                <thead className="bg-tinta text-arena">
                  <tr>
                    <th scope="col" className="p-4 font-semibold">
                      Estado
                    </th>
                    <th scope="col" className="p-4 font-semibold">
                      Lo que pide cada año
                    </th>
                    <th scope="col" className="p-4 font-semibold">
                      Abrir tu LLC con nosotros
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {estadosGuia.map((clave) => (
                    <tr key={clave} className="border-t border-tinta/10 align-top">
                      <th scope="row" className="p-4 font-display font-bold text-tinta">
                        {estadoLlc(clave).nombre}
                      </th>
                      <td className="p-4">{anualEstado(clave)}</td>
                      <td className="p-4 whitespace-nowrap">{aperturaEstado(clave)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              No hay un estado «mejor» para todo el mundo: depende de tu actividad, de dónde estén tus clientes y de
              cuánto mantenimiento quieras asumir. Si dudas, la mayoría de nuestros clientes elige{" "}
              <strong>Nuevo México</strong>: es el más ligero de mantener.
            </p>
            <p>
              ¿Prefieres otro estado?{" "}
              <Link href="/contacto?servicio=arranque" className={enlace}>
                Escríbenos
              </Link>{" "}
              y lo valoramos contigo.
            </p>
          </Section>

          <Section id="documentos" n="04" titulo="Los documentos clave">
            <div className="grid gap-4 sm:grid-cols-2">
              {documentos.map(({ icon: Icon, titulo, texto }) => (
                <div key={titulo} className="rounded-3xl border border-tinta/10 bg-card p-6">
                  <span className="grid size-11 place-items-center rounded-2xl bg-chancla/12 text-chancla-2">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <p className="mt-4 font-display text-lg font-bold text-tinta">{titulo}</p>
                  <p className="mt-2 text-base">{texto}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section id="cada-ano" n="05" titulo="Lo que toca cada año">
            <p>
              Lo que hay que presentar al IRS depende de cuántos socios tenga tu LLC. Aunque no haya impuesto que pagar,
              no presentarlo puede acarrear sanciones importantes.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-tinta/10 bg-card p-6">
                <h3 className="font-display text-xl font-bold text-tinta">Si eres el único socio y no resides en EE. UU.</h3>
                <p className="mt-3 text-base">
                  Lo habitual es presentar cada año el <strong>formulario 5472</strong> junto a un{" "}
                  <strong>formulario 1120 pro forma</strong>. Con ellos informas al IRS de las operaciones entre tú y tu
                  empresa: lo que aportas, lo que retiras y, el primer año, los gastos de constitución.
                </p>
                <ul className="mt-4 space-y-2 text-base">
                  <li className="flex gap-2">
                    <CalendarClock className="mt-1 size-4 shrink-0 text-chancla-2" aria-hidden="true" />
                    <span>
                      <strong className="text-tinta">Plazo del IRS:</strong> 15 de abril del año siguiente (LLC con año
                      natural).
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <CalendarClock className="mt-1 size-4 shrink-0 text-chancla-2" aria-hidden="true" />
                    <span>
                      <strong className="text-tinta">Con nosotros:</strong> {dolares(FORMULARIOS_1120)}, sea cual sea el
                      estado. Mándanos tus datos <strong className="text-tinta">antes del 1 de abril</strong>.
                    </span>
                  </li>
                </ul>
              </div>
              <div className="rounded-3xl border border-tinta/10 bg-card p-6">
                <h3 className="font-display text-xl font-bold text-tinta">Si sois varios socios</h3>
                <p className="mt-3 text-base">
                  La LLC presenta cada año el <strong>Form 1065</strong> y un <strong>K-1 por cada socio</strong>, en
                  lugar del 5472.
                </p>
                <ul className="mt-4 space-y-2 text-base">
                  <li className="flex gap-2">
                    <CalendarClock className="mt-1 size-4 shrink-0 text-chancla-2" aria-hidden="true" />
                    <span>
                      <strong className="text-tinta">Plazo del IRS:</strong> 15 de marzo del año siguiente.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <CalendarClock className="mt-1 size-4 shrink-0 text-chancla-2" aria-hidden="true" />
                    <span>
                      <strong className="text-tinta">Con nosotros:</strong> {TEXTOS_PRECIO.formularios1065}. Mándanos
                      vuestros datos <strong className="text-tinta">antes del 1 de marzo</strong>.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
            <h3 className="pt-2 font-display text-2xl font-bold text-tinta">Lo que te pedimos (un socio)</h3>
            <p>Esto es lo que te pedimos para prepararlos. Tenlo a mano y en un rato está hecho:</p>
            <div className="grid gap-4 md:grid-cols-3">
              {checklistPresentacion.map((g) => (
                <div key={g.grupo} className="rounded-3xl bg-arena-2 p-6">
                  <p className="font-display text-lg font-bold text-tinta">{g.grupo}</p>
                  <ul className="mt-3 space-y-2 text-base">
                    {g.items.map((it) => (
                      <li key={it} className="flex gap-2">
                        <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-chancla" />
                        {it}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <Callout>
              ¿un año sin actividad? Escribe «0» en los campos que no tengas. Y recuerda: sacar efectivo de la cuenta de
              la empresa en un cajero cuenta como dinero que pasa de la LLC a ti.
            </Callout>
            <p>
              <strong className="text-tinta">Y además, el estado.</strong> Según dónde esté tu LLC, puede haber un
              informe o una tasa anual estatal. Mira la{" "}
              <a href="#estado" className={enlace}>
                tabla del apartado 03
              </a>{" "}
              para saber cuánto y cuándo.
            </p>
            <div className="pt-2">
              <CtaLink href="/formularios-llc" variant="dark">
                Presentar mis formularios
              </CtaLink>
            </div>
          </Section>

          <Section id="cerrar" n="06" titulo="Cerrar una LLC">
            <p>
              Si ya no usas tu LLC, dejar de mantenerla no la cierra: siguen corriendo tasas y obligaciones con el estado
              y con el IRS. Hay que hacerlo en orden:
            </p>
            <ol className="list-decimal space-y-2 pl-6">
              <li>
                Disolver la LLC en su estado, con los <em>Articles of Dissolution</em> o el{" "}
                <em>Certificate of Cancellation</em>, después de regularizar lo que quedara pendiente.
              </li>
              <li>Presentar los últimos formularios (1120 y 5472), marcados como finales en la casilla correspondiente.</li>
              <li>Pedir al IRS que cierre el EIN, lo cual solo hará si todo está presentado y en orden.</li>
              <li>
                Cerrar la cuenta bancaria (aunque esto realmente se podría hacer antes) y dar de baja el registered agent.
              </li>
            </ol>
            <p>
              Nosotros gestionamos el cierre de tu LLC si ya no la usas (o si la has usado demasiado): nos encargamos de
              la disolución ante el estado, de los formularios 1120 y 5472 finales y del cierre del EIN, en{" "}
              <strong>{PLAZO}</strong>. Cuesta <strong>{dolares(CIERRE)} + la tasa de disolución del estado</strong> (en
              Nuevo México, incluida), para LLC <strong>al día</strong> y de <strong>un solo socio</strong> de{" "}
              {LISTA_ESTADOS_LLC}.
            </p>
            <p>
              <em>{AVISO_PLAZO}</em>
            </p>
            <div className="pt-2">
              <CtaLink href="/cierra-tu-llc" variant="dark">
                Ver el servicio de cierre
              </CtaLink>
            </div>
          </Section>

          <p className="rounded-2xl border border-dashed border-tinta/20 p-5 text-sm text-tinta/60">
            Esta guía es información general y orientativa. No sustituye el asesoramiento fiscal o legal profesional
            sobre tu caso concreto.
          </p>
        </article>
      </div>

      <FinalCta titulo="¿Lo ves más claro?" subtitulo="Pues ahora, a la sombra." />
    </>
  );
}

function Section({
  id,
  n,
  titulo,
  children,
}: {
  id: string;
  n: string;
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28">
      <div className="flex items-baseline gap-4">
        <span className="font-mono text-sm text-chancla-2">{n}</span>
        <h2 className="text-3xl font-bold md:text-5xl">{titulo}</h2>
      </div>
      <div className="mt-8 space-y-6 text-lg leading-relaxed text-tinta/75">{children}</div>
    </section>
  );
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative rounded-3xl border-l-4 border-sol bg-sol/15 p-6 text-base text-tinta/85">
      <span className="font-display font-bold text-tinta">Truco de chiringuito: </span>
      {children}
    </div>
  );
}
