# Plan: desplegar tu agente en webs de clientes, cómo unir web + agente y qué gancho usar para arrancar

> Escrito como asesor de despliegue el 30/09/2026. Lo **verificado** sale del código de `RafGab/ai-lead-machine-demo`
> y de `demo-site/implementar.html`. Lo marcado como **propuesta** es mío y lo decides tú.
> Interpreto "los dos rubros" como tus dos servicios: **página web** y **agente virtual**.

## 1. Cómo unir web + agente (una sola oferta, dos motores)

La web atrae y explica; el agente atiende, cualifica y agenda. El cliente lo ve como una sola cosa:

```
Visitante → web del cliente → agente IA (widget) → cualifica con reglas del negocio
   → cita en su Google Calendar → correo con el lead → panel de leads (estados, notas, CSV)
```

Técnicamente es un solo backend y un widget que se pega con una línea. Tus planes oficiales (Esencial, Crecimiento, Empresa)
**ya son esa unión**: incluyen web corporativa + agente.

## 2. Opciones para venderlo y manejarlo por separado

| Opción | Qué compra el cliente | Cuándo encaja | Precio |
|---|---|---|---|
| **A. Web + agente** (el plan oficial) | Todo integrado | Negocios sin web o con web mala | **Oficial**: Esencial 12 m = 2.500 € + 165 €/mes · 5.800.000 + 750.000 COP/mes |
| **B. Solo agente** | El widget en la web que ya tienen | Negocios con web que funciona, que solo quieren atención 24/7 | **Propuesta** (12 m): 1.100 € + 120 €/mes · 2.600.000 + 550.000 COP/mes |
| **C. Solo web** | Página corporativa | Quien aún no está listo para el agente | **Propuesta**: 1.600 € + 45 €/mes · 3.400.000 + 200.000 COP/mes |

Cómo salen los números de la propuesta: B + C suman 2.700 € de instalación y 165 €/mes, frente a 2.500 € y 165 €/mes del plan A.
El paquete ahorra 200 € y empuja a comprar lo integrado. En Colombia igual: 6.000.000 frente a 5.800.000 y 750.000/mes en ambos casos.
Contrato de 6 meses: 1.300 € + 135 €/mes y 3.000.000 + 620.000 COP/mes para la opción B.

**Recomendación:** vende **B como puerta de entrada** (la más fácil de decir sí) y **A como objetivo**. C solo como salida para quien no está listo.

## 3. Cómo desplegarlo en la web de un cliente (paso a paso)

Verificado en `render.yaml`, `widget.js` y `calendar_service.py`.

1. **Servicio en Render para ese cliente** (copia de `ai-lead-machine-backend`, plan *starter* con disco de 1 GB para la base de datos).
2. **Variables de entorno:** `OPENAI_API_KEY`, `ADMIN_KEY` (clave de su panel), `SMTP_USER` y `SMTP_PASSWORD` (envío de correos),
   `NOTIFY_EMAIL` (quién recibe los leads), `COMERCIAL_EMAIL` (quién atiende las citas), `GOOGLE_SERVICE_ACCOUNT_FILE`,
   `GOOGLE_CALENDAR_ID` y `BUSINESS_DAYS`, `BUSINESS_HOURS_START`, `BUSINESS_HOURS_END` (horario de citas).
3. **Calendario:** el cliente comparte su Google Calendar con el email de tu cuenta de servicio (permiso "Realizar cambios en los eventos").
4. **Adaptar el flujo a su negocio:** editar el archivo del rubro en `backend/demo/verticals/` (preguntas, reglas, tono, color). Ya existen
   dental, despacho, hotel, gimnasio, extranjería e inmobiliaria.
5. **Pegar el widget** en su web (WordPress, Wix, Webflow, Shopify o HTML, en cualquier sitio que permita añadir un script):
   ```html
   <script src="https://SU-BACKEND.onrender.com/widget.js"
           data-api-url="https://SU-BACKEND.onrender.com"
           data-color="#2650F0" data-agent-name="Nombre del asistente"
           data-subtitle="Te ayudo a dar el primer paso"
           data-welcome="¡Hola! ¿En qué puedo ayudarte?" data-position="right" defer></script>
   ```
6. **Probar de punta a punta:** una conversación completa, que la cita aparezca en su calendario, que llegue el correo y que el lead salga en su panel (`leads.html`).
7. **Entrega:** acceso al panel, 30 minutos de formación y revisión de las primeras conversaciones a la semana.

Tiempo realista: 2 a 5 días. Coste por cliente: aproximadamente 7 USD/mes del plan starter de Render (confírmalo en tu cuenta)
más el uso de OpenAI, que varía con el modelo y hay que medir en las primeras semanas.

## 4. Límites que debes conocer antes de vender (verificados en el código)

| Límite | Consecuencia | Qué hacer |
|---|---|---|
| Calendario, correo y horario se configuran **por rubro**, no por cliente | Dos clientes del mismo rubro (por ejemplo dos clínicas dentales) en un mismo backend compartirían calendario y avisos | Al empezar, **un despliegue por cliente**. Más adelante, hacer multicliente real |
| WhatsApp, Instagram y voz figuran como "próximamente" | Muchos negocios querrán WhatsApp (en España y Colombia es el canal principal) | No venderlo como disponible. Priorízalo en el roadmap |
| Recordatorios y seguimiento automáticos: hechos en un parche (`parches/`), **pendientes de aplicar y desplegar** | Es lo primero que pedirá alguien que agenda citas | Aplicar el parche, desplegarlo y activarlo cliente a cliente (solo por correo) |
| Privacidad | Tratas datos personales de los clientes de tu cliente | Contrato de encargado de tratamiento (RGPD en España, Ley 1581 en Colombia), aviso de privacidad en el chat |
| El agente de despachos no da consejo legal | Correcto, mantenlo | Dejarlo dicho en la propuesta a abogados |

## 5. Tres formas de operarlo

| Modelo | Ventajas | Inconvenientes | Cuándo |
|---|---|---|---|
| **1. Un despliegue por cliente** | Aislamiento total, su propia clave, su propia base de datos, fácil de cobrar y de cerrar | Más mantenimiento cuando haya muchos clientes | **Los primeros 5–10 clientes** |
| 2. Un backend compartido, un cliente por rubro | Cero coste extra por cliente | No permite dos clientes del mismo rubro | Solo para demos |
| 3. Multicliente real (tabla de clientes con su configuración) | Escala a decenas de clientes con un solo servicio | Hay que desarrollarlo | Cuando pases de 10 clientes |

## 6. El gancho fijo para arrancar

**Gancho:** *"Te enseño en 48 horas tu agente atendiendo a tus clientes. Si no te convence, no pagas nada."*

Como el coste de una prueba es de unos pocos euros, puedes ofrecerlo sin riesgo. Se ejecuta en tres pasos, siempre iguales:

1. **Prueba de respuesta (día 0).** Escribes al negocio una consulta normal fuera de horario y anotas cuánto tardan en responder.
   Se lo cuentas con educación: *"Le escribí el sábado a las 22:40 y tardaron 2 días en responder."* Es un dato concreto y real.
2. **Demo con su marca (48 h).** Usas el rubro ya construido, con su nombre, colores y servicios (la demo admite abrirse directa en un rubro con `?rubro=`),
   y le envías el enlace: *"Así atendería a tus clientes."*
3. **Piloto de 14 días en su web real.** Pegas el widget. Si ve que le llegan leads y citas, pasa al plan B o al A. Si no, lo quitas.

**Por qué este gancho y no otro:** tiene una prueba propia (tu Acero Pulido real con Gari), usa rubros que ya están construidos,
mide un dolor que el dueño reconoce (tardan en responder) y deja al cliente decidir después de ver el agente funcionando.

### Con qué rubro empezar
**Uno solo**, para repetir el mismo mensaje.
- **España:** asesorías de extranjería y despachos de abogados. Tienes caso real, el rubro ya está construido y dominas el terreno.
- **Colombia:** clínicas dentales, que también tienen rubro construido y mucha demanda de citas.

### Metas para los primeros 30 días (orientativas)
| Semana | Acción | Meta |
|---|---|---|
| 1 | Elegir rubro, preparar una demo por rubro, lista de 40 negocios | 40 negocios |
| 2 | Pruebas de respuesta y mensajes con la demo | 20 contactos, 6 respuestas |
| 3 | Llamadas de 15 minutos y pilotos | 3 pilotos |
| 4 | Cierre de pilotos | 1–2 clientes de pago |

## 7. Qué hacer esta semana
- [ ] Decidir precios de las opciones B y C (las mías son una propuesta).
- [ ] Decidir el modelo de operación: un despliegue por cliente para empezar.
- [ ] Preparar la demo por rubro con `?rubro=` y su enlace.
- [ ] Redactar el contrato y el aviso de privacidad (consultar con un asesor legal).
- [ ] Reorganizar el Reel, tarjetas y DTech con lo verificado de `CONTEXTO.md`.
- [ ] Priorizar en el roadmap: recordatorios automáticos y WhatsApp.
