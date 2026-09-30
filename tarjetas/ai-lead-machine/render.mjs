// Genera: tarjeta-compartir.png (1080×1350), tarjeta-imprimir.pdf (90×50 mm con sangrado, frente y dorso)
// y previsualizacion-imprimir.png. Lee datos.json.
// Uso: MODULES=<carpeta con node_modules de playwright y qrcode> CHROMIUM=<ruta> node render.mjs
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const aqui = dirname(fileURLToPath(import.meta.url));
const req = createRequire(join(process.env.MODULES || aqui, 'x.js'));
const { chromium } = req('playwright');
const QRCode = req('qrcode');

const cfg = JSON.parse(readFileSync(join(aqui, 'datos.json'), 'utf8'));
const digitos = String(cfg.whatsapp).replace(/\D/g, '');
const destinoQr = cfg.qr === 'whatsapp' && digitos.length >= 9
  ? `https://wa.me/${digitos}`   // sin texto prellenado: el QR queda más simple y se lee mejor impreso
  : 'https://' + String(cfg.url).replace(/^https?:\/\//, '');
const qrSvg = (await QRCode.toString(destinoQr, { type: 'svg', margin: 0, errorCorrectionLevel: 'M', color: { dark: '#000000', light: '#FFFFFF' } })).replace('<svg ', '<svg shape-rendering="crispEdges" ');
console.log('El QR lleva a:', destinoQr);

const b = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
async function abrir(archivo, viewport) {
  const p = await b.newPage({ viewport, deviceScaleFactor: 1 });
  await p.addInitScript(({ c, q }) => { window.__CFG = c; window.__QR = q; }, { c: cfg, q: qrSvg });
  await p.goto(pathToFileURL(join(aqui, archivo)).href);
  await p.evaluate(() => window.listo);
  return p;
}

// Para compartir (grupos de WhatsApp, Facebook, Instagram)
const a = await abrir('compartir.html', { width: 1080, height: 1350 });
await a.screenshot({ path: join(aqui, 'tarjeta-compartir.png') });

// Para imprimir: PDF de 2 páginas (frente y dorso) con sangrado
const c = await abrir('imprimir.html', { width: 400, height: 240 });
await c.pdf({ path: join(aqui, 'tarjeta-imprimir.pdf'), width: '96mm', height: '56mm', printBackground: true, preferCSSPageSize: true });
// Vista previa a 4×: las dos caras una junto a la otra
await c.setViewportSize({ width: 820, height: 480 });
await c.addStyleTag({ content: '.page{margin:0!important;zoom:3.6}body{display:flex;gap:16px;padding:16px;width:max-content}' });
await c.setViewportSize({ width: 1500, height: 820 });
await c.screenshot({ path: join(aqui, 'previsualizacion-imprimir.png'), fullPage: true });
await b.close();
console.log('✔ tarjeta-compartir.png, tarjeta-imprimir.pdf, previsualizacion-imprimir.png');
