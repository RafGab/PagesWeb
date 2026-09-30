# Tarjeta AI Lead Machine

| Archivo | Uso |
|---|---|
| `tarjeta-compartir.png` | 1080×1350 (4:5). Para grupos de WhatsApp, Facebook, Instagram, LinkedIn |
| `tarjeta-imprimir.pdf` | Tarjeta de presentación 90×50 mm con 3 mm de sangrado (hoja de 96×56 mm), 2 páginas: frente y dorso |
| `previsualizacion-imprimir.png` | Vista previa de las dos caras |

## Completar tus datos
Edita `datos.json` (nombre, WhatsApp con prefijo del país y `"qr"`: `"whatsapp"` abre tu chat, `"demo"` abre la demo) y ejecuta:

    MODULES=<carpeta con node_modules de playwright y qrcode> node render.mjs

## Para la imprenta
- Pide "tarjetas 90×50 mm, impresión a color por ambas caras, papel couché 300–350 g, **con sangrado de 3 mm**". El PDF ya lo incluye: no hay que agregar nada.
- Los textos están a más de 3 mm del borde de corte.
- Los colores son RGB (vivos en pantalla). En impresión CMYK el verde lima y el azul cian salen algo más apagados: pide una prueba.
- Antes de imprimir, **escanea el QR con el celular**.
