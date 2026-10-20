---
status: implemented
---

# 1.3 — Landing page para tráfego pago

Pedido em 2026-10-19: deixar o site pronto para receber anúncios (Meta/Google), com uma ação
principal: simular a economia e chamar no WhatsApp.

## Mudanças

- **Simulador no hero.** O visitante digita a conta de luz já na primeira tela; o resultado abre no
  simulador completo logo abaixo.
- **Seção de benefícios** ("A conta de luz sobe todo ano. O sol, não.") com 4 benefícios, sem números
  inventados.
- **CTA depois das etapas** e texto do botão do simulador mais direto.
- **Barra fixa no celular** com "Simular" e "WhatsApp", no lugar do botão flutuante.
- **Menu enxuto:** só as seções que ajudam a decidir (Simulação, Como funciona, Dúvidas, Contato) e o
  botão de orçamento.
- **Medição:** evento `simulacao` no GA4 e `Simulacao` no Meta Pixel a cada cálculo, para usar como
  conversão nos anúncios.

## A confirmar com o cliente

- "Orçamento sem compromisso".
- Benefícios de valorização do imóvel e baixa manutenção (padrão do setor).

## Critério de pronto

- Hero → resultado funciona com Enter e clique, no celular e no desktop.
- Barra fixa não cobre conteúdo nem o aviso de cookies.
- Sem erros no console e sem rolagem horizontal.
