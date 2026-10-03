import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Pending } from "@/components/brand/pending";
import { faqs } from "@/lib/site";

export function Faq() {
  return (
    <Accordion className="divide-y divide-tinta/10 border-y border-tinta/10">
      {faqs.map((f, i) => (
        <AccordionItem key={f.q} value={`faq-${i}`} className="border-none">
          <AccordionTrigger className="gap-6 py-6 text-left font-display text-lg font-semibold hover:no-underline md:text-xl">
            <span className="flex items-baseline gap-4">
              <span className="font-mono text-xs font-medium text-chancla-2">
                {String(i + 1).padStart(2, "0")}
              </span>
              {f.q}
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-6 pl-9 text-base leading-relaxed text-tinta/70">
            {f.a ?? (
              <span className="flex flex-wrap items-center gap-2">
                Todavía no hemos publicado tarifas en esta web. Escríbenos y te pasamos el precio
                para tu caso.
                <Pending>Precios pendientes</Pending>
              </span>
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
