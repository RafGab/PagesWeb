# Contexto compartido: AI Lead Machine

> Lee este archivo al empezar cualquier sesión nueva en este repositorio. Está verificado contra el código de
> `RafGab/ai-lead-machine-demo` (30/09/2026). Si algo cambia, actualízalo aquí.

## Quién
**Viviana Acero** · WhatsApp +34 672 953 197 · marca **AI Lead Machine**. Clientes objetivo: España y Colombia.

## El producto (lo que existe hoy)
Un agente de IA que **atiende, cualifica y agenda** dentro de la web del cliente (widget embebible con una línea de código).

| Función real | Dónde está en el código |
|---|---|
| Conversación híbrida: botones para preguntas cerradas y texto libre | `frontend/public/widget.js`, `backend/demo/orchestrator.py` |
| Reglas de negocio propias de cada cliente (filtra y prioriza como su equipo) | `backend/demo/verticals/*.py` |
| Agenda en **Google Calendar** con disponibilidad real y alternativas si está ocupado | `backend/services/calendar_service.py`, `backend/demo/booking_service.py` |
| Aviso por **correo** con cada lead nuevo | `backend/services/notify.py`, `backend/demo/lead_notification.py` |
| Panel de leads con estados, notas y exportación a CSV | `demo-site/leads.html` |
| Botón "hablar con una persona" y saludo proactivo | `backend/demo/handoff_service.py` |
| Panel de estadísticas (volumen, horas de más demanda, motivos de consulta) | `demo-site/insights.html` |

**Rubros ya construidos:** inmobiliarias, clínicas dentales, despachos de abogados, hoteles, gimnasios, asesorías de extranjería (+ propietarios). Se adapta cualquier otro.

**Caso real:** Acero Pulido (asesoría de extranjería) con su asistente **Gari** → https://go2spain-site.onrender.com

### Lo que NO existe todavía (no anunciarlo como disponible)
- **WhatsApp, Instagram y agente de voz**: en la web de precios figuran como "próximamente".
- **Recordatorios automáticos de citas** y **seguimiento automático** a quien no compra: **desarrollados y probados, pero sin desplegar**.
  Están en `parches/ai-lead-machine-demo/` (por correo, apagados por defecto, 22 pruebas). Hasta que se apliquen, se desplieguen y se
  activen en el cliente (ver `parches/README.md`), **no anunciarlos como disponibles**. Solo por correo: sin WhatsApp ni SMS.

## Precios oficiales (de `demo-site/implementar.html`)
Incluyen web corporativa + agente. Instalación única + cuota mensual. Sin IVA.

| Plan | Para quién | España 6 m | España 12 m | Colombia 6 m (COP) | Colombia 12 m (COP) |
|---|---|---|---|---|---|
| **Esencial** | Hasta ~500 conversaciones/mes, un canal, sin integraciones. Web de 5–8 páginas | 2.800 € + 190 €/mes | 2.500 € + 165 €/mes | 6.500.000 + 850.000/mes | 5.800.000 + 750.000/mes |
| **Crecimiento** | Varios canales, agenda o CRM, varias líneas. Web de 10–15 páginas, reglas avanzadas, estadísticas | 8.200 € + 550 €/mes | 7.200 € + 490 €/mes | 16.000.000 + 2.600.000/mes | 14.000.000 + 2.300.000/mes |
| **Empresa** | Alto volumen, CRM/ERP, multiidioma. Web 25+ páginas, SLA | 19.000 € + 1.500 €/mes | 16.500 € + 1.300 €/mes | 35.000.000 + 5.500.000/mes | 30.000.000 + 4.800.000/mes |

## Enlaces
- Demo en vivo: https://ai-lead-machine-demo.onrender.com · Implementar: https://ai-lead-machine-demo.onrender.com/implementar.html
- Repositorio del agente: https://github.com/RafGab/ai-lead-machine-demo

## Identidad y reglas de mensaje
- Paleta "Confianza eléctrica": `marca/ai-lead-machine/LEEME.md`. Logo: pendiente de recolorear (falta el archivo original).
- **No limitar el mensaje a "vender"**: sirve a cualquier negocio que atienda clientes.
- **No presentar WhatsApp como el canal del agente**: hoy vive en la web del cliente.
- Solo anunciar funciones de la tabla "lo que existe hoy".

## Material creado (este repositorio)
Reel 45 s y descripción (`videos/`), tarjetas (`tarjetas/`), oferta a DTech (`ofertas/dtech/`), demos con marca ficticia (`demos/`),
kits de clínicas y talleres (`plantillas/`).

## Pendiente de alinear con el producto real
- `ofertas/dtech/`: **reescrita el 01/10/2026** con el producto real y los precios oficiales (WhatsApp como fase 2). Falta decidir la fecha de la fase 2 y construir el rubro de DTech en el agente.
- `plantillas/*`, `demos/*` y `landing-agencia/`: usan precios y funciones (recordatorios, WhatsApp) que no coinciden con el producto oficial.
