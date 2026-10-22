// Genera la oferta en HTML (-> PDF con Playwright) y en Word. Uso: NODE_PATH=<docx> node generar.mjs
import fs from 'fs';import {createRequire} from 'module';
const require=createRequire(import.meta.url);
const D=require('docx');
const FD=process.env.FONTS_DIR;
const b64=p=>fs.readFileSync(FD+p).toString('base64');
const faces=[['Montserrat',600,'montserrat/files/montserrat-latin-600-normal.woff2'],['Montserrat',700,'montserrat/files/montserrat-latin-700-normal.woff2'],['Montserrat',800,'montserrat/files/montserrat-latin-800-normal.woff2'],['DM Sans',400,'dm-sans/files/dm-sans-latin-400-normal.woff2'],['DM Sans',500,'dm-sans/files/dm-sans-latin-500-normal.woff2'],['DM Sans',700,'dm-sans/files/dm-sans-latin-700-normal.woff2']];
const fontCss=faces.map(([n,w,p])=>`@font-face{font-family:'${n}';font-weight:${w};src:url(data:font/woff2;base64,${b64(p)}) format('woff2')}`).join('\n');

// ---------- CONTENIDO ----------
const FECHA='22 de octubre de 2026';
const pk=[
 {k:'A',n:'Catálogo + WhatsApp',p:'295 €',m:'25 €/mes',t:'5 a 7 días hábiles',ideal:'Empezar ya: tus productos en el móvil y los pedidos por WhatsApp.'},
 {k:'B',n:'Catálogo + botón de pago',p:'445 €',m:'25 €/mes',t:'8 a 12 días hábiles*',ideal:'Cobrar online en tus productos principales, sin carrito.'},
 {k:'C',n:'Tienda online propia',p:'790 €',m:'40 €/mes',t:'15 a 20 días hábiles',ideal:'Carrito, pago y envíos para vender con una tienda completa.'},
 {k:'D',n:'Tienda + proveedor',p:'1.180 €',m:'55 €/mes',t:'20 a 30 días hábiles**',ideal:'Tu tienda más productos de un proveedor que envía por ti (dropshipping).'}];
const rows=[
 ['Web para móvil con tu catálogo','✓','✓','✓','✓'],
 ['Productos incluidos','Hasta 20','Hasta 20 (15 con pago)','Hasta 30','30 + hasta 100 de proveedor'],
 ['Pedido por WhatsApp con producto y medida','✓','✓','✓','✓'],
 ['Precios por menor y por mayor','✓','✓','✓','✓'],
 ['Dónde estamos, horario y cómo llegar','✓','✓','✓','✓'],
 ['Botón de pago (tarjeta y PayPal)','—','✓','✓','✓'],
 ['Carrito con varios productos','—','—','✓','✓'],
 ['Recogida o envío configurables','—','✓','✓','✓'],
 ['Aviso del pedido por correo','—','✓','✓','✓'],
 ['Productos de proveedor (dropshipping)','—','—','—','✓ 1 proveedor'],
 ['Textos legales básicos (plantilla)','✓','✓','✓','✓'],
 ['Dominio, alojamiento y un cambio al mes','✓','✓','✓','✓'],
 ['Pago único','295 €','445 €','790 €','1.180 €'],
 ['Cuota mensual','25 €','25 €','40 €','55 €']];
const plazos=[
 {k:'A',t:'5 a 7 días hábiles',a:0,b:1.4,c:'#6D3AE8'},
 {k:'B',t:'8 a 12 días hábiles*',a:0,b:2.4,c:'#8B4FD9'},
 {k:'C',t:'15 a 20 días hábiles',a:0,b:4,c:'#A44CC4'},
 {k:'D',t:'20 a 30 días hábiles**',a:0,b:6,c:'#C4479F'}];
const info=[
 ['Para todos los paquetes',['Nombre del negocio y, si lo tienes, el logo y los colores.','Número de WhatsApp para recibir los pedidos.','Días, horario y ubicación de tu puesto o tienda.','Lista de productos: nombre, medidas, colores, precio por menor, precio por mayor y unidades mínimas por mayor.','Fotos de cada producto (cuanto mejor la luz, mejor se ve).','El dominio que quieres (por ejemplo, tunegocio.es) o el que ya tienes.']],
 ['Para pago online (B, C y D)',['Si eres autónomo o sociedad, con tus datos fiscales para las páginas legales.','Alta o verificación de tu cuenta de cobro (por ejemplo, Stripe, PayPal o la de tu banco).','Cómo quieres entregar: recogida y/o envío, con quién y a qué precio.']],
 ['Para proveedor (D)',['El proveedor que quieres usar y su cuenta de dropshipping dada de alta.','Sus condiciones por escrito: plazos de entrega, devoluciones y costes.','Qué margen quieres aplicar a cada producto.']]];
const pasos=[
 ['Nos envías la información completa','Con la lista de arriba. Si falta algo, te lo pedimos de una vez.'],
 ['Pago del 50 % y arranque','El plazo cuenta desde que tenemos toda la información y el primer pago.'],
 ['Te enseñamos el borrador','Lo ves en tu móvil y nos dices los cambios. Incluimos una ronda de ajustes.'],
 ['Publicamos','Con tu dominio, y te explicamos cómo pedir cambios cada mes. Pagas el otro 50 % al publicar y empieza la cuota mensual.']];
const notas=[
 '* Con cobro por Stripe o PayPal. Si usas el TPV de tu banco (Redsys), el banco puede tardar de 1 a 3 semanas más en activarlo.',
 '** Depende de que el proveedor apruebe tu cuenta y de que tengamos sus condiciones. Cada proveedor se confirma antes de empezar.'];
const terceros=[
 ['Comisión de cobro con tarjeta','Alrededor del 1,5 % + 0,25 € por venta con tarjeta estándar europea (Stripe). La cobra la pasarela, no nosotros.'],
 ['Proveedor de dropshipping','Cuota y alta según el proveedor que elijas (algunos cobran desde unas decenas de euros al mes). Se confirma con su tarifa oficial antes de empezar.'],
 ['Envíos','Los precios de la empresa de transporte los fija el transportista.']];
const noincl=['Fotografía profesional de los productos.','Revisión legal de los textos de venta, devoluciones y privacidad: te damos plantillas y debe revisarlas tu asesor.','Gestión de pedidos, atención al cliente y devoluciones.','Publicidad en redes o buscadores, o posicionamiento garantizado.','Más de un cambio al mes en la cuota (los extras se presupuestan antes).'];
const cond=['Importes sin IVA. Se aplica el IVA vigente en factura.','Forma de pago: 50 % al empezar y 50 % al publicar. La cuota mensual empieza al publicar.','La cuota incluye dominio, alojamiento y un cambio al mes.','Se pueden ampliar paquetes más adelante sin rehacer la web: pagas solo la diferencia entre paquetes.','Propuesta válida durante 15 días desde su fecha.'];

// ---------- HTML ----------
const esc=t=>String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;');
const css=`${fontCss}
@page{size:A4;margin:0}*{box-sizing:border-box}
:root{--ink:#1C1A3A;--v:#6D3AE8;--m:#C4479F;--lav:#F1EDFF;--mut:#5C5877;--line:#E2DCF5;--g:#1F9D55}
body{margin:0;font:400 9.6pt/1.5 'DM Sans',Arial,sans-serif;color:var(--ink)}
.page{width:210mm;height:297mm;padding:16mm 16mm 14mm;position:relative;overflow:hidden;break-after:page;background:#fff}
.page::before{content:"";position:absolute;right:-60mm;top:-60mm;width:150mm;height:150mm;border-radius:50%;background:radial-gradient(circle,#6D3AE81f,transparent 68%)}
.page>*{position:relative}
h1,h2,h3{font-family:Montserrat,Arial,sans-serif;margin:0;letter-spacing:-.01em}
.brand{display:flex;align-items:center;gap:10px;margin-bottom:12px}
.logo{width:34px;height:34px;border-radius:9px;background:linear-gradient(135deg,var(--v),var(--m));display:grid;place-items:center}
.logo svg{width:20px;height:20px}
.brand b{font:700 11pt Montserrat;display:block;line-height:1.1}.brand span{font-size:8.4pt;color:var(--mut)}
.pill{display:inline-block;background:var(--lav);color:var(--v);font:700 7.6pt Montserrat;letter-spacing:.1em;text-transform:uppercase;padding:5px 12px;border-radius:99px}
h1{font-size:24pt;line-height:1.1;font-weight:800;margin:12px 0 6px}h1 em{font-style:normal;color:var(--v)}
.lead{font-size:10.6pt;color:var(--mut);max-width:150mm;margin:0 0 6mm}
.meta{display:flex;gap:18px;font-size:8.8pt;color:var(--mut);margin-bottom:6mm}.meta b{color:var(--ink)}
.cards{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.pc{border:1px solid var(--line);border-radius:12px;padding:12px 11px;background:#fff;display:flex;flex-direction:column;gap:5px}
.pc.rec{border:2px solid var(--v);background:linear-gradient(180deg,#F7F3FF,#fff)}
.pc .k{font:800 8pt Montserrat;color:var(--v);letter-spacing:.1em}.pc h3{font-size:10.2pt;line-height:1.2;min-height:25pt}
.pc .pr{font:800 17pt Montserrat;line-height:1}.pc .pr small{font:600 8pt 'DM Sans';color:var(--mut)}
.pc .mm{font-size:8.8pt;font-weight:700;color:var(--ink)}.pc .id{font-size:8.4pt;color:var(--mut)}
.pc .tm{margin-top:auto;font-size:8.4pt;border-top:1px dashed var(--line);padding-top:6px;color:var(--ink)}.pc .tm b{color:var(--v)}
.reco{font:700 7pt Montserrat;color:#fff;background:linear-gradient(90deg,var(--v),var(--m));display:inline-block;padding:3px 8px;border-radius:99px;width:max-content}
h2{font-size:13.5pt;font-weight:800;margin:6mm 0 3mm}
table{width:100%;border-collapse:collapse;font-size:8.8pt}
th,td{padding:5.5px 7px;border-bottom:1px solid var(--line);text-align:center}th:first-child,td:first-child{text-align:left}
th{background:var(--lav);color:var(--v);font:700 8pt Montserrat}tr.b td{font-weight:700;background:#FAF8FF}
td.y{color:var(--g);font-weight:700}td.n{color:#B8B3CF}
.two{display:grid;grid-template-columns:1fr 1fr;gap:10mm}
ul{margin:0;padding-left:15px}li{margin:2.2px 0}
.tl{margin-top:2mm}.tr{display:grid;grid-template-columns:20mm 1fr 44mm;gap:8px;align-items:center;margin:5px 0}
.tr .kk{font:800 9pt Montserrat;color:var(--v)}.trk{height:13px;background:var(--lav);border-radius:99px;position:relative}.trk i{position:absolute;top:0;bottom:0;border-radius:99px}
.tr .tt{font-size:8.6pt;font-weight:700}.scale{display:grid;grid-template-columns:20mm 1fr 44mm;gap:8px;font-size:7.4pt;color:var(--mut)}.scale div:nth-child(2){display:flex;justify-content:space-between}
.note{font-size:7.9pt;color:var(--mut);margin:3px 0}
.info h3{font-size:9.6pt;color:var(--v);margin:6px 0 3px}
.step{display:flex;gap:9px;margin:5px 0}.step .nn{flex:0 0 22px;height:22px;border-radius:50%;background:linear-gradient(135deg,var(--v),var(--m));color:#fff;font:800 9pt Montserrat;display:grid;place-items:center}
.step b{display:block;font-size:9.4pt}.step span{font-size:8.7pt;color:var(--mut)}
.box{background:var(--lav);border-radius:12px;padding:10px 13px}
.cta{display:flex;justify-content:space-between;align-items:center;margin-top:5mm;gap:12px}
.cta .who b{font:800 11pt Montserrat;display:block}.cta .who span{font-size:8.8pt;color:var(--mut)}
.wa{background:var(--g);color:#fff;border-radius:12px;padding:11px 16px;text-align:center;font:700 9.6pt 'DM Sans'}.wa b{font:800 10.4pt Montserrat;display:block}
.foot{position:absolute;left:16mm;right:16mm;bottom:8mm;display:flex;justify-content:space-between;font-size:7.4pt;color:var(--mut);border-top:1px solid var(--line);padding-top:4px}
`;
const logoSvg='<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16l-6 7v5l-4 2v-7z"/></svg>';
const head=(p)=>`<div class="brand"><div class="logo">${logoSvg}</div><div><b>AI Lead Machine</b><span>Webs para negocios</span></div></div>`;
const foot=(n)=>`<div class="foot"><span>Propuesta de web para tu negocio · ${FECHA}</span><span>Página ${n} de 3</span></div>`;
const cards=pk.map((p,i)=>`<div class="pc ${p.k==='A'?'rec':''}">${p.k==='A'?'<span class="reco">Para empezar</span>':'<span style="height:15px"></span>'}<div class="k">PAQUETE ${p.k}</div><h3>${esc(p.n)}</h3><div class="pr">${p.p}<small> + IVA</small></div><div class="mm">+ ${p.m} + IVA</div><div class="id">${esc(p.ideal)}</div><div class="tm">Listo en <b>${p.t}</b></div></div>`).join('');
const tbl='<table><tr><th>Qué incluye</th>'+pk.map(p=>`<th>${p.k} · ${esc(p.n.split(' ')[0]==='Catálogo'?p.n.replace('Catálogo ','Catálogo '):p.n)}</th>`).join('')+'</tr>'+rows.map((r,i)=>`<tr class="${i>=12?'b':''}"><td>${esc(r[0])}</td>`+r.slice(1).map(c=>`<td class="${c==='—'?'n':(c.startsWith('✓')?'y':'')}">${esc(c)}</td>`).join('')+'</tr>').join('')+'</table>';
const tl='<div class="tl">'+plazos.map(p=>`<div class="tr"><div class="kk">Paquete ${p.k}</div><div class="trk"><i style="left:${p.a/6*100}%;width:${(p.b-p.a)/6*100}%;background:${p.c}"></i></div><div class="tt">${p.t}</div></div>`).join('')+'<div class="scale"><div></div><div><span>Semana 0</span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span></div><div></div></div></div>';
const html=`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Propuesta de web · AI Lead Machine</title><style>${css}</style></head><body>
<section class="page">${head()}<span class="pill">Propuesta para tu negocio</span><h1>Tu web, <em>por fases</em>, sin pagar de más</h1>
<p class="lead">Empiezas con lo esencial y creces cuando lo necesites: de un catálogo con pedidos por WhatsApp a una tienda online con proveedores. Cada paso se suma al anterior sin rehacer nada.</p>
<div class="meta"><span><b>Para:</b> [Nombre del cliente]</span><span><b>Fecha:</b> ${FECHA}</span><span><b>Válida:</b> 15 días</span></div>
<div class="cards">${cards}</div>
<p class="note" style="margin-top:8px">Todos los importes son sin IVA. La cuota mensual incluye dominio, alojamiento y un cambio al mes.</p>
<h2>Qué recomendamos</h2>
<div class="box"><b>Empieza por el paquete A.</b> En una semana tendrás tu catálogo en el móvil y recibirás pedidos por WhatsApp. Cuando veas que compran, sumas el botón de pago (B) o pasas a tienda completa (C). El proveedor (D) conviene añadirlo cuando ya tengas ventas y hayas comprobado su margen.</div>
<h2>Cómo funciona</h2>
${pasos.map((s,i)=>`<div class="step"><div class="nn">${i+1}</div><div><b>${esc(s[0])}</b><span>${esc(s[1])}</span></div></div>`).join('')}
${foot(1)}</section>
<section class="page">${head()}<h2 style="margin-top:0">Qué incluye cada paquete</h2>${tbl}
<div class="two" style="margin-top:6mm"><div><h2 style="margin-top:0">Costes de terceros</h2><p class="note" style="font-size:8.6pt">Los paga el negocio directamente. Son orientativos y se confirman antes de empezar.</p><ul>${terceros.map(t=>`<li><b>${esc(t[0])}:</b> ${esc(t[1])}</li>`).join('')}</ul></div>
<div><h2 style="margin-top:0">Qué no incluye</h2><ul>${noincl.map(t=>`<li>${esc(t)}</li>`).join('')}</ul></div></div>
${foot(2)}</section>
<section class="page">${head()}<h2 style="margin-top:0">Cuánto tardamos</h2><p class="note" style="font-size:8.8pt;margin-bottom:2px">Contamos desde el día en que recibimos <b>toda la información</b> y el primer pago.</p>${tl}
${notas.map(n=>`<p class="note">${esc(n)}</p>`).join('')}
<h2>Información que necesitamos de ti</h2><div class="info two"><div>${info.slice(0,1).map(i=>`<h3>${esc(i[0])}</h3><ul>${i[1].map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`).join('')}</div><div>${info.slice(1).map(i=>`<h3>${esc(i[0])}</h3><ul>${i[1].map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`).join('')}</div></div>
<h2>Condiciones</h2><ul>${cond.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>
<div class="cta"><div class="who"><b>Viviana Acero</b><span>AI Lead Machine · Webs para negocios<br>Te la hago yo, sin que sepas nada de webs.</span></div><div class="wa">Escribe <b>WEB</b>WhatsApp +34 672 953 197</div></div>
${foot(3)}</section></body></html>`;
fs.writeFileSync('oferta.html',html);

// ---------- WORD ----------
const {Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,WidthType,ShadingType,BorderStyle,AlignmentType,Footer,PageNumber,LevelFormat,TabStopType,VerticalAlign}=D;
const V='6D3AE8',INK='1C1A3A',MUT='5C5877',LAV='F1EDFF';const F='Calibri',W=9638;
const t=(x,o={})=>new TextRun({text:x,font:F,size:21,color:INK,...o});
const P=(x,o={})=>new Paragraph({spacing:{after:100,line:290},...o,children:Array.isArray(x)?x:[t(x)]});
const H=(x)=>new Paragraph({keepNext:true,spacing:{before:260,after:90},border:{bottom:{style:BorderStyle.SINGLE,size:6,color:V,space:3}},children:[new TextRun({text:x,font:F,size:28,bold:true,color:INK})]});
const B=(x)=>new Paragraph({numbering:{reference:'b',level:0},spacing:{after:50,line:280},children:[t(x)]});
const thin={style:BorderStyle.SINGLE,size:4,color:'D9D3EE'};const bd={top:thin,bottom:thin,left:thin,right:thin};
const cell=(x,w,o={})=>new TableCell({width:{size:w,type:WidthType.DXA},verticalAlign:VerticalAlign.CENTER,margins:{top:70,bottom:70,left:100,right:100},borders:bd,shading:o.fill?{type:ShadingType.CLEAR,fill:o.fill,color:'auto'}:undefined,children:[new Paragraph({alignment:o.al||AlignmentType.CENTER,children:[t(x,{size:o.sz||19,bold:o.b,color:o.c||INK})]})]});
const cw=[3238,1600,1600,1600,1600];
const tabla=new Table({width:{size:W,type:WidthType.DXA},columnWidths:cw,rows:[
 new TableRow({tableHeader:true,children:[cell('Qué incluye',cw[0],{fill:LAV,b:true,c:V,al:AlignmentType.LEFT}),...pk.map((p,i)=>cell(`${p.k} · ${p.n}`,cw[i+1],{fill:LAV,b:true,c:V,sz:17}))]}),
 ...rows.map((r,ri)=>new TableRow({cantSplit:true,children:r.map((c,i)=>cell(c,cw[i],{al:i===0?AlignmentType.LEFT:AlignmentType.CENTER,b:ri>=12,c:c==='—'?'B8B3CF':(c.startsWith('✓')?'1F9D55':INK)}))}))]});
const plazosT=new Table({width:{size:W,type:WidthType.DXA},columnWidths:[2200,3000,4438],rows:[
 new TableRow({tableHeader:true,children:[cell('Paquete',2200,{fill:LAV,b:true,c:V,al:AlignmentType.LEFT}),cell('Plazo',3000,{fill:LAV,b:true,c:V}),cell('Para qué',4438,{fill:LAV,b:true,c:V,al:AlignmentType.LEFT})]}),
 ...pk.map(p=>new TableRow({cantSplit:true,children:[cell(`${p.k} · ${p.n}`,2200,{al:AlignmentType.LEFT,b:true}),cell(p.t,3000,{b:true,c:V}),cell(p.ideal,4438,{al:AlignmentType.LEFT})]}))]});
const kids=[
 new Paragraph({spacing:{after:40},children:[new TextRun({text:'AI Lead Machine',font:F,size:26,bold:true,color:V}),new TextRun({text:'   Webs para negocios',font:F,size:19,color:MUT})]}),
 new Paragraph({spacing:{before:120,after:80},children:[new TextRun({text:'Tu web, por fases, sin pagar de más',font:F,size:48,bold:true,color:INK})]}),
 P('Empiezas con lo esencial y creces cuando lo necesites: de un catálogo con pedidos por WhatsApp a una tienda online con proveedores. Cada paso se suma al anterior sin rehacer nada.',{}),
 P([t('Para: ',{bold:true}),t('[Nombre del cliente]      '),t('Fecha: ',{bold:true}),t(FECHA+'      '),t('Válida: ',{bold:true}),t('15 días')]),
 H('Paquetes y precios'),
 P('Todos los importes son sin IVA. La cuota mensual incluye dominio, alojamiento y un cambio al mes.',{}),
 ...pk.flatMap(p=>[new Paragraph({keepNext:true,spacing:{before:140,after:30},children:[t(`Paquete ${p.k} · ${p.n}`,{bold:true,size:23,color:V})]}),new Paragraph({keepNext:true,spacing:{after:30},children:[t(`${p.p} + IVA, y ${p.m} + IVA`,{bold:true,size:22})]}),P(`${p.ideal} Listo en ${p.t}.`)]),
 H('Qué recomendamos'),
 P('Empieza por el paquete A. En una semana tendrás tu catálogo en el móvil y recibirás pedidos por WhatsApp. Cuando veas que compran, sumas el botón de pago (B) o pasas a tienda completa (C). El proveedor (D) conviene añadirlo cuando ya tengas ventas y hayas comprobado su margen.'),
 H('Qué incluye cada paquete'),tabla,
 H('Cuánto tardamos'),P('Contamos desde el día en que recibimos toda la información y el primer pago.'),plazosT,
 ...notas.map(n=>P(n,{spacing:{after:40}})),
 H('Información que necesitamos de ti'),
 ...info.flatMap(i=>[new Paragraph({keepNext:true,spacing:{before:120,after:40},children:[t(i[0],{bold:true,color:V})]}),...i[1].map(B)]),
 H('Cómo funciona'),
 ...pasos.map((s,i)=>P([t(`${i+1}. ${s[0]}. `,{bold:true}),t(s[1])])),
 H('Costes de terceros'),P('Los paga el negocio directamente. Son orientativos y se confirman antes de empezar.'),
 ...terceros.map(x=>B(`${x[0]}: ${x[1]}`)),
 H('Qué no incluye'),...noincl.map(B),
 H('Condiciones'),...cond.map(B),
 new Paragraph({spacing:{before:300,after:40},children:[t('Viviana Acero',{bold:true,size:26})]}),
 P('AI Lead Machine · Webs para negocios. Te la hago yo, sin que sepas nada de webs.'),
 P([t('Escribe ',{}),t('WEB',{bold:true,color:'1F9D55'}),t(' por WhatsApp: +34 672 953 197',{})])];
const doc=new Document({creator:'AI Lead Machine',title:'Propuesta de web para tu negocio',styles:{default:{document:{run:{font:F,size:21}}}},
 numbering:{config:[{reference:'b',levels:[{level:0,format:LevelFormat.BULLET,text:'•',alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:500,hanging:260}},run:{color:V}}}]}]},
 sections:[{properties:{page:{size:{width:11906,height:16838},margin:{top:1134,bottom:1134,left:1134,right:1134}}},
 footers:{default:new Footer({children:[new Paragraph({tabStops:[{type:TabStopType.RIGHT,position:W}],children:[new TextRun({text:'AI Lead Machine · Propuesta de web',font:F,size:16,color:MUT}),new TextRun({text:'\tPágina ',font:F,size:16,color:MUT}),new TextRun({children:[PageNumber.CURRENT],font:F,size:16,color:MUT})]})]})},children:kids}]});
Packer.toBuffer(doc).then(b=>{fs.writeFileSync('Oferta-web-textil-hogar.docx',b);console.log('docx ok',b.length)});
