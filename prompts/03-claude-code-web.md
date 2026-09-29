# Prompt 03 — PROMPT MAESTRO para Claude Code (construir la web)

Abre Claude Code en una carpeta vacía (o en este repo) y pega el prompt.
Si tienes el diseño de Stitch, ponlo en la carpeta como `diseno.png` o `diseno.html`.

```
Eres un desarrollador web senior especializado en webs de conversión para
negocios locales. Construye una web completa, lista para publicar.

## Datos del negocio
- Nombre: [NOMBRE]
- Sector: [SECTOR]
- Ciudad / zona que atiende: [CIUDAD, BARRIOS]
- Dirección: [DIRECCIÓN]
- Teléfono: [TELÉFONO]  | WhatsApp: [NÚMERO con prefijo, ej. 573001234567]
- Email: [EMAIL]
- Horario: [HORARIO]
- Servicios (con precio "desde" si lo hay): [LISTA]
- Diferenciales: [AÑOS, CERTIFICACIONES, GARANTÍAS]
- Nota Google y nº reseñas: [4,8 ★ – 120 reseñas]
- 3 reseñas reales: [PEGAR TEXTO + NOMBRE]
- Cliente ideal: [DESCRIPCIÓN]
- Acción principal que queremos: [LLAMAR / WHATSAPP / RESERVAR / PRESUPUESTO]
- Colores / logo: [HEX o archivo logo.png]
- Referencia de diseño: [diseno.png de Google Stitch / URL que le gusta]

## Requisitos técnicos
1. HTML5 + CSS + JS vanilla, sin frameworks ni build (un index.html y,
   si hay varias páginas, servicios.html, contacto.html). Todo en español.
2. Mobile-first, responsive, accesible (contraste AA, alt en imágenes,
   etiquetas en formularios, navegación por teclado).
3. Rendimiento: Lighthouse ≥ 90 en todas las categorías. Imágenes con
   loading="lazy", width/height, fuentes de sistema o 1 Google Font máx.
4. Estructura de secciones: header fijo con CTA → hero con titular
   orientado a resultado + CTA + botón WhatsApp + prueba social →
   servicios → por qué nosotros (con números) → galería/antes-después →
   reseñas → proceso en 3 pasos → FAQ (acordeón con <details>) →
   CTA final + formulario → footer con NAP, horario y mapa embebido.
5. Botón flotante de WhatsApp con mensaje prellenado
   (https://wa.me/[NÚMERO]?text=Hola%2C%20vengo%20de%20la%20web...).
6. Formulario funcional sin backend usando Formspree
   (action="https://formspree.io/f/[ID]") con validación HTML5.
7. SEO local: <title> y meta description con servicio + ciudad, un solo
   H1, Open Graph, schema.org JSON-LD de tipo [LocalBusiness/Dentist/
   Plumber/etc.] con NAP, horario, geo y aggregateRating, sitemap.xml y
   robots.txt.
8. Medición: eventos de clic en teléfono, WhatsApp y envío de formulario
   (dataLayer.push para Google Tag Manager, dejar el ID como variable).
9. Copy: escríbelo tú. Persuasivo, claro, beneficios antes que
   características, sin clichés tipo "somos líderes". Usa los datos
   reales; donde falte algo, pon [PENDIENTE] en vez de inventar.
10. Usa imágenes de placeholder de https://images.unsplash.com relevantes
    al sector (se reemplazarán por fotos reales).

## Proceso
- Primero muéstrame el plan de secciones y el copy del hero (3 opciones
  de titular). Espera mi elección.
- Después genera todos los archivos.
- Al final, revisa tu propio código: HTML válido, enlaces tel:/wa.me
  correctos, sin texto en inglés, y dame una checklist de lo que queda
  [PENDIENTE] para pedir al cliente.
- Explícame cómo publicarla gratis en Netlify o Cloudflare Pages y
  conectar el dominio del cliente.
```

## Prompts de iteración rápida
- `Haz la versión más premium: más espacio, tipografía más grande, fotos a sangre en el hero.`
- `Reescribe el copy para [cliente ideal] con tono más cercano y urgencia suave.`
- `Añade una página por cada servicio optimizada para "[servicio] en [ciudad]".`
- `Pasa Lighthouse mentalmente y corrige todo lo que baje de 90.`
- `Crea 3 variantes del hero para test A/B.`
