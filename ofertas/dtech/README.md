# Oferta para DTech (@tecnologia.dtech) · versión 2, con el producto real

> Reescrita el 01/10/2026 a partir de `../../CONTEXTO.md` (producto verificado en el código y precios oficiales).
> La versión anterior (agente de WhatsApp, precios propios, kits de venta y calculadora) está en `archivo/` y **no debe enviarse**.

## Lo que DTech ya te dijo (Denis Bermúdez, 30/09/2026)
1. *"Nosotros manejamos bot"*.
2. *"Pero al WhatsApp manejo humanizado ya que es venta al mayoreo"*.

Consecuencias para la oferta: no compitas con su bot ni con su atención humana en WhatsApp. Se vende **un filtro previo**
que entrega los casos calificados y con resumen a su equipo humano.

## Qué se ofrece (todo verificado contra el código de tu agente)
- **Fase 1, disponible hoy:** agente en la web de DTech que atiende 24/7, **califica** al revendedor (modalidad, ciudad, categoría, volumen, experiencia),
  **prioriza con reglas** (por ejemplo volumen alto = urgente), **agenda una llamada con un asesor** en Google Calendar,
  **avisa por correo**, panel de leads con estados, notas y CSV, y botón "hablar con una persona".
- **Fase 2, en desarrollo:** el mismo agente en **WhatsApp**, como primer filtro antes del equipo humano.
  En tu web de precios figura como "próximamente" en el plan Crecimiento. **No lo vendas como disponible.**

### Decisión tuya antes de enviar
La propuesta incluye la fase 2 con una fecha estimada: `[FECHA ESTIMADA DE WHATSAPP]` en `propuesta.html`.
- Si vas a construirlo, pon una fecha realista que puedas cumplir.
- Si no quieres comprometerte, **borra el bloque "Fase 2"** de la propuesta. El resto se sostiene solo.

## Precios (oficiales, de `demo-site/implementar.html`, COP sin IVA)
| Plan | 12 meses | 6 meses |
|---|---|---|
| **Esencial** (hasta ~500 conversaciones/mes, un canal) | 5.800.000 + 750.000/mes | 6.500.000 + 850.000/mes |
| **Crecimiento** ⭐ (recomendado: alto volumen, reglas avanzadas, estadísticas, varios canales) | 14.000.000 + 2.300.000/mes (total 41.600.000) | 16.000.000 + 2.600.000/mes (total 31.600.000) |

Por qué Crecimiento: DTech dice tener miles de revendedores y vende por varios canales, así que superaría las 500 conversaciones al mes y necesitará
las reglas avanzadas y las estadísticas. Esencial sirve como arranque más barato para probar solo en la web; se puede cambiar de plan.
Ya no hay "piloto de $990.000": no existe en tu lista de precios. Tu gancho es la **demo con sus datos, sin costo**.

## ¿Un bot que ya tienen es lo mismo que tu agente?
**No necesariamente, pero no lo sabes hasta ver su bot.** "Bot" es una palabra que cubre cosas muy distintas:

| | Bot típico (menús, palabras clave, FAQ) | Tu agente (según tu código) |
|---|---|---|
| Entiende texto libre | Poco o nada: se apoya en botones y palabras exactas | Sí, con IA, y combina botones con texto libre |
| Recoge datos del cliente | Formularios fijos | Extrae los datos de la conversación según los campos de cada negocio |
| Decide quién es prioritario | No | Sí, con reglas del negocio |
| Agenda con disponibilidad real | Rara vez | Sí, Google Calendar y alternativas si está ocupado |
| Pasa a una persona con resumen | A veces, sin contexto | Sí |
| Panel de leads con estados y notas | Raro | Sí, con CSV y estadísticas |

Pero **tu agente es de la misma familia: automatiza la primera atención.** Si el bot de DTech ya califica, prioriza y entrega los casos resumidos
a su equipo, tu propuesta de "agente" aporta poco y **no deberías insistir**. Por eso el primer paso es averiguarlo, no vender.

### Cómo averiguar qué hace su bot (haz esto antes de la llamada)
1. **Pruébalo tú:** escríbele como un revendedor nuevo (canal que use: web, Instagram, WhatsApp). Apunta si:
   - entiende una frase libre o solo botones;
   - te pregunta ciudad, volumen, modalidad o categoría;
   - te pasa a una persona y si esa persona recibe el resumen;
   - te agenda una llamada o te da un enlace;
   - responde a las 11 de la noche.
2. **Pregúntale a Denis (5 preguntas):**
   - ¿En qué canal está el bot y qué hace exactamente?
   - ¿Qué pregunta a quien llega y qué hace con las respuestas? ¿Llegan a una hoja, CRM o correo?
   - ¿Cómo sabe su equipo qué lead es prioritario?
   - ¿Qué porcentaje de quienes preguntan termina haciendo un pedido?
   - ¿Qué es lo que más le molesta de su bot actual?

### Qué ofrecer según lo que encuentres
| Si su bot… | Entonces tu oferta es… |
|---|---|
| Es de menús o palabras clave y no califica | **El agente** como mejora: entiende texto libre, califica y entrega al humano con resumen |
| Califica, pero los datos se pierden (no hay panel ni correo) | **El panel de leads + avisos**, y el agente si quieren mejorar la conversación |
| Hace todo lo anterior y bien | **No vendas el agente.** Quizá su cuello de botella es la captación (la web) o el seguimiento, y eso aún no lo cubre tu producto |
| Solo funciona en un canal (por ejemplo Instagram) | El agente en la **web**, que es otro canal, y la fase 2 en WhatsApp |

## Antes de enviar la propuesta
- [ ] Decidir la fase 2 y sustituir `[FECHA ESTIMADA DE WHATSAPP]` (nombre y WhatsApp ya están puestos; el correo no se incluye).
- [ ] Para hablar de "demo con sus datos" tienes que **construir el rubro de DTech** en tu agente (mayorista y dropshipping). Hoy no existe: los rubros
  listos son inmobiliaria, dental, despacho, hotel, gimnasio y extranjería. Es un archivo nuevo en `backend/demo/verticals/` (preguntas, campos, reglas, color).
- [ ] Confirmar con Denis qué hace su bot (sección anterior).
- [ ] Revisar el cobro de WhatsApp (`whatsapp-octubre-2026.md`): el aviso de ese documento sobre el "agente en WhatsApp" aplica a la fase 2, no a hoy.

## Archivos
- `propuesta.html`: propuesta de una página para enviar o guardar en PDF.
- `mensajes.md`: mensajes para Denis, respuesta al "ya tenemos bot" y guion de llamada.
- `whatsapp-octubre-2026.md`: análisis del cobro de WhatsApp y coste para la fase 2.
- `archivo/`: versión anterior, **no enviar**.

## Análisis de DTech (sin cambios)
Importador y mayorista de tecnología, hogar y belleza en el C.C. Puerto Rico (Calle 13, Bogotá). Vende desde 3 unidades y abastece a dropshippers con despacho en 12–24 h.
Dice tener +10 años, +5.000 emprendedores activos y unos 45.000 pedidos en 2025 (datos de su propio material, sin verificar). WhatsApp públicos: 322 321 4138 y 322 912 4924.
Hay dos marcas parecidas ("Tecnología DTech / Diamond Technology" y "D-TECH"): confirma que son la misma empresa antes de mezclar datos.

## Fuentes
- [Instagram @tecnologia.dtech](https://www.instagram.com/tecnologia.dtech/)
- [Las2orillas – bodegas de tecnología en Bogotá](https://www.las2orillas.co/las-bodegas-ocultas-de-tecnologia-en-bogota-con-muchos-productos-desde-3-500/)
- [catalogodtech.com](https://catalogodtech.com/) · [portafoliodtech.com](https://portafoliodtech.com/)
- [Rappi – Tecnología DTech](https://www.rappi.com.co/tiendas/900250967-diamondtechnology-mt-enc)
- Planes y funciones: `demo-site/implementar.html` del repositorio `RafGab/ai-lead-machine-demo`
