# Prompt 07 — Servicios recurrentes (lo que justifica la cuota mensual)

Réplica de los packs del anuncio de Oier: **reseñas**, **agenda** y **captación automática**.
Pega el prompt que corresponda en Claude Code dentro de la carpeta del cliente.

## A) Clínica · web + reseñas (97 €/mes)
```
Monta un sistema de reseñas de Google para [NEGOCIO] ([SECTOR], [CIUDAD]).
Enlace directo para dejar reseña: [URL g.page/r/.../review]

1. Crea en la web la página /opina.html: si la valoración es de 4–5
   estrellas, lleva al enlace de Google; si es de 1–3, muestra un
   formulario privado (Formspree) para que la queja llegue a la clínica.
2. Escribe 3 mensajes de WhatsApp/SMS para enviar 2 h después de la cita
   (cercano, máx. 300 caracteres, con el enlace a /opina.html) y 1
   recordatorio a los 3 días.
3. Crea un workflow de n8n (JSON importable): nueva cita marcada como
   "completada" en [Google Calendar/CRM] → esperar 2 h → enviar el
   WhatsApp por [Twilio/360dialog] → registrar en una hoja de Google.
4. Prompt para responder reseñas: dada una reseña, redacta una respuesta
   en nombre de la clínica (agradece, menciona el tratamiento sin datos
   de salud, invita a volver; si es negativa, pide disculpas y ofrece
   contacto privado).
5. Informe mensual en HTML: reseñas nuevas, nota media, antes y después.
```

## B) Taller · web + agenda (147 €/mes)
```
Añade reservas online a la web de [TALLER] en [CIUDAD].
Servicios y duración: [cambio de aceite 45 min, pre-ITV 60 min, diagnosis 30 min…]
Horario: [HORARIO]

1. Incrusta Cal.com (o el calendario de GoHighLevel) en /reservar.html,
   con un tipo de evento por servicio y los campos: matrícula, modelo,
   km, WhatsApp.
2. Recordatorios: 24 h y 2 h antes de la cita, por WhatsApp.
3. Reactivación: workflow de n8n que, a los 6 meses del último servicio o
   30 días antes de la ITV, envíe "Te toca la revisión, reserva aquí".
4. Mensajes para quien no se presenta y para reagendar.
5. Informe mensual: citas agendadas, citas perdidas y clientes reactivados.
```

## C) Gimnasio · captación automática (197 €/mes)
```
Crea un sistema de captación para [GIMNASIO] en [CIUDAD].
Oferta de entrada: [clase de prueba gratis / 7 días por 9 €].

1. Landing /prueba-gratis.html: titular orientado al resultado,
   testimonios, formulario (nombre, WhatsApp, objetivo, horario
   preferido) y medición con el píxel de Meta y GTM.
2. Asistente de WhatsApp: escribe el system prompt de un agente de IA
   que responda al lead en menos de 1 minuto, resuelva dudas (precios:
   [PRECIOS], horarios, clases), lo cualifique y agende la prueba en
   [Cal.com/CRM]. Si pide hablar con una persona o hay una queja, debe
   pasar a un humano.
3. Secuencia de seguimiento: día 0, 1, 3 y 7 si no agenda; recordatorio
   antes de la prueba; oferta de alta 24 h después de la prueba.
4. Reactivación de antiguos socios (lista CSV) con una oferta de vuelta.
5. 3 anuncios de Meta (texto e idea visual) para la oferta de entrada.
6. Informe mensual: leads, pruebas agendadas, asistencias y altas.
```

## Agente mensual de mantenimiento (todos los packs)
```
Para cada cliente en /clientes/*: lee datos.json y metricas.csv, genera
el informe del mes (informe-[mes].html), 4 publicaciones para Google
Business Profile, y una lista de mejoras para la web. No envíes nada:
deja todo en /revisar/ para que un humano lo apruebe.
```
