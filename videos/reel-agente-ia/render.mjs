// Graba reel.html como MP4 vertical para Instagram/TikTok (1080×1920, 30 fps, H.264 + pista de audio silenciosa).
// Uso: MODULES=<carpeta con node_modules de playwright y @ffmpeg-installer/ffmpeg> CHROMIUM=<ruta> node render.mjs
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const aqui = dirname(fileURLToPath(import.meta.url));
const req = createRequire(join(process.env.MODULES || aqui, 'x.js'));
const { chromium } = req('playwright');
const ffmpeg = process.env.FFMPEG || req('@ffmpeg-installer/ffmpeg').path;

const FPS = 30;
const salida = join(aqui, 'reel-agente-ia.mp4');
const portada = join(aqui, 'portada.jpg');

const b = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
await p.goto(pathToFileURL(join(aqui, 'reel.html')).href);
await p.evaluate(() => window.listo);
const dur = await p.evaluate(() => window.DURACION);
const total = Math.round(dur * FPS);

const ff = spawn(ffmpeg, [
  '-y', '-hide_banner', '-loglevel', 'error',
  '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
  '-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100',
  '-map', '0:v', '-map', '1:a', '-shortest',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-level', '4.1',
  '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', salida,
], { stdio: ['pipe', 'inherit', 'inherit'] });

for (let f = 0; f < total; f++) {
  await p.evaluate((t) => window.seek(t), f / FPS);
  const img = await p.screenshot({ type: 'jpeg', quality: 95 });
  if (!ff.stdin.write(img)) await new Promise((ok) => ff.stdin.once('drain', ok));
  if (f % 150 === 0) console.log(`fotograma ${f}/${total}`);
}
ff.stdin.end();
await new Promise((ok, ko) => ff.on('close', (c) => (c === 0 ? ok() : ko(new Error('ffmpeg ' + c)))));

// Portada: el gancho de la escena 1
await p.evaluate(() => window.seek(3.9));
await p.screenshot({ path: portada, type: 'jpeg', quality: 92 });
await b.close();
console.log('✔ ' + salida);
