import { Carousel } from "@/components/Carousel";
import { Reveal, Eyebrow, WA_CONTA, btnWhats, WhatsAppIcon, IMG } from "@/components/ui/shared";
import fv2Img from "@/assets/fotovoltaico2.jpg";

export function ComoFunciona() {
  const steps = [
    [
      "Conta de luz",
      "Você manda a sua conta pelo WhatsApp e calculamos o tamanho do sistema para o seu consumo.",
    ],
    [
      "Visita técnica",
      "Avaliamos o telhado, a posição do sol, as sombras e a parte elétrica do imóvel.",
    ],
    [
      "Projeto e aprovação",
      "Fazemos o projeto de engenharia e cuidamos da aprovação junto à distribuidora.",
    ],
    [
      "Instalação",
      "Equipe própria instala o sistema com segurança e deixa tudo pronto para gerar.",
    ],
  ];

  return (
    <section id="como-funciona" className="glow-tr bg-surface-2 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <Eyebrow>Como funciona</Eyebrow>
            <h2 className="text-4xl md:text-5xl">Como o sistema funciona?</h2>
            <div className="mt-6 space-y-4 text-lg leading-relaxed text-muted-foreground">
              <p>
                Os painéis solares captam a luz do sol e a transformam em energia elétrica. O
                inversor converte essa energia para que ela possa ser utilizada normalmente.
              </p>
              <p>
                Quando o sistema gera mais energia do que você consome, o excedente é enviado para a
                rede elétrica e convertido em créditos de energia. Esses créditos podem ser
                utilizados posteriormente, quando o consumo for maior do que a geração.
              </p>
              <p>
                Tudo isso sem a necessidade de baterias, tornando a energia solar uma solução mais
                econômica, eficiente e acessível.
              </p>
            </div>
          </Reveal>
          <Reveal>
            <Carousel
              label="Diagrama do sistema fotovoltaico"
              fit="contain"
              images={[
                {
                  src: `${IMG}/fotovoltaico1.webp`,
                  alt: "Diagrama: painéis solares, inversor e ligação com a rede elétrica",
                },
                {
                  src: fv2Img,
                  alt: "Painéis solares em telhado comercial com o inversor instalado na parede",
                },
              ]}
            />
          </Reveal>
        </div>
        <Reveal className="mt-24">
          <h2 className="text-3xl md:text-4xl">Do orçamento à energia no seu telhado</h2>
          <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(([t, d], k) => (
              <li
                key={t}
                className="group border-t-2 border-foreground/20 pt-5 transition-colors duration-500 hover:border-primary"
              >
                <span className="display block text-6xl text-primary/90">0{k + 1}</span>
                <h3 className="mt-3 text-xl">{t}</h3>
                <p className="mt-2 text-muted-foreground">{d}</p>
              </li>
            ))}
          </ol>
          <div className="mt-14 flex flex-col items-start gap-5 border-t pt-10 sm:flex-row sm:items-center sm:justify-between">
            <p className="display text-2xl md:text-3xl">O primeiro passo leva um minuto.</p>
            <a href={WA_CONTA} target="_blank" rel="noopener" className={btnWhats}>
              <WhatsAppIcon />
              Enviar minha conta de luz
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
