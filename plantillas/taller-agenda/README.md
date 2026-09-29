# Kit "Web + agenda" para talleres mecánicos (pack de 147 €/mes)

Rellenas un archivo con los datos del taller, ejecutas un comando y tienes:

| Archivo generado | Para qué sirve |
|---|---|
| `index.html` | Web del taller: servicios con precio y botón "Reservar", marcas, reseñas, pre-ITV, FAQ, contacto, mapa y barra fija "Llamar / Reservar" en móvil |
| `reservar.html` | **Agenda online** en 3 pasos: servicios → día y hora → datos del coche (matrícula, modelo, km, extras) |
| `panel.html` | **Panel del taller**: (1) mensajes de WhatsApp en 10 s (confirmar cita, recordatorio, presupuesto, coche listo, reseña) y (2) **avisos de revisión e ITV** a partir de un CSV de clientes |
| `gracias.html` | Página tras pedir presupuesto |

Demo ya generada: `demo/taller/` (para ver la agenda abre `reservar.html`; para el panel, `panel.html` → "Probar con datos de ejemplo").

## Crear la web de un taller nuevo (≈ 1 hora)
```
cp clientes/taller.json clientes/taller-lopez.json     # rellena sus datos
node construir.mjs clientes/taller-lopez.json          # genera demo/taller-lopez/
```
El script avisa de los datos que faltan. Publica la carpeta en Netlify Drop o Cloudflare Pages
y conecta el dominio del taller. Guarda `https://dominio/panel.html` en el móvil y el ordenador del taller.

## Configurar la agenda (`agenda` en el JSON)
| Campo | Ejemplo | Qué hace |
|---|---|---|
| `franjas` | `"1": ["08:30-13:00","15:00-18:30"]` | Horas de recepción de coches por día (0 = domingo … 6 = sábado). Un día sin franjas aparece como "cerrado" |
| `intervalo_min` | `30` | Cada cuánto se ofrece una hora |
| `antelacion_min_horas` | `3` | No deja reservar para dentro de menos de X horas |
| `dias_visibles` | `21` | Cuántos días hacia delante se pueden elegir |
| `festivos` | `["2026-12-08"]` | Días cerrados (añade los festivos locales y las vacaciones) |
| `extras` | `["Necesito vehículo de sustitución"]` | Casillas opcionales en la reserva |
| `meses_revision` / `dias_aviso` | `12` / `30` | Cuándo toca revisión y con cuánta antelación avisar |
| `calcom_url` | `https://cal.com/taller-lopez/cita` | Opcional: si lo rellenas, la agenda usa Cal.com (ver abajo) |

Cada servicio lleva `id` y `duracion_min`. El `id` sirve para enlaces directos:
`reservar.html?s=preitv&m=1234ABC&n=Javier` abre la agenda con la pre-ITV elegida y la matrícula y el nombre ya rellenos
(es lo que usan los avisos de ITV).

## Cómo funciona una reserva
```
Cliente reserva en la web (servicio, día, hora, coche)
   ├─> email al taller con todos los datos (Formspree)
   ├─> botón para mandar también la reserva por WhatsApp al taller
   └─> botón "Añadir a mi calendario" (.ics con aviso 2 h antes)
Taller → panel.html → "Confirmar cita" → WhatsApp al cliente
Día anterior → panel.html → "Recordatorio"
Coche revisado → "Presupuesto para aprobar"  →  terminado → "Coche listo"  →  días después → "Pedir reseña"
Cada mes → panel.html → Avisos → carga el CSV → "Avisar" a los que les toca revisión o ITV
```

### ⚠️ Límite importante del modo básico (sin Cal.com)
La web es estática, así que **no sabe qué horas ya están ocupadas**: la reserva es una *solicitud*
que el taller confirma por WhatsApp (así lo dice la página). Para la mayoría de talleres pequeños es
suficiente, porque se trabaja "por la mañana dejas el coche". Si el taller necesita bloquear huecos de verdad:

**Mejora con Cal.com (gratis para 1 usuario):** crea una cuenta para el taller, un tipo de evento por
servicio (o uno genérico "Cita taller" con preguntas de matrícula/modelo), conecta su Google Calendar
y pon el enlace en `agenda.calcom_url`. La página `reservar.html` mostrará ese calendario, que sí bloquea
las horas ocupadas y manda recordatorios por email.

## Qué pedir al taller
- Nombre, razón social y **nº de Registro Industrial del taller** (debe figurar en sus documentos).
- Dirección, teléfono, WhatsApp, email y horario de recepción de coches.
- Servicios con precio orientativo (IVA incluido) y duración aproximada.
- Festivos y vacaciones del año.
- Enlace de reseñas de Google (Perfil de Empresa → "Pedir reseñas").
- Fotos reales del taller y del equipo (sustituyen a las de ejemplo).
- **Lista de clientes para los avisos** (CSV): `nombre;telefono;matricula;modelo;ultima_revision;proxima_itv`
  (hay botón para descargar la plantilla; fechas en `dd/mm/aaaa` o `aaaa-mm-dd`). Casi todos los programas
  de gestión de talleres exportan a Excel/CSV.
- Cuenta gratuita de Formspree con el email del taller → `formspree_id`.

## Normas
- **RGPD:** los avisos de revisión/ITV son comunicaciones comerciales: envíalos solo a clientes que lo
  hayan aceptado (añade la casilla en la hoja de recepción del taller). El panel procesa el CSV solo en
  el navegador: no guarda ni envía los datos.
- **Precios:** muéstralos con IVA incluido y como orientativos ("desde"). Por normativa el cliente
  tiene derecho a un presupuesto por escrito antes de la reparación: la web lo usa como argumento de venta.

## Qué justifica los 147 €/mes
| Tarea mensual | Cómo |
|---|---|
| Web, hosting y cambios | Netlify/Cloudflare (0 €) |
| Agenda online 24/7 + recordatorios | `reservar.html` + `panel.html` (o Cal.com) |
| Avisos de revisión e ITV (clientes que vuelven) | Pestaña "Avisos" con el CSV del mes |
| Reseñas y Perfil de Google | Mensaje "Pedir reseña" + `prompts/04-seo-local.md` |
| Informe mensual (reservas web, clics a WhatsApp/llamada, avisos enviados) | `prompts/07-servicios-recurrentes.md` |

Argumento de venta: **un solo cliente que vuelve por el aviso de ITV o de revisión (~120 €) paga el mes.**

## Automatizar (cuando tengas varios talleres)
n8n + WhatsApp Business API (Twilio o 360dialog): reserva en Formspree/Cal.com → confirmación automática;
cita de mañana → recordatorio a las 18:00; el día 1 de cada mes → leer el CSV/Google Sheet → enviar los avisos.
Prompt en `prompts/07-servicios-recurrentes.md` (sección B).
