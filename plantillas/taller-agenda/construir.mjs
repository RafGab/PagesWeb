#!/usr/bin/env node
// Genera la web + agenda de un taller a partir de su archivo de datos.
// Uso:  node construir.mjs clientes/taller.json [carpeta-salida]
// Sin dependencias: solo Node 18+.

import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { esc, jsonScript, cargarCliente, variablesComunes, construir } from '../comun/motor.mjs';

const raizKit = dirname(fileURLToPath(import.meta.url));
const { c, salida } = cargarCliente(raizKit);
const agenda = c.agenda || {};

// Tarjetas de servicio con enlace directo a la reserva de ese servicio
const serviciosHtml = c.servicios.map((s) =>
  `<article class="card svc-card"><div class="ic" aria-hidden="true">${esc(s.icono)}</div><h3>${esc(s.nombre)}</h3><p>${esc(s.texto)}</p>` +
  `<div class="svc-foot">${s.precio ? `<span class="price">${esc(s.precio)}</span>` : '<span></span>'}` +
  `<a href="reservar.html?s=${encodeURIComponent(s.id)}" data-ev="reservar_servicio">Reservar →</a></div></article>`
).join('\n    ');

const marcasHtml = (c.marcas || []).map((m) => `<li>${esc(m)}</li>`).join('');

// Configuración que usan reservar.html y panel.html en el navegador
const configReserva = {
  nombre: c.nombre,
  direccion: `${c.direccion}, ${c.cp} ${c.ciudad}`,
  whatsapp: String(c.whatsapp).replace(/\D/g, ''),
  formspree_id: c.formspree_id,
  calcom_url: agenda.calcom_url || '',
  intervalo_min: agenda.intervalo_min || 30,
  dias_visibles: agenda.dias_visibles || 21,
  antelacion_min_horas: agenda.antelacion_min_horas ?? 3,
  franjas: agenda.franjas || {},
  festivos: agenda.festivos || [],
  extras: agenda.extras || [],
  servicios: c.servicios.map(({ id, nombre, precio, duracion_min }) => ({ id, nombre, precio, duracion_min: duracion_min || 60 })),
};
const configPanel = {
  nombre: c.nombre,
  horario: c.horario_texto,
  prefijo: c.prefijo_pais || '34',
  enlace_reserva: `${c.dominio}/reservar.html`,
  enlace_resena: c.google_resena_url,
  meses_revision: agenda.meses_revision || 12,
  dias_aviso: agenda.dias_aviso || 30,
  mensajes: c.mensajes_taller,
  aviso_revision: c.aviso_revision,
  aviso_itv: c.aviso_itv,
};

const vars = {
  ...variablesComunes({ tipo_schema: 'AutoRepair', ...c }),
  servicios_html: serviciosHtml,
  marcas_html: marcasHtml,
  registro_texto: c.registro_taller ? `Nº Registro Industrial: ${c.registro_taller}` : '',
  confirmacion_texto: agenda.confirmacion_texto || 'Te confirmaremos la cita por WhatsApp.',
  config_reserva_json: jsonScript(configReserva),
  config_panel_json: jsonScript(configPanel),
};

construir({
  raizKit, c, salida, vars,
  obligatorios: ['nombre', 'telefono', 'whatsapp', 'direccion', 'ciudad', 'dominio', 'formspree_id', 'email', 'razon_social', 'registro_taller', 'google_resena_url'],
  privadas: ['panel.html', 'gracias.html'],
  resumen: [
    'index.html     → web pública',
    'reservar.html  → agenda online (servicio → día y hora → datos)',
    'panel.html     → panel del taller: mensajes por WhatsApp y avisos de revisión/ITV',
  ],
});
