// Motor compartido por todos los kits (clínicas, taller, …).
// Cada kit tiene su construir.mjs, que prepara sus variables y llama a construir().
// Sin dependencias: solo Node 18+.

import { readFileSync, writeFileSync, mkdirSync, copyFileSync, readdirSync } from 'node:fs';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const COMUN = dirname(fileURLToPath(import.meta.url));

// ---------- utilidades ----------
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
export const jsonScript = (v) => JSON.stringify(v).replace(/</g, '\\u003c');
const inicial = (n) => esc(String(n).trim().charAt(0).toUpperCase());

/** Lee el JSON del cliente indicado en la línea de comandos y decide la carpeta de salida. */
export function cargarCliente(raizKit) {
  const archivo = process.argv[2];
  if (!archivo) {
    console.error('Uso: node construir.mjs clientes/<cliente>.json [carpeta-salida]');
    process.exit(1);
  }
  const c = JSON.parse(readFileSync(archivo, 'utf8'));
  const salida = process.argv[3] || join(raizKit, 'demo', basename(archivo, '.json'));
  return { c, salida };
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
  taller: {
    font: 'system-ui,-apple-system,"Segoe UI",Roboto,sans-serif',
    fontH: '"Barlow Condensed","Arial Narrow",system-ui,sans-serif',
    hWeight: 700, hTrack: '.01em', r: '10px', imgR: '14px', btnR: '8px',
    link: '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&display=swap" rel="stylesheet">',
  },
};

// ---------- variables comunes a cualquier negocio local ----------
export function variablesComunes(c) {
  const t = TEMAS[c.tema] || TEMAS.clinico;
  const col = c.colores || {};
  const cssVars = `:root{--c:${col.principal};--on-c:${col.sobre_principal || '#fff'};--acc:${col.acento};--on-acc:${col.sobre_acento || '#1a1a1a'};` +
    `--ink:${col.texto};--mut:${col.texto_suave};--bg:${col.fondo};--soft:${col.fondo_suave};--card:${col.tarjeta || '#fff'};--line:${col.linea};` +
    `--hero-bg:${col.hero || col.fondo_suave};--font:${t.font};--font-h:${t.fontH};--h-weight:${t.hWeight};--h-track:${t.hTrack};` +
    `--r:${t.r};--img-r:${t.imgR};--btn-r:${t.btnR}}`;

  const nota = String(c.google_nota).replace(',', '.');
  const schema = {
    '@context': 'https://schema.org',
    '@type': c.tipo_schema || 'LocalBusiness',
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
  const faq = c.faq || [];
  const faqSchema = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.p, acceptedAnswer: { '@type': 'Answer', text: f.r } })) };

  const waTexto = encodeURIComponent(c.whatsapp_texto || 'Hola, vengo de la web y quiero pedir cita');
  return {
    ...c,
    tel_href: String(c.telefono).replace(/[^\d+]/g, ''),
    wa_link: `https://wa.me/${String(c.whatsapp).replace(/\D/g, '')}?text=${waTexto}`,
    maps_embed: `https://www.google.com/maps?q=${encodeURIComponent(`${c.nombre}, ${c.direccion}, ${c.cp} ${c.ciudad}`)}&output=embed`,
    google_perfil_url: c.google_perfil_url || `https://www.google.com/maps/search/${encodeURIComponent(`${c.nombre} ${c.ciudad}`)}`,
    anio: new Date().getFullYear(),
    color: col.principal,
    // HTML sin escapar (solo generado aquí)
    css_vars: cssVars,
    fuente_link: t.link,
    schema_json: jsonScript([schema, faqSchema]),
    servicios_html: (c.servicios || []).map((s) =>
      `<article class="card"><div class="ic" aria-hidden="true">${esc(s.icono)}</div><h3>${esc(s.nombre)}</h3><p>${esc(s.texto)}</p>${s.precio ? `<div class="price">${esc(s.precio)}</div>` : ''}</article>`
    ).join('\n    '),
    stats_html: (c.diferenciales || []).map((d) => `<div><b>${esc(d.cifra)}</b><span>${esc(d.texto)}</span></div>`).join(''),
    resenas_html: (c.resenas || []).map((r) =>
      `<figure class="card"><span class="stars" aria-label="5 de 5 estrellas">★★★★★</span><blockquote>“${esc(r.texto)}”</blockquote><figcaption><span class="av" aria-hidden="true">${inicial(r.autor)}</span>${esc(r.autor)}${r.cuando ? ` · ${esc(r.cuando)}` : ''}</figcaption></figure>`
    ).join('\n    '),
    pasos_html: (c.pasos || []).map((p) => `<div class="card"><h3>${esc(p.titulo)}</h3><p>${esc(p.texto)}</p></div>`).join(''),
    faq_html: faq.map((f) => `<details><summary>${esc(f.p)}</summary><p>${esc(f.r)}</p></details>`).join('\n  '),
    opciones_html: (c.servicios || []).map((s) => `<option>${esc(s.nombre)}</option>`).join('') + '<option>Otra consulta</option>',
  };
}

/**
 * Renderiza las plantillas del kit y escribe la web.
 * {{clave}} se escapa; {{{clave}}} se inserta tal cual (solo HTML generado por el kit).
 */
export function construir({ raizKit, c, salida, vars, obligatorios = [], privadas = [], resumen = [] }) {
  const pendientes = new Set();
  for (const k of obligatorios) {
    const v = c[k];
    if (v === undefined || v === null || v === '' || String(v).includes('PENDIENTE')) pendientes.add(k);
  }
  const render = (html) => html
    .replace(/\{\{\{(\w+)\}\}\}/g, (_, k) => (k in vars ? String(vars[k]) : (pendientes.add(k), '')))
    .replace(/\{\{(\w+)\}\}/g, (_, k) => (k in vars ? esc(vars[k]) : (pendientes.add(k), '')));

  const plantilla = join(raizKit, 'plantilla');
  mkdirSync(salida, { recursive: true });
  copyFileSync(join(COMUN, 'estilos.css'), join(salida, 'estilos.css'));
  for (const f of readdirSync(plantilla)) {
    const origen = join(plantilla, f);
    if (f.endsWith('.html')) writeFileSync(join(salida, f), render(readFileSync(origen, 'utf8')));
    else copyFileSync(origen, join(salida, f));
  }
  writeFileSync(join(salida, 'robots.txt'), `User-agent: *\n${privadas.map((p) => `Disallow: /${p}\n`).join('')}Sitemap: ${c.dominio}/sitemap.xml\n`);
  writeFileSync(join(salida, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${esc(c.dominio)}/</loc></url></urlset>\n`);

  console.log(`✔ Web generada en ${salida}`);
  for (const r of resumen) console.log(`  ${r}`);

  // Busca marcadores sin rellenar en todo el JSON (FAQ, galería, etc.)
  (function recorrer(v, ruta) {
    if (typeof v === 'string') { if (/PENDIENTE|TU_ID|TU_CODIGO/.test(v)) pendientes.add(ruta); }
    else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) recorrer(x, ruta ? `${ruta}.${k}` : k);
  })(c, '');
  if (pendientes.size) console.log(`⚠ Datos pendientes de rellenar (${pendientes.size}):\n  - ${[...pendientes].join('\n  - ')}`);
}
