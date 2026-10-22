# Oferta ampliada · textil de hogar (pago online y proveedores)

> Propuesta de precios mía, **para que decidas tú**. Importes sin IVA. Las cifras de plataformas y proveedores salen de reseñas y guías de terceros encontradas por búsqueda web (no pude abrir las páginas oficiales): **confírmalas** antes de prometerlas.
> Supuesto de mi estimación: tu hora de trabajo a 30 €, y horas por tarea estimadas. Ajústalas a tu ritmo.

## 1. Respuesta corta
- **Sí se puede**: una tienda con carrito y pago, conectada a un proveedor de dropshipping, es técnicamente viable (hay conectores para WooCommerce y para Shopify).
- **El botón de pago es adicional** y **los proveedores también**: no están en los 295 €. Son dos fases de pago aparte.
- Hoy no tengo cuentas ni acceso a ningún proveedor, así que la integración real se prueba **con la cuenta del cliente**. Lo que ves en la demo es una simulación.

## 2. Lo que sube el precio (propuesta)
| Fase | Qué incluye | Pago único | Cuota mensual |
|---|---|---|---|
| **1 · Tu oferta** | Catálogo para móvil con pedido por WhatsApp, horario, cómo llegar, dominio y hosting, hasta 20 productos | **295 €** | **25 €** |
| **+ Productos extra** | Cada pack de 20 productos más (con fotos y precios que entrega el cliente) | **+60 €** por pack | igual |
| **2 · Botón de pago** | Pago con tarjeta y PayPal en los productos (enlaces de pago de Stripe o Redsys), recogida o envío, aviso del pedido por correo, textos legales básicos. Hasta 15 productos, sin carrito | **+150 €** | igual (25 €) |
| **3 · Tienda online completa** | Carrito, pago, envíos, páginas legales, 30 productos propios (WooCommerce) | **790 €** *(sustituye a la fase 1)* | **40 €** |
| **4 · Proveedor de dropshipping** | Conectar **1 proveedor**: importar hasta 100 productos, reglas de margen y precio, sincronización de stock, prueba de pedido | **+390 €** | **55 €** en total |

**Resumen de paquetes (sin IVA):**
- **A · Catálogo + WhatsApp:** 295 € + 25 €/mes.
- **B · Catálogo + botón de pago:** 445 € + 25 €/mes.
- **C · Tienda online propia:** 790 € + 40 €/mes.
- **D · Tienda + proveedor:** 1.180 € + 55 €/mes.

Para situarlo: según guías de 2026, una tienda online básica para pyme en España se mueve **entre 1.500 y 5.000 €**, y el mantenimiento web entre **50 y 150 €/mes**. Estos precios quedan por debajo a propósito, en línea con tu oferta de 295 €. Si prefieres subirlos, el punto más fácil es la tienda (C) y el proveedor (D).

**Horas estimadas (para comprobar tu margen):** B ≈ 5 h, C ≈ 26 h, proveedor ≈ 13 h.

## 3. Costes que paga el cliente a terceros (no son tuyos)
| Concepto | Orientación | Dónde confirmarlo |
|---|---|---|
| Comisión de pago con tarjeta (Stripe, EEE) | ≈ **1,5 % + 0,25 €** por venta con tarjeta estándar | Stripe |
| Proveedor de dropshipping (por ejemplo BigBuy) | Según reseñas, suscripción de **69 a 99 €/mes + 90 € de alta**; el conector de plataforma puede estar incluido en su plan para tienda propia o costar 129–149 € aparte | bigbuy.eu |
| Shopify (si se usa en lugar de WooCommerce) | Plan Basic ≈ **36 USD/mes** según una fuente | shopify.com |
| WooCommerce | Gratis como software; paga hosting, plugins y temas | |

**Ojo:** esto puede sumar **100–190 €/mes** de costes del cliente. El dropshipping solo compensa si el margen por pedido lo paga:
**margen = precio de venta − coste del proveedor − envío − comisión de pago − devoluciones.**
En textil de hogar el margen suele ser corto; para lo que ya vende en el mercadillo, su stock propio suele salir mejor, y el proveedor para productos complementarios.

## 4. Antes de decir sí
- [ ] ¿Qué proveedor quiere? Pide **condiciones por escrito**: mínimos, plazos de entrega, devoluciones, y si tiene conector para su plataforma.
- [ ] ¿Es autónomo o sociedad? Necesita **datos fiscales**, aviso legal, política de privacidad, cookies, condiciones de venta y devoluciones (14 días de desistimiento para consumidores). Que los revise un asesor.
- [ ] ¿Quién atiende reclamaciones y devoluciones de los pedidos de proveedor? Lo gestiona el negocio, no tú.
- [ ] Define **qué cubre tu soporte** y a qué precio los cambios fuera de la cuota (te recomiendo el mismo "un cambio al mes" de tu oferta).
- [ ] Pago: **50 % al empezar y 50 % al publicar**. Recuerda tu fecha de inicio de trabajo si aplica.

## 5. Cómo hacerle la oferta (guion corto)
> "Para empezar le dejo la web con su catálogo y pedidos por WhatsApp, como ve en la demo, por 295 € y 25 al mes. Si más adelante quiere cobrar online, se le añade el botón de pago, y si quiere vender productos de proveedor, se conecta un proveedor. Cada paso se presupuesta aparte para que pague solo lo que usa."

## 6. La demo
La demo `demo-hogar-textil.html` tiene un selector abajo a la izquierda:
- **Fase 1 · WhatsApp:** lo que cubre tu oferta de 295 €.
- **Fase 2 · con pago:** muestra el **botón «Comprar»** y una ventana de pago **simulada** (cantidad, recogida o envío, total y «Pagar»). Los productos de proveedor muestran el envío desde proveedor. Hay un aviso amarillo de que no se cobra nada.
- En **«Por mayor»** no hay pago online: se pide la tarifa por WhatsApp (así suele funcionar la venta al por mayor).

## 7. Catálogo grande (≈ 1.200 productos) · actualización 22/10/2026
El cliente tiene unos 1.200 productos: no se cargan a mano. Propuesta:
| Tamaño | Carga (pago único) | Cuota |
|---|---|---|
| Hasta 100 | +120 € | sin cambio |
| Hasta 300 | +250 € | sin cambio |
| Hasta 600 | +420 € | +15 €/mes |
| Hasta 1.200 | +700 € | +15 €/mes |

- **Ejemplos con 1.200:** A = 995 € + 40 €/mes · C = 1.490 € + 55 €/mes · D = 1.880 € + 70 €/mes. El paquete B no encaja (pago por producto solo en 15).
- **Horas estimadas:** 20–26 h para 1.200 productos con hoja de cálculo y fotos listas (limpieza de datos, categorías y variantes, importación, optimizar fotos, pruebas). A 30 €/h son ≈ 700 €.
- **Si no hay hoja de cálculo:** capturarla cuesta unos 1,50 € por producto (≈ 1.800 €). Lo más barato es que la prepare el cliente.
- **Camino crítico del plazo:** la hoja de cálculo y las fotos del cliente, no tu trabajo. Plazos: A 12–18 días hábiles, C 25–35, D 30–40; **salida por tandas** con los 150–200 más vendidos en 7–10 días.
- **Alternativa gratuita para el cliente:** la app WhatsApp Business permite un catálogo de productos (el límite que recuerdo es de unos 500; compruébalo en Meta), pero no cubre 1.200 ni busca bien.
- **Demo:** ya muestra 1.200 productos de ejemplo con buscador, filtros por categoría, «Ver más» y «Mi pedido» (varios productos en un solo WhatsApp).

## 8. Caso real: 230 piezas propias + modelos de sus proveedores (22/10/2026)
El cliente vende 230 piezas en el mercadillo y quiere mostrar **todos los modelos de sus proveedores**, que los envíen **directamente** a su cliente cuando él no los tiene.
- **Es el paquete D (tienda híbrida):** 790 € (tienda) + 700 € (carga hasta 1.200) + 390 € (1 proveedor) = **1.880 € + 70 €/mes**. Cada proveedor extra: +250 € y +10 €/mes.
- **Solo sus 230 piezas:** A = 545 € + 25 €/mes · C = 1.040 € + 40 €/mes.
- **En la web** cada producto muestra «En el puesto» (recogida hoy o envío 24–48 h) o «Del proveedor» (lo envía el proveedor en [X] días). La demo ya lo hace (230 y 970).
- **Lo que decide si se puede:** (1) que el proveedor **acepte enviar directo** al cliente final sin su factura en el paquete, (2) que tenga **catálogo digital** (Excel, CSV o feed) con precios, stock y fotos, (3) cómo recibe los pedidos y cada cuánto actualiza stock y precios. Un mayorista tradicional puede no tener nada de esto.
- **Si el proveedor no envía directo:** mostrar sus modelos «bajo pedido» (compra el cliente, el negocio pide al proveedor y envía él, con plazo mayor) o dejar solo los que sí envíen.
- **Riesgos:** el negocio es el vendedor ante el cliente (devoluciones, garantía y desistimiento los gestiona él); el stock del puesto se vende también en persona, así que puede vender online algo ya vendido; los precios del proveedor cambian y hay que actualizarlos (actualización mensual desde su Excel incluida; automática por feed, a presupuestar).
- **Preguntas para el cliente:** ¿cuántos proveedores y cuáles?, ¿tienen catálogo en Excel o web de pedidos?, ¿ya enviaron alguna vez directo a un cliente tuyo?, ¿cómo llevas el stock del puesto?, ¿eres autónomo o sociedad?
