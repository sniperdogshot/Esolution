import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { CONSENT_KEY, loadTracking } from "@/lib/tracking";

export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const v = localStorage.getItem(CONSENT_KEY);
    if (v === "aceito") void loadTracking();
    else if (v !== "recusado") setShow(true);
  }, []);

  if (!show) return null;

  const choose = (v: "aceito" | "recusado") => {
    localStorage.setItem(CONSENT_KEY, v);
    setShow(false);
    if (v === "aceito") void loadTracking();
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Aviso de cookies"
      className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-md rounded-2xl border bg-surface-2 p-5 shadow-lift md:left-auto md:right-6 md:bottom-6 md:mx-0"
    >
      <p className="text-sm leading-relaxed text-muted-foreground">
        Usamos cookies para medir visitas e anúncios, só se você permitir.{" "}
        <Link to="/privacidade" className="font-semibold text-foreground underline underline-offset-4">
          Política de Privacidade
        </Link>
      </p>
      <div className="mt-4 flex gap-3">
        <button onClick={() => choose("recusado")} className="min-h-12 flex-1 rounded-full border px-5 font-semibold text-foreground transition-colors hover:bg-surface">
          Recusar
        </button>
        <button onClick={() => choose("aceito")} className="min-h-12 flex-1 rounded-full bg-primary px-5 font-bold text-primary-foreground transition-transform ease-soft hover:-translate-y-0.5">
          Aceitar
        </button>
      </div>
    </div>
  );
}
