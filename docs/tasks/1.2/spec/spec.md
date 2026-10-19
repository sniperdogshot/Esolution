---
status: implemented
---

# 1.2 — Redesenho visual e foco no cliente

Pedido em 2026-10-19: melhorar o visual e a experiência do cliente de energia solar antes de publicar.
Contexto de marca em `PRODUCT.md`.

## Decisões

- **Cores do logo.** Paleta em OKLCH derivada do "E" do logo (`#00baa0` → `#30be5a`): verde-floresta
  escuro para superfícies escuras, branco levemente quente para as claras, verde-limão como cor de ação.
  O verde `#2E7D32` antigo e os amarelos foram removidos.
- **Tipografia.** Archivo (variável em largura e peso) no lugar de Montserrat; títulos expandidos.
- **Site todo escuro** (o cliente não gostou do fundo branco, 2026-10-19). As seções alternam três
  tons de verde-floresta; só o campo do simulador continua claro, para ler bem no sol. A faixa
  "Mande sua conta de luz" é a única superfície em verde-limão.

## Mudanças de conteúdo

- Hero alinhado à esquerda, sem logo duplicado, com dois CTAs (simulador e WhatsApp) e três provas
  já usadas pelo cliente (até 80%, instalação certificada, sem baterias).
- Simulador logo após o hero, com o resultado principal (economia no 1º ano) em destaque.
- Novo bloco "Do orçamento à energia no seu telhado" com 4 etapas.
- Missão como faixa sobre o vídeo.
- Nova seção "Dúvidas frequentes" (6 perguntas, `<details>`, com dados estruturados `FAQPage`).
- Faixa final "Mande sua conta de luz" com CTA para o WhatsApp.
- Botão "Orçamento" fixo no menu.

## A confirmar com o cliente

- Etapa 3 diz que a Esolution "cuida da aprovação junto à distribuidora".
- Etapa 4 diz "equipe própria".
- Respostas das dúvidas sobre conta mínima (Lei 14.300) e vida útil dos equipamentos.

## Critério de pronto

- Sem erros no console; sem rolagem horizontal em 390px e 1440px.
- Simulador devolve os mesmos valores da versão anterior.
- Menu mobile abre, fecha e navega.
