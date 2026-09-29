#!/usr/bin/env node
// Genera la web de una clínica a partir de su archivo de datos.
// Uso:  node construir.mjs clientes/dental.json [carpeta-salida]
// Sin dependencias: solo Node 18+.

import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { esc, jsonScript, cargarCliente, variablesComunes, construir } from '../comun/motor.mjs';

const raizKit = dirname(fileURLToPath(import.meta.url));
const { c, salida } = cargarCliente(raizKit);

const galeriaHtml = (c.galeria && c.galeria.length)
  ? `<section id="resultados"><div class="w">
  <div class="center"><h2>${esc(c.galeria_titulo || 'Resultados reales')}</h2><p>${esc(c.galeria_subtitulo || '')}</p></div>
  <div class="ba">${c.galeria.map((g) =>
    `<figure><div class="pair"><div role="img" aria-label="Antes" style="background-image:url('${esc(g.antes)}')"><span>Antes</span></div><div role="img" aria-label="Después" style="background-image:url('${esc(g.despues)}')"><span>Después</span></div></div><figcaption>${esc(g.texto)}</figcaption></figure>`
  ).join('')}</div>
  <p class="note">${esc(c.galeria_aviso || 'Imágenes publicadas con el consentimiento de los pacientes. Los resultados pueden variar en cada persona.')}</p>
</div></section>`
  : '';

const vars = {
  ...variablesComunes({ tipo_schema: 'MedicalClinic', ...c }),
  registro_texto: c.registro_sanitario ? `Nº de registro sanitario: ${c.registro_sanitario}` : '',
  galeria_html: galeriaHtml,
  mensajes_json: jsonScript(c.mensajes_resena),
  opina_url_json: jsonScript(`${c.dominio}/opina.html`),
};

construir({
  raizKit, c, salida, vars,
  obligatorios: ['nombre', 'telefono', 'whatsapp', 'direccion', 'ciudad', 'dominio', 'google_resena_url', 'formspree_id', 'email', 'razon_social', 'registro_sanitario'],
  privadas: ['enviar.html', 'opina.html', 'gracias.html'],
  resumen: [
    'index.html   → web pública',
    'opina.html   → página de reseñas (el enlace que reciben los pacientes)',
    'enviar.html  → panel de recepción para pedir reseñas por WhatsApp',
  ],
});
