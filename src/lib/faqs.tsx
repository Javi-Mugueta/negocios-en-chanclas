import Link from "next/link";
import type { ReactNode } from "react";

export type Faq = { q: string; a: ReactNode };

function Lista({ items, ordenada }: { items: ReactNode[]; ordenada?: boolean }) {
  const Etiqueta = ordenada ? "ol" : "ul";
  return (
    <Etiqueta className={ordenada ? "my-3 list-decimal space-y-1.5 pl-5" : "my-3 list-disc space-y-1.5 pl-5"}>
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </Etiqueta>
  );
}

/** Preguntas frecuentes de la home (copy final de modificaciones-home.md, sección 11). */
export const faqs: Faq[] = [
  {
    q: "¿Qué son los formularios 1120 y 5472?",
    a: (
      <p>
        Si tu LLC es de un solo socio y no resides en EE. UU., cada año tienes que presentar al IRS el
        formulario 5472, que informa de las operaciones entre la LLC y tú: aportaciones, retiradas de
        dinero, préstamos o pagos. Se presenta junto a un 1120 &quot;pro forma&quot;, que no es una
        declaración de impuestos, solo el soporte del 5472. El plazo es el 15 de abril y puede
        ampliarse hasta el 15 de octubre. Si no lo presentas, la multa es de 25.000$ por formulario y
        año.
      </p>
    ),
  },
  {
    q: "¿Quién presenta mis formularios?",
    a: (
      <p>
        Nosotros. Tú nos das los datos de la LLC y los movimientos del año, preparamos los
        formularios y te los enviamos cuando esté todo listo. También nos encargamos de presentarlos
        ante el IRS y te enviamos el justificante.
      </p>
    ),
  },
  {
    q: "Mi LLC no ha tenido actividad este año. ¿Tengo que presentar igual?",
    a: (
      <p>
        Casi siempre sí. Aunque no hayas facturado, pagar con tu dinero las tasas del estado, el
        registered agent o la propia constitución cuenta como una operación entre tú y la LLC, y hay
        que informarla. Si de verdad no hubo ni un solo movimiento, revisamos tu caso. Ten en cuenta
        que el informe anual del estado se paga haya actividad o no (por ejemplo, si tienes una LLC
        en Wyoming debes presentar el informe anual y pagar la tasa de 60$ igual).
      </p>
    ),
  },
  {
    q: "¿Sacar dinero en un cajero cuenta como transferencia?",
    a: (
      <p>
        Sí. Cualquier dinero que pase de la LLC a ti cuenta como una operación con el socio y se
        declara en el 5472, da igual que sea por transferencia, en cajero o con la tarjeta de la
        empresa. Lo mismo vale en sentido contrario: lo que metes en la LLC también se declara.
      </p>
    ),
  },
  {
    q: "¿Dónde encuentro la fecha de creación de mi LLC?",
    a: (
      <p>
        Está en el documento de constitución: los <em>Articles of Organization</em> o el{" "}
        <em>Certificate of Formation</em>, según el estado. También puedes buscar tu LLC en el
        buscador de empresas de la <em>Secretary of State</em> de su estado. No te fíes de la carta
        del EIN (CP 575): su fecha es la de asignación del número, no la de creación de la empresa.
      </p>
    ),
  },
  {
    q: "Quiero cerrar mi LLC. ¿Cómo lo hago?",
    a: (
      <>
        <p>Hay que hacerlo en orden:</p>
        <Lista
          ordenada
          items={[
            <>
              Disolver la LLC en su estado, con los <em>Articles of Dissolution</em> o el{" "}
              <em>Certificate of Cancellation</em>, después de pagar lo pendiente.
            </>,
            "Presentar los últimos 1120 y 5472, marcados como finales.",
            "Pedir al IRS que cierre el EIN.",
            "Cerrar la cuenta bancaria y dar de baja el registered agent.",
          ]}
        />
        <p>
          Si dejas de pagar sin más, la LLC no se cierra: siguen acumulándose tasas y obligaciones.
          Puedes <Link href="/cierra-tu-llc">contratar este servicio</Link> con nosotros con total
          confianza.
        </p>
      </>
    ),
  },
  {
    q: "¿Trabajáis con LLC de cualquier estado?",
    a: (
      <p>
        Sí. Nuestro formulario acepta LLC de New Mexico, Wyoming, Delaware y la mayoría de estados.
        Si el tuyo no aparece, pregúntanos.
      </p>
    ),
  },
  {
    q: "¿Y con corporaciones (C-Corp)?",
    a: (
      <p>
        Sí. Una C-Corp tributa por sí misma en EE. UU. (21 % federal) y presenta un 1120 completo,
        con el 5472 si tiene socios extranjeros.{" "}
        <Link href="/contacto?servicio=corporacion">Escríbenos</Link> y valoramos tu situación concreta.
      </p>
    ),
  },
  {
    q: "¿Cuánto cuesta abrir una LLC?",
    a: (
      <p>
        Con nosotros, puedes tener el plan más básico por 397$ el primer año con tu LLC completa
        (después, la renovación es de 197$ al año). A partir de ahí, en nuestra web encontrarás
        propuestas más ambiciosas y completas. Tú eliges.
      </p>
    ),
  },
  {
    q: "¿Me conviene una LLC?",
    a: (
      <p>
        Te encaja si vendes servicios o productos digitales a clientes de varios países, cobras con
        Stripe o PayPal, o quieres vender en EE. UU. y dar una imagen más internacional. No te encaja
        si lo único que buscas es pagar menos impuestos viviendo en España: aquí la LLC no te libra
        de tributar. Si dudas, te lo decimos antes de cobrarte nada.
      </p>
    ),
  },
  {
    q: "¿Necesito ser residente o viajar a EE. UU. para abrirla?",
    a: (
      <p>
        No. Todo se hace online, desde el sofá y en chanclas. No necesitas visado, ni número de la
        seguridad social americana (SSN), ni ITIN. Con tu pasaporte basta.
      </p>
    ),
  },
  {
    q: "¿Sirve para freelancers, ecommerce, agencias o creadores de contenido?",
    a: (
      <p>
        Sí, es justo el perfil habitual. Freelancers con clientes internacionales, tiendas online con
        Shopify o Amazon, agencias de marketing o desarrollo, creadores que cobran de plataformas,
        infoproductos, SaaS… Si tu negocio vive en internet y vende fuera de tu país, probablemente
        encaje.
      </p>
    ),
  },
  {
    q: "¿Paga impuestos una LLC en EE. UU.?",
    a: (
      <p>
        Si eres el único socio y no tienes actividad física en EE. UU. (ni oficina, ni empleados, ni
        almacén propio), por lo general la LLC no paga impuesto federal sobre la renta: es
        fiscalmente transparente. Eso no quiere decir que no pague en ningún sitio: los beneficios
        tributan en tu país de residencia. Además, tienes que presentar cada año los formularios
        informativos y pagar las tasas del estado.
      </p>
    ),
  },
  {
    q: "¿Me ayuda a cobrar de clientes internacionales?",
    a: (
      <p>
        Sí. Con una LLC y su EIN puedes abrir cuentas en Stripe, Whop o PayPal como empresa
        americana, vender en Amazon US y facturar en dólares a clientes de EE. UU. de forma que les
        resulta familiar. Muchos clientes americanos prefieren trabajar con una empresa de allí
        antes que con un autónomo extranjero.
      </p>
    ),
  },
  {
    q: "¿Puedo abrir una cuenta bancaria en EE. UU.?",
    a: (
      <p>
        Sí. Cuando tengas la LLC y el EIN, puedes solicitarla online con bancos digitales como
        Mercury, Relay o Wise Business. La apertura no forma parte de nuestro servicio porque la
        aprobación depende del banco, pero te decimos qué documentos te van a pedir para que la
        solicitud vaya a la primera. Igualmente, puedes contratar ese servicio aparte con nosotros si
        quieres que un experto abra la cuenta 1a1 contigo.
      </p>
    ),
  },
  {
    q: "¿Cuánto se tarda en tener la LLC operativa?",
    a: (
      <p>
        Entre 20 y 25 días naturales desde que nos pasas los datos hasta que tienes la LLC
        constituida y el EIN asignado. A partir de ahí puedes abrir la cuenta bancaria y empezar a
        facturar.
      </p>
    ),
  },
  {
    q: "¿Qué incluye vuestro servicio?",
    a: (
      // «Dashboard de control de tus obligaciones» queda fuera: descartado por ahora
      // (correcciones-web-nec.md, sección 3).
      <Lista
        items={[
          "Constitución de la LLC en Nuevo México. Si la quieres en otro estado, lo vemos en el encargo personalizado.",
          "Obtención del EIN, el número fiscal de la empresa.",
          "Registered agent durante el primer año.",
          "Operating Agreement (modelo estándar).",
        ]}
      />
    ),
  },
  {
    q: "¿Es legal? ¿No es para evadir impuestos?",
    a: (
      <p>
        Es completamente legal: millones de personas no residentes tienen una LLC. Lo que no es legal
        es usarla para esconder ingresos a Hacienda. Si vives en España, lo que gana tu LLC tributa
        en España y hay que declararlo. Nosotros te lo decimos claro desde el principio y tú tomas
        tus decisiones y eres responsable de ellas.
      </p>
    ),
  },
  {
    q: "¿Qué pasa si no presento nada?",
    a: (
      <p>
        Que te puede salir carísimo. El IRS pone multas de 25.000$ por cada formulario 5472 que no se
        presente, por cada año. Y si no pagas el informe anual del estado, la LLC puede quedar
        disuelta de oficio. Para eso estamos: para que no se te pase ningún plazo.
      </p>
    ),
  },
  {
    q: "¿Por qué con vosotros y no con Firstbase, Doola u otra plataforma?",
    a: (
      <p>
        Esas plataformas constituyen la LLC y poco más. Lo que no hacen es explicarte cómo tributa en
        España ni ayudarte con tu Hacienda. Detrás de Negocios en Chanclas hay asesores fiscales
        especializados en estructuras internacionales que conocen las dos orillas: la americana y la
        española. Y te hablamos en español, sin bots.
      </p>
    ),
  },
  {
    q: "¿Me ayudáis también con Hacienda en España?",
    a: (
      <p>
        Podemos hacerlo, es de hecho lo que más nos diferencia porque contamos con abogados,
        asesores financieros y fiscales, pero debes tener en cuenta que esto se sale de un servicio
        desatendido e implica costes adicionales de consultoría.
      </p>
    ),
  },
  {
    q: "¿Puedo cambiarme a vosotros si ya tengo LLC con otro proveedor?",
    a: (
      <p>
        Claro. Nos pasas la documentación de tu LLC (documento de constitución, carta del EIN y
        declaraciones anteriores), cambiamos el registered agent si hace falta y nos encargamos del
        cumplimiento a partir de ese momento. Si hay algo pendiente de otros años, lo revisamos y te
        decimos cómo regularizarlo. Si estás en esta situación, lo mejor es que contactes con
        nosotros antes de contratar ningún servicio.
      </p>
    ),
  },
  {
    q: "¿Puedo hablar con alguien antes de decidir?",
    a: (
      <p>
        Sí. Puedes reservar una llamada gratuita de 15 minutos y te decimos si la LLC tiene sentido
        para tu caso. Si no lo tiene, también te lo diremos. Solo contacta con nosotros a través del{" "}
        <Link href="/contacto">formulario</Link>.
      </p>
    ),
  },
  {
    q: "¿Qué necesito para empezar?",
    a: (
      <>
        <Lista
          items={[
            "Tu pasaporte.",
            "Dos o tres opciones de nombre para la LLC.",
            "Tu dirección de residencia.",
            "Una breve descripción de la actividad.",
            "Un email y un teléfono de contacto.",
          ]}
        />
        <p>Con eso arrancamos.</p>
      </>
    ),
  },
];
