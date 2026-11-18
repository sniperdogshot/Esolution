import { WhatsAppIcon } from "@/components/Carousel";
import { WA_CONTA, btnWhats } from "@/components/ui/shared";

export function ChamadaFinal() {
  return (
    <section className="grain overflow-hidden bg-primary py-16 text-primary-foreground md:py-24">
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-start gap-6 px-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl md:text-6xl">Mande sua conta de luz. A gente faz as contas.</h2>
          <p className="mt-3 text-lg">
            Uma foto da conta pelo WhatsApp já basta para começarmos o seu orçamento.
          </p>
        </div>
        <a
          href={WA_CONTA}
          target="_blank"
          rel="noopener"
          className="inline-flex min-h-14 shrink-0 items-center gap-2 rounded-full bg-primary-foreground px-7 font-bold text-foreground transition-transform duration-300 ease-soft hover:-translate-y-0.5"
        >
          <WhatsAppIcon />
          Enviar minha conta
        </a>
      </div>
    </section>
  );
}
