// Genera los iconos PNG de la PWA a partir del SVG del logotipo.
import sharp from "sharp";
import { readFileSync } from "node:fs";

const svg = readFileSync("public/icons/icon.svg");
const maskable = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" fill="#1f3d2b"/><g transform="translate(6 6) scale(0.7)">${svg.toString().replace(/<\/?svg[^>]*>/g, "").replace('rx="12"', 'rx="0"')}</g></svg>`,
);

async function main() {
  await sharp(svg, { density: 600 }).resize(192, 192).png().toFile("public/icons/icon-192.png");
  await sharp(svg, { density: 1200 }).resize(512, 512).png().toFile("public/icons/icon-512.png");
  await sharp(maskable, { density: 1200 }).resize(512, 512).png().toFile("public/icons/icon-maskable-512.png");
  console.log("Iconos generados");
}
main();
