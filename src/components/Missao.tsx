import { useRef, useEffect } from "react";
import { Reveal } from "@/components/ui/shared";

export function Missao() {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e) return;
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.2 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);
  return (
    <section
      aria-labelledby="missao-t"
      className="relative isolate overflow-hidden bg-background py-24 md:py-36"
    >
      <video
        ref={ref}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
        className="absolute inset-0 -z-20 h-full w-full object-cover"
      >
        <source src="/videos/missao.mp4" type="video/mp4" />
      </video>
      <div className="video-dim absolute inset-0 -z-10" aria-hidden="true" />
      <Reveal className="mx-auto max-w-5xl px-5">
        <h2
          id="missao-t"
          className="mb-4 flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.14em] text-brand"
          style={{ fontStretch: "100%" }}
        >
          <span className="logo-bar h-0.5 w-8 rounded-full" aria-hidden="true" />
          Nossa missão
        </h2>
        <p className="display text-2xl leading-snug md:text-4xl md:leading-tight">
          Oferecer as melhores práticas da engenharia, na execução de obras e projetos de
          infraestrutura, buscando sempre o desenvolvimento sustentável, com respeito ao meio
          ambiente, o crescimento e o bem-estar de seus colaboradores e a satisfação de seus
          clientes.
        </p>
      </Reveal>
    </section>
  );
}
