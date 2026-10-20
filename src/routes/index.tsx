import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Menu, X, Mail, MapPin, ArrowRight, TrendingDown, ShieldCheck, Home, Wrench, Calculator } from "lucide-react";
import { Carousel, WhatsAppIcon } from "@/components/Carousel";
import { formatBRL, formatKwh, parseBRL, simulate, waLink, type SimResult } from "@/lib/simulator";
import { trackSimulacao } from "@/lib/tracking";
import fv2Img from "@/assets/fotovoltaico2.jpg";
import heroImg from "@/assets/hero.jpg";
import sobre1Img from "@/assets/sobre1.jpg";
import sobre2Img from "@/assets/sobre2.jpg";
import sobre3Img from "@/assets/sobre3.jpg";
import equipe1Img from "@/assets/equipe1.jpg";
import equipe2Img from "@/assets/equipe2.jpg";
import equipe3Img from "@/assets/equipe3.jpg";

const SITE = "https://esolution-engenharia.netlify.app";
const IMG = "/images";
const LOGO = `${IMG}/EsolutionLogo1.webp`;
const OG = `${SITE}${IMG}/og-image.jpg`;
const TITLE = "Esolution Engenharia | Energia Solar em Fortaleza, Eusébio e Ceará";
const DESC = "Projeto e instalação de energia solar para casas e empresas em Fortaleza, Eusébio e todo o Ceará. Simule sua economia e peça um orçamento pelo WhatsApp.";
const WA_GENERIC = waLink("Olá! Gostaria de um orçamento de energia solar.");
const WA_CONTA = waLink("Olá! Quero um orçamento de energia solar. Vou enviar minha conta de luz.");
const EMAIL = "juliano@esolut.eng.br";

const FAQ = [
  ["A energia solar funciona em dias nublados?", "Funciona, com produção menor. O sistema é dimensionado pela média de sol do ano inteiro, e o Ceará está entre os lugares com mais sol do Brasil."],
  ["E à noite, de onde vem a energia?", "Da rede da distribuidora. O que o sistema gera a mais durante o dia vira créditos de energia, que abatem o consumo da noite e dos meses com menos sol."],
  ["Preciso comprar baterias?", "Não. No sistema conectado à rede, os créditos de energia fazem o papel da bateria, o que deixa o investimento menor."],
  ["Minha conta de luz vai zerar?", "Não. Continua a cobrança mínima da distribuidora (custo de disponibilidade) e, pelas regras atuais, uma parte do uso da rede. Por isso a economia é de até 80%, e não de 100%."],
  ["Quanto tempo dura um sistema de energia solar?", "Os painéis costumam durar mais de 25 anos. O inversor tem vida útil menor e pode precisar ser trocado ao longo desse período."],
  ["Como eu começo?", "Faça a simulação ou mande uma foto da sua conta de luz pelo WhatsApp. A partir dela calculamos o sistema e combinamos a visita técnica."],
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:image", content: OG },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:image", content: OG },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: "Esolution Engenharia",
          telephone: "+55 85 98154-6006",
          email: EMAIL,
          image: `${SITE}${LOGO}`,
          address: { "@type": "PostalAddress", streetAddress: "Rua Zildênia, 1166 - Sala 05, Amador", addressLocality: "Eusébio", addressRegion: "CE", addressCountry: "BR" },
          areaServed: [{ "@type": "City", name: "Fortaleza" }, { "@type": "City", name: "Eusébio" }, { "@type": "State", name: "Ceará" }],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
        }),
      },
    ],
  }),
  component: Index,
});

/* ---------- shared bits ---------- */

const btnPrimary = "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 font-bold text-primary-foreground transition-all duration-300 ease-soft hover:-translate-y-0.5 hover:shadow-lift disabled:pointer-events-none disabled:opacity-40";
const btnWhats = "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-whatsapp px-6 font-bold text-primary-foreground transition-all duration-300 ease-soft hover:-translate-y-0.5 hover:shadow-lift";

function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (!e) return; if (e.isIntersecting) { el.classList.add("is-visible"); io.disconnect(); } }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className={`reveal ${className}`}>{children}</div>;
}

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="mb-4 flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.14em] text-brand">
      <span className="logo-bar h-0.5 w-8 rounded-full" aria-hidden />{children}
    </p>
  );
}

/* ---------- page ---------- */

function Index() {
  const [heroOut, setHeroOut] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const [valor, setValor] = useState("");
  const [result, setResult] = useState<SimResult | null>(null);
  const [calcValor, setCalcValor] = useState(0);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e && setHeroOut(!e.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const calcular = (raw: string, scroll = false) => {
    const v = parseBRL(raw);
    if (!(v > 0)) return;
    setResult(simulate(v));
    setCalcValor(v);
    trackSimulacao(v);
    if (scroll) requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }));
  };

  return (
    <>
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-primary focus:px-5 focus:py-3 focus:font-bold focus:text-primary-foreground">
        Pular para o conteúdo
      </a>
      <Header />
      <main id="conteudo">
        <Hero heroRef={heroRef} onSubmit={(v) => { setValor(v); calcular(v, true); }} />
        <Faixa />
        <Simulador valor={valor} setValor={setValor} result={result} calcValor={calcValor} onCalc={() => calcular(valor)} resultRef={resultRef} />
        <Beneficios />
        <ComoFunciona />
        <QuemSomos />
        <Equipe />
        <Missao />
        <Duvidas />
        <ChamadaFinal />
        <Contato />
      </main>
      <Footer />
      <a href={WA_GENERIC} target="_blank" rel="noopener" aria-label="Falar no WhatsApp" className="fixed bottom-6 right-6 z-40 hidden h-16 w-16 items-center justify-center rounded-full bg-whatsapp text-primary-foreground shadow-lift transition-transform duration-300 ease-soft hover:scale-105 md:flex">
        <WhatsAppIcon className="h-8 w-8" />
      </a>
      <div className={`fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 gap-3 border-t bg-surface p-3 transition-transform duration-500 ease-soft md:hidden ${heroOut ? "translate-y-0" : "translate-y-full"}`} aria-hidden={!heroOut}>
        <a href="#simulacao" tabIndex={heroOut ? 0 : -1} className={btnPrimary}><Calculator className="h-5 w-5" />Simular</a>
        <a href={WA_GENERIC} target="_blank" rel="noopener" tabIndex={heroOut ? 0 : -1} className={btnWhats}><WhatsAppIcon />WhatsApp</a>
      </div>
    </>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open]);

  const links = [["#simulacao", "Simulação"], ["#como-funciona", "Como funciona"], ["#duvidas", "Dúvidas"], ["#contato", "Contato"]];

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${scrolled ? "border-b bg-background" : "bg-transparent"}`}>
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <a href="#" aria-label="Esolution Engenharia, início"><img src={LOGO} alt="Esolution Engenharia" className="h-10 w-auto md:h-11" /></a>
        <nav aria-label="Principal" className="hidden items-center gap-8 md:flex">
          {links.map(([h, l]) => <a key={h} href={h} className="font-medium text-muted-foreground transition-colors hover:text-foreground">{l}</a>)}
        </nav>
        <div className="flex items-center gap-2">
          <a href={WA_GENERIC} target="_blank" rel="noopener" className={`${btnPrimary} px-5`}><WhatsAppIcon />Orçamento</a>
          <button onClick={() => setOpen(true)} aria-label="Abrir menu" aria-expanded={open} className="flex h-12 w-12 items-center justify-center rounded-full text-foreground md:hidden">
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 md:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 video-dim" />
          <nav aria-label="Menu" onClick={(e) => e.stopPropagation()} className="absolute right-0 top-0 flex h-full w-72 flex-col bg-surface p-5 animate-in slide-in-from-right duration-300">
            <button onClick={() => setOpen(false)} aria-label="Fechar menu" className="ml-auto flex h-12 w-12 items-center justify-center rounded-full text-foreground">
              <X className="h-6 w-6" />
            </button>
            <ul className="mt-6 space-y-1">
              {links.map(([h, l]) => (
                <li key={h}><a href={h} onClick={() => setOpen(false)} className="flex min-h-12 items-center border-b text-xl font-bold text-foreground">{l}</a></li>
              ))}
            </ul>
            <a href={WA_GENERIC} target="_blank" rel="noopener" className={`${btnWhats} mt-8`}><WhatsAppIcon />Falar no WhatsApp</a>
          </nav>
        </div>
      )}
    </header>
  );
}

function Hero({ heroRef, onSubmit }: { heroRef: React.RefObject<HTMLElement | null>; onSubmit: (v: string) => void }) {
  const [v, setV] = useState("");
  const submit = (e: FormEvent) => { e.preventDefault(); if (parseBRL(v) > 0) onSubmit(v); };
  return (
    <section ref={heroRef} className="relative isolate overflow-hidden bg-background pt-28 pb-14 md:min-h-[92vh] md:pt-40">
      <img src={heroImg} width={1920} height={1152} alt="Casa com telhado de cerâmica e painéis solares, cercada de coqueiros" className="ken-burns absolute inset-0 -z-20 h-full w-full object-cover" fetchPriority="high" />
      <div aria-hidden className="sun-ring pointer-events-none absolute -right-40 -top-40 -z-10 h-[34rem] w-[34rem] rounded-full md:right-[8%] md:top-[6%]" />
      <div className="hero-fade absolute inset-0 -z-10" aria-hidden />
      <div className="mx-auto max-w-6xl px-5">
        <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Eyebrow>Energia solar em Fortaleza, Eusébio e todo o Ceará</Eyebrow>
          <h1 className="text-5xl sm:text-6xl md:text-8xl">Gere sua <span className="text-primary">própria</span> energia.</h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            Projeto e instalação de sistemas fotovoltaicos para casas e empresas, com economia de até 80% na conta de luz.
          </p>
          <form onSubmit={submit} className="mt-8 max-w-xl">
            <label htmlFor="hero-valor" className="mb-2 block font-semibold">Quanto você paga de luz por mês?</label>
            <div className="flex flex-col gap-3 sm:flex-row sm:rounded-full sm:bg-field sm:p-1.5 sm:panel-ring">
              <div className="flex min-h-14 flex-1 items-center rounded-full bg-field px-5 text-field-foreground sm:min-h-12">
                <span className="mr-2 font-bold">R$</span>
                <input id="hero-valor" inputMode="decimal" autoComplete="off" placeholder="350,00" value={v} onChange={(e) => setV(e.target.value)} className="w-full bg-transparent text-lg font-semibold outline-none placeholder:text-field-foreground/45" />
              </div>
              <button type="submit" className={`${btnPrimary} min-h-14 sm:min-h-12`}>Ver minha economia <ArrowRight className="h-5 w-5" /></button>
            </div>
          </form>
          <p className="mt-4 text-muted-foreground">
            Orçamento sem compromisso. Prefere conversar?{" "}
            <a href={WA_GENERIC} target="_blank" rel="noopener" className="font-semibold text-whatsapp underline underline-offset-4">Fale no WhatsApp</a>
          </p>
        </div>
        <ul className="mt-14 grid max-w-3xl divide-y divide-border border-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[["Até 80%", "de economia na conta de luz"], ["Segura e certificada", "instalação feita por engenheiros"], ["Sem baterias", "o excedente vira crédito na rede"]].map(([t, d]) => (
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

function Faixa() {
  const items = ["Fortaleza", "Eusébio", "Todo o Ceará", "Até 80% de economia", "Sem baterias", "Instalação por engenheiros"];
  const row = [...items, ...items];
  return (
    <div aria-hidden className="overflow-hidden border-y bg-background py-5">
      <div className="marquee flex w-max gap-10">
        {row.map((t, k) => (
          <span key={k} className="display flex items-center gap-10 whitespace-nowrap text-2xl text-muted-foreground md:text-3xl">
            {t}<span className="h-2 w-2 rounded-full bg-primary" />
          </span>
        ))}
      </div>
    </div>
  );
}

function Simulador({ valor, setValor, result, calcValor, onCalc, resultRef }: {
  valor: string; setValor: (v: string) => void; result: SimResult | null; calcValor: number; onCalc: () => void; resultRef: React.RefObject<HTMLDivElement | null>;
}) {
  const ok = parseBRL(valor) > 0;
  const dash = "—";
  const waMsg = result
    ? waLink(`Olá! Fiz a simulação no site: minha conta de luz é de ${formatBRL(calcValor)} por mês e a economia estimada foi de ${formatBRL(result.economiaAnual)} no 1º ano. Gostaria de um orçamento.`)
    : "";
  return (
    <section id="simulacao" className="glow-tr bg-surface py-20 md:py-28">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
        <Reveal>
          <Eyebrow>Simulação</Eyebrow>
          <h2 className="text-4xl md:text-5xl">Quanto você economizaria?</h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">Digite o valor médio da sua conta de luz e veja, na hora, uma estimativa da economia com energia solar no primeiro ano.</p>
          <ol className="mt-8 space-y-5">
            {["Use a média dos últimos meses, que fica no histórico da própria conta.", "Depois, envie o resultado pelo WhatsApp e receba um orçamento com o sistema certo para o seu consumo."].map((t, k) => (
              <li key={k} className="flex gap-4 border-t pt-5">
                <span className="display text-2xl text-brand">0{k + 1}</span>
                <span className="text-muted-foreground">{t}</span>
              </li>
            ))}
          </ol>
        </Reveal>
        <Reveal className="relative overflow-hidden rounded-3xl bg-surface-2 p-5 panel-ring sm:p-8">
          <div aria-hidden className="logo-bar absolute inset-x-0 top-0 h-1" />
          <form onSubmit={(e) => { e.preventDefault(); if (ok) onCalc(); }}>
            <label htmlFor="sim-valor" className="mb-2 block font-semibold">Valor médio da sua conta mensal</label>
            <div className="flex min-h-16 items-center rounded-2xl bg-field px-5 text-field-foreground">
              <span className="mr-2 text-xl font-bold">R$</span>
              <input id="sim-valor" inputMode="decimal" autoComplete="off" placeholder="0,00" value={valor} onChange={(e) => setValor(e.target.value)} className="w-full bg-transparent text-2xl font-bold outline-none placeholder:text-field-foreground/40" />
            </div>
            <button type="submit" disabled={!ok} className={`${btnPrimary} mt-4 w-full min-h-14 text-lg`}>Calcular economia</button>
          </form>
          <div ref={resultRef} aria-live="polite" className="mt-8">
            <div className="rounded-2xl border border-primary/30 bg-background p-5">
              <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Economia estimada no 1º ano</p>
              <p className="display mt-1 text-4xl text-primary sm:text-5xl">{result ? formatBRL(result.economiaAnual) : dash}</p>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-3">
              {[
                ["Economia por mês", result ? formatBRL(result.economiaMensal) : dash],
                ["Nova conta mensal", result ? formatBRL(result.novaContaMensal) : dash],
                ["Nova conta no ano", result ? formatBRL(result.novaContaAnual) : dash],
                ["Consumo estimado", result ? `${formatKwh(result.consumoMensal)} kWh/mês` : dash],
              ].map(([k, v]) => (
                <div key={k} className="rounded-2xl bg-background p-4">
                  <dt className="text-xs text-muted-foreground sm:text-sm">{k}</dt>
                  <dd className="mt-1 text-lg font-bold sm:text-xl">{v}</dd>
                </div>
              ))}
            </dl>
            {result && (
              <a href={waMsg} target="_blank" rel="noopener" className={`${btnWhats} mt-5 w-full min-h-14 text-center animate-in fade-in slide-in-from-bottom-2 duration-500`}>
                <WhatsAppIcon />Quero esse orçamento no WhatsApp
              </a>
            )}
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">Estimativa com base em valores médios de tarifa. A economia real depende do seu consumo, do local e do projeto.</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Beneficios() {
  const items = [
    [TrendingDown, "Até 80% a menos na conta", "Você passa a pagar basicamente a taxa mínima da distribuidora e a parte da rede."],
    [ShieldCheck, "Proteção contra aumentos", "A energia que o seu telhado produz não sofre os reajustes da tarifa."],
    [Home, "Imóvel com mais valor", "Energia solar é um diferencial na hora de vender ou alugar a casa ou o ponto comercial."],
    [Wrench, "Pouca manutenção", "Sem peças em movimento: no dia a dia, basta manter os painéis limpos."],
  ] as const;
  return (
    <section className="glow-bl bg-background py-20 md:py-28">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 lg:grid-cols-[1fr_1.4fr] lg:items-center">
        <Reveal><h2 className="text-4xl md:text-6xl">A conta de luz sobe todo ano. <span className="text-primary">O sol, não.</span></h2></Reveal>
        <Reveal>
          <ul className="grid sm:grid-cols-2">
            {items.map(([Icon, t, d], k) => (
              <li key={t} className={`border-t py-6 sm:px-6 ${k % 2 === 0 ? "sm:pl-0" : "sm:border-l"} ${k > 1 ? "sm:border-t" : ""}`}>
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15"><Icon className="h-5 w-5 text-primary" aria-hidden /></span>
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

function ComoFunciona() {
  const steps = [
    ["Conta de luz", "Você manda a sua conta pelo WhatsApp e calculamos o tamanho do sistema para o seu consumo."],
    ["Visita técnica", "Avaliamos o telhado, a posição do sol, as sombras e a parte elétrica do imóvel."],
    ["Projeto e aprovação", "Fazemos o projeto de engenharia e cuidamos da aprovação junto à distribuidora."],
    ["Instalação", "Equipe própria instala o sistema com segurança e deixa tudo pronto para gerar."],
  ];
  return (
    <section id="como-funciona" className="glow-tr bg-surface-2 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <Eyebrow>Como funciona</Eyebrow>
            <h2 className="text-4xl md:text-5xl">Como o sistema funciona?</h2>
            <div className="mt-6 space-y-4 text-lg leading-relaxed text-muted-foreground">
              <p>Os painéis solares captam a luz do sol e a transformam em energia elétrica. O inversor converte essa energia para que ela possa ser utilizada normalmente.</p>
              <p>Quando o sistema gera mais energia do que você consome, o excedente é enviado para a rede elétrica e convertido em créditos de energia. Esses créditos podem ser utilizados posteriormente, quando o consumo for maior do que a geração.</p>
              <p>Tudo isso sem a necessidade de baterias, tornando a energia solar uma solução mais econômica, eficiente e acessível.</p>
            </div>
          </Reveal>
          <Reveal>
            <Carousel label="Diagrama do sistema fotovoltaico" fit="contain" images={[
              { src: `${IMG}/fotovoltaico1.webp`, alt: "Diagrama: painéis solares, inversor e ligação com a rede elétrica" },
              { src: fv2Img, alt: "Painéis solares em telhado comercial com o inversor instalado na parede" },
            ]} />
          </Reveal>
        </div>
        <Reveal className="mt-24">
          <h2 className="text-3xl md:text-4xl">Do orçamento à energia no seu telhado</h2>
          <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(([t, d], k) => (
              <li key={t} className="group border-t-2 border-foreground/20 pt-5 transition-colors duration-500 hover:border-primary">
                <span className="display block text-6xl text-primary/90">0{k + 1}</span>
                <h3 className="mt-3 text-xl">{t}</h3>
                <p className="mt-2 text-muted-foreground">{d}</p>
              </li>
            ))}
          </ol>
          <div className="mt-14 flex flex-col items-start gap-5 border-t pt-10 sm:flex-row sm:items-center sm:justify-between">
            <p className="display text-2xl md:text-3xl">O primeiro passo leva um minuto.</p>
            <a href={WA_CONTA} target="_blank" rel="noopener" className={btnWhats}><WhatsAppIcon />Enviar minha conta de luz</a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function QuemSomos() {
  return (
    <section className="bg-background py-20 md:py-28">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <Eyebrow>Quem somos</Eyebrow>
          <h2 className="text-3xl md:text-4xl">Tecnologia, experiência e eficiência para transformar projetos em resultados.</h2>
          <div className="mt-6 space-y-4 text-lg leading-relaxed text-muted-foreground">
            <p>A Esolution é uma empresa de engenharia que combina experiência, tecnologia e inovação para desenvolver soluções mais seguras, eficientes e sustentáveis.</p>
            <p>Com uma equipe de profissionais especializados e atuação em diferentes segmentos, buscamos oferecer serviços de alto padrão, sempre com foco em qualidade, pontualidade e excelência.</p>
          </div>
        </Reveal>
        <Reveal>
          <Carousel label="Fotos da empresa" images={[{ src: sobre1Img, alt: "Instaladores fixando trilhos de alumínio em telhado" }, { src: sobre2Img, alt: "Painéis solares em telhado de galpão comercial" }, { src: sobre3Img, alt: "Técnico conectando o inversor solar" }]} />
        </Reveal>
      </div>
    </section>
  );
}

function Equipe() {
  return (
    <section className="bg-surface py-20 md:py-28">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 lg:grid-cols-2 lg:items-center">
        <Reveal className="lg:order-2">
          <Eyebrow>Nossa equipe</Eyebrow>
          <h2 className="text-3xl md:text-4xl">Nossa equipe</h2>
          <div className="mt-6 space-y-4 text-lg leading-relaxed text-muted-foreground">
            <p>O corpo técnico da Esolution é constituído por profissionais com larga experiência nos setores de energia, superestrutura ferroviária e engenharia de incêndio.</p>
            <p>Com uma política de valorização profissional, a empresa proporciona um ambiente corporativo dinâmico, ágil e flexível, capaz de estimular o crescimento da sua equipe e colaboradores, além da troca contínua de conhecimentos e experiências.</p>
          </div>
        </Reveal>
        <Reveal className="lg:order-1">
          <Carousel label="Fotos da equipe" images={[{ src: equipe1Img, alt: "Engenheiros revisando um projeto elétrico no telhado" }, { src: equipe2Img, alt: "Técnicos posicionando um painel solar" }, { src: equipe3Img, alt: "Engenheiro testando a ligação dos painéis solares no telhado" }]} />
        </Reveal>
      </div>
    </section>
  );
}

function Missao() {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(([e]) => { if (!e) return; if (e.isIntersecting) v.play().catch(() => {}); else v.pause(); }, { threshold: 0.2 });
    io.observe(v);
    return () => io.disconnect();
  }, []);
  return (
    <section aria-labelledby="missao-t" className="relative isolate overflow-hidden bg-background py-24 md:py-36">
      <video ref={ref} muted loop playsInline preload="none" aria-hidden className="absolute inset-0 -z-20 h-full w-full object-cover">
        <source src="/videos/missao.mp4" type="video/mp4" />
      </video>
      <div className="video-dim absolute inset-0 -z-10" aria-hidden />
      <Reveal className="mx-auto max-w-5xl px-5">
        <h2 id="missao-t" className="mb-4 flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.14em] text-brand" style={{ fontStretch: "100%" }}><span className="logo-bar h-0.5 w-8 rounded-full" aria-hidden />Nossa missão</h2>
        <p className="display text-2xl leading-snug md:text-4xl md:leading-tight">
          Oferecer as melhores práticas da engenharia, na execução de obras e projetos de infraestrutura, buscando sempre o desenvolvimento sustentável, com respeito ao meio ambiente, o crescimento e o bem-estar de seus colaboradores e a satisfação de seus clientes.
        </p>
      </Reveal>
    </section>
  );
}

function Duvidas() {
  return (
    <section id="duvidas" className="glow-bl bg-surface-2 py-20 md:py-28">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 lg:grid-cols-[1fr_1.6fr]">
        <Reveal>
          <Eyebrow>Dúvidas</Eyebrow>
          <h2 className="text-4xl md:text-5xl">Dúvidas frequentes</h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">O que todo mundo pergunta antes de colocar energia solar em casa. Ficou alguma dúvida? Fale com a gente.</p>
          <a href={waLink("Olá! Tenho uma dúvida sobre energia solar.")} target="_blank" rel="noopener" className="mt-6 inline-flex min-h-12 items-center gap-2 font-bold text-whatsapp">Perguntar no WhatsApp <ArrowRight className="h-5 w-5" /></a>
        </Reveal>
        <Reveal>
          <div className="border-t">
            {FAQ.map(([q, a]) => (
              <details key={q} className="group border-b">
                <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 py-4 text-lg font-bold">
                  <h3 className="text-lg font-bold" style={{ fontStretch: "100%" }}>{q}</h3>
                  <span aria-hidden className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xl transition-transform duration-300 ease-soft group-open:rotate-45">+</span>
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

function ChamadaFinal() {
  return (
    <section className="grain overflow-hidden bg-primary py-16 text-primary-foreground md:py-24">
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-start gap-6 px-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl md:text-6xl">Mande sua conta de luz. A gente faz as contas.</h2>
          <p className="mt-3 text-lg">Uma foto da conta pelo WhatsApp já basta para começarmos o seu orçamento.</p>
        </div>
        <a href={WA_CONTA} target="_blank" rel="noopener" className="inline-flex min-h-14 shrink-0 items-center gap-2 rounded-full bg-primary-foreground px-7 font-bold text-foreground transition-transform duration-300 ease-soft hover:-translate-y-0.5">
          <WhatsAppIcon />Enviar minha conta
        </a>
      </div>
    </section>
  );
}

function Contato() {
  const addr = "Rua Zildênia, 1166 - Sala 05, Amador, Eusébio/CE";
  return (
    <section id="contato" className="bg-background py-20 md:py-28">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 lg:grid-cols-2">
        <Reveal>
          <Eyebrow>Contato</Eyebrow>
          <h2 className="text-4xl md:text-5xl">Fale com a Esolution</h2>
          <ul className="mt-8 divide-y border-y">
            <li><a href={WA_GENERIC} target="_blank" rel="noopener" className="flex min-h-16 items-center gap-4 py-3"><WhatsAppIcon className="h-6 w-6 text-whatsapp" /><span><span className="block text-sm text-muted-foreground">WhatsApp</span><span className="font-bold">(85) 98154-6006</span></span></a></li>
            <li><a href={`mailto:${EMAIL}`} className="flex min-h-16 items-center gap-4 py-3"><Mail className="h-6 w-6 text-brand" /><span><span className="block text-sm text-muted-foreground">E-mail</span><span className="font-bold break-all">{EMAIL}</span></span></a></li>
            <li className="flex min-h-16 items-center gap-4 py-3"><MapPin className="h-6 w-6 shrink-0 text-brand" /><span><span className="block text-sm text-muted-foreground">Endereço</span><span className="font-bold">{addr}</span></span></li>
          </ul>
        </Reveal>
        <Reveal>
          <iframe
            title="Mapa: localização da Esolution Engenharia em Eusébio/CE"
            src={`https://www.google.com/maps?q=${encodeURIComponent(addr)}&output=embed`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-80 w-full rounded-2xl border-0 lg:h-full lg:min-h-96"
          />
        </Reveal>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t bg-surface pb-28 pt-10 md:pb-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 md:flex-row md:items-center md:justify-between">
        <img src={LOGO} alt="Esolution Engenharia" loading="lazy" className="h-10 w-auto self-start" />
        <div className="flex gap-2">
          <a href={WA_GENERIC} target="_blank" rel="noopener" aria-label="WhatsApp" className="flex h-12 w-12 items-center justify-center rounded-full border text-foreground hover:bg-surface-2"><WhatsAppIcon /></a>
          <a href={`mailto:${EMAIL}`} aria-label="E-mail" className="flex h-12 w-12 items-center justify-center rounded-full border text-foreground hover:bg-surface-2"><Mail className="h-5 w-5" /></a>
        </div>
        <div className="text-sm text-muted-foreground">
          <p>© Esolution Engenharia - Todos os direitos reservados.</p>
          <Link to="/privacidade" className="mt-1 inline-flex min-h-12 items-center font-semibold text-foreground underline underline-offset-4">Política de Privacidade</Link>
        </div>
      </div>
    </footer>
  );
}
