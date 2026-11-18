import { type ReactNode, useRef, useEffect } from "react";
import {
  Menu,
  X,
  Mail,
  MapPin,
  ArrowRight,
  TrendingDown,
  ShieldCheck,
  Home,
  Wrench,
  Calculator,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/Carousel";

/* ---------- shared constants ---------- */

import {
  SITE,
  IMG,
  LOGO,
  OG,
  TITLE,
  DESC,
  EMAIL,
  ADDRESS,
  PHONE,
  PHONE_DISPLAY,
  WHATSAPP_NUMBER,
  WA_GENERIC_MSG,
  WA_CONTA_MSG,
  FAQ,
} from "@/lib/constants";

export {
  SITE,
  IMG,
  LOGO,
  OG,
  TITLE,
  DESC,
  EMAIL,
  ADDRESS,
  PHONE,
  PHONE_DISPLAY,
  WHATSAPP_NUMBER,
  WA_GENERIC_MSG,
  WA_CONTA_MSG,
  FAQ,
};

export const WA_GENERIC = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WA_GENERIC_MSG)}`;
export const WA_CONTA = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WA_CONTA_MSG)}`;

/* ---------- shared styles ---------- */

export const btnPrimary =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 font-bold text-primary-foreground transition-all duration-300 ease-soft hover:-translate-y-0.5 hover:shadow-lift disabled:pointer-events-none disabled:opacity-40";
export const btnWhats =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-whatsapp px-6 font-bold text-primary-foreground transition-all duration-300 ease-soft hover:-translate-y-0.5 hover:shadow-lift";

/* ---------- shared icons ---------- */

export { WhatsAppIcon };

/* ---------- shared components ---------- */

interface RevealProps {
  children: ReactNode;
  className?: string;
}

export function Reveal({ children, className = "" }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e) return;
        if (e.isIntersecting) {
          el.classList.add("is-visible");
          io.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  );
}

interface EyebrowProps {
  children: ReactNode;
}

export function Eyebrow({ children }: EyebrowProps) {
  return (
    <p className="mb-4 flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.14em] text-brand">
      <span className="logo-bar h-0.5 w-8 rounded-full" aria-hidden="true" />
      {children}
    </p>
  );
}

/* ---------- nav links ---------- */

export const navLinks = [
  ["#simulacao", "Simulação"],
  ["#como-funciona", "Como funciona"],
  ["#duvidas", "Dúvidas"],
  ["#contato", "Contato"],
] as const;
