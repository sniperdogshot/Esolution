import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { WhatsAppIcon } from "@/components/Carousel";
import { navLinks, WA_GENERIC, btnPrimary, btnWhats, LOGO } from "@/components/ui/shared";

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? "bg-background/95 backdrop-blur-sm shadow-md border-b border-border" : "bg-background/95 backdrop-blur-sm shadow-sm border-b border-border"}`}
    >
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <a href="#" aria-label="Esolution Engenharia, início">
          <img src={LOGO} alt="Esolution Engenharia" className="h-10 w-auto md:h-11" />
        </a>
        <nav aria-label="Principal" className="hidden items-center gap-8 md:flex">
          {navLinks.map(([h, l]) => (
            <a
              key={h}
              href={h}
              className="font-medium text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm px-2 py-1 -mx-2"
            >
              {l}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a href={WA_GENERIC} target="_blank" rel="noopener" className={`${btnPrimary} px-5`}>
            <WhatsAppIcon />
            Orçamento
          </a>
          <button
            onClick={() => setOpen(true)}
            aria-label="Abrir menu"
            aria-expanded={open}
            className="flex h-12 w-12 items-center justify-center rounded-full text-foreground md:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 md:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 video-dim" />
          <nav
            aria-label="Menu"
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 top-0 flex h-full w-72 flex-col bg-surface p-5 animate-in slide-in-from-right duration-300"
          >
            <button
              onClick={() => setOpen(false)}
              aria-label="Fechar menu"
              className="ml-auto flex h-12 w-12 items-center justify-center rounded-full text-foreground"
            >
              <X className="h-6 w-6" />
            </button>
            <ul className="mt-6 space-y-1">
              {navLinks.map(([h, l]) => (
                <li key={h}>
                  <a
                    href={h}
                    onClick={() => setOpen(false)}
                    className="flex min-h-12 items-center border-b text-xl font-bold text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface rounded-sm px-2 py-1 -mx-2"
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
            <a href={WA_GENERIC} target="_blank" rel="noopener" className={`${btnWhats} mt-8`}>
              <WhatsAppIcon />
              Falar no WhatsApp
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
