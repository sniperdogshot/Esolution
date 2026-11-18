import { Mail, MapPin } from "lucide-react";
import { WhatsAppIcon } from "@/components/Carousel";
import { WA_GENERIC, EMAIL, ADDRESS, Reveal, Eyebrow } from "@/components/ui/shared";

export function Contato() {
  return (
    <section id="contato" className="bg-background py-20 md:py-28">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 lg:grid-cols-2">
        <Reveal>
          <Eyebrow>Contato</Eyebrow>
          <h2 className="text-4xl md:text-5xl">Fale com a Esolution</h2>
          <ul className="mt-8 divide-y border-y">
            <li>
              <a
                href={WA_GENERIC}
                target="_blank"
                rel="noopener"
                className="flex min-h-16 items-center gap-4 py-3"
              >
                <WhatsAppIcon className="h-6 w-6 text-whatsapp" />
                <span>
                  <span className="block text-sm text-muted-foreground">WhatsApp</span>
                  <span className="font-bold">(85) 92103-5492</span>
                </span>
              </a>
            </li>
            <li>
              <a href={`mailto:${EMAIL}`} className="flex min-h-16 items-center gap-4 py-3">
                <Mail className="h-6 w-6 text-brand" />
                <span>
                  <span className="block text-sm text-muted-foreground">E-mail</span>
                  <span className="font-bold break-all">{EMAIL}</span>
                </span>
              </a>
            </li>
            <li className="flex min-h-16 items-center gap-4 py-3">
              <MapPin className="h-6 w-6 shrink-0 text-brand" />
              <span>
                <span className="block text-sm text-muted-foreground">Endereço</span>
                <span className="font-bold">{ADDRESS}</span>
              </span>
            </li>
          </ul>
        </Reveal>
        <Reveal>
          <iframe
            title="Mapa: localização da Esolution Engenharia em Eusébio/CE"
            src={`https://www.google.com/maps?q=${encodeURIComponent(ADDRESS)}&output=embed`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-80 w-full rounded-2xl border-0 lg:h-full lg:min-h-96"
          />
        </Reveal>
      </div>
    </section>
  );
}
