import { PHONE, EMAIL, ADDRESS, SITE, LOGO } from "@/lib/constants";
import { WA_GENERIC } from "@/components/ui/shared";

export const localBusinessSchema = {
  type: "application/ld+json",
  children: JSON.stringify({
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Esolution Engenharia",
    telephone: PHONE,
    email: EMAIL,
    image: `${SITE}${LOGO}`,
    address: { "@type": "PostalAddress", streetAddress: ADDRESS, addressCountry: "BR" },
    areaServed: [
      { "@type": "City", name: "Fortaleza" },
      { "@type": "City", name: "Eusébio" },
      { "@type": "State", name: "Ceará" },
    ],
  }),
};

export const faqSchema = {
  type: "application/ld+json",
  children: JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "A energia solar funciona em dias nublados?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Funciona, com produção menor. O sistema é dimensionado pela média de sol do ano inteiro, e o Ceará está entre os lugares com mais sol do Brasil.",
        },
      },
      {
        "@type": "Question",
        name: "E à noite, de onde vem a energia?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Da rede da distribuidora. O que o sistema gera a mais durante o dia vira créditos de energia, que abatem o consumo da noite e dos meses com menos sol.",
        },
      },
      {
        "@type": "Question",
        name: "Preciso comprar baterias?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Não. No sistema conectado à rede, os créditos de energia fazem o papel da bateria, o que deixa o investimento menor.",
        },
      },
      {
        "@type": "Question",
        name: "Minha conta de luz vai zerar?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Não. Continua a cobrança mínima da distribuidora (custo de disponibilidade) e, pelas regras atuais, uma parte do uso da rede. Por isso a economia é de até 80%, e não de 100%.",
        },
      },
      {
        "@type": "Question",
        name: "Quanto tempo dura um sistema de energia solar?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Os painéis costumam durar mais de 25 anos. O inversor tem vida útil menor e pode precisar ser trocado ao longo desse período.",
        },
      },
      {
        "@type": "Question",
        name: "Como eu começo?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Faça a simulação ou mande uma foto da sua conta de luz pelo WhatsApp. A partir dela calculamos o sistema e combinamos a visita técnica.",
        },
      },
    ],
  }),
};

export const simulatorSchema = {
  type: "application/ld+json",
  children: JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Simulador de Economia Solar",
    description:
      "Calcule sua economia estimada com energia solar no primeiro ano baseada no valor da sua conta de luz.",
    provider: { "@type": "LocalBusiness", name: "Esolution Engenharia" },
    areaServed: { "@type": "State", name: "Ceará" },
    potentialAction: {
      "@type": "ViewAction",
      target: WA_GENERIC,
      name: "Solicitar orçamento via WhatsApp",
    },
  }),
};
