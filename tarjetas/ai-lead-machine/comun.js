// Datos de la tarjeta y utilidades compartidas por compartir.html e imprimir.html.
// Edita datos.json (no este archivo) y vuelve a ejecutar render.mjs.
window.CFG = Object.assign({
  marca: 'AI Lead Machine',
  nombre: '[Tu nombre]',
  whatsapp: '[Tu WhatsApp]',
  url: 'ai-lead-machine-demo.onrender.com/implementar.html',
  palabra: 'AGENTE',
  qrtexto: 'Escanea y mira la demo',
}, window.__CFG || {});

const C = window.CFG;
const col = { ink: '#071226', cobalt: '#2650F0', aqua: '#19D6E6', amber: '#FFB81C', sky: '#8FB2FF' };
const svg = (d, stroke = col.ink, w = 6) => `<svg viewBox="0 0 64 64" fill="none" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
window.ICONS = {
  web: svg('<rect x="8" y="12" width="48" height="40" rx="6"/><path d="M8 24h48M16 18h2M24 18h2"/>'),
  bot: svg('<rect x="12" y="20" width="40" height="30" rx="10"/><path d="M32 20v-8M26 34h0M38 34h0M26 42h12"/>'),
  cal: svg('<rect x="8" y="12" width="48" height="44" rx="6"/><path d="M8 26h48M20 6v12M44 6v12M22 40l6 6 12-12"/>'),
  bolt: svg('<path d="M36 6L14 36h16l-4 22 22-30H32z"/>'),
  loop: svg('<path d="M50 24A20 20 0 0 0 14 22M14 40a20 20 0 0 0 36 2"/><path d="M50 10v14H36M14 54V40h14"/>'),
};

// Rellena todo [data-f="campo"] con el dato y [data-icon="web"] con el icono.
document.querySelectorAll('[data-f]').forEach((el) => { el.textContent = C[el.dataset.f]; });
document.querySelectorAll('[data-icon]').forEach((el) => { el.innerHTML = window.ICONS[el.dataset.icon]; });
// QR: lo inyecta render.mjs como SVG (negro sobre blanco para que se lea bien impreso).
document.querySelectorAll('[data-qr]').forEach((el) => { el.innerHTML = window.__QR || ''; });
window.listo = document.fonts.ready.then(() => true);
