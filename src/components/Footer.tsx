import { Link } from "@tanstack/react-router";
import { WhatsAppIcon } from "@/components/Carousel";
import { Mail } from "lucide-react";
import { LOGO, WA_GENERIC, EMAIL, Reveal } from "@/components/ui/shared";

export function Footer() {
  return (
    <footer className="border-t bg-surface pb-28 pt-10 md:pb-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 md:flex-row md:items-center md:justify-between">
        <img
          src={LOGO}
          alt="Esolution Engenharia"
          loading="lazy"
          className="h-10 w-auto self-start"
        />
        <div className="flex gap-2">
          <a
            href={WA_GENERIC}
            target="_blank"
            rel="noopener"
            aria-label="WhatsApp"
            className="flex h-12 w-12 items-center justify-center rounded-full border text-foreground hover:bg-surface-2"
          >
            <WhatsAppIcon />
          </a>
          <a
            href={`mailto:${EMAIL}`}
            aria-label="E-mail"
            className="flex h-12 w-12 items-center justify-center rounded-full border text-foreground hover:bg-surface-2"
          >
            <Mail className="h-5 w-5" />
          </a>
        </div>
        <div className="text-sm text-muted-foreground">
          <p>© Esolution Engenharia - Todos os direitos reservados.</p>
          <Link
            to="/privacidade"
            className="mt-1 inline-flex min-h-12 items-center font-semibold text-foreground underline underline-offset-4"
          >
            Política de Privacidade
          </Link>
        </div>
      </div>
    </footer>
  );
}
