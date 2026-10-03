import type { Metadata } from "next";
import { AlertTriangle, CalendarClock, FileCheck2, IdCard, ScrollText, UserCheck } from "lucide-react";
import { CtaLink, Eyebrow } from "@/components/brand/cta";
import { FinalCta } from "@/components/final-cta";
import { Reveal } from "@/components/reveal";
import { checklistPresentacion } from "@/lib/site";

export const metadata: Metadata = {
  title: "Cómo funciona una LLC",
  description:
    "Qué es una LLC, cómo elegir estado, qué documentos necesitas y qué obligaciones tienes cada año con el IRS. Explicado en español y sin tecnicismos.",
};

const indice = [
  { id: "que-es", label: "Qué es una LLC" },
  { id: "por-que", label: "Por qué tanta gente la elige" },
  { id: "estado", label: "Elegir estado" },
  { id: "documentos", label: "Los documentos clave" },
  { id: "cada-ano", label: "Lo que toca cada año" },
  { id: "cerrar", label: "Cerrar una LLC" },
];

const estadosComparados = [
  {
    nombre: "New Mexico",
    nota: "No exige informe anual estatal a las LLC. Mantenimiento muy ligero.",
  },
  {
    nombre: "Wyoming",
    nota: "Pide un informe anual con una tasa reducida. Muy popular por su sencillez.",
  },
  {
    nombre: "Delaware",
    nota: "Referencia en derecho societario. Las LLC pagan un impuesto anual fijo al estado.",
  },
];

const documentos = [
  {
    icon: ScrollText,
    titulo: "Articles of Organization",
    texto:
      "El documento con el que el estado registra tu LLC. Guárdalo bien: en él figura la fecha de creación, que te pedirán cada año.",
  },
  {
    icon: IdCard,
    titulo: "EIN",
    texto:
      "El número de identificación fiscal de tu empresa ante el IRS. Lo necesitas para el banco, para facturar y para tus presentaciones.",
  },
  {
    icon: FileCheck2,
    titulo: "Operating Agreement",
    texto:
      "Las reglas internas de la LLC: quién es dueño de qué y cómo se decide. Imprescindible si sois dos miembros.",
  },
  {
    icon: UserCheck,
    titulo: "Agente registrado",
    texto:
      "Toda LLC necesita una dirección y un representante en su estado para recibir notificaciones oficiales.",
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
          <Eyebrow className="justify-center">Guía sin tecnicismos</Eyebrow>
          <h1 className="mt-5 text-5xl leading-[0.95] font-extrabold md:text-7xl">
            Cómo funciona una LLC,{" "}
            <span className="font-serif font-normal text-chancla italic">explicado en la toalla.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-tinta/70 md:text-xl">
            Todo lo que necesitas entender antes de montar (o mantener) tu empresa en Estados
            Unidos, en diez minutos de lectura.
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
              Una <strong>LLC</strong> (Limited Liability Company) es la forma más común de tener
              una pequeña empresa en Estados Unidos. Piensa en ella como una sociedad de
              responsabilidad limitada, pero más flexible y con menos formalidades.
            </p>
            <p>
              Su gran ventaja está en el nombre: <em>responsabilidad limitada</em>. Las deudas y
              obligaciones de la empresa son de la empresa, no tuyas. Tu patrimonio personal queda a
              un lado, siempre que mantengas separadas las cuentas de la LLC y las tuyas.
            </p>
            <Callout>
              Una LLC se crea en un estado concreto, no «en Estados Unidos» en general. Por eso la
              primera gran decisión es dónde registrarla.
            </Callout>
          </Section>

          <Section id="por-que" n="02" titulo="Por qué tanta gente la elige">
            <ul className="grid gap-4 sm:grid-cols-2">
              {[
                ["No necesitas vivir allí", "Puedes ser miembro de una LLC sin residir en EE. UU. ni tener nacionalidad estadounidense."],
                ["Poca burocracia", "Sin juntas obligatorias ni actas complicadas. La gestión diaria es sencilla."],
                ["Flexible", "Puede tener uno o varios miembros, y repartir propiedad y decisiones como acordéis."],
                ["Puerta al mercado de EE. UU.", "Facilita trabajar con clientes, plataformas y proveedores estadounidenses."],
              ].map(([t, d]) => (
                <li key={t} className="rounded-3xl border border-tinta/10 bg-card p-6">
                  <p className="font-display text-lg font-bold text-tinta">{t}</p>
                  <p className="mt-2 text-base">{d}</p>
                </li>
              ))}
            </ul>
          </Section>

          <Section id="estado" n="03" titulo="Elegir estado">
            <p>
              Cada estado tiene sus tasas, sus informes anuales y su nivel de privacidad. Para quien
              no reside en EE. UU., estos tres son de los más habituales:
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              {estadosComparados.map((e, i) => (
                <Reveal key={e.nombre} delay={i * 90}>
                  <div className="h-full rounded-3xl bg-tinta p-6 text-arena">
                    <p className="font-mono text-xs tracking-[0.18em] text-sol uppercase">Estado</p>
                    <p className="mt-2 font-display text-2xl font-bold">{e.nombre}</p>
                    <p className="mt-3 text-base text-arena/70">{e.nota}</p>
                  </div>
                </Reveal>
              ))}
            </div>
            <p>
              No hay un estado «mejor» para todo el mundo: depende de tu actividad, de dónde están
              tus clientes y de cuánto mantenimiento quieres asumir. Te ayudamos a decidir.
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
              Si tienes una LLC de un solo miembro y no resides en EE. UU., lo habitual es que cada
              año tengas que presentar el <strong>formulario 5472</strong> junto a un{" "}
              <strong>formulario 1120 pro forma</strong>. Con ellos informas al IRS de las
              operaciones entre tú y tu empresa: lo que aportas, lo que retiras y los gastos de
              constitución el primer año.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex gap-4 rounded-3xl border border-tinta/10 bg-card p-6">
                <CalendarClock className="size-6 shrink-0 text-chancla-2" aria-hidden="true" />
                <p className="text-base">
                  Para las LLC con año natural, el plazo general termina el{" "}
                  <strong className="text-tinta">15 de abril</strong> del año siguiente.
                </p>
              </div>
              <div className="flex gap-4 rounded-3xl border border-chancla/30 bg-chancla/5 p-6">
                <AlertTriangle className="size-6 shrink-0 text-chancla-2" aria-hidden="true" />
                <p className="text-base">
                  Aunque no haya impuesto que pagar, no presentarlo puede acarrear sanciones
                  importantes del IRS. Mejor no olvidarlo.
                </p>
              </div>
            </div>
            <p>Esto es lo que te pedimos para prepararla. Tenlo a mano y en un rato está hecho:</p>
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
              ¿Un año sin actividad? Escribe «0» en los campos vacíos. Y recuerda: sacar efectivo de
              la cuenta de la empresa en un cajero cuenta como transferencia al miembro.
            </Callout>
            <p>
              Además, según el estado, puede haber un informe o una tasa anual estatal. Te lo
              recordamos para que no te pille por sorpresa.
            </p>
          </Section>

          <Section id="cerrar" n="06" titulo="Cerrar una LLC">
            <p>
              Si decides cerrar, no basta con dejar de usarla. Hay que presentar una última
              declaración ante el IRS y, según el estado, tramitar la disolución.
            </p>
            <p>
              Con nosotros es sencillo: en tu presentación anual marcas la casilla{" "}
              <strong>«Última presentación»</strong> y la declaración se tramita como la última de
              tu empresa.
            </p>
            <div className="pt-2">
              <CtaLink href="/servicios#cierre" variant="dark">
                Ver el servicio de cierre
              </CtaLink>
            </div>
          </Section>

          <p className="rounded-2xl border border-dashed border-tinta/20 p-5 text-sm text-tinta/60">
            Esta guía es información general y orientativa. No sustituye el asesoramiento fiscal o
            legal profesional sobre tu caso concreto.
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
