# Botanix AI

Plataforma web (PWA instalable) para **identificar plantas, diagnosticar problemas, saber qué sembrar según el clima real de cualquier ubicación del mundo, cuidar un jardín virtual y diseñar espacios verdes** a partir de fotografías.

> Estado: primera versión funcional. Todo lo descrito como «operativo» está implementado y cubierto por pruebas automatizadas. Las integraciones externas que no se han podido ejecutar en vivo desde el entorno de desarrollo están indicadas expresamente.

---

## 1. Qué hace

| Módulo | Qué ofrece |
|---|---|
| **Identificar** | Cámara o galería (hasta 3 fotos). Lista de especies candidatas con nivel de confianza (estimación del modelo, no probabilidad calibrada), rasgos observados, diferencias con especies parecidas, fotos adicionales útiles y preguntas de seguimiento. Ficha botánica completa (taxonomía, origen, porte, flores, toxicidad para personas/perros/gatos, invasividad…) y guía de cuidados (riego adaptable, luz, suelo, poda, reproducción). Nombre verificado contra el backbone taxonómico de **GBIF** (aceptado / sinónimo / no encontrado). Exportación en Markdown e impresión. |
| **Diagnosticar** | Fotos + preguntas (riego, sustrato, luz, temperatura, evolución, cambios recientes). Problema probable, alternativas, gravedad, cómo comprobarlo, qué hacer ya, plan de recuperación, prevención, señales de mejora/fracaso, cuándo aislar y cuándo acudir a un profesional. Siempre «diagnóstico visual orientativo». Medidas culturales primero; productos solo si hace falta y **sin dosis** (se eliminan automáticamente si el modelo las incluye). |
| **Qué sembrar** | Motor determinista que usa el **clima real de la ubicación** (10 años de reanálisis ERA5 de Open-Meteo, corregidos por altitud): «¿Qué puedo sembrar hoy?» con explicación de cada recomendación, aviso por previsión de heladas o calor de los próximos 7 días, alternativas (semillero, interior, invernadero, próxima ventana). Calendario anual: sembrar, semillero, trasplantar, cosechar, flores, árboles y arbustos, césped, podar, abonar, mantenimiento, proteger y qué posponer. Idoneidad de 21 frutales y perennes (frío invernal estimado, rusticidad, calor estival). Clasificación de Köppen, zona USDA aproximada, meses de helada y secos, gráficos de temperatura y lluvia. Exportación CSV e iCalendar. |
| **Diseña mi jardín** | Fotos del espacio + medidas, orientación, presupuesto, mantenimiento, usos y estilo (15 estilos + «recomiéndame»). Análisis del espacio (sin inventar medidas: pide los datos que faltan), 1–3 propuestas con zonas, **plano esquemático SVG a escala** si hay medidas, lista de plantas con cantidades y marcos, materiales, césped o cubierta, riego, drenaje, presupuesto orientativo por partidas y niveles económico/equilibrado/prémium, fases, mantenimiento, alternativas y errores. Comparador de propuestas, revisiones iterativas versionadas y lista de compra CSV (volúmenes de compost, acolchado y grava calculados a partir de las zonas). |
| **Mis plantas** | Jardín virtual: plantas guardadas, registro de cuidados (riego, abonado, poda, trasplante, siembra, germinación, cosecha, tratamientos…), diario con fotos y **comparador antes/después**, diagnósticos vinculados. |
| **Calendario de cuidados** | Recordatorios configurables, desactivables y **adaptados al clima del mes** (más riego con calor, menos con frío, abonado aplazado fuera de temporada). Exportación iCalendar. |
| **Explorar** | Búsqueda por nombre común, científico, familia, sinónimos, características (sombra, sequía, fácil, frutal…) en la base local, los 67 cultivos del motor y GBIF. |
| **Asistente** | Chat que conoce tu ubicación, clima y plantas guardadas. |
| **Perfil** | Ubicaciones (coordenadas redondeadas a ~1 km), experiencia, vivienda, presupuesto, mantenimiento, unidades, idioma (es/en), niños y mascotas, consentimiento de fotos, consumo del plan, **descarga de datos** y **eliminación de cuenta** (RGPD). |

---

## 2. Arquitectura

```
botanix-ai/
├── prisma/                 Esquema PostgreSQL, migraciones y semilla
├── public/                 Manifest PWA, service worker, iconos, página sin conexión
├── scripts/                Limpieza de fotos caducadas, iconos, imagen de prueba
├── src/
│   ├── app/                Páginas (App Router) y API REST (app/api/**/route.ts)
│   ├── components/         Interfaz (React, accesible, móvil primero)
│   └── lib/
│       ├── ai/             Capa de IA independiente del proveedor
│       │   ├── types.ts        Contrato AiProvider
│       │   ├── providers/      openai.ts · anthropic.ts · unconfigured.ts · fixture.ts (solo pruebas)
│       │   ├── prompts/        Prompts versionados (la versión se guarda en cada análisis)
│       │   ├── guardrails.ts   Controles deterministas de calidad y seguridad
│       │   └── pricing.ts      Tarifas y cálculo de coste por operación
│       ├── climate/        Adaptador Open-Meteo, normales, Köppen, USDA, caché
│       ├── sowing/         Datos agronómicos curados, motor de siembra, frío invernal
│       ├── taxonomy/       Adaptador GBIF
│       ├── domain/         Esquemas zod de las salidas estructuradas
│       ├── services/       Lógica de negocio (análisis asíncronos, límites, fotos…)
│       ├── storage/        Almacenamiento privado y procesado de imágenes
│       ├── auth/ security/ Sesiones, contraseñas, CSRF, límites de peticiones
│       ├── garden/ exports/ Plano, lista de compra, recordatorios, CSV, ICS, Markdown
│       └── i18n/           Diccionarios es/en
└── tests/                  unit · integration (PostgreSQL real) · e2e (Playwright)
```

**Tecnologías:** Next.js 15 (App Router) + React 19 + TypeScript estricto · Tailwind CSS 4 · PostgreSQL 16 + Prisma 6 · SDK oficiales de OpenAI y Anthropic · zod · sharp · Vitest · Playwright.

**Decisiones clave**

- **Un solo servicio TypeScript.** No hace falta Python: el análisis de imagen lo hace el modelo multimodal y el procesado (validación, EXIF, redimensionado) lo hace `sharp`.
- **IA desacoplada.** `AiProvider` define `structured()` (salida validada con zod) y `chat()`. Añadir otro proveedor = una clase nueva registrada en `lib/ai/registry.ts`. Sin clave configurada se usa `UnconfiguredProvider`, que **nunca simula resultados**: la interfaz muestra las instrucciones de configuración.
- **Adaptadores de datos** para clima (`ClimateProvider`) y taxonomía. Cada dato externo guarda proveedor, URL, fecha de consulta, periodo y limitaciones.
- **Análisis asíncronos.** La API responde al momento (202) y procesa con `after()`; el cliente consulta el estado con espera progresiva.
- **Caché:** análisis idénticos (mismas fotos, contexto y versión de prompt) en 30 días no se repiten ni se cobran; normales climáticas por celda de ~1 km durante 180 días; previsión durante 1 hora.
- **Controles de calidad deterministas** (`guardrails.ts`) sobre toda salida de IA: candidatos ordenados y puntuaciones acotadas; incertidumbre detectada (confianza o margen insuficientes) → se ocultan usos comestibles/medicinales y se piden más fotos; incoherencias taxonómicas señaladas; diagnósticos sin alternativas o con foto inutilizable → confianza rebajada; dosis eliminadas; zonas del diseño ajustadas al plano; presupuestos incoherentes señalados.

### Modelo de datos

Usuarios, sesiones, ubicaciones, caché climática, taxones, sinónimos, nombres comunes, fichas botánicas, fuentes de datos, cultivos, plagas/enfermedades (tabla preparada para EPPO), fotos, análisis (con versión de prompt, proveedor, hash de entrada, avisos), diagnósticos, tratamientos, jardines, zonas, diseños y versiones, plantas del usuario, eventos de cuidado, recordatorios, diario y sus fotos, conversaciones, mensajes y uso/coste de IA. Ver `prisma/schema.prisma`.

Todas las tablas privadas cuelgan del usuario con borrado en cascada y cada consulta filtra por `userId` (comprobado en pruebas de aislamiento).

### Seguridad y privacidad

- Contraseñas con bcrypt (12 rondas); comparación ficticia si el email no existe (sin enumeración de cuentas).
- Sesiones con token aleatorio de 256 bits en cookie `httpOnly`, `SameSite=Lax`, `Secure` en producción; en la base de datos solo se guarda su SHA-256.
- Protección CSRF por comprobación de `Origin` en peticiones que modifican datos.
- Límites de peticiones por IP y por usuario (registro, login, fotos, análisis, chat, búsqueda) y **límites mensuales por plan con tope de coste de IA**.
- Validación de entradas con zod en todas las rutas; consultas parametrizadas (Prisma).
- Subidas: validación del contenido real con `sharp` (no de la extensión), límite de tamaño y píxeles, recompresión a JPEG y **eliminación de todos los metadatos, incluido el GPS**. Almacenamiento fuera de `/public`, servido solo a su propietario con `Cache-Control: private`.
- Cabeceras: CSP, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`.
- Registro de errores sin datos personales ni contenido de fotos.
- RGPD: consentimiento explícito para procesar fotos con IA (revocable), exportación JSON, eliminación de cuenta con borrado de archivos, conservación limitada de fotos de análisis (`IMAGE_RETENTION_DAYS`, script `cleanup:images`), ubicación aproximada. La página `/privacy` es un **texto base que debe revisar un profesional jurídico** antes del lanzamiento.

---

## 3. Puesta en marcha (local)

Requisitos: Node.js 20+ (probado con 22), PostgreSQL 14+ (probado con 16).

```bash
cd botanix-ai
npm install
cp .env.example .env            # y edita DATABASE_URL / ANTHROPIC_API_KEY
createdb botanix                # o crea la base de datos con tu herramienta
npx prisma migrate deploy       # aplica las migraciones
npm run db:seed                 # fuentes y 67 cultivos del motor de siembra
# opcional: cuenta de demostración (DATOS DE PRUEBA) demo@botanix.test / demo-botanix-2026
SEED_DEMO_USER=1 npm run db:seed
npm run dev                     # http://localhost:3000
```

Producción: `npm run build && npm start`.

### Variables de entorno

| Variable | Obligatoria | Descripción |
|---|---|---|
| `DATABASE_URL` | Sí | Cadena de conexión PostgreSQL |
| `APP_URL` | Sí en producción | URL pública (comprobación de origen) |
| `AI_PROVIDER` | No | `openai` (por defecto) o `anthropic` |
| `OPENAI_API_KEY` | Para IA con OpenAI | La misma clave del agente virtual (Render). Sin clave, identificación, diagnóstico, diseño y chat muestran instrucciones de configuración |
| `OPENAI_MODEL` | No | Por defecto `gpt-4o-mini` (el del agente). Debe admitir imágenes y salidas estructuradas; `gpt-4o` identifica mejor |
| `ANTHROPIC_API_KEY` | Si `AI_PROVIDER=anthropic` | Clave de Claude |
| `ANTHROPIC_MODEL` | No | Por defecto `claude-opus-5-5` (solo con `AI_PROVIDER=anthropic`) |
| `ANTHROPIC_EFFORT` | No | `low`/`medium`/`high`/`xhigh`/`max` (por defecto `medium`) |
| `ANTHROPIC_SERVER_FALLBACK` | No | `1` (por defecto): si el modelo rechaza una petición por sus filtros, la API la reintenta en el modelo alternativo recomendado. Pon `0` para desactivarlo |
| `AI_TIMEOUT_MS` | No | Tiempo máximo por llamada (120 000) |
| `CLIMATE_PROVIDER` | No | `open-meteo` |
| `TAXONOMY_PROVIDER` | No | `gbif` o `none` |
| `STORAGE_DRIVER` / `STORAGE_LOCAL_DIR` | No | `local` / `./storage` |
| `IMAGE_RETENTION_DAYS` | No | Días que se conservan fotos de análisis no guardadas (30) |
| `MAX_UPLOAD_MB` | No | Tamaño máximo por foto (12) |
| `SESSION_DAYS` | No | Duración de la sesión (30) |
| `RATE_LIMIT_REGISTER_PER_HOUR` | No | Registros permitidos por IP y hora (5) |
| `BOTANIX_ALLOW_FIXTURES` | Solo pruebas | Permite `AI_PROVIDER=fixture` y `CLIMATE_PROVIDER=fixture` fuera de `NODE_ENV=test` (E2E). Nunca en producción |

### Cómo obtener las claves

- **OpenAI (IA multimodal, proveedor por defecto):** usa la misma clave que el agente virtual de AI Lead Machine: en Render → servicio del agente → *Environment* → copia el valor de `OPENAI_API_KEY` y pégalo en las variables de Botanix. Si prefieres separar consumos, crea otra clave en <https://platform.openai.com/api-keys> dentro del mismo proyecto. Revisa el saldo y el límite de gasto en *Billing*.
- **Anthropic (alternativa):** crea una cuenta en <https://platform.claude.com>, añade un método de pago, genera una clave en *API keys* y ponla en `ANTHROPIC_API_KEY`. Fija un límite de gasto mensual en la consola.
- **Open-Meteo (clima):** no requiere clave para uso **no comercial**. Para un uso comercial hay que contratar su plan de pago (<https://open-meteo.com/en/pricing>) y añadir la clave al adaptador (`lib/climate/open-meteo.ts`). Atribución obligatoria (CC BY 4.0), ya incluida en la interfaz.
- **GBIF (taxonomía):** API pública sin clave (datos CC BY 4.0).

---

## 4. Pruebas

```bash
npm run typecheck
npm run test:unit                       # lógica pura, sin red
createdb botanix_test && DATABASE_URL=postgresql://…/botanix_test npx prisma migrate deploy
npm run test:integration                # route handlers reales contra PostgreSQL (TEST_DATABASE_URL)
createdb botanix_e2e && DATABASE_URL=postgresql://…/botanix_e2e npx prisma migrate deploy
npm run build && npm run test:e2e       # Chromium, escritorio y móvil (E2E_DATABASE_URL)
```

- **Unitarias (50):** Köppen, zonas USDA, agregación de series diarias, adaptadores Open-Meteo y GBIF con respuestas simuladas, motor de siembra, frío invernal, controles de calidad, exportaciones, costes, límites, recordatorios, lista de compra y compatibilidad de los esquemas con la salida estructurada de la API.
- **Pruebas de calidad científica** incluidas: ningún cultivo sensible al frío se recomienda al aire libre en meses con heladas frecuentes; cosechas que no caen en meses de helada letal; Burgos con ventana de tomate más tardía que Madrid; tomate solo bajo invernadero en Bogotá (2600 m); ajo sin frío invernal no viable; hemisferio sur desplazado seis meses; diagnósticos demasiado seguros rebajados; usos comestibles ocultos con identificaciones dudosas; incoherencias taxonómicas detectadas.
- **Integración (22):** registro y login, CSRF, ubicación y siembra, validación de subidas y eliminación de EXIF/GPS, identificación asíncrona completa con caché, ficha exportable, planta con cuidados, diario y recordatorios, **aislamiento entre usuarios**, diagnóstico, IA no configurada (503 con instrucciones), fallo del proveedor (análisis marcado como fallido), límite del plan, diseño con revisión y lista de compra, chat con historial, búsqueda y RGPD (exportación sin hash y borrado de cuenta y archivos).
- **E2E (Playwright):** registro → ubicación → identificar → ficha → guardar planta → recordatorio → historial; diagnóstico; qué sembrar con exportación; diseño con revisión; protección de rutas y ausencia de desbordamiento horizontal. En escritorio y móvil (Pixel 7).

Las pruebas usan proveedores de **DATOS DE PRUEBA** (IA y clima simulados) que la interfaz marca con un aviso visible. Nunca se activan en producción salvo que se fuerce `BOTANIX_ALLOW_FIXTURES=1`.

---

## 5. Despliegue

La app necesita un proceso Node.js persistente (por `after()` y el almacenamiento local) y PostgreSQL.

1. Base de datos PostgreSQL gestionada (cualquier proveedor). Ejecuta `npx prisma migrate deploy` y `npm run db:seed`.
2. Servidor Node.js (VPS, contenedor, Render, Railway, Fly.io…): `npm ci && npm run build && npm start`. Define las variables de entorno y monta un **volumen persistente** para `STORAGE_LOCAL_DIR`.
3. HTTPS obligatorio (las cookies son `Secure` en producción). `APP_URL` debe ser la URL pública.
4. Tarea diaria: `npm run cleanup:images` (fotos caducadas y sesiones expiradas).
5. Comprobación de salud: `GET /api/health`.

Para varias réplicas o plataformas *serverless*: sustituir el limitador en memoria por Redis (misma interfaz en `lib/security/rate-limit.ts`), implementar un `StorageDriver` S3/R2 (`lib/storage/index.ts`) y mover el procesamiento de análisis a una cola.

---

## 6. Costes operativos estimados

Cada operación real guarda sus tokens y su coste en `AiUsage` (visible en el perfil), así que el coste se puede medir en cuanto haya clave. Las cifras siguientes son **estimaciones de tamaño, no mediciones**, calculadas con las tarifas registradas en `lib/ai/pricing.ts` (confírmalas en <https://openai.com/api/pricing>: no se pudieron comprobar en vivo desde el entorno).

**OpenAI (por defecto)** — gpt-4o-mini: 0,15 $ / 0,60 $ por millón de tokens (entrada / salida); gpt-4o: 2,50 $ / 10 $. En gpt-4o-mini cada foto en alta resolución consume muchos más tokens que en gpt-4o, por lo que la diferencia de coste real es menor de lo que sugieren las tarifas.

| Operación | gpt-4o-mini | gpt-4o |
|---|---|---|
| Identificación (3 fotos + ficha) | ~0,015 $ | ~0,05 $ |
| Diagnóstico (2–3 fotos) | ~0,012 $ | ~0,04 $ |
| Diseño de jardín | ~0,02 $ | ~0,10 $ |
| Mensaje del asistente | <0,001 $ | ~0,01 $ |

Ejemplo: 100 usuarios activos/mes con 8 análisis, 1 diseño y 20 mensajes ≈ **15 $/mes con gpt-4o-mini** o **≈ 70 $/mes con gpt-4o**. Recomendación: empezar con gpt-4o-mini (el mismo modelo del agente) y probar gpt-4o con fotos reales; para identificación de especies suele haber una diferencia de calidad apreciable.

**Claude (alternativa)** — Claude Opus 5.5: 4 $ / 20 $ (tabla oficial del 06/10/2026): ~0,14–0,18 $ por identificación, ~0,28–0,44 $ por diseño.

A esto se suman el alojamiento (servidor Node.js y PostgreSQL gestionado) y, para uso comercial, el plan de pago de Open-Meteo. El plan gratuito de la app limita a 10 análisis, 2 diseños y 40 mensajes al mes con un tope de 2 $ de IA por usuario (`lib/plans.ts`).

---|---|---|---|
| Identificación (3 fotos de 1568 px + ficha) | ~9 000 | ~5 000–7 000 | 0,14–0,18 $ |
| Diagnóstico (2–3 fotos) | ~7 000–9 000 | ~4 000–6 000 | 0,11–0,16 $ |
| Diseño de jardín (fotos + 1–3 propuestas) | ~10 000 | ~12 000–20 000 | 0,28–0,44 $ |
| Mensaje del asistente | ~2 000 | ~600 | ~0,02 $ |

Ejemplo: 100 usuarios activos/mes con 8 análisis, 1 diseño y 20 mensajes cada uno ≈ 800 × 0,16 + 100 × 0,40 + 2000 × 0,02 ≈ **210 $/mes en IA**. Con Claude Sonnet 5.5 (`ANTHROPIC_MODEL=claude-sonnet-5-5`) las tarifas son la mitad; conviene medir la calidad antes de cambiar.

A esto se suman el alojamiento (servidor Node.js y PostgreSQL gestionado; depende del proveedor) y, para uso comercial, el plan de pago de Open-Meteo. El plan gratuito de la app limita a 10 análisis, 2 diseños y 40 mensajes al mes con un tope de 2 $ de IA por usuario (`lib/plans.ts`).

---

## 7. Integraciones

| Integración | Estado |
|---|---|
| OpenAI (Responses API, visión + salida estructurada estricta) | **Implementada y proveedor por defecto.** Probada con respuestas HTTP simuladas (petición con imagen, esquema estricto, rechazos, clave inválida, saldo agotado); **no ejecutada en vivo** (la clave está en Render, no en este entorno). |
| Anthropic (Claude, visión + salida estructurada + fallback de servidor) | **Implementada** (alternativa). Tipos verificados contra el SDK oficial y esquemas convertidos con su helper en pruebas; **no ejecutada en vivo** (no había clave en el entorno). |
| Open-Meteo (geocodificación, histórico ERA5, previsión) | **Implementada** y probada con respuestas simuladas; **no ejecutada en vivo** (la red del entorno bloqueaba el dominio). |
| GBIF (verificación de nombres y búsqueda) | **Implementada** y probada con respuestas simuladas; **no ejecutada en vivo** por el mismo motivo. |
| Generación/edición de imágenes del jardín | **No implementada.** Se muestra el plano esquemático y la descripción; ninguna imagen decorativa se presenta como el jardín del usuario. |
| POWO (Kew), World Flora Online, EPPO, AEMET, Copernicus directo, catálogos comerciales | **Pendientes.** Los modelos de datos (`wfoId`, `powoId`, `PestDisease.eppoCode`, `DataSource`) y los adaptadores están preparados para añadirlos. |
| Pasarela de pago | **No implementada** (decisión de proveedor pendiente). Los planes y límites ya existen. |
| Notificaciones push/correo de recordatorios | **No implementadas.** Recordatorios en la app y exportables a cualquier calendario (.ics). |

---

## 8. Problemas conocidos y limitaciones

- La temperatura media del aire se usa como aproximación de la temperatura del suelo; el efecto del invernadero es una estimación fija.
- Las normales climáticas son de 10 años de reanálisis en rejilla de 9–25 km: no captan microclimas (patios, heladas de valle, laderas). La nota de microclima del usuario se pasa a la IA pero no modifica el motor determinista.
- La zona USDA y el frío invernal (mínimo entre horas-frío 0–7,2 °C y unidades Utah con supuesto sinusoidal) son aproximaciones.
- Los parámetros agronómicos son por especie, no por variedad; el día largo/corto solo se trata en la cebolla.
- Las fichas y diagnósticos dependen del modelo de IA; los controles deterministas reducen, pero no eliminan, errores.
- El limitador de peticiones y `after()` asumen una sola instancia.
- En los proveedores de prueba solo existen tres ubicaciones (Madrid, Burgos, Bogotá) con valores aproximados escritos a mano.

## 9. Próximos pasos prioritarios

1. Configurar `OPENAI_API_KEY` (la del agente), ejecutar un lote de fotos reales de referencia y comparar calidad y coste entre gpt-4o-mini y gpt-4o (crear un conjunto de evaluación con identificaciones conocidas).
2. Verificar Open-Meteo y GBIF en vivo desde el servidor de despliegue; contratar el plan comercial de Open-Meteo si procede.
3. Desplegar con PostgreSQL gestionado, volumen persistente y tarea diaria de limpieza.
4. Revisión jurídica de la política de privacidad y condiciones.
5. Adaptadores EPPO (plagas reguladas) y POWO/WFO; listas de invasoras por país.
6. Almacenamiento S3/R2, cola de trabajos y Redis para escalar.
7. Notificaciones de recordatorios (push web o correo) y pasarela de pago.
8. Generación de imágenes conceptuales del jardín con un proveedor adecuado, claramente separada del plano técnico.
