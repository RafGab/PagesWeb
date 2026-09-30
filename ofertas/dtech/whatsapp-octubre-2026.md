# DTech y el cobro de WhatsApp desde el 1 de octubre de 2026: problema y solución

> ⚠️ **Aviso (01/10/2026):** el agente en WhatsApp que se describe abajo es la **fase 2**, todavía **no disponible** en AI Lead Machine.
> Lo que sí existe hoy es el agente en la web. Las funciones de consultar stock o estado de pedido del prompt de ejemplo no existen en el producto:
> serían integraciones a medida. Usa este documento para hablar del **coste de Meta** y de la fase 2, no como descripción del producto actual.

> Investigado el 30/09/2026. Las tarifas son las publicadas por Meta y recogidas por proveedores oficiales (ver fuentes).
> No pude abrir la documentación de Meta directamente desde este entorno; las cifras coinciden en varias fuentes independientes.

## 1. Qué cambia de verdad (sin alarmismo)

| | Antes (hasta el 30/09/2026) | Desde el 1/10/2026 |
|---|---|---|
| **App gratuita WhatsApp Business** (la del celular) | Gratis | **Sigue gratis.** El cambio no la afecta |
| Que el cliente te escriba | Gratis | **Sigue gratis** |
| **API / WhatsApp Business Platform** (chatbots, CRM, agentes de IA, Zendesk, HubSpot…): respuestas dentro de la ventana de 24 h ("mensajes de servicio") | Gratis e ilimitadas | **1.000 gratis al mes por número; desde la 1.001 se cobra cada mensaje entregado** |
| Plantillas de *utilidad* enviadas dentro de la ventana de 24 h (confirmación de pedido, guía de envío…) | Gratis | **Se cobran** |
| Plantillas de *marketing* (promos, novedades, reactivación) | Se cobraban | Se siguen cobrando (es la tarifa más cara) |
| Requisito | — | Tener método de pago en la cuenta de Meta antes del 30/09/2026 para no cortar el servicio |

**Tarifas en Colombia** (por mensaje entregado; la tarifa depende del país del *destinatario*):

| Tipo | USD por mensaje | ≈ COP (TRM de referencia $4.000) |
|---|---|---|
| Servicio (respuesta dentro de 24 h, desde el mensaje 1.001) | $0,0008 | ≈ $3 |
| Utilidad | $0,0008 | ≈ $3 |
| Autenticación | $0,0008 | ≈ $3 |
| **Marketing** | **$0,0125** | **≈ $50** |

Los 1.000 mensajes gratis se renuevan cada mes y no se acumulan.

**Conclusión:** en Colombia **responder es muy barato** (≈ $3 COP por mensaje). **Lo caro es el marketing masivo** (≈ $50 COP por mensaje, 16 veces más). El titular "WhatsApp deja de ser gratis" asusta más de lo que cuesta.

## 2. El problema para DTech

DTech vive del WhatsApp: miles de emprendedores preguntan precios, stock y cómo trabajar dropshipping, y mandan pedidos.
Tiene uno de estos dos escenarios (confirmarlo en la llamada):

### Escenario A: atienden con la app gratuita (lo más probable)
- **No les van a cobrar**, pero la app no escala: no se puede automatizar, no hay respuesta a las 11 de la noche,
  varios asesores se pisan, los leads se enfrían y no hay datos de nada.
- **Riesgo nuevo:** con el ruido del 1 de octubre les van a ofrecer "chatbots" y CRMs sin explicarles el coste por mensaje,
  o van a descartar la automatización "porque ahora WhatsApp cobra". Las dos decisiones les cuestan revendedores.

### Escenario B: ya usan la API (un CRM, un bot, un proveedor)
- Desde hoy **cada respuesta por encima de 1.000 al mes y cada confirmación de pedido se pagan**.
- Los bots mal diseñados envían 3–4 mensajes cortos por respuesta ("¡Hola!", "Claro", "Te cuento…", "¿Algo más?"):
  **cada burbuja se cobra**.
- Las **difusiones masivas de novedades a toda la base** son la partida grande: a $0,0125 por mensaje, 5.000 revendedores
  × 4 envíos al mes = 20.000 mensajes ≈ **US$250 ≈ $1.000.000 COP/mes**, aunque la mayoría no compre.
- Sin medición no saben cuánto les cuesta cada pedido que entra por WhatsApp.

**En una frase:** el problema no es la tarifa de responder, que en Colombia es mínima. El problema es **atender a mano**
(se pierden ventas) o **automatizar mal** (se paga por mensajes que no venden).

## 3. La solución: el agente virtual de DTech

Un agente de IA en la API oficial de WhatsApp, **diseñado para vender más y gastar lo mínimo en mensajes**.

| Qué hace | Cómo ahorra o vende |
|---|---|
| **Responde en menos de 1 minuto, 24/7:** precios por volumen, stock, cómo ser dropshipper o mayorista, envíos, garantía, estado del pedido | Ningún revendedor se enfría esperando. Atiende fuera del horario del equipo |
| **Una respuesta completa en un solo mensaje** (con enlace al catálogo o al kit de venta), nunca 4 burbujas | Cada mensaje entregado cuenta: menos mensajes = menos coste |
| **Resuelve en menos turnos:** pregunta lo necesario una sola vez (modalidad, ciudad, categoría) y manda la lista de precios que corresponde | Menos idas y vueltas = menos coste y cierre más rápido |
| **Registra cada lead** (nombre, ciudad, modalidad, interés) en una hoja o CRM | DTech sabe cuántos revendedores entran y de dónde |
| **Pasa a un asesor humano** en pedidos grandes (mayoreo, distribuidor), quejas o cuando el cliente lo pide, con el resumen de la conversación | El equipo se dedica a cerrar, no a repetir precios |
| **Actualizaciones de pedido agrupadas:** un solo mensaje con número de guía y enlace de seguimiento, en vez de varios avisos | Menos mensajes de utilidad cobrados |
| **Marketing segmentado, no masivo:** reactivación solo a revendedores que compraron esa categoría o llevan 30 días sin pedir; novedades generales por el **Canal de WhatsApp** de DTech (publicar en un canal no se cobra por mensaje) | Recorta la partida más cara (≈ $50 COP por mensaje) sin dejar de comunicar |
| **Panel de costes:** mensajes enviados, coste estimado, conversaciones, leads y **coste por pedido** | Deciden con datos |
| Opcional: **modo coexistencia** (si el proveedor de API lo soporta): el equipo sigue usando la app en el celular y el agente atiende por la API con el mismo número | Sin cambiar el número que ya conocen sus 5.000 clientes |

### Cuánto le costaría a DTech en mensajes (estimación a validar con su volumen real)

| Concepto | Volumen al mes (supuesto) | Coste |
|---|---|---|
| Respuestas del agente y del equipo (servicio) | 36.000 (6.000 conversaciones × 6), 1.000 gratis | 35.000 × $0,0008 = **US$28** |
| Confirmaciones y guías de pedido (utilidad) | 3.750 pedidos × 1 mensaje agrupado | **US$3** |
| Reactivación segmentada (marketing) | 4.000 mensajes | 4.000 × $0,0125 = **US$50** |
| **Total Meta** | | **≈ US$81/mes ≈ $325.000 COP** |
| Lo mismo con un bot "hablador" y difusiones masivas | 3× mensajes de servicio (107.000 cobrados), 3 avisos por pedido y 20.000 de marketing | ≈ US$345/mes ≈ **$1.380.000 COP** |

**El diseño del agente ahorra ~$1.000.000 COP al mes solo en tarifas de Meta.** Eso sin contar lo principal: los revendedores
que no se pierden por responder tarde.

> Nota: Meta tiene su propio agente de IA ("Meta Business Agent") con tarifa por tokens. Las cifras publicadas por terceros
> son contradictorias, así que no las uso en la comparativa; si DTech lo menciona, pedir la cotización oficial.

## 4. Cómo encaja en la oferta
- El agente es la pieza **C** del plan **Crecimiento** ($3.900.000 + $1.490.000/mes). El coste de Meta lo paga DTech
  directamente con su método de pago, y nosotros se lo **reportamos cada mes** en el panel.
- Mensaje clave de venta: *"No le van a cobrar por usar la app. Pero si quiere automatizar y crecer, hágalo bien: en Colombia
  responder cuesta $3 pesos el mensaje; lo que sale caro es un bot mal hecho y las difusiones masivas."*

## 5. Instrucciones base del agente (system prompt)
```
Eres el asistente comercial de DTech, importador y mayorista de tecnología, hogar y belleza en Bogotá
(C.C. Puerto Rico). Atiendes por WhatsApp a emprendedores que quieren vender productos DTech.

Objetivo: que cada persona reciba la información correcta y haga su primer pedido, en el menor número
de mensajes posible.

Reglas de estilo (cada mensaje enviado tiene coste):
- Responde SIEMPRE en un solo mensaje completo. Nunca partas la respuesta en varios mensajes.
- Máximo 5 líneas. Usa viñetas y 1 emoji como mucho. Trata de "usted" salvo que el cliente tutee.
- Si necesitas datos, pídelos todos juntos en una sola pregunta: modalidad (dropshipping, mayoreo
  desde 3 unidades o distribuidor), ciudad y categoría de interés.
- No mandes saludos ni despedidas sueltas.

Qué puedes responder (usa SOLO la información de la base de conocimiento; si algo no está, dilo y
ofrece un asesor):
- Precios por modalidad y descuentos por volumen → envía el enlace a la lista de precios que corresponda.
- Stock de un producto → consulta la herramienta de stock.
- Cómo funciona el dropshipping con DTech, tiempos de despacho (12–24 h) y envíos a toda Colombia.
- Estado de un pedido → pide el número de pedido o de guía y consulta la herramienta de pedidos.
- Kit de venta de un producto → envía el enlace de descarga.

Pasa a un asesor humano (herramienta handoff, con un resumen de 2 líneas) cuando:
- Es un pedido de mayoreo grande o alguien quiere ser distribuidor.
- Hay una queja, garantía, devolución o problema con un pago.
- La persona lo pide o se enfada, o no tienes la respuesta tras un intento.

Registra cada contacto nuevo con la herramienta de registrar lead (nombre, ciudad, modalidad, interés).
Nunca inventes precios, stock ni plazos. Nunca pidas datos de tarjetas ni contraseñas.
```

## Fuentes
- [Infobae – WhatsApp Business cobrará por responder mensajes: a quiénes afecta y a quiénes no](https://www.infobae.com/tecno/2026/09/06/whatsapp-business-cobrara-por-responder-mensajes-en-2026-a-quienes-afecta-y-a-quienes-no/)
- [Infobae – WhatsApp Business pondrá un límite a los mensajes](https://www.infobae.com/tecno/2026/09/11/whatsapp-business-pondra-un-limite-a-los-mensajes-y-aplicara-cargos-a-las-empresas-que-lo-excedan/)
- [Colombia.com – WhatsApp empieza a cobrar por mensajes el 1 de octubre](https://www.colombia.com/tecnologia/destacadas/whatsapp-cobrara-por-mensajes-desde-el-1-de-octubre-602438)
- [Hint – WhatsApp API 2026: tarifas en México, Colombia y Argentina](https://www.hint.mx/blog/whatsapp-api-cobrara-mensajes-de-servicio)
- [360dialog – Cobro de mensajes de servicio en octubre de 2026](https://360dialog.com/blog/whatsapp-service-message-charging-october-2026/)
- [Meta for Developers – Pricing updates for Meta Business Agent, service and utility messages](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing/non-template-messages)
- [Meta for Developers – Pricing on the WhatsApp Business Platform](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing)
- [Ámbito – WhatsApp deja de ser gratis para las empresas a partir de octubre](https://www.ambito.com/tecnologia/whatsapp-deja-ser-gratis-las-empresas-partir-octubre-2026-las-claves-del-cambio-meta-n6306488)
- [Wati – WhatsApp AI token pricing (Meta Business Agent)](https://www.wati.io/en/blog/meta-whatsapp-ai-token-pricing/)
