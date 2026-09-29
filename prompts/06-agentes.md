# Prompt 06 — Agencia automatizada con agentes (Claude Code)

Crea en tu proyecto un archivo `CLAUDE.md` con esto y luego pide a Claude Code:
*"Ejecuta el pipeline para [nicho] en [ciudad], 20 leads."*

```
# Pipeline de agencia web

Trabajas como una agencia de 5 agentes. Usa subagentes para cada rol y
guarda todo en /leads/[fecha]-[nicho]-[ciudad]/.

1. INVESTIGADOR
   Entrada: nicho + ciudad + nº de leads.
   Tarea: busca negocios (web search) con ≥ 20 reseñas y web deficiente o
   inexistente. Guarda leads.csv: nombre, web, teléfono, instagram, nota,
   nº reseñas, motivo de elección.

2. AUDITOR
   Por cada lead, aplica prompts/01-auditoria-web.md y guarda
   auditoria.md en su carpeta.

3. DISEÑADOR-DEV
   Por cada lead, aplica prompts/03-claude-code-web.md en modo rápido
   (sin esperar confirmación, 1 sola página) usando la plantilla
   plantilla-cliente/index.html como base. Guarda muestra/index.html.

4. VENDEDOR
   Aplica prompts/05-prospeccion.md y guarda mensajes.md con el WhatsApp,
   email y DM listos. NO envíes nada: un humano revisa y envía.

5. OPTIMIZADOR
   Lee /metricas.csv (enviados, respuestas, llamadas, cierres por nicho y
   mensaje) y propone cambios en oferta, nicho o copy en optimizacion.md.

Reglas: no inventes datos del negocio (usa [PENDIENTE]); respeta la
privacidad; no hagas scraping que viole términos de servicio; el envío de
mensajes siempre lo aprueba un humano.
```
