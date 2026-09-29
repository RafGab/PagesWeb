# Kit "Web + reseñas" para clínicas dentales y estéticas (pack de 97 €/mes)

Un solo kit y dos estilos: **dental** (limpio y clínico) y **estética** (elegante).
Rellenas un archivo con los datos de la clínica, ejecutas un comando y tienes:

| Archivo generado | Para qué sirve |
|---|---|
| `index.html` | Web de la clínica: SEO local, WhatsApp, formulario, mapa y reseñas destacadas |
| `opina.html` | El enlace que reciben los pacientes: valoran con estrellas → Google o mensaje privado |
| `enviar.html` | Panel de recepción: nombre + móvil → WhatsApp con la petición de reseña en 5 segundos |
| `gracias.html` | Página tras enviar el formulario de cita |
| `robots.txt`, `sitemap.xml` | SEO |

Demos ya generadas: `demo/dental/` y `demo/estetica/` (ábrelas en el navegador).

## Crear la web de una clínica nueva (≈ 1 hora)

1. Copia el preset de su sector:
   `cp clientes/dental.json clientes/clinica-perez.json`   (o `estetica.json`)
2. Rellena los datos (ver "Qué pedir a la clínica"). Cambia colores en `colores`
   y el estilo con `"tema": "clinico"` o `"tema": "elegante"`.
3. Genera la web:
   `node construir.mjs clientes/clinica-perez.json`
   → queda en `demo/clinica-perez/`. El script lista los datos que faltan.
4. Publícala gratis: arrastra la carpeta a **Netlify Drop** (app.netlify.com/drop)
   o a Cloudflare Pages, y conecta el dominio de la clínica.
5. Instala el panel en el ordenador o el móvil de recepción: abre
   `https://dominio/enviar.html` y añádelo a la pantalla de inicio.

Truco: pídele a Claude Code *"Rellena clientes/clinica-perez.json con los datos
de esta clínica: [pega su web actual, su ficha de Google y su Instagram]"*.

## Qué pedir a la clínica
- Nombre comercial, razón social y **nº de registro sanitario** (obligatorio en la publicidad sanitaria).
- Dirección, teléfono, móvil de WhatsApp, email y horario.
- **Enlace para dejar reseña en Google**: en su Perfil de Empresa → "Pedir reseñas" → copiar enlace (`https://g.page/r/.../review`).
- Nota y número de reseñas actuales, y 3 reseñas reales para copiar en la web.
- Tratamientos con precio "desde" (si quieren mostrarlo).
- Logo, colores y fotos reales (equipo, instalaciones y, en estética, antes/después **con consentimiento por escrito**).
- Una cuenta gratuita de **Formspree** con el email de la clínica → el ID va en `formspree_id`.

## Cómo funciona el sistema de reseñas
```
Paciente sale de la consulta
   └─> Recepción abre enviar.html, escribe nombre + móvil → se abre WhatsApp con el mensaje
         └─> El paciente abre opina.html y valora con estrellas
               ├─ 4–5 ★ → botón grande "Publicar mi opinión en Google"
               └─ 1–3 ★ → formulario privado a la dirección (+ enlace a Google también visible)
```
Objetivo realista: pedirla a todos los pacientes → **15–40 reseñas nuevas al mes** en una clínica con 10+ pacientes al día.

### ⚠️ Normas que el kit ya respeta (no las quites)
- **Google prohíbe el "review gating"** (enviar a Google solo a los contentos). Por eso
  el enlace a Google se ve siempre, también con 1–3 estrellas. Si una clínica lo pide
  quitar, explícale que Google puede borrar sus reseñas.
- **No se regala nada a cambio de reseñas** (también lo prohíbe Google).
- **Protección de datos (RGPD)**: envía solo a pacientes que hayan dado su consentimiento
  para recibir comunicaciones, y **nunca menciones el tratamiento** en el mensaje (es un dato de salud).
- **Publicidad sanitaria**: muestra el nº de registro sanitario, no prometas resultados
  garantizados y, en estética, no anuncies medicamentos con receta por su nombre
  (p. ej. habla de "arrugas de expresión", no de la marca del producto).
  Revisa la normativa de tu comunidad autónoma.

## Qué justifica los 97 €/mes
| Tarea mensual | Cómo |
|---|---|
| Hosting, SSL y cambios en la web | Netlify/Cloudflare (0 €) |
| Responder todas las reseñas de Google | `respuestas-resenas.md` + Claude |
| 4 publicaciones al mes en el Perfil de Google | `prompts/04-seo-local.md` |
| Informe mensual (reseñas nuevas, nota, clics en WhatsApp/llamadas) | `prompts/07-servicios-recurrentes.md` |

## Mejora opcional: envío automático
Cuando tengas más de 5 clínicas, automatiza el envío con n8n + WhatsApp Business API
(Twilio o 360dialog): cita marcada como "completada" en la agenda → esperar 2 h → enviar el
mensaje de `mensajes_resena` → registrar en Google Sheets. Hay un prompt para montarlo en `prompts/07`.
