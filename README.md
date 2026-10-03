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
| `/servicios` | Paquetes de LLC, cómo funciona la presentación anual, servicios digitales con precios |
| `/contacto` | Datos de contacto y formulario (admite `?servicio=en-regla`, `arranque`, `cierre`…) |
| `/legal` | Marcador para los textos legales |

## Origen del contenido

Los hechos proceden de lo publicado en negociosenchanclas.com:

- Presentación de los formularios **1120 y 5472**, con la aclaración «solo intermediamos»: recogemos los datos y los entregamos a contables autorizados, que presentan los formularios.
- LLC de **1 o 2 miembros**; **corporaciones próximamente**.
- Baja de la LLC marcando **«Última presentación»**.
- Estados aceptados por el formulario (New Mexico, Wyoming, Delaware…), los datos que pide y sus notas (escribir «0», los cajeros cuentan como transferencias, la fecha de creación está en los Articles of Organization).
- Contacto: email, teléfonos de EE. UU. y España y dirección de Albuquerque.
- Servicios digitales, sus precios y las condiciones de la política de devoluciones (30 días, pago 50/50).

Las explicaciones generales sobre LLC (qué es, estados, EIN, plazo del 15 de abril…) son
información orientativa y se presentan como tal en la web.

## Pendiente (marcado en la web)

Todo lo que no está publicado en la web actual se muestra con una etiqueta amarilla a rayas
(componente `<Pending />`). En el código, esos datos valen `PENDIENTE` en `src/lib/site.ts`.

- **Precios** de los tres paquetes de LLC: Arranque, En regla y Cierre tranquilo.
- **Alcance del paquete de constitución (Arranque)**: la web actual no describe este servicio. La lista de lo que incluye es una propuesta que hay que confirmar.
- **Horario de atención**.
- **Reseñas de clientes**: hay un hueco reservado, sin opiniones inventadas.
- **Textos legales** (privacidad, cookies, devoluciones) en `/legal`.
- **Asistente `/empezar`**: las respuestas solo viven en el estado de la página; no se envían ni se guardan. El precio y la tasa estatal se muestran como pendientes.
- **Envío del formulario de contacto**: `POST /api/contacto` valida los datos y responde, pero **no envía nada**. Hay que conectar un proveedor de email o un CRM en `src/app/api/contacto/route.ts`.

## Estructura

```
src/
  app/                 rutas (App Router) y API de contacto
  components/
    brand/             logotipo, botones y la etiqueta <Pending />
    home/              secciones de la portada
    ui/                primitivas de shadcn/ui
  lib/site.ts          contenido central: contacto, paquetes, preguntas frecuentes, servicios
```
