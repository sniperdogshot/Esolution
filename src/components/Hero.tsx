import { useState, type FormEvent, type ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { parseBRL, waLink } from "@/lib/simulator";
import heroImg from "@/assets/hero.jpg";

const WA_GENERIC = waLink("Olá! Gostaria de um orçamento de energia solar.");

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="mb-4 flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.14em] text-brand">
      <span className="logo-bar h-0.5 w-8 rounded-full" aria-hidden />
      {children}
    </p>
  );
}

export function Hero({
  heroRef,
  onSubmit,
}: {
  heroRef: React.RefObject<HTMLElement | null>;
  onSubmit: (v: string) => void;
}) {
  const [v, setV] = useState("");
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (parseBRL(v) > 0) onSubmit(v);
  };
  return (
    <section
      ref={heroRef}
      className="relative isolate overflow-hidden bg-background pt-28 pb-14 md:min-h-[92vh] md:pt-40"
    >
      <img
        src={heroImg}
        width={1920}
        height={1152}
        alt="Casa com telhado de cerâmica e painéis solares, cercada de coqueiros"
        className="ken-burns absolute inset-0 -z-20 h-full w-full object-cover"
        fetchPriority="high"
      />
      <div
        aria-hidden
        className="sun-ring pointer-events-none absolute -right-40 -top-40 -z-10 h-[34rem] w-[34rem] rounded-full md:right-[8%] md:top-[6%]"
      />
      <div className="hero-fade absolute inset-0 -z-10" aria-hidden />
      <div className="mx-auto max-w-6xl px-5">
        <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Eyebrow>Energia solar em Fortaleza, Eusébio e todo o Ceará</Eyebrow>
          <h1 className="text-5xl sm:text-6xl md:text-8xl">
            Gere sua <span className="text-primary">própria</span> energia.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            Projeto e instalação de sistemas fotovoltaicos para casas e empresas, com economia de
            até 80% na conta de luz.
          </p>
          <form onSubmit={submit} className="mt-8 max-w-xl">
            <label htmlFor="hero-valor" className="mb-2 block font-semibold">
              Quanto você paga de luz por mês?
            </label>
            <div className="flex flex-col gap-3 sm:flex-row sm:rounded-full sm:bg-field sm:p-1.5 sm:panel-ring">
              <div className="flex min-h-14 flex-1 items-center rounded-full bg-field px-5 text-field-foreground sm:min-h-12">
                <span className="mr-2 font-bold">R$</span>
                <input
                  id="hero-valor"
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="350,00"
                  value={v}
                  onChange={(e) => setV(e.target.value)}
                  className="w-full bg-transparent text-lg font-semibold outline-none placeholder:text-field-foreground/45"
                />
              </div>
              <button
                type="submit"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 font-bold text-primary-foreground transition-all duration-300 ease-soft hover:-translate-y-0.5 hover:shadow-lift disabled:pointer-events-none disabled:opacity-40 min-h-14 sm:min-h-12"
              >
                Ver minha economia <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </form>
          <p className="mt-4 text-muted-foreground">
            Orçamento sem compromisso. Prefere conversar?{" "}
            <a
              href={WA_GENERIC}
              target="_blank"
              rel="noopener"
              className="font-semibold text-whatsapp underline underline-offset-4"
            >
              Fale no WhatsApp
            </a>
          </p>
        </div>
        <ul className="mt-14 grid max-w-3xl divide-y divide-border border-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[
            ["Até 80%", "de economia na conta de luz"],
            ["Segura e certificada", "instalação feita por engenheiros"],
            ["Sem baterias", "o excedente vira crédito na rede"],
          ].map(([t, d]) => (
            <li key={t} className="py-4 sm:px-5 sm:first:pl-0">
              <p className="display text-2xl text-primary">{t}</p>
              <p className="text-sm text-muted-foreground">{d}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
