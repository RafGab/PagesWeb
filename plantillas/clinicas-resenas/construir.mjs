#!/usr/bin/env node
// Genera la web de una clínica a partir de su archivo de datos.
// Uso:  node construir.mjs clientes/dental.json [carpeta-salida]
// Sin dependencias: solo Node 18+.

import { readFileSync, writeFileSync, mkdirSync, copyFileSync, readdirSync } from 'node:fs';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = dirname(fileURLToPath(import.meta.url));
const PLANTILLA = join(RAIZ, 'plantilla');

const archivo = process.argv[2];
if (!archivo) {
  console.error('Uso: node construir.mjs clientes/<cliente>.json [carpeta-salida]');
  process.exit(1);
}
const c = JSON.parse(readFileSync(archivo, 'utf8'));
const salida = process.argv[3] || join(RAIZ, 'demo', basename(archivo, '.json'));

// ---------- utilidades ----------
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const jsonScript = (v) => JSON.stringify(v).replace(/</g, '\\u003c');
const pendientes = new Set();
function falta(clave) {
  const v = c[clave];
  if (v === undefined || v === null || v === '' || String(v).includes('PENDIENTE')) pendientes.add(clave);
}

// ---------- temas ----------
const TEMAS = {
  clinico: {
    font: 'system-ui,-apple-system,"Segoe UI",Roboto,sans-serif',
    fontH: 'system-ui,-apple-system,"Segoe UI",Roboto,sans-serif',
    hWeight: 800, hTrack: '-.01em', r: '18px', imgR: '28px', btnR: '999px',
    link: '',
  },
  elegante: {
    font: '"Jost",system-ui,sans-serif',
    fontH: '"Cormorant Garamond",Georgia,serif',
    hWeight: 600, hTrack: '0', r: '4px', imgR: '6px', btnR: '2px',
    link: '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Jost:wght@400;600;700&display=swap" rel="stylesheet">',
  },
};
const t = TEMAS[c.tema] || TEMAS.clinico;
const col = c.colores || {};
const cssVars = `:root{--c:${col.principal};--on-c:${col.sobre_principal || '#fff'};--acc:${col.acento};--on-acc:${col.sobre_acento || '#1a1a1a'};` +
  `--ink:${col.texto};--mut:${col.texto_suave};--bg:${col.fondo};--soft:${col.fondo_suave};--card:${col.tarjeta || '#fff'};--line:${col.linea};` +
  `--hero-bg:${col.hero || col.fondo_suave};--font:${t.font};--font-h:${t.fontH};--h-weight:${t.hWeight};--h-track:${t.hTrack};` +
  `--r:${t.r};--img-r:${t.imgR};--btn-r:${t.btnR}}`;

// ---------- bloques HTML ----------
const inicial = (n) => esc(String(n).trim().charAt(0).toUpperCase());

const serviciosHtml = c.servicios.map((s) =>
  `<article class="card"><div class="ic" aria-hidden="true">${esc(s.icono)}</div><h3>${esc(s.nombre)}</h3><p>${esc(s.texto)}</p>${s.precio ? `<div class="price">${esc(s.precio)}</div>` : ''}</article>`
).join('\n    ');

const statsHtml = c.diferenciales.map((d) => `<div><b>${esc(d.cifra)}</b><span>${esc(d.texto)}</span></div>`).join('');

const resenasHtml = c.resenas.map((r) =>
  `<figure class="card"><span class="stars" aria-label="5 de 5 estrellas">★★★★★</span><blockquote>“${esc(r.texto)}”</blockquote><figcaption><span class="av" aria-hidden="true">${inicial(r.autor)}</span>${esc(r.autor)}${r.cuando ? ` · ${esc(r.cuando)}` : ''}</figcaption></figure>`
).join('\n    ');

const pasosHtml = c.pasos.map((p) => `<div class="card"><h3>${esc(p.titulo)}</h3><p>${esc(p.texto)}</p></div>`).join('');

const faqHtml = c.faq.map((f) => `<details><summary>${esc(f.p)}</summary><p>${esc(f.r)}</p></details>`).join('\n  ');

const opcionesHtml = c.servicios.map((s) => `<option>${esc(s.nombre)}</option>`).join('') + '<option>Otra consulta</option>';

const galeriaHtml = (c.galeria && c.galeria.length)
  ? `<section id="resultados"><div class="w">
  <div class="center"><h2>${esc(c.galeria_titulo || 'Resultados reales')}</h2><p>${esc(c.galeria_subtitulo || '')}</p></div>
  <div class="ba">${c.galeria.map((g) =>
    `<figure><div class="pair"><div role="img" aria-label="Antes" style="background-image:url('${esc(g.antes)}')"><span>Antes</span></div><div role="img" aria-label="Después" style="background-image:url('${esc(g.despues)}')"><span>Después</span></div></div><figcaption>${esc(g.texto)}</figcaption></figure>`
  ).join('')}</div>
  <p class="note">${esc(c.galeria_aviso || 'Imágenes publicadas con el consentimiento de los pacientes. Los resultados pueden variar en cada persona.')}</p>
</div></section>`
  : '';

// ---------- datos estructurados (SEO local) ----------
const nota = String(c.google_nota).replace(',', '.');
const schema = {
  '@context': 'https://schema.org',
  '@type': c.tipo_schema || 'MedicalClinic',
  name: c.nombre,
  url: c.dominio,
  image: c.hero_imagen,
  telephone: c.telefono,
  email: c.email,
  priceRange: c.rango_precio || '€€',
  address: { '@type': 'PostalAddress', streetAddress: c.direccion, postalCode: c.cp, addressLocality: c.ciudad, addressRegion: c.provincia, addressCountry: c.pais || 'ES' },
  openingHours: c.horario_schema,
  aggregateRating: { '@type': 'AggregateRating', ratingValue: nota, reviewCount: String(c.google_resenas).replace(/\D/g, ''), bestRating: '5' },
  sameAs: c.redes || [],
};
if (c.lat && c.lng) schema.geo = { '@type': 'GeoCoordinates', latitude: c.lat, longitude: c.lng };
const faqSchema = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: c.faq.map((f) => ({ '@type': 'Question', name: f.p, acceptedAnswer: { '@type': 'Answer', text: f.r } })) };

// ---------- variables ----------
const waTexto = encodeURIComponent(c.whatsapp_texto || 'Hola, vengo de la web y quiero pedir cita');
const vars = {
  ...c,
  tel_href: String(c.telefono).replace(/[^\d+]/g, ''),
  wa_link: `https://wa.me/${String(c.whatsapp).replace(/\D/g, '')}?text=${waTexto}`,
  maps_embed: `https://www.google.com/maps?q=${encodeURIComponent(`${c.nombre}, ${c.direccion}, ${c.cp} ${c.ciudad}`)}&output=embed`,
  google_perfil_url: c.google_perfil_url || `https://www.google.com/maps/search/${encodeURIComponent(`${c.nombre} ${c.ciudad}`)}`,
  registro_texto: c.registro_sanitario ? `Nº de registro sanitario: ${c.registro_sanitario}` : '',
  anio: new Date().getFullYear(),
  color: col.principal,
  // HTML sin escapar (solo generado aquí)
  css_vars: cssVars,
  fuente_link: t.link,
  schema_json: jsonScript([schema, faqSchema]),
  servicios_html: serviciosHtml,
  stats_html: statsHtml,
  resenas_html: resenasHtml,
  pasos_html: pasosHtml,
  faq_html: faqHtml,
  opciones_html: opcionesHtml,
  galeria_html: galeriaHtml,
  mensajes_json: jsonScript(c.mensajes_resena),
  opina_url_json: jsonScript(`${c.dominio}/opina.html`),
};

['nombre', 'telefono', 'whatsapp', 'direccion', 'ciudad', 'dominio', 'google_resena_url', 'formspree_id', 'email', 'razon_social', 'registro_sanitario']
  .forEach(falta);

function render(html) {
  return html
    .replace(/\{\{\{(\w+)\}\}\}/g, (_, k) => (k in vars ? String(vars[k]) : (pendientes.add(k), '')))
    .replace(/\{\{(\w+)\}\}/g, (_, k) => (k in vars ? esc(vars[k]) : (pendientes.add(k), '')));
}

// ---------- escribir ----------
mkdirSync(salida, { recursive: true });
for (const f of readdirSync(PLANTILLA)) {
  const origen = join(PLANTILLA, f);
  if (f.endsWith('.html')) writeFileSync(join(salida, f), render(readFileSync(origen, 'utf8')));
  else copyFileSync(origen, join(salida, f));
}
writeFileSync(join(salida, 'robots.txt'), `User-agent: *\nDisallow: /enviar.html\nDisallow: /opina.html\nDisallow: /gracias.html\nSitemap: ${c.dominio}/sitemap.xml\n`);
writeFileSync(join(salida, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${esc(c.dominio)}/</loc></url></urlset>\n`);

console.log(`✔ Web generada en ${salida}`);
console.log('  index.html   → web pública');
console.log('  opina.html   → página de reseñas (el enlace que reciben los pacientes)');
console.log('  enviar.html  → panel de recepción para pedir reseñas por WhatsApp');
// Busca marcadores sin rellenar en todo el JSON (FAQ, galería, etc.)
const marcas = new Set();
(function recorrer(v, ruta) {
  if (typeof v === 'string') { if (/PENDIENTE|TU_ID|TU_CODIGO/.test(v)) marcas.add(ruta); }
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) recorrer(x, ruta ? `${ruta}.${k}` : k);
})(c, '');
for (const k of pendientes) marcas.add(k);
pendientes.clear(); marcas.forEach((m) => pendientes.add(m));
if (pendientes.size) console.log(`⚠ Datos pendientes de rellenar (${pendientes.size}):\n  - ${[...pendientes].join('\n  - ')}`);
