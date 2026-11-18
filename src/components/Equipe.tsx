import { Carousel } from "@/components/Carousel";
import { Reveal, Eyebrow } from "@/components/ui/shared";
import equipe1Img from "@/assets/equipe1.jpg";
import equipe2Img from "@/assets/equipe2.jpg";
import equipe3Img from "@/assets/equipe3.jpg";

export function Equipe() {
  return (
    <section className="bg-surface py-20 md:py-28">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 lg:grid-cols-2 lg:items-center">
        <Reveal className="lg:order-2">
          <Eyebrow>Nossa equipe</Eyebrow>
          <h2 className="text-3xl md:text-4xl">Nossa equipe</h2>
          <div className="mt-6 space-y-4 text-lg leading-relaxed text-muted-foreground">
            <p>
              O corpo técnico da Esolution é constituído por profissionais com larga experiência nos
              setores de energia, superestrutura ferroviária e engenharia de incêndio.
            </p>
            <p>
              Com uma política de valorização profissional, a empresa proporciona um ambiente
              corporativo dinâmico, ágil e flexível, capaz de estimular o crescimento da sua equipe
              e colaboradores, além da troca contínua de conhecimentos e experiências.
            </p>
          </div>
        </Reveal>
        <Reveal className="lg:order-1">
          <Carousel
            label="Fotos da equipe"
            images={[
              { src: equipe1Img, alt: "Engenheiros revisando um projeto elétrico no telhado" },
              { src: equipe2Img, alt: "Técnicos posicionando um painel solar" },
              {
                src: equipe3Img,
                alt: "Engenheiro testando a ligação dos painéis solares no telhado",
              },
            ]}
          />
        </Reveal>
      </div>
    </section>
  );
}
