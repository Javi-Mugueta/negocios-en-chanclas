# Negocios en Chanclas · web de marketing

Web de marketing de **Negocios en Chanclas – Gestión de LLC**: gestión de LLC en Estados Unidos, en
español y sin agobios. Está hecha con Next.js (App Router), TypeScript, Tailwind CSS v4 y shadcn/ui.

## Arrancar en local

Necesitas Node.js 20 o superior.

```bash
npm install
npm run dev
```

Abre [http://localhost:4317](http://localhost:4317).

Otros comandos:

```bash
npm run build && npm start   # build de producción, servido en el puerto 4317
npm run lint                 # ESLint
npm run typecheck            # TypeScript
npm test                     # pruebas de los formularios y del acceso al panel
```

## Variables de entorno

Solo los nombres. Los valores viven en el alojamiento (producción y vista previa) y, en local, en `.env.local`. La plantilla está en `.env.example`.

| Variable | Uso |
| --- | --- |
| `NEC_DATABASE_URL` | URL de Postgres. El pooler va en modo transacción: el cliente no usa prepared statements. Si la URL trae `sslmode`, se ignora y el cifrado se configura en el servidor. |
| `NEC_SESSION_SECRET` | Secreto para firmar la cookie del panel. Mínimo 32 caracteres. |
| `NEC_ADMIN_USER` | Usuario único del panel. |
| `NEC_ADMIN_PASSWORD_HASH` | Hash bcrypt de la contraseña del panel. |
| `NEC_IP_SALT` | Sal para guardar un código de la IP, nunca la dirección en claro. |
| `NEC_FORMULARIOS_LAUNCH` | Opcional. Fecha ISO (p. ej. `2027-01-01T00:00`; sin zona se entiende hora de Madrid). Si está definida, `/formularios-llc` (y su banner, entrada de menú y enlace en el sitemap) queda oculta hasta ese momento. Sin definir, está siempre visible. Un valor ilegible la deja oculta. |

Para generar el hash de la contraseña, sin dejarla en el repo:

```bash
node -e "console.log(require('bcryptjs').hashSync(process.argv[1], 12))" -- 'la-clave'
```

La sesión del panel dura 8 horas, va en una cookie httpOnly, `SameSite=Strict` y, en producción, `Secure`.

## Consultas

El formulario de `/contacto`, el asistente de `/empezar`, los datos de `/formularios-llc` y los de `/cierra-tu-llc` validan en el servidor, piden consentimiento (versión publicada en `/legal`) y guardan la consulta. Un campo oculto descarta envíos automáticos. Hay un límite de 5 envíos por IP cada 10 minutos. «¡Recibido!» solo aparece si el guardado ha ido bien; si falla, se muestra el error y el enlace de WhatsApp.

Todo se guarda en `nec.leads`, sin cambios de esquema: el encargo personalizado entra por `/contacto?servicio=encargo` (`origen=contacto`, `servicio=encargo`); Formularios LLC, con `origen=contacto`, `servicio=formularios-llc` y los datos (pasaporte, EIN, importes…) en `datos`; el cierre de LLC, con `origen=contacto`, `servicio=cierre-llc` y sus respuestas en `datos`. Esos datos no se escriben nunca en los logs. Tras guardar, cada botón de pago (planes del asistente, Formularios LLC y cierre) enlaza a Stripe con `client_reference_id` igual al id de la consulta y `prefilled_email` con el email del cliente, para cruzar el pago desde la ficha del panel; junto al botón se pide usar ese mismo email en Stripe.

El panel está en `/panel`. Desde ahí se filtran las consultas, se cambia el estado, se escriben notas, se marcan como spam o como borradas, se exportan a CSV y se ven los contadores del día y de la semana (hora de Madrid). No hay enlace al panel en las páginas públicas. `robots.txt` lo deja fuera, igual que `/api/`.

## Páginas

| Ruta | Contenido |
| --- | --- |
| `/` | Portada: hero, el camino en 4 pasos, tipos de empresa, servicios, transparencia, atención humana, preguntas frecuentes |
| `/formularios-llc` | Formularios LLC del ejercicio 2026: requisitos, formulario de datos, casillas obligatorias y pantalla de pago (169 $, Stripe). Visible por defecto; si se define `NEC_FORMULARIOS_LAUNCH`, oculta (404, fuera del sitemap, del menú y del banner de la home) hasta esa fecha en hora de Madrid; se evalúa en cada petición (`src/lib/visibilidad.ts`) |
| `/cierra-tu-llc` | Cierre de LLC (467 $ + tasas del estado, solo Wyoming y Nuevo México con un socio): formulario de 14 campos, casillas y pantalla de pago en Stripe. Otro estado o dos o más socios → contacto |
| `/encargo-personalizado` | Redirige a `/contacto?servicio=encargo` |
| `/empezar` | Asistente. «Ya tengo una LLC»: 5 pasos (punto de partida, tipo, estado, nombre, contacto). «Quiero crear mi LLC»: alta completa en 12 pasos (sin pasaporte) y, al final, los planes con su pago en Stripe. Admite `?paquete=arranque` o `en-regla`, y `?plan=basico` o `estandar` (los botones de los planes de la home; preselecciona el plan y se guarda en la consulta). «Quiero cerrar mi LLC» y `?paquete=cierre` llevan a `/cierra-tu-llc`; «Corporación (C-Corp)» lleva a `/contacto?servicio=corporacion` |
| `/como-funciona-una-llc` | Guía: qué es una LLC, elegir estado, documentos clave, obligaciones anuales (1120 + 5472) y cierre |
| `/servicios` | Siete tarjetas con ancla propia (`#apertura-llc`, `#c-corp`, `#cierre-llc`, `#cambio-titularidad`, `#operating-agreement`, `#operaciones-societarias`, `#formularios-anuales`) y el bloque «¿No sabes cuál necesitas?» |
| `/contacto` | WhatsApp (España y EE. UU.), dirección en Albuquerque y formulario (admite `?servicio=en-regla`, `arranque`, `cierre`, `corporacion`, `encargo`, `cambio-titularidad`, `operating-agreement`, `operaciones-societarias`…). Con `corporacion` y `encargo` muestra un aviso encima del formulario |
| `/legal` | Política de privacidad y la garantía de devolución |
| `/panel` | Panel privado de consultas. No está enlazado desde la web pública ni se indexa |

## Origen del contenido

Los hechos proceden de lo publicado en negociosenchanclas.com:

- Presentación de los formularios **1120 y 5472**: lo hacemos todo directamente (recogemos los datos, los revisamos y presentamos los formularios).
- **LLC de un socio** (single member) y **LLC con varios socios** (multi-member). La corporación (C-Corp) es un servicio **a medida**.
- **Número EIN listo en 48 horas** y atención en español e inglés.
- **Apertura guiada de cuenta bancaria** como extra, sin precio publicado.
- Cierre de LLC como servicio propio (`/cierra-tu-llc`).
- Estados aceptados por el formulario (New Mexico, Wyoming, Delaware…), los datos que pide y sus notas (escribir «0», los cajeros cuentan como transferencias, la fecha de creación está en los Articles of Organization).
- Contacto: WhatsApp de EE. UU. y España (los números están en `contacto.whatsapp` dentro de `src/lib/site.ts`) y dirección de Albuquerque. No se publica un email de la empresa.
- Servicios digitales, sus precios y las condiciones de la política de devoluciones (30 días, pago 50/50).

Las explicaciones generales sobre LLC (qué es, estados, EIN, plazo del 15 de abril…) son
información orientativa y se presentan como tal en la web.

## Lo que la web no muestra

No hay etiquetas de «pendiente», «próximamente» ni horario de atención, y no hay bloque de reseñas.

- **Precios**: se publican los del Plan Básico (397$), el Plan Estándar (497$) y Formularios LLC (169$). La apertura de cuenta no tiene precio publicado. Los planes todavía no tienen enlace de pago: el botón lleva al asistente.
- **Asistente `/empezar`**: cinco preguntas y, en la última, el consentimiento. El teléfono es opcional. Las respuestas se guardan al ver el siguiente paso.
- **Formulario de contacto**: `POST /api/contacto` valida y guarda. El formulario pide el email de quien escribe, para poder responderle.

## Estructura

```
src/
  app/                 rutas (App Router), API de consultas y panel
  components/
    brand/             logotipo y botones
    home/              secciones de la portada
    panel/             piezas del panel privado
    ui/                primitivas de shadcn/ui
  lib/site.ts          contenido central: contacto, paquetes, preguntas frecuentes, servicios
```
