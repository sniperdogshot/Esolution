import { getGaId } from "./ga.functions";

export const CONSENT_KEY = "esolutionCookieConsent";
const PIXEL_ID = "1281633922901130";
const GTM_ID = "GTM-PDXMRRWM";

type AnyFn = (...args: unknown[]) => void;
declare global {
  interface Window {
    gtag?: AnyFn;
    fbq?: AnyFn & { callMethod?: AnyFn; queue?: unknown[]; loaded?: boolean; version?: string; push?: AnyFn };
    _fbq?: unknown;
    dataLayer?: unknown[];
  }
}

let loaded = false;

function addScript(src: string) {
  const s = document.createElement("script");
  s.async = true;
  s.src = src;
  document.head.appendChild(s);
}

/** Loads GTM, GA4 and Meta Pixel. Must only be called after the visitor accepts cookies. */
export async function loadTracking() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
  addScript(`https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`);

  // Meta Pixel
  const fbq: any = function (...args: unknown[]) {
    fbq.callMethod ? fbq.callMethod(...args) : fbq.queue.push(args);
  };
  fbq.push = fbq; fbq.loaded = true; fbq.version = "2.0"; fbq.queue = [];
  window.fbq = fbq; window._fbq = fbq;
  addScript("https://connect.facebook.net/en_US/fbevents.js");
  fbq("init", PIXEL_ID);
  fbq("track", "PageView");

  try {
    const { id } = await getGaId();
    if (id) {
      addScript(`https://www.googletagmanager.com/gtag/js?id=${id}`);
      window.gtag = function () {
        // eslint-disable-next-line prefer-rest-params
        window.dataLayer!.push(arguments);
      };
      window.gtag("set", "developer_id.dZjgwMW", true);
      window.gtag("js", new Date());
      window.gtag("config", id);
    }
  } catch (e) {
    console.error("GA4 não carregou", e);
  }
}

export function trackWhatsApp() {
  window.gtag?.("event", "clique_whatsapp");
  window.fbq?.("track", "Contact");
}
export function trackEmail() {
  window.gtag?.("event", "clique_email");
  window.fbq?.("trackCustom", "EmailClick");
}
export function trackSimulacao(value: number) {
  const data = { value, currency: "BRL" };
  window.gtag?.("event", "simulacao", data);
  window.fbq?.("trackCustom", "Simulacao", data);
}
