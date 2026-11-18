import { Carousel } from "@/components/Carousel";
import { Reveal, Eyebrow } from "@/components/ui/shared";
import sobre1Img from "@/assets/sobre1.jpg";
import sobre2Img from "@/assets/sobre2.jpg";
import sobre3Img from "@/assets/sobre3.jpg";

export function QuemSomos() {
  return (
    <section className="bg-background py-20 md:py-28">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <Eyebrow>Quem somos</Eyebrow>
          <h2 className="text-3xl md:text-4xl">
            Tecnologia, experiência e eficiência para transformar projetos em resultados.
          </h2>
          <div className="mt-6 space-y-4 text-lg leading-relaxed text-muted-foreground">
            <p>
              A Esolution é uma empresa de engenharia que combina experiência, tecnologia e inovação
              para desenvolver soluções mais seguras, eficientes e sustentáveis.
            </p>
            <p>
              Com uma equipe de profissionais especializados e atuação em diferentes segmentos,
              buscamos oferecer serviços de alto padrão, sempre com foco em qualidade, pontualidade
              e excelência.
            </p>
          </div>
        </Reveal>
        <Reveal>
          <Carousel
            label="Fotos da empresa"
            images={[
              { src: sobre1Img, alt: "Instaladores fixando trilhos de alumínio em telhado" },
              { src: sobre2Img, alt: "Painéis solares em telhado de galpão comercial" },
              { src: sobre3Img, alt: "Técnico conectando o inversor solar" },
            ]}
          />
        </Reveal>
      </div>
    </section>
  );
}
