import { Check, Clock, MessageCircle } from "lucide-react";
import { CtaLink } from "@/components/brand/cta";
import { AVISO_PLAZO, contacto } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Las cuatro piezas de toda confirmación (flujos, sección 0.4):
 * ¡Recibido!, qué pasa ahora, cuándo y, si hay prisa, WhatsApp.
 */
export function Confirmacion({
  titulo = "¡Recibido!",
  queAhora,
  cuando,
  orientativo = false,
  oscuro = false,
  className,
}: {
  titulo?: string;
  queAhora: React.ReactNode;
  /** Plazo, si lo hay. En contacto no se compromete ninguno. */
  cuando?: React.ReactNode;
  /** Añade el aviso de plazo orientativo (apertura y cierre). */
  orientativo?: boolean;
  oscuro?: boolean;
  className?: string;
}) {
  const suave = oscuro ? "text-arena/75" : "text-tinta/70";
  return (
    <div className={cn("space-y-3", className)}>
      <p className={cn("flex items-center gap-2 font-display text-xl font-bold", oscuro ? "text-arena" : "text-tinta")}>
        <Check className="size-5 text-chancla" strokeWidth={3} aria-hidden="true" />
        {titulo}
      </p>
      <p className={suave}>{queAhora}</p>
      {cuando && (
        <p className={cn("flex items-start gap-2", suave)}>
          <Clock className="mt-1 size-4 shrink-0" aria-hidden="true" />
          <span>
            {cuando}
            {orientativo && <span className="mt-1 block text-sm opacity-80">{AVISO_PLAZO}</span>}
          </span>
        </p>
      )}
      <p className={cn("text-sm", suave)}>
        ¿Prisa?{" "}
        <a
          href={contacto.whatsapp.espana.href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn("font-semibold underline underline-offset-4", oscuro ? "text-sol" : "text-chancla-2")}
        >
          Escríbenos por WhatsApp ({contacto.whatsapp.espana.visible})
        </a>
        .
      </p>
    </div>
  );
}

/**
 * Cuando el servicio todavía no tiene enlace de Whop: los datos ya están guardados
 * y el pago se cierra por contacto.
 */
export function PagoPorContacto({
  email,
  contactoHref,
  oscuro = true,
}: {
  email: string;
  contactoHref: string;
  oscuro?: boolean;
}) {
  return (
    <div className={cn("rounded-2xl p-5", oscuro ? "bg-arena/10 text-arena/85" : "bg-sol/15 text-tinta/85")}>
      <p>
        <strong className={oscuro ? "text-arena" : "text-tinta"}>Ya tenemos tus datos.</strong> El pago de este
        importe todavía no está disponible online: te escribimos{email ? ` a ${email}` : ""} con el enlace de pago.
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <CtaLink href={contactoHref} variant={oscuro ? "primary" : "dark"}>
          Escríbenos
        </CtaLink>
        <a
          href={contacto.whatsapp.espana.href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 font-semibold ring-1 transition",
            oscuro ? "text-arena ring-arena/30 hover:bg-arena/10" : "text-tinta ring-tinta/20 hover:bg-tinta/5",
          )}
        >
          <MessageCircle className="size-4" aria-hidden="true" />
          WhatsApp {contacto.whatsapp.espana.visible}
        </a>
      </div>
    </div>
  );
}
