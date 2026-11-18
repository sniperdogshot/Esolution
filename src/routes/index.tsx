import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState, useEffect } from "react";
import { Calculator } from "lucide-react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Simulator, type SimulatorHandle } from "@/components/Simulator";
import { Beneficios } from "@/components/Beneficios";
import { ComoFunciona } from "@/components/ComoFunciona";
import { QuemSomos } from "@/components/QuemSomos";
import { Equipe } from "@/components/Equipe";
import { Missao } from "@/components/Missao";
import { Duvidas } from "@/components/Duvidas";
import { ChamadaFinal } from "@/components/ChamadaFinal";
import { Contato } from "@/components/Contato";
import { Faixa } from "@/components/Faixa";
import { Footer } from "@/components/Footer";
import { WhatsAppIcon } from "@/components/Carousel";
import { faqSchema, localBusinessSchema, simulatorSchema } from "@/lib/seo";
import {
  SITE,
  IMG,
  LOGO,
  OG,
  TITLE,
  DESC,
  EMAIL,
  ADDRESS,
  PHONE,
  WA_GENERIC,
  FAQ,
  btnPrimary,
  btnWhats,
} from "@/components/ui/shared";

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
    scripts: [localBusinessSchema, faqSchema, simulatorSchema],
  }),
  component: Index,
});

function Index() {
  const [heroOut, setHeroOut] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const simulatorRef = useRef<SimulatorHandle>(null);
  const [heroValor, setHeroValor] = useState("");

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e && setHeroOut(!e.isIntersecting), {
      threshold: 0,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const handleHeroSubmit = (v: string) => {
    setHeroValor(v);
    simulatorRef.current?.calculate(v, true);
  };

  const handleCalculated = () => {
    // Called when simulation completes - could add analytics here
  };

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-primary focus:px-5 focus:py-3 focus:font-bold focus:text-primary-foreground"
      >
        Pular para o conteúdo
      </a>
      <Header />
      <main id="main-content">
        <Hero heroRef={heroRef} onSubmit={handleHeroSubmit} />
        <Faixa />
        <Simulator ref={simulatorRef} initialValor={heroValor} onCalculated={handleCalculated} />
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
      <a
        href={WA_GENERIC}
        target="_blank"
        rel="noopener"
        aria-label="Falar no WhatsApp"
        className="fixed bottom-6 right-6 z-40 hidden h-16 w-16 items-center justify-center rounded-full bg-whatsapp text-primary-foreground shadow-lift transition-transform duration-300 ease-soft hover:scale-105 md:flex"
      >
        <WhatsAppIcon className="h-8 w-8" />
      </a>
      <div
        className={`fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 gap-3 border-t bg-surface p-3 transition-transform duration-500 ease-soft md:hidden ${heroOut ? "translate-y-0" : "translate-y-full"}`}
        aria-hidden={!heroOut}
      >
        <a href="#simulacao" tabIndex={heroOut ? 0 : -1} className={btnPrimary}>
          <Calculator className="h-5 w-5" />
          Simular
        </a>
        <a
          href={WA_GENERIC}
          target="_blank"
          rel="noopener"
          tabIndex={heroOut ? 0 : -1}
          className={btnWhats}
        >
          <WhatsAppIcon />
          WhatsApp
        </a>
      </div>
    </>
  );
}
