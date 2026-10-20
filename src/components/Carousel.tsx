import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  images: { src: string; alt: string }[];
  fit?: "contain" | "cover";
  label: string;
}

export function Carousel({ images, fit = "cover", label }: Props) {
  const [i, setI] = useState(0);
  const n = images.length;
  const go = (d: number) => setI((v) => (v + d + n) % n);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((v) => (v + 1) % n), 6000);
    return () => clearInterval(t);
  }, [n, i]);

  return (
    <div role="region" aria-roledescription="carrossel" aria-label={label} className="relative">
      <div className={`relative overflow-hidden rounded-2xl ${fit === "contain" ? "bg-surface-2" : ""} aspect-[4/3]`}>
        {images.map((img, k) => (
          <img
            key={img.src}
            src={img.src}
            alt={img.alt}
            loading="lazy"
            aria-hidden={k !== i}
            className={`absolute inset-0 h-full w-full transition-opacity duration-700 ease-soft ${fit === "contain" ? "object-contain p-3" : "object-cover"} ${k === i ? "opacity-100" : "opacity-0"} ${fit === "cover" ? "group-hover:scale-105 transition-[opacity,transform]" : ""}`}
          />
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex gap-2">
          {images.map((_, k) => (
            <button
              key={k}
              onClick={() => setI(k)}
              aria-label={`Mostrar imagem ${k + 1}`}
              aria-current={k === i}
              className="flex h-12 w-8 items-center justify-center"
            >
              <span className={`block h-1.5 rounded-full transition-all duration-500 ease-soft ${k === i ? "w-7 bg-primary" : "w-3 bg-muted-foreground/40"}`} />
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={() => go(-1)} aria-label="Imagem anterior" className="flex h-12 w-12 items-center justify-center rounded-full border text-foreground transition-colors hover:bg-surface-2">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button onClick={() => go(1)} aria-label="Próxima imagem" className="flex h-12 w-12 items-center justify-center rounded-full border text-foreground transition-colors hover:bg-surface-2">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function WhatsAppIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.62.71.23 1.36.2 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.04 21.5h-.01a9.4 9.4 0 0 1-4.8-1.32l-.35-.2-3.56.93.95-3.47-.22-.36a9.4 9.4 0 0 1-1.44-5.01C2.61 6.86 6.84 2.64 12.05 2.64c2.52 0 4.89.99 6.67 2.77a9.36 9.36 0 0 1 2.76 6.67c0 5.2-4.23 9.42-9.44 9.42m8.03-17.45A11.27 11.27 0 0 0 12.04.72C5.79.72.7 5.8.7 12.05c0 2 .52 3.95 1.52 5.66L.6 23.28l5.7-1.5a11.3 11.3 0 0 0 5.74 1.46h.01c6.25 0 11.34-5.08 11.34-11.33 0-3.03-1.18-5.87-3.32-8.01" />
    </svg>
  );
}
