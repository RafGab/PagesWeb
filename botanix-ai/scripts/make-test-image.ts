// Genera la imagen sintética usada en las pruebas E2E (DATOS DE PRUEBA, no es una foto real).
import sharp from "sharp";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="700"><rect width="900" height="700" fill="#efe9da"/><ellipse cx="450" cy="350" rx="320" ry="210" fill="#2f6b3a"/><path d="M150 350 H750 M300 350 L220 220 M420 350 L380 170 M540 350 L580 180 M660 350 L720 240" stroke="#a7cfa3" stroke-width="8" fill="none"/></svg>`;
sharp(Buffer.from(svg)).jpeg({ quality: 85 }).toFile("tests/fixtures/leaf-test.jpg").then(() => console.log("ok"));
