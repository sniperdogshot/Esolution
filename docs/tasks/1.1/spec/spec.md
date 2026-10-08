---
status: approved
---

# 1.1 — Melhorias do site e do bot de WhatsApp

## Objetivo

Aplicar as 24 melhorias levantadas na revisão de 2026-10-08: tirar credenciais do Git, fazer o bot
realmente responder no WhatsApp, corrigir bugs do simulador, reduzir o peso da página e melhorar
conversão, SEO, LGPD e acessibilidade.

## Comportamento esperado

**Site**

- Página em modo padrão (`<!DOCTYPE html>`, `lang="pt-BR"`), com `canonical`, Open Graph completo e
  imagem de compartilhamento 1200×630.
- Imagens em WebP (~100 KB cada), com `loading="lazy"` fora da primeira dobra; vídeo só carrega e
  toca quando entra na tela.
- Simulador: campo com "R$", Enter calcula, sem erro no console; mostra consumo, nova conta mensal
  e anual, economia mensal e economia no 1º ano. Os números são os mesmos de hoje (fórmula e
  constantes não mudam).
- Depois do cálculo aparece "Receber orçamento no WhatsApp", com a conta e a economia na mensagem.
- Link de e-mail usa `mailto:`.
- Meta Pixel, GTM e GA4 só carregam depois de "Aceitar" no aviso de cookies; "Recusar" não carrega
  nada. Há uma página `privacidade.html`.
- Menu, carrossel e botões flutuantes funcionam por teclado e têm rótulos para leitor de tela.

**Bot**

- Cada mensagem de texto recebida no webhook gera uma resposta enviada pela Graph API.
- Webhook recusa (403) requisição sem assinatura `X-Hub-Signature-256` válida.
- `/testar` só existe com `ENABLE_TEST_ROUTE=1`. `VERIFY_TOKEN` não tem valor padrão no código.
- Valor da conta aceita "500", "R$ 500", "500 reais", "450.50", "450,50", "1.200,50".
- Ao finalizar, o lead é enviado por WhatsApp para `NOTIFY_PHONE`. Depois disso o bot responde uma
  vez "já registrado" e fica em silêncio; após 30 dias, um novo contato recomeça o fluxo.
- Mensagem repetida pela Meta (mesmo id) é ignorada.

## Mudanças

- `index.html` — estrutura, metadados, simulador, links, aviso de cookies, acessibilidade.
- `style.css` — cores de hover, simulador, aviso de cookies, fade-in, remoção de CSS sem uso.
- `script.js` — menu, carrossel, vídeo, simulador; remove código morto.
- `tracking.js` (novo) — consentimento e carregamento de Pixel/GTM/GA4.
- `privacidade.html` (novo) — política de privacidade.
- `images/` — WebP, favicon pequeno, `og-image.jpg`; remove arquivos sem uso.
- `netlify.toml` (novo) — bloqueia `/whatsapp-bot/*` no site publicado.
- `.gitignore` (novo), `whatsapp-bot/.env.example` (novo).
- `whatsapp-bot/main.py`, `whatsapp-bot/database.py` — envio, assinatura, parsing, notificação.
- `whatsapp-bot/.env` e `__pycache__` deixam de ser versionados (o arquivo local fica).

## Edge cases

- Sem `localStorage`: o aviso de cookies reaparece a cada visita; nada quebra.
- Sem JavaScript: conteúdo visível (fade-in não esconde nada), ícones via `<noscript>`.
- Falha no envio pela Graph API: registra em log e devolve 200, para a Meta não reenviar em loop.
- `NOTIFY_PHONE` só recebe texto livre se tiver falado com o número do bot nas últimas 24h (regra
  da Meta); fora disso o envio falha e fica no log.
- Não há mudança de schema no banco.

## Fora do escopo (dependem do dono)

- Trocar a senha do banco e o `VERIFY_TOKEN` já expostos no GitHub.
- Domínio próprio, coordenadas e horário de funcionamento no Schema.org.
- Revisão jurídica do texto da política de privacidade.
- Commit e push.

## Critério de pronto

- Página abre sem erro no console; simulador devolve os mesmos valores de antes.
- Nenhuma requisição a Google/Meta antes de aceitar os cookies.
- Fluxo completo do bot testado localmente com SQLite e envio simulado.
- `git ls-files` não lista `.env` nem `__pycache__`.
