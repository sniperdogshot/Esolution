import { createFileRoute, Link } from "@tanstack/react-router";

const LOGO = "/images/EsolutionLogo1.webp";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade | Esolution Engenharia" },
      { name: "description", content: "Como a Esolution Engenharia trata seus dados neste site, conforme a LGPD." },
      { property: "og:title", content: "Política de Privacidade | Esolution Engenharia" },
      { property: "og:description", content: "Como a Esolution Engenharia trata seus dados neste site, conforme a LGPD." },
    ],
  }),
  component: Privacidade,
});

function Privacidade() {
  const h2 = "mt-10 text-2xl";
  const p = "mt-4 leading-relaxed text-muted-foreground";
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-surface">
        <div className="mx-auto flex max-w-3xl items-center px-5 py-4">
          <Link to="/"><img src={LOGO} alt="Esolution Engenharia" className="h-10 w-auto" /></Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-5 py-14">
        <h1 className="text-4xl md:text-5xl">Política de Privacidade</h1>
        <p className={p}>Esta página explica quais dados a Esolution Engenharia coleta neste site, para quê, e como você pode exercer seus direitos previstos na Lei Geral de Proteção de Dados (Lei nº 13.709/2018).</p>
        <h2 className={h2}>Quais dados coletamos</h2>
        <ul className={`${p} list-disc space-y-3 pl-5`}>
          <li><strong className="text-foreground">Dados de navegação</strong>, somente se você aceitar os cookies: páginas visitadas, cliques, tipo de dispositivo e localização aproximada, coletados pelo Google Analytics, Google Tag Manager e Meta Pixel.</li>
          <li><strong className="text-foreground">Dados de contato</strong>, quando você fala conosco por WhatsApp ou e-mail: número de telefone ou e-mail, e as informações que você enviar para o orçamento (valor da conta de energia, cidade da instalação e equipamentos que pretende instalar).</li>
        </ul>
        <p className={p}>O valor digitado no simulador de economia é calculado no seu próprio navegador e não é enviado a nós, a menos que você escolha mandá-lo pelo WhatsApp.</p>
        <h2 className={h2}>Para que usamos</h2>
        <ul className={`${p} list-disc space-y-2 pl-5`}>
          <li>Responder ao seu contato e preparar o orçamento solicitado.</li>
          <li>Entender como o site é usado e medir o resultado dos nossos anúncios.</li>
        </ul>
        <h2 className={h2}>Com quem compartilhamos</h2>
        <p className={p}>Os dados de navegação são tratados pelo Google e pela Meta, que fornecem as ferramentas de medição. As conversas por WhatsApp passam pela plataforma WhatsApp Business, da Meta. Não vendemos seus dados.</p>
        <h2 className={h2}>Cookies</h2>
        <p className={p}>Os cookies de medição e publicidade só são ativados depois que você clica em "Aceitar" no aviso do site. Para mudar sua escolha, apague os dados deste site no seu navegador e o aviso será exibido novamente.</p>
        <h2 className={h2}>Seus direitos</h2>
        <p className={p}>Você pode pedir a confirmação, o acesso, a correção ou a exclusão dos seus dados, e retirar o seu consentimento a qualquer momento, escrevendo para <a className="text-foreground underline" href="mailto:juliano@esolut.eng.br">juliano@esolut.eng.br</a>.</p>
        <h2 className={h2}>Contato</h2>
        <p className={p}>Esolution Engenharia — Rua Zildênia, 1166 - Sala 05, Amador, Eusébio/CE.</p>
        <p className={p}>E-mail: <a className="text-foreground underline" href="mailto:juliano@esolut.eng.br">juliano@esolut.eng.br</a></p>
        <Link to="/" className="mt-10 inline-flex min-h-12 items-center rounded-full bg-primary px-6 font-bold text-primary-foreground">Voltar para o site</Link>
      </main>
    </div>
  );
}
