import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { ArrowRight, Check } from "lucide-react";
import { WhatsAppIcon } from "@/components/Carousel";
import { formatBRL, formatKwh, parseBRL, waLink, type SimResult } from "@/lib/simulator";
import { trackSimulacao } from "@/lib/tracking";

const btnPrimary =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 font-bold text-primary-foreground transition-all duration-300 ease-soft hover:-translate-y-0.5 hover:shadow-lift disabled:pointer-events-none disabled:opacity-40";
const btnWhats =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-whatsapp px-6 font-bold text-primary-foreground transition-all duration-300 ease-soft hover:-translate-y-0.5 hover:shadow-lift";
const btnGhost =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-transparent border border-border px-6 font-bold text-foreground transition-all duration-300 ease-soft hover:bg-accent hover:text-accent-foreground";

const STORAGE_KEY = "esolution-simulation";
const STORAGE_TTL_HOURS = 24;

interface StoredSimulation {
  valor: string;
  calcValor: number;
  result: SimResult;
  timestamp: number;
}

function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e) return;
        if (e.isIntersecting) {
          el.classList.add("is-visible");
          io.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="mb-4 flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.14em] text-brand">
      <span className="logo-bar h-0.5 w-8 rounded-full" aria-hidden />
      {children}
    </p>
  );
}

export interface SimulatorProps {
  /** Optional initial value from Hero or external source */
  initialValor?: string;
  /** Callback fired when calculation completes - allows Hero to scroll to results */
  onCalculated?: () => void;
}

export interface SimulatorHandle {
  calculate: (raw: string, scroll?: boolean) => void;
  clearSimulation: () => void;
}

const Simulador = forwardRef<SimulatorHandle, SimulatorProps>(
  ({ initialValor = "", onCalculated }, ref) => {
    const [valor, setValor] = useState(initialValor);
    const [result, setResult] = useState<SimResult | null>(null);
    const [calcValor, setCalcValor] = useState(0);
    const [isValid, setIsValid] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const resultRef = useRef<HTMLDivElement>(null);

    // Load from localStorage on mount
    useEffect(() => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const data: StoredSimulation = JSON.parse(stored);
          const ageHours = (Date.now() - data.timestamp) / (1000 * 60 * 60);
          if (ageHours < STORAGE_TTL_HOURS && data.result) {
            setValor(data.valor);
            setCalcValor(data.calcValor);
            setResult(data.result);
          } else {
            // Expired - clear it
            localStorage.removeItem(STORAGE_KEY);
          }
        }
      } catch {
        // Ignore parse errors
      }
    }, []);

    // Save to localStorage when result changes
    useEffect(() => {
      if (result && valor && calcValor > 0) {
        const data: StoredSimulation = {
          valor,
          calcValor,
          result,
          timestamp: Date.now(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      }
    }, [result, valor, calcValor]);

    const calculate = useCallback(
      (raw: string, scroll = false) => {
        const v = Number(
          raw
            .replace(/[^\d.,]/g, "")
            .replace(/\./g, "")
            .replace(",", "."),
        );
        if (!(v > 0)) return;
        const consumoMensal = v / 0.9848;
        const consumoAnual = consumoMensal * 12;
        const economiaAnual = consumoAnual * (0.35 * 0.9848 + 0.65 * 0.342 + 0.65 * 0.6428 * 0.35);
        const economiaMensal = economiaAnual / 12;
        const novaContaMensal = v - economiaMensal;
        const novaContaAnual = v * 12 - economiaAnual;
        const newResult = {
          consumoMensal,
          economiaAnual,
          economiaMensal,
          novaContaMensal,
          novaContaAnual,
        };
        setResult(newResult);
        setCalcValor(v);
        setValor(raw);
        trackSimulacao(v);
        if (scroll) {
          requestAnimationFrame(() =>
            resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }),
          );
        }
        onCalculated?.();
      },
      [onCalculated],
    );

    const clearSimulation = useCallback(() => {
      setValor("");
      setResult(null);
      setCalcValor(0);
      localStorage.removeItem(STORAGE_KEY);
    }, []);

    useImperativeHandle(ref, () => ({
      calculate,
      clearSimulation,
    }));

    const parsedValue = parseBRL(valor);
    const ok = parsedValue > 0;
    const dash = "—";
    const waMsg = result
      ? waLink(
          `Olá! Fiz a simulação no site: minha conta de luz é de ${formatBRL(calcValor)} por mês e a economia estimada foi de ${formatBRL(result.economiaAnual)} no 1º ano. Gostaria de um orçamento.`,
        )
      : "";

    useEffect(() => {
      setIsValid(ok);
    }, [ok]);

    return (
      <section id="simulacao" className="glow-tr bg-surface py-20 md:py-28">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
          <Reveal>
            <Eyebrow>Simulação</Eyebrow>
            <h2 className="text-4xl md:text-5xl">Quanto você economizaria?</h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              Digite o valor médio da sua conta de luz e veja, na hora, uma estimativa da economia
              com energia solar no primeiro ano.
            </p>
            <ol className="mt-8 space-y-5">
              {[
                "Use a média dos últimos meses, que fica no histórico da própria conta.",
                "Depois, envie o resultado pelo WhatsApp e receba um orçamento com o sistema certo para o seu consumo.",
              ].map((t, k) => (
                <li key={k} className="flex gap-4 border-t pt-5">
                  <span className="display text-2xl text-brand">0{k + 1}</span>
                  <span className="text-muted-foreground">{t}</span>
                </li>
              ))}
            </ol>
          </Reveal>
          <Reveal className="relative overflow-hidden rounded-3xl bg-surface-2 p-5 panel-ring sm:p-8">
            <div aria-hidden className="logo-bar absolute inset-x-0 top-0 h-1" />
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (ok) calculate(valor);
              }}
            >
              <label htmlFor="sim-valor" className="mb-2 block font-semibold">
                Valor médio da sua conta mensal
              </label>
              <div
                className={`
                flex min-h-16 items-center rounded-2xl bg-field px-5 text-field-foreground
                transition-all duration-300 ease-soft
                ${isValid ? "border-2 border-green-500 bg-green-50 dark:bg-green-900/20" : "border-2 border-transparent"}
                ${isFocused && !isValid ? "border-2 border-primary/50" : ""}
              `}
              >
                <span className="mr-2 text-xl font-bold">R$</span>
                <input
                  id="sim-valor"
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="Exemplo: 350,00"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className="w-full bg-transparent text-2xl font-bold outline-none placeholder:text-field-foreground/40"
                  aria-describedby="valor-help"
                />
                {isValid && (
                  <Check
                    className="ml-2 h-6 w-6 text-green-500 animate-in zoom-in duration-200"
                    aria-hidden="true"
                  />
                )}
              </div>
              <p
                id="valor-help"
                className="mt-2 text-sm text-muted-foreground"
                aria-hidden={isValid}
              >
                Digite apenas números. Use vírgula para centavos. Exemplo: 350,00
              </p>
              <button
                type="submit"
                disabled={!ok}
                className={`${btnPrimary} mt-4 w-full min-h-14 text-lg`}
              >
                Calcular economia
              </button>
            </form>
            <div ref={resultRef} aria-live="polite" className="mt-8">
              <div className="rounded-2xl border border-primary/30 bg-background p-5">
                <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Economia estimada no 1º ano
                </p>
                <p className="display mt-1 text-4xl text-primary sm:text-5xl">
                  {result ? formatBRL(result.economiaAnual) : dash}
                </p>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-3">
                {[
                  ["Economia por mês", result ? formatBRL(result.economiaMensal) : dash],
                  ["Nova conta mensal", result ? formatBRL(result.novaContaMensal) : dash],
                  ["Nova conta no ano", result ? formatBRL(result.novaContaAnual) : dash],
                  [
                    "Consumo estimado",
                    result ? `${formatKwh(result.consumoMensal)} kWh/mês` : dash,
                  ],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-2xl bg-background p-4">
                    <dt className="text-xs text-muted-foreground sm:text-sm">{k}</dt>
                    <dd className="mt-1 text-lg font-bold sm:text-xl">{v}</dd>
                  </div>
                ))}
              </dl>
              {result && (
                <>
                  <a
                    href={waMsg}
                    target="_blank"
                    rel="noopener"
                    className={`${btnWhats} mt-5 w-full min-h-14 text-center animate-in fade-in slide-in-from-bottom-2 duration-500`}
                  >
                    <WhatsAppIcon />
                    Quero esse orçamento no WhatsApp
                  </a>
                  <button
                    type="button"
                    onClick={clearSimulation}
                    className={`${btnGhost} mt-3 w-full min-h-12 text-center animate-in fade-in slide-in-from-bottom-2 duration-500`}
                  >
                    Limpar simulação
                  </button>
                </>
              )}
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                Estimativa com base em valores médios de tarifa. A economia real depende do seu
                consumo, do local e do projeto.
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    );
  },
);

Simulador.displayName = "Simulator";

export { Simulador as Simulator };
