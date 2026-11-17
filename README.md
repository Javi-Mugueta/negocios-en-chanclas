# Negocios en Chanclas · web de marketing

Web de marketing de **Negocios en Chanclas – Gestión LLC´s**: gestión de LLC en Estados Unidos, en
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
```

## Páginas

| Ruta | Contenido |
| --- | --- |
| `/` | Portada: hero, el camino en 4 pasos, tipos de empresa, servicios, transparencia, atención humana, preguntas frecuentes |
| `/empezar` | Asistente en 5 pasos (punto de partida, tipo de empresa, estado, nombre, contacto) que termina en el siguiente paso recomendado. Admite `?paquete=arranque`, `en-regla` o `cierre` |
| `/como-funciona-una-llc` | Guía: qué es una LLC, elegir estado, documentos clave, obligaciones anuales (1120 + 5472) y cierre |
| `/servicios` | Paquetes de LLC (sin precio publicado), diferencia entre LLC de un socio y LLC con varios socios, apertura de cuenta como extra, presentación anual y servicios digitales con precios |
| `/contacto` | WhatsApp (España y EE. UU.), dirección en Albuquerque y formulario (admite `?servicio=en-regla`, `arranque`, `cierre`, `corporacion`…) |
| `/legal` | Aviso breve de privacidad (el uso de los datos del formulario) y la garantía de devolución ya publicada en servicios |

## Origen del contenido

Los hechos proceden de lo publicado en negociosenchanclas.com:

- Presentación de los formularios **1120 y 5472**: lo hacemos todo directamente (recogemos los datos, los revisamos y presentamos los formularios).
- **LLC de un socio** (single member) y **LLC con varios socios** (multi-member). La corporación (C-Corp) es un servicio **a medida**.
- **Número EIN listo en 48 horas** y atención en español e inglés.
- **Apertura guiada de cuenta bancaria** como extra, sin precio publicado.
- Baja de la LLC marcando **«Última presentación»**.
- Estados aceptados por el formulario (New Mexico, Wyoming, Delaware…), los datos que pide y sus notas (escribir «0», los cajeros cuentan como transferencias, la fecha de creación está en los Articles of Organization).
- Contacto: WhatsApp de EE. UU. y España (los números están en `contacto.whatsapp` dentro de `src/lib/site.ts`) y dirección de Albuquerque. No se publica un email de la empresa.
- Servicios digitales, sus precios y las condiciones de la política de devoluciones (30 días, pago 50/50).

Las explicaciones generales sobre LLC (qué es, estados, EIN, plazo del 15 de abril…) son
información orientativa y se presentan como tal en la web.

## Lo que la web no muestra

No hay etiquetas de «pendiente», «próximamente» ni horario de atención, y no hay bloque de reseñas.

- **Precios** de los paquetes de LLC y de la apertura de cuenta: no se publican. El botón lleva al asistente o al formulario.
- **Asistente `/empezar`**: cinco preguntas. El teléfono es opcional. Las respuestas solo viven en la página; no se envían ni se guardan.
- **Envío del formulario de contacto**: `POST /api/contacto` valida los datos y responde, pero **no envía nada**. Hay que conectar un proveedor o un CRM en `src/app/api/contacto/route.ts`. El formulario sigue pidiendo el email de quien escribe, para poder responderle.

## Estructura

```
src/
  app/                 rutas (App Router) y API de contacto
  components/
    brand/             logotipo y botones
    home/              secciones de la portada
    ui/                primitivas de shadcn/ui
  lib/site.ts          contenido central: contacto, paquetes, preguntas frecuentes, servicios
```
