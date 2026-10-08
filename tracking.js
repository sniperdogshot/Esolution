// Consentimento de cookies + Meta Pixel, Google Tag Manager e GA4.
// Nada de rastreamento é carregado antes de o visitante aceitar.

const CONSENT_KEY = 'esolutionCookieConsent';

function lerConsentimento() {
  try {
    return localStorage.getItem(CONSENT_KEY);
  } catch (e) {
    return null;
  }
}

function salvarConsentimento(valor) {
  try {
    localStorage.setItem(CONSENT_KEY, valor);
  } catch (e) {
    // sem localStorage (aba anônima etc.): vale só para esta visita
  }
}

function carregarRastreamento() {
  if (window.rastreamentoCarregado) return;
  window.rastreamentoCarregado = true;

  // Meta Pixel
  !function (f, b, e, v, n, t, s) {
    if (f.fbq) return; n = f.fbq = function () {
      n.callMethod ?
        n.callMethod.apply(n, arguments) : n.queue.push(arguments)
    };
    if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
    n.queue = []; t = b.createElement(e); t.async = !0;
    t.src = v; s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s)
  }(window, document, 'script',
    'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', '1281633922901130');
  fbq('track', 'PageView');

  // Google Tag Manager
  (function (w, d, s, l, i) {
    w[l] = w[l] || []; w[l].push({
      'gtm.start':
        new Date().getTime(), event: 'gtm.js'
    }); var f = d.getElementsByTagName(s)[0],
      j = d.createElement(s), dl = l != 'dataLayer' ? '&l=' + l : ''; j.async = true; j.src =
        'https://www.googletagmanager.com/gtm.js?id=' + i + dl; f.parentNode.insertBefore(j, f);
  })(window, document, 'script', 'dataLayer', 'GTM-PDXMRRWM');

  // Google tag (gtag.js)
  const ga = document.createElement('script');
  ga.async = true;
  ga.src = 'https://www.googletagmanager.com/gtag/js?id=G-ZZ8V9X5L3B';
  document.head.appendChild(ga);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { dataLayer.push(arguments); };
  gtag('js', new Date());
  gtag('config', 'G-ZZ8V9X5L3B');
}

function trackWhatsAppClick() {
  if (window.gtag) {
    gtag('event', 'clique_whatsapp', {
      event_category: 'Contato',
      event_label: 'WhatsApp'
    });
  }
  if (window.fbq) fbq('track', 'Contact');
}

function trackEmailClick() {
  if (window.gtag) {
    gtag('event', 'clique_email', {
      event_category: 'Contato',
      event_label: 'Email'
    });
  }
  if (window.fbq) fbq('trackCustom', 'EmailClick');
}

document.querySelectorAll('[data-track]').forEach(link => {
  link.addEventListener('click', () => {
    if (link.dataset.track === 'whatsapp') trackWhatsAppClick();
    else if (link.dataset.track === 'email') trackEmailClick();
  });
});

// Banner de cookies
const cookieBanner = document.getElementById('cookieBanner');
const consentimento = lerConsentimento();

if (consentimento === 'aceito') {
  carregarRastreamento();
} else if (consentimento !== 'recusado' && cookieBanner) {
  cookieBanner.hidden = false;

  document.getElementById('cookieAceitar').addEventListener('click', () => {
    salvarConsentimento('aceito');
    cookieBanner.hidden = true;
    carregarRastreamento();
  });

  document.getElementById('cookieRecusar').addEventListener('click', () => {
    salvarConsentimento('recusado');
    cookieBanner.hidden = true;
  });
}
