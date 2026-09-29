# Modelo replicado: Agencia de páginas web con IA para negocios locales

Réplica del modelo Webker + método "Claude Code + Stitch", adaptado para empezar sin equipo.

---

## 1. La oferta (lo que vendes)

**No vendes "una página web". Vendes "más clientes desde Google y WhatsApp".**

> *"Te hacemos una web que convierte visitas en llamadas y reservas, lista en 7 días. Si en 60 días no recibes más contactos que antes, seguimos trabajando gratis hasta conseguirlo."*

Componentes:
1. Web de 1–5 páginas orientada a UNA acción (llamar, WhatsApp, reservar, pedir presupuesto).
2. SEO local on-page (títulos, schema LocalBusiness, NAP, velocidad, móvil).
3. Optimización de Google Business Profile.
4. Formulario/WhatsApp conectado + medición (Analytics / eventos de clic).
5. Plan mensual: hosting, cambios, copias de seguridad, informe de leads.

## 2. Precios (3 niveles)

| Plan | España / USA | LATAM (ref. Colombia/México) | Incluye |
|---|---|---|---|
| **Esencial** | 790 € / $900 + 39 €/mes | $250–400 USD + $20–25/mes | Landing 1 página, WhatsApp, SEO local básico |
| **Negocio** ⭐ | 1.900 € / $2.000 + 79 €/mes | $500–900 USD + $35–50/mes | 5 páginas, GBP, blog, reservas/formularios, informe mensual |
| **Crecimiento** | 3.000 € / $3.000 + 199 €/mes | $1.200–1.800 USD + $90–150/mes | Todo + páginas SEO por servicio/zona, campañas Google/Meta, CRM |

Alternativa sin pago inicial (modelo "renting web", muy vendido en España): **0 € de alta + 59–99 €/mes con 12 meses de permanencia**. Ideal para cerrar rápido con negocios pequeños.

## 3. Entrega (flujo de producción, 2–6 h por web)

```
Brief (15 min con el cliente)
  └─> prompts/01-auditoria-web.md       → diagnóstico de su web/competencia
  └─> prompts/02-google-stitch.md       → diseño visual en Google Stitch
  └─> prompts/03-claude-code-web.md     → web real (HTML/CSS/JS o Astro)
  └─> prompts/04-seo-local.md           → SEO on-page + schema + GBP
  └─> QA: móvil, Lighthouse > 90, formularios, WhatsApp
  └─> Deploy: Netlify / Vercel / Cloudflare Pages / GitHub Pages (gratis)
  └─> Dominio del cliente + Analytics
```

La carpeta `plantilla-cliente/` es un ejemplo del resultado (clínica dental ficticia).

## 4. Captación de clientes (el 80% del negocio)

### Canal 1 – Prospección en frío con "web de muestra" (el más efectivo)
1. Elige nicho + ciudad (ej. "dentistas en Medellín").
2. Saca de Google Maps negocios con: web mala, sin web, o solo Instagram, y ≥ 20 reseñas (tienen dinero y clientes).
3. **Hazles la home gratis** con los prompts (20–30 min cada una) y súbela a un subdominio.
4. Envía por WhatsApp/email/DM: *"Te hice esta versión nueva de tu web, ¿te la enseño en 10 min?"* (ver `prompts/05-prospeccion.md`).
5. Llamada de 15 min → propuesta → cobro 50% por adelantado.

Métricas de referencia: 30 muestras/semana → 6–10 respuestas → 3–4 llamadas → 1–2 cierres.

### Canal 2 – Contenido (lo que hace Oier)
Reels/TikTok "antes vs. después" de webs de negocios locales. Lento al principio, escala a largo plazo.

### Canal 3 – Referidos
10–15% de comisión o 1 mes gratis por cada cliente referido.

## 5. Los números (escenario realista, 1 persona)

| Mes | Clientes nuevos | Ticket medio | Ingreso proyectos | Clientes en cuota | MRR (79 €) | Total mes |
|---|---|---|---|---|---|---|
| 1 | 2 | 900 € | 1.800 € | 2 | 158 € | 1.958 € |
| 3 | 4 | 1.200 € | 4.800 € | 9 | 711 € | 5.511 € |
| 6 | 5 | 1.500 € | 7.500 € | 23 | 1.817 € | 9.317 € |
| 12 | 6 | 1.800 € | 10.800 € | 55 | 4.345 € | 15.145 € |

(En LATAM divide aprox. entre 2,5–3. Asume 5% de cancelación mensual de cuotas.)

Costes: dominio del cliente (lo paga él), hosting estático (0 €), Claude Pro/Max (20–100 $/mes), Stitch (gratis), herramientas de prospección (0–50 $/mes). **Margen > 85%.**

## 6. Automatización con agentes (versión "sin empleados")

Replica de la arquitectura que describe Oier, con Claude Code (ver `prompts/06-agentes.md`):

| Agente | Tarea | Entrada → Salida |
|---|---|---|
| Investigador | Encuentra negocios con web mala | nicho + ciudad → CSV de leads |
| Auditor | Diagnostica cada web | URL → informe de 5 problemas |
| Diseñador/Dev | Genera web de muestra | datos del negocio → `index.html` |
| Vendedor | Redacta el mensaje personalizado | auditoría + URL muestra → mensaje |
| Optimizador | Revisa respuestas y ajusta | métricas → cambios de oferta/copy |

## 7. Plan de 30 días

- **Semana 1**: elige nicho, publica tu landing (`landing-agencia/`), crea 3 webs de portafolio (una puede ser `plantilla-cliente/`).
- **Semana 2**: 30 webs de muestra + 30 mensajes.
- **Semana 3**: llamadas, cierra los 2 primeros (precio "fundador" con descuento a cambio de testimonio).
- **Semana 4**: entrega, pide reseña + referido, repite con 50 muestras.

## 8. Qué NO copiar
- Prometer cifras de facturación del tipo "40 k€ en 3 semanas".
- Venderte como formador antes de tener 20+ clientes propios.
- Competir por precio: nicha y vende resultados.
