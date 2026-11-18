import { ArrowRight } from "lucide-react";
import { Reveal, Eyebrow, FAQ } from "@/components/ui/shared";
import { waLink } from "@/lib/simulator";

export function Duvidas() {
  return (
    <section id="duvidas" className="glow-bl bg-surface-2 py-20 md:py-28">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 lg:grid-cols-[1fr_1.6fr]">
        <Reveal>
          <Eyebrow>Dúvidas</Eyebrow>
          <h2 className="text-4xl md:text-5xl">Dúvidas frequentes</h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            O que todo mundo pergunta antes de colocar energia solar em casa. Ficou alguma dúvida?
            Fale com a gente.
          </p>
          <a
            href={waLink("Olá! Tenho uma dúvida sobre energia solar.")}
            target="_blank"
            rel="noopener"
            className="mt-6 inline-flex min-h-12 items-center gap-2 font-bold text-whatsapp"
          >
            Perguntar no WhatsApp <ArrowRight className="h-5 w-5" />
          </a>
        </Reveal>
        <Reveal>
          <div className="border-t">
            {FAQ.map(([q, a]) => (
              <details key={q} className="group border-b">
                <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 py-4 text-lg font-bold">
                  <h3 className="text-lg font-bold" style={{ fontStretch: "100%" }}>
                    {q}
                  </h3>
                  <span
                    aria-hidden="true"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xl transition-transform duration-300 ease-soft group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="pb-5 pr-10 leading-relaxed text-muted-foreground">{a}</p>
              </details>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
