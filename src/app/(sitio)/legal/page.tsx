import type { Metadata } from "next";
import Link from "next/link";
import { Eyebrow } from "@/components/brand/cta";
import { CONSENTIMIENTO_VERSION } from "@/lib/privacidad";
import { contacto } from "@/lib/site";

export const metadata: Metadata = {
  title: "Avisos legales",
  robots: { index: false },
};

export default function LegalPage() {
  return (
    <section className="mx-auto max-w-3xl px-5 pt-14 pb-24 sm:px-8 md:pt-20">
      <Eyebrow>Avisos legales</Eyebrow>
      <h1 className="mt-5 text-5xl leading-[0.95] font-extrabold md:text-6xl">Lo legal, a la vista.</h1>
      <p className="mt-6 text-lg text-tinta/70">
        Esta política explica qué hace Negocios en Chanclas con los datos que nos dejas en la web.
        Versión {CONSENTIMIENTO_VERSION}.
      </p>

      <div className="mt-12 space-y-10 text-lg leading-relaxed text-tinta/75">
        <section id="privacidad" className="space-y-4">
          <h2 className="text-2xl font-bold text-tinta">Política de privacidad</h2>
          <p>
            Negocios en Chanclas trata los datos que envías desde el formulario de contacto y desde
            el asistente de «Empieza aquí». El responsable del tratamiento es la persona o sociedad
            que opera la marca. Estos tres datos todavía hay que completarlos:
          </p>
          <ul className="space-y-2 rounded-3xl border border-chancla/30 bg-chancla/10 p-5 text-base text-tinta">
            <li>
              <strong>TODO (Javier):</strong> razón social o nombre legal del responsable.
            </li>
            <li>
              <strong>TODO (Javier):</strong> NIF o CIF.
            </li>
            <li>
              <strong>TODO (Javier):</strong> domicilio a efectos legales.
            </li>
          </ul>
          <p>
            Mientras tanto, puedes escribirnos por el{" "}
            <Link href="/contacto" className="font-semibold text-tinta underline underline-offset-4">
              formulario de contacto
            </Link>
            , por WhatsApp ({contacto.whatsapp.espana.visible} o {contacto.whatsapp.eeuu.visible}) o
            a la dirección de correspondencia que publicamos en la página de contacto:{" "}
            {contacto.direccion.join(", ")}.
          </p>

          <h3 className="pt-2 text-xl font-bold text-tinta">Qué datos recogemos</h3>
          <p>
            Nombre, email y, si lo indicas, teléfono. En el formulario de contacto, el servicio que
            te interesa y tu mensaje. En el asistente, las respuestas: punto de partida, tipo de
            LLC, estado, nombre de la empresa y tus datos de contacto. En el formulario de
            Formularios LLC, además, los datos que necesitamos para preparar los formularios de tu
            LLC: número de pasaporte, nacionalidad, dirección de residencia, nombre, EIN, dirección,
            fecha de constitución y actividad de la LLC, los importes del ejercicio (dinero sacado de
            la LLC, dinero aportado y saldo a 31 de diciembre) y las confirmaciones que marcas. El
            pago de ese servicio se hace en Stripe, fuera de esta web: no vemos ni guardamos los datos
            de tu tarjeta. También guardamos la página
            desde la que escribiste, los parámetros de campaña (UTM) si venían en el enlace, un
            identificador calculado a partir de tu IP —no la IP en claro— y el identificador de tu
            navegador.
          </p>

          <h3 className="pt-2 text-xl font-bold text-tinta">Para qué y con qué base</h3>
          <p>
            Los usamos para responderte, preparar el servicio que nos pides y llevar el seguimiento
            interno de esa conversación. La base jurídica es tu consentimiento, que nos das al
            marcar la casilla y enviar el formulario (artículo 6.1.a del RGPD). No es obligatorio
            enviar el formulario: si no quieres, puedes escribirnos por WhatsApp.
          </p>

          <h3 className="pt-2 text-xl font-bold text-tinta">Cuánto tiempo los guardamos</h3>
          <p>
            Los conservamos 24 meses desde el último contacto. Si pides que los suprimamos, dejamos
            de usarlos en ese momento y los eliminamos dentro de ese mismo plazo máximo, o antes.
          </p>

          <h3 className="pt-2 text-xl font-bold text-tinta">A quién se los comunicamos</h3>
          <p>
            No vendemos tus datos ni los cedemos a terceros para su propio uso. La web y la base de
            datos están en proveedores de alojamiento que solo tratan los datos por cuenta de
            Negocios en Chanclas, para guardar tu consulta y poder atenderla.
          </p>

          <h3 className="pt-2 text-xl font-bold text-tinta">Tus derechos</h3>
          <p>
            Puedes pedir acceso, rectificación, supresión, oposición, limitación del tratamiento y
            portabilidad, y retirar el consentimiento cuando quieras. También puedes reclamar ante
            la autoridad de protección de datos que te corresponda.
          </p>
          <p className="rounded-3xl border border-chancla/30 bg-chancla/10 p-5 text-base text-tinta">
            <strong>TODO (Javier):</strong> indica el email al que una persona puede escribir para
            ejercer estos derechos. Hasta que esté, usa el formulario de contacto o WhatsApp.
          </p>

          <h3 className="pt-2 text-xl font-bold text-tinta">Seguridad</h3>
          <p>
            El acceso al listado de consultas está restringido con usuario y contraseña. La sesión
            del panel va en una cookie httpOnly. La dirección IP no se guarda: solo un código
            derivado que no permite recuperarla. La conexión con la base de datos va cifrada.
          </p>
          <p>Versión de esta política: {CONSENTIMIENTO_VERSION}. Es la que queda asociada a cada envío.</p>
        </section>

        <section id="devoluciones">
          <h2 className="text-2xl font-bold text-tinta">Devoluciones y reembolsos</h2>
          <p className="mt-3">
            En diseño web y tiendas online tienes 30 días para solicitar el reembolso si el proyecto
            final no responde a tus necesidades. El pago de esos proyectos es del 50&nbsp;% al
            empezar y del 50&nbsp;% al terminar.
          </p>
        </section>
      </div>
    </section>
  );
}
