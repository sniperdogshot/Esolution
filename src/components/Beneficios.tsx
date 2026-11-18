import { TrendingDown, ShieldCheck, Home, Wrench } from "lucide-react";
import { Reveal, Eyebrow } from "@/components/ui/shared";

export function Beneficios() {
  const items = [
    [
      TrendingDown,
      "Até 80% a menos na conta",
      "Você passa a pagar basicamente a taxa mínima da distribuidora e a parte da rede.",
    ],
    [
      ShieldCheck,
      "Proteção contra aumentos",
      "A energia que o seu telhado produz não sofre os reajustes da tarifa.",
    ],
    [
      Home,
      "Imóvel com mais valor",
      "Energia solar é um diferencial na hora de vender ou alugar a casa ou o ponto comercial.",
    ],
    [
      Wrench,
      "Pouca manutenção",
      "Sem peças em movimento: no dia a dia, basta manter os painéis limpos.",
    ],
  ] as const;

  return (
    <section className="glow-bl bg-background py-20 md:py-28">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 lg:grid-cols-[1fr_1.4fr] lg:items-center">
        <Reveal>
          <h2 className="text-4xl md:text-6xl">
            A conta de luz sobe todo ano. <span className="text-primary">O sol, não.</span>
          </h2>
        </Reveal>
        <Reveal>
          <ul className="grid sm:grid-cols-2">
            {items.map(([Icon, t, d], k) => (
              <li
                key={t}
                className={`border-t py-6 sm:px-6 ${k % 2 === 0 ? "sm:pl-0" : "sm:border-l"} ${k > 1 ? "sm:border-t" : ""}`}
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15">
                  <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                </span>
                <h3 className="mt-3 text-xl">{t}</h3>
                <p className="mt-2 text-muted-foreground">{d}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
