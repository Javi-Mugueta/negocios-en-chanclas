import Link from "next/link";
import { ENLACE_PRIVACIDAD, TERMINOS_VERSION } from "@/lib/privacidad";
import { contacto } from "@/lib/site";

/**
 * Términos y Condiciones y Política de devoluciones (texto validado por Santiago el 2026-11-27,
 * `terminos-y-condiciones.md`, secciones 1 a 3). Se publica en /legal y en /terminos.
 * No cambiar el texto sin una nueva validación: cada cambio sube `TERMINOS_VERSION`.
 */

const enlace = "font-semibold text-tinta underline underline-offset-4";

function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="pt-2 text-xl font-bold text-tinta">{children}</h3>;
}

function Lista({ children, ordenada = false }: { children: React.ReactNode; ordenada?: boolean }) {
  const Tag = ordenada ? "ol" : "ul";
  return <Tag className={ordenada ? "list-decimal space-y-2 pl-6" : "list-disc space-y-2 pl-6"}>{children}</Tag>;
}

export function ResumenTerminos() {
  return (
    <div className="rounded-3xl border-l-4 border-sol bg-sol/15 p-6 text-base text-tinta/85">
      <p className="font-display text-lg font-bold text-tinta">Lo importante, en corto:</p>
      <ul className="mt-3 list-disc space-y-2 pl-5">
        <li>
          Contratas con <strong>Leaving Vorkuta LLC</strong>, como profesional que quiere tener una empresa en EE. UU.
          Pagas en dólares, a través de Whop.
        </li>
        <li>
          <strong>Empezamos a trabajar en cuanto pagas.</strong> Los plazos que damos son orientativos: dependemos de
          oficinas públicas de EE. UU.
        </li>
        <li>
          Tus datos tienen que ser <strong>ciertos y completos</strong>. Si no lo son, o no nos los mandas, no hay
          devolución.
        </li>
        <li>
          <strong>Si no hemos empezado, te devolvemos todo.</strong> Una vez presentado un trámite ante el estado o el
          IRS, no hay devolución.
        </li>
        <li>No somos tu asesor fiscal en tu país: te ayudamos con la LLC en EE. UU.</li>
      </ul>
    </div>
  );
}

export function TerminosYCondiciones() {
  return (
    <section id="terminos" className="scroll-mt-28 space-y-4">
      <h2 className="text-2xl font-bold text-tinta">Términos y Condiciones</h2>
      <ResumenTerminos />

      <H3>2.1 Quién presta el servicio</H3>
      <p>
        Los servicios de Negocios en Chanclas los presta <strong>Leaving Vorkuta LLC</strong> («nosotros»), sociedad
        de Nuevo México (EE. UU.):
      </p>
      <Lista>
        <li>4300 Ridgecrest Dr SE, Suite L #532, Rio Rancho, NM 87124, EE. UU.</li>
        <li>EIN 36-5069633.</li>
        <li>
          Contacto: formulario de{" "}
          <Link href="/contacto" className={enlace}>
            /contacto
          </Link>{" "}
          y WhatsApp{" "}
          <a href={contacto.whatsapp.espana.href} target="_blank" rel="noopener noreferrer" className={enlace}>
            {contacto.whatsapp.espana.visible}
          </a>{" "}
          /{" "}
          <a href={contacto.whatsapp.eeuu.href} target="_blank" rel="noopener noreferrer" className={enlace}>
            {contacto.whatsapp.eeuu.visible}
          </a>
          .
        </li>
      </Lista>

      <H3>2.2 A quién van dirigidos</H3>
      <p>
        Nuestros servicios están pensados para <strong>emprendedores y profesionales</strong> que quieren constituir,
        mantener o cerrar una empresa en EE. UU.{" "}
        <strong>Al contratar declaras que lo haces con fines empresariales o profesionales</strong>, no como
        consumidor.
      </p>

      <H3>2.3 Qué servicios ofrecemos</H3>
      <p>
        Los descritos en la web, con el alcance, el precio y las condiciones que aparecen en cada página en el momento
        de la compra:
      </p>
      <Lista>
        <li>
          <strong>Apertura de LLC:</strong> Plan Básico y Plan Estándar, de un socio o de varios.
        </li>
        <li>
          <strong>Formularios anuales:</strong> 1120/5472 para un socio; Form 1065 + K-1 para varios socios.
        </li>
        <li>
          <strong>Cierre de LLC.</strong>
        </li>
        <li>
          <strong>Servicios a medida por contacto:</strong> C-Corp, cambio de titularidad, Operating Agreement
          personalizado y operaciones societarias.
        </li>
      </Lista>
      <p>
        <strong>No incluyen</strong>, salvo que la página del servicio diga lo contrario:
      </p>
      <Lista>
        <li>la apertura de la cuenta bancaria, que es un servicio aparte;</li>
        <li>las obligaciones estatales anuales de la LLC (informe anual, franchise tax…);</li>
        <li>las obligaciones fiscales en tu país de residencia;</li>
        <li>el asesoramiento fiscal o legal sobre tu situación personal.</li>
      </Lista>

      <H3>2.4 Cómo se contrata</H3>
      <Lista ordenada>
        <li>Rellenas el formulario del servicio con datos ciertos y completos y aceptas estas condiciones.</li>
        <li>Pagas en Whop el plan que corresponde a tu caso (servicio, estado y número de socios).</li>
        <li>
          <strong>
            El encargo queda aceptado y empezamos a trabajar en cuanto recibimos el pago
          </strong>{" "}
          y comprobamos que coincide con tu formulario. Al pagar, nos pides expresamente que empecemos de inmediato.
        </li>
      </Lista>
      <p>Si el plan pagado no corresponde a tu formulario (por ejemplo, otro estado u otro número de socios):</p>
      <Lista>
        <li>si falta dinero, te pedimos la diferencia antes de empezar;</li>
        <li>si sobra, te devolvemos la diferencia.</li>
      </Lista>
      <p>
        Si pagas <strong>sin haber rellenado el formulario</strong>, te escribimos al email del pago para pedirte los
        datos. El encargo no empieza hasta que los tengamos.
      </p>

      <H3>2.5 Precios y pago</H3>
      <Lista>
        <li>
          Precios en <strong>dólares estadounidenses (USD)</strong>, tal y como aparecen en la web al contratar. Fuera
          de Nuevo México incluyen, desglosada, la tasa pública del estado, que pagamos nosotros por ti.
        </li>
        <li>
          El pago se procesa en <strong>Whop</strong>. No vemos ni guardamos los datos de tu tarjeta.
        </li>
        <li>No añadimos impuestos al precio. Las comisiones de cambio de divisa de tu banco corren de tu cuenta.</li>
        <li>
          <strong>Usa en Whop el mismo email que nos das en el formulario</strong>: así unimos tu pago con tus datos.
        </li>
        <li>
          Si un organismo público cambia sus tasas entre tu pago y la presentación, te lo comunicamos: si suben, nos
          pagas la diferencia; si bajan, te la devolvemos.
        </li>
      </Lista>

      <H3>2.6 Lo que te comprometes a hacer</H3>
      <Lista>
        <li>
          Darnos <strong>datos ciertos, completos y a tiempo</strong>, y avisarnos si cambian.
        </li>
        <li>
          <strong>Cumplir los requisitos</strong> de cada servicio tal y como los declaras. Por ejemplo, en los
          formularios: que ningún socio es ciudadano ni residente fiscal en EE. UU., que la LLC no tiene presencia
          física en EE. UU., que está al día y que los socios son personas físicas.
        </li>
        <li>
          <strong>Responder</strong> a lo que te pidamos para completar el encargo, en un máximo de{" "}
          <strong>30 días</strong>.
        </li>
        <li>No obstaculizar el trámite.</li>
        <li>
          Mantener tu LLC al día una vez entregada: renovaciones, agente registrado, informes estatales y formularios
          anuales.
        </li>
      </Lista>
      <p>
        <strong>Si incumples cualquiera de estos compromisos</strong>, podemos parar o cancelar el encargo{" "}
        <strong>sin devolución</strong> (sección 3.3) y <strong>no respondemos</strong> de ninguna consecuencia:
        sanciones, rechazos, retrasos, pérdida de plazos o cualquier otra. Esto incluye:
      </p>
      <Lista>
        <li>mentir en los requisitos;</li>
        <li>darnos información falsa, incompleta o tardía;</li>
        <li>obstaculizar la apertura;</li>
        <li>no responder en plazo.</li>
      </Lista>

      <H3>2.7 Plazos</H3>
      <p>
        Los plazos que publicamos («aproximadamente 20 días») son <strong>orientativos</strong>. Dependen de la
        Secretaría de Estado de cada estado, del IRS y de otros organismos, y pueden variar por periodos vacacionales y
        festivos en EE. UU. Un retraso de esos organismos no es un incumplimiento nuestro ni da derecho a devolución.
      </p>
      <p>
        En los formularios anuales, solo nos comprometemos a presentarlos dentro del plazo del IRS si recibimos tus
        datos <strong>antes de la fecha límite publicada</strong>: 1 de abril (un socio) y 1 de marzo (varios socios).
      </p>

      <H3>2.8 Lo que no depende de nosotros</H3>
      <Lista>
        <li>
          <strong>Nombre de la LLC:</strong> el estado puede rechazar las opciones de nombre. Por eso pedimos varias y
          las probamos en orden. Si se rechazan todas, te pediremos otras.
        </li>
        <li>
          <strong>EIN, aprobación de bancos y otros organismos:</strong> dependen de terceros.
        </li>
        <li>
          <strong>Operating Agreement:</strong> se entrega un <strong>modelo</strong>, estándar o para varios socios,
          rellenado con tus datos. No es un contrato negociado a medida (eso es el servicio de Operating Agreement
          personalizado).
        </li>
      </Lista>

      <H3>2.9 Responsabilidad</H3>
      <p>
        Respondemos de tu encargo profesional con la diligencia debida.{" "}
        <strong>
          Nuestra responsabilidad total por un encargo se limita al importe que pagaste por ese servicio
        </strong>
        , sin contar las tasas públicas.
      </p>
      <p>
        No respondemos de las decisiones fiscales o legales que tomes en tu país, del uso que hagas de la LLC ni de las
        consecuencias de incumplir tus compromisos (sección 2.6).
      </p>

      <H3>2.10 Comunicaciones y entregas</H3>
      <p>
        Nos comunicamos preferentemente por email y, de forma auxiliar, por WhatsApp. Las entregas (documentos de la
        LLC, formularios presentados y justificantes) se hacen por email a la dirección que nos indiques.
      </p>

      <H3>2.11 Datos personales</H3>
      <p>
        Los tratamos según la{" "}
        <Link href={ENLACE_PRIVACIDAD} className={enlace}>
          Política de privacidad
        </Link>
        . Responsable del tratamiento: <strong>Leaving Vorkuta LLC</strong>, con los datos de la sección 2.1.
      </p>

      <H3>2.12 Ley aplicable y reclamaciones</H3>
      <p>
        Antes de reclamar a tu banco o en Whop, <strong>escríbenos</strong>: la mayoría de los problemas se resuelven
        en un mensaje.
      </p>
      <p>
        Estas condiciones se rigen por las <strong>leyes del estado de Nuevo México (EE. UU.)</strong>.
      </p>

      <H3>2.13 Cambios</H3>
      <p>
        Podemos actualizar estas condiciones. A cada contratación se le aplica la versión vigente el día del pago.
        Versión: {TERMINOS_VERSION}.
      </p>
    </section>
  );
}

const devolucionesPorServicio = [
  ["Apertura de LLC", "Antes de empezar", "Empezado, sin presentar la constitución ante el estado", "Constitución presentada"],
  [
    "Formularios 1120/5472 y Form 1065",
    "Antes de empezar a prepararlos",
    "Preparados y sin presentar ante el IRS",
    "Presentados",
  ],
  ["Cierre de LLC", "Antes de empezar", "Empezado, sin presentar la disolución ante el estado", "Disolución presentada"],
] as const;

export function PoliticaDevoluciones() {
  return (
    <section id="devoluciones" className="scroll-mt-28 space-y-4">
      <h2 className="text-2xl font-bold text-tinta">Política de devoluciones</h2>

      <H3>3.1 La regla general</H3>
      <Lista>
        <li>
          <strong>Si no hemos empezado a trabajar en tu encargo, te devolvemos todo.</strong>
        </li>
        <li>
          <strong>Si ya hemos empezado, pero no hemos presentado nada</strong> ante un organismo público, te devolvemos
          el <strong>30 %</strong> en los casos de la sección 3.2.
        </li>
        <li>
          <strong>Una vez presentado</strong> un trámite ante el estado o el IRS, <strong>no hay devolución</strong>.
        </li>
      </Lista>
      <p>Las tasas públicas ya pagadas no se devuelven nunca, porque los organismos no nos las reembolsan.</p>

      <H3>3.2 Cuándo hay devolución del 30 %</H3>
      <p>
        Solo en estos casos, y siempre <strong>antes de presentar nada</strong> ante el estado o el IRS:
      </p>
      <Lista ordenada>
        <li>
          <strong>Cancelas por decisión propia</strong> después de que hayamos empezado: ya hemos revisado tus datos,
          comprobado los nombres y preparado los documentos o los formularios.
        </li>
        <li>
          <strong>El trámite no se puede completar por causas ajenas a ti y a nosotros</strong>: por ejemplo, el
          organismo cambia sus requisitos o deja de admitir el trámite.
        </li>
      </Lista>
      <p>Por servicio:</p>
      <div className="overflow-x-auto rounded-2xl border border-tinta/10">
        <table className="w-full min-w-[36rem] text-left text-base">
          <thead className="bg-arena-2 text-tinta">
            <tr>
              <th scope="col" className="p-3 font-semibold">
                Servicio
              </th>
              <th scope="col" className="p-3 font-semibold">
                Devolución completa
              </th>
              <th scope="col" className="p-3 font-semibold">
                Devolución del 30 %
              </th>
              <th scope="col" className="p-3 font-semibold">
                Sin devolución
              </th>
            </tr>
          </thead>
          <tbody>
            {devolucionesPorServicio.map(([servicio, completa, parcial, ninguna]) => (
              <tr key={servicio} className="border-t border-tinta/10 align-top">
                <th scope="row" className="p-3 font-bold text-tinta">
                  {servicio}
                </th>
                <td className="p-3">{completa}</td>
                <td className="p-3">{parcial}</td>
                <td className="p-3">{ninguna}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <H3>3.3 Sin devolución</H3>
      <Lista>
        <li>Una vez presentado el trámite ante el estado o el IRS.</li>
        <li>
          <strong>Si incumples tus compromisos</strong> (sección 2.6): mentir en los requisitos (por ejemplo, un socio
          residente en EE. UU., un socio empresa o una LLC que no estaba al día), dar información falsa o incompleta,
          obstaculizar el trámite o no responder en 30 días después de varios avisos.
        </li>
        <li>Por retrasos de organismos públicos (sección 2.7).</li>
        <li>Por formularios pedidos después de la fecha límite: no se pueden contratar online.</li>
      </Lista>

      <H3>3.4 Devolución completa</H3>
      <Lista>
        <li>
          <strong>No podemos prestar el servicio por causas imputables a nosotros.</strong>
        </li>
        <li>
          <strong>Pago duplicado:</strong> te devolvemos el segundo pago.
        </li>
        <li>
          <strong>Plan equivocado</strong> con importe de más: te devolvemos la diferencia (sección 2.4).
        </li>
      </Lista>

      <H3>3.5 Sin derecho de desistimiento</H3>
      <p>
        Al ser una contratación con fines empresariales o profesionales (sección 2.2) y empezar el servicio en cuanto
        pagas (sección 2.4), <strong>no hay derecho de desistimiento</strong>. Las devoluciones se rigen solo por esta
        política.
      </p>

      <H3>3.6 Cómo pedir una devolución</H3>
      <p>
        Escríbenos por el{" "}
        <Link href="/contacto" className={enlace}>
          formulario de contacto
        </Link>{" "}
        o por WhatsApp con el email que usaste en Whop y el servicio contratado. Si procede, ordenamos el reembolso en
        Whop, que lo devuelve al mismo medio de pago. El plazo en que llega a tu cuenta depende de tu banco.
      </p>
    </section>
  );
}
