const fs=require('fs');
const {Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,WidthType,ShadingType,BorderStyle,AlignmentType,Header,Footer,ImageRun,PageNumber,LevelFormat,TabStopType,VerticalAlign}=require('docx');
const NEUTRO=process.env.ESTILO==='neutro';
const NOCHE=NEUTRO?'1F2937':'0B1426',ORO=NEUTRO?'9CA3AF':'C9A66B',OROV=NEUTRO?'374151':'7A5C22',MARFIL='F7F4ED',GRAF=NEUTRO?'4B5563':'4F596B';
const SERIF=NEUTRO?'Calibri':'Georgia',SANS='Calibri';
const W=9638; // A4 con margenes 1134 (2cm) => 11906-2268
const blank=(n=14)=>'.'.repeat(n);
const r=(t,o={})=>new TextRun({text:t,font:SANS,size:21,color:'1F2937',...o});
// texto con [..] resaltado
function runs(text,base={}){
  const out=[];const re=/(\[\.+\]|☐|\*\*[^*]+\*\*)/g;let last=0,m;
  while((m=re.exec(text))){
    if(m.index>last) out.push(r(text.slice(last,m.index),base));
    const tok=m[0];
    if(tok.startsWith('**')) out.push(r(tok.slice(2,-2),{...base,bold:true}));
    else if(tok==='☐') out.push(r('☐',{...base,font:'Segoe UI Symbol',color:OROV}));
    else out.push(r(tok,{...base,color:OROV}));
    last=m.index+tok.length;
  }
  if(last<text.length) out.push(r(text.slice(last),base));
  return out;
}
const esc=t=>t.replace(/&/g,'&amp;').replace(/</g,'&lt;');
const hx=t=>esc(t).replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>').replace(/\[(\.+)\]/g,(m)=>'<span class="bl">'+m+'</span>').replace(/☐/g,'<span class="cb">☐</span>');
const p=(text,o={})=>(H.push('<p>'+hx(text)+'</p>'),new Paragraph({spacing:{after:110,line:300},alignment:AlignmentType.JUSTIFIED,...o,children:runs(text)}));
const bullet=(text)=>(H.push('<div class="li"><span>–</span><div>'+hx(text)+'</div></div>'),new Paragraph({numbering:{reference:'b',level:0},spacing:{after:70,line:290},children:runs(text)}));
let clause=0;
const h2=(text)=>(H.push('<h2>'+esc(text)+'</h2>'),new Paragraph({keepNext:true,spacing:{before:300,after:100},border:{bottom:{style:BorderStyle.SINGLE,size:6,color:ORO,space:4}},children:[new TextRun({text,font:SERIF,size:28,bold:true,color:NOCHE})]}));
const label=(t)=>(H.push('<div class="lab">'+esc(t)+'</div>'),new Paragraph({spacing:{after:60},children:[new TextRun({text:t.toUpperCase(),font:'Consolas',size:16,color:OROV,characterSpacing:40})]}));
const noB={style:BorderStyle.NONE,size:0,color:'FFFFFF'};const noBorders={top:noB,bottom:noB,left:noB,right:noB};
const thin={style:BorderStyle.SINGLE,size:4,color:'CDD3DF'};
function table(rows,widths,header=true){
  H.push('<table>'+rows.map((row,i)=>'<tr>'+row.map(c=>(header&&i===0?'<th>':'<td>')+hx(c)+(header&&i===0?'</th>':'</td>')).join('')+'</tr>').join('')+'</table>');
  return new Table({width:{size:W,type:WidthType.DXA},columnWidths:widths,rows:rows.map((row,i)=>new TableRow({tableHeader:header&&i===0,cantSplit:true,children:row.map((c,j)=>new TableCell({width:{size:widths[j],type:WidthType.DXA},verticalAlign:VerticalAlign.CENTER,margins:{top:90,bottom:90,left:130,right:130},
    shading:header&&i===0?{type:ShadingType.CLEAR,fill:NOCHE,color:'auto'}:(i%2===0?{type:ShadingType.CLEAR,fill:NEUTRO?'F3F4F6':'F4F1E8',color:'auto'}:undefined),
    borders:{top:thin,bottom:thin,left:thin,right:thin},
    children:[new Paragraph({children:header&&i===0?[new TextRun({text:c,font:SANS,size:19,bold:true,color:NEUTRO?'FFFFFF':ORO})]:runs(c,{size:20})})]}))}))});
}
const logo=fs.readFileSync('logo.png');const H=[];
const header=NEUTRO?new Header({children:[new Paragraph({spacing:{after:0},border:{bottom:{style:BorderStyle.SINGLE,size:6,color:'9CA3AF',space:4}},tabStops:[{type:TabStopType.RIGHT,position:W}],children:[new TextRun({text:'Viviana Andrea Acero Pulido  ·  Martínez-Matilla Abogados',font:SANS,size:16,color:'4B5563'}),new TextRun({text:'\tCONTRATO DE PRESTACIÓN DE SERVICIOS',font:SANS,size:15,color:'4B5563',characterSpacing:30})]})]}):new Header({children:[new Table({width:{size:W,type:WidthType.DXA},columnWidths:[5200,4438],rows:[new TableRow({children:[
 new TableCell({width:{size:5200,type:WidthType.DXA},borders:noBorders,shading:{type:ShadingType.CLEAR,fill:NOCHE,color:'auto'},margins:{top:110,bottom:110,left:200,right:100},verticalAlign:VerticalAlign.CENTER,
   children:[new Paragraph({children:[new ImageRun({type:'png',data:logo,transformation:{width:190,height:Math.round(190*(logoH()/logoW())) },altText:{title:'AI Lead Machine',description:'Logotipo',name:'logo'}})]})]}),
 new TableCell({width:{size:4438,type:WidthType.DXA},borders:noBorders,shading:{type:ShadingType.CLEAR,fill:NOCHE,color:'auto'},margins:{top:110,bottom:110,left:100,right:200},verticalAlign:VerticalAlign.CENTER,
   children:[new Paragraph({alignment:AlignmentType.RIGHT,children:[new TextRun({text:'CONTRATO DE PRESTACIÓN DE SERVICIOS',font:'Consolas',size:15,color:ORO,characterSpacing:30})]})]})]})]}),
 new Paragraph({spacing:{after:0},border:{top:{style:BorderStyle.SINGLE,size:18,color:ORO,space:0}},children:[]})]});
function pngSize(buf){return {w:buf.readUInt32BE(16),h:buf.readUInt32BE(20)}}
function logoW(){return pngSize(logo).w}function logoH(){return pngSize(logo).h}
const footer=new Footer({children:[new Paragraph({border:{top:{style:BorderStyle.SINGLE,size:4,color:ORO,space:6}},tabStops:[{type:TabStopType.RIGHT,position:W}],children:[
 new TextRun({text:NEUTRO?'Contrato de prestación de servicios':'AI Lead Machine · Viviana Andrea Acero Pulido  |  Martínez-Matilla Abogados',font:SANS,size:16,color:GRAF}),
 new TextRun({text:'\tPágina ',font:SANS,size:16,color:GRAF}),new TextRun({children:[PageNumber.CURRENT],font:SANS,size:16,color:GRAF}),new TextRun({text:' de ',font:SANS,size:16,color:GRAF}),new TextRun({children:[PageNumber.TOTAL_PAGES],font:SANS,size:16,color:GRAF})]})]});
const B=blank;
const kids=[];
H.push('<div class="lab">DOCUMENTO · MODELO</div><h1>Contrato de prestación de servicios</h1><div class="note">Modelo orientativo. Rellena los espacios en blanco y marca las casillas ☐ que apliquen. Antes de firmar, que lo revise un abogado: contiene cláusulas de protección de datos y de responsabilidad que dependen de cada caso.</div>');
// Titulo
kids.push(new Paragraph({spacing:{before:200,after:40},children:[new TextRun({text:'DOCUMENTO · MODELO',font:'Consolas',size:16,color:OROV,characterSpacing:40})]}));
kids.push(new Paragraph({spacing:{after:120},children:[new TextRun({text:'Contrato de prestación de servicios',font:SERIF,size:50,bold:true,color:NOCHE})]}));
kids.push(new Paragraph({spacing:{after:200},shading:{type:ShadingType.CLEAR,fill:NEUTRO?'F3F4F6':'F4F1E8',color:'auto'},border:{left:{style:BorderStyle.SINGLE,size:24,color:ORO,space:8}},children:[new TextRun({text:'Modelo orientativo. Rellena los espacios en blanco y marca las casillas ☐ que apliquen. Antes de firmar, que lo revise un abogado: contiene cláusulas de protección de datos y de responsabilidad que dependen de cada caso.',font:SANS,size:19,italics:true,color:GRAF})]}));
const T=(s)=>kids.push(h2(s));
T('Reunidos');
kids.push(p(`En [${B()}], a [${B(4)}] de [${B()}] de [${B(6)}].`));
kids.push(p(`**De una parte, la PRESTADORA:** Viviana Andrea Acero Pulido, con NIF/NIE [${B()}], domicilio en [${B(26)}], que actúa con la marca comercial AI Lead Machine (en adelante, la «Prestadora»).`));
kids.push(p(`**De otra parte, el CLIENTE:** Martínez-Matilla Abogados, forma jurídica [${B()}], con NIF [${B()}], domicilio en [${B(26)}], representado por [${B(26)}], en calidad de [${B()}] (en adelante, el «Cliente»).`));
kids.push(p('Ambas partes se reconocen capacidad legal suficiente y acuerdan este contrato.'));
T('1. Objeto');
kids.push(p('La Prestadora presta al Cliente los servicios descritos en la cláusula 2: la mejora de su web actual (martinezmatilla.com) y la puesta en marcha de un asistente virtual de atención y reserva de primeras consultas, con el mantenimiento acordado.'));
T('2. Servicios incluidos');
kids.push(label('A. Mejora de la web (sobre la web actual del Cliente)'));
['☐ Versión que conserva su estilo actual.','☐ Versión mejorada (mismos colores y logo, con mejor jerarquía y legibilidad).','Reorganización de la página de inicio, claridad del mensaje principal, versión móvil y doble vía de contacto (formulario, WhatsApp y asistente).',`Número de rondas de revisión incluidas: [${B(4)}].`].forEach(t=>kids.push(bullet(t)));
kids.push(label('B. Asistente virtual'));
['Atención en la web las 24 horas, con preguntas guiadas y texto libre.','Recogida de los datos necesarios para la primera consulta: nombre, teléfono, tipo de caso, resumen, plazos y día preferido.','Marcado de casos con plazo urgente según las reglas acordadas con el Cliente.','Reserva de la primera consulta en el Google Calendar del Cliente, con la disponibilidad real.','Aviso por correo electrónico al Cliente y panel con los casos recibidos, estados y notas.','Opción de hablar con una persona.',`Formación de [${B(4)}] minutos y revisión de las primeras conversaciones durante [${B(4)}] semanas.`].forEach(t=>kids.push(bullet(t)));
kids.push(label('C. Ficha de Google (opcional)'));
kids.push(bullet(`☐ Optimización inicial de la ficha de Google Business Profile del Cliente (una sola vez), con revisión mensual de [${B(4)}] minutos.`));
kids.push(label('D. Mantenimiento'));
kids.push(bullet(`Alojamiento y funcionamiento del asistente, y hasta [${B(4)}] horas al mes de pequeños cambios.`));
T('3. Lo que no incluye este contrato');
['El asistente **no presta asesoramiento jurídico**, no valora la viabilidad de ningún caso, no estima cantidades a recuperar ni informa de honorarios. Solo recoge datos para que un abogado del Cliente atienda la primera consulta.','WhatsApp automatizado, Instagram, llamadas de voz, recordatorios automáticos y seguimiento automático, salvo acuerdo posterior por escrito.','Garantía de posicionamiento en buscadores, de número de llamadas o de clientes.','Redacción de contenidos jurídicos ni de nuevas páginas de servicios, gestión de anuncios, ni cambios de identidad (logo o paleta nuevos).','Integración con programas de gestión de expedientes o CRM.'].forEach(t=>kids.push(bullet(t)));
kids.push(p('Cualquier servicio adicional se presupuesta por separado y por escrito.'));
T('4. Plazos de ejecución');
[`Inicio: [${B()}] (una vez firmado el contrato y recibidos los accesos).`,`Publicación de la web mejorada y del asistente: antes del [${B()}].`,`Si el Cliente tarda más de [${B(4)}] días en entregar accesos, contenidos o revisiones, los plazos se amplían en el mismo tiempo.`].forEach(t=>kids.push(bullet(t)));
T('5. Precio y forma de pago');
kids.push(p('Importes sin IVA. El IVA aplicable (21 %, salvo que corresponda otro tipo) se añade en factura.'));
kids.push(table([['Concepto','Importe'],['Alta (pago único)',`[${B(10)}] €`],['Cuota mensual (asistente, alojamiento y mantenimiento)',`[${B(10)}] € / mes`],['Servicios adicionales aceptados por escrito',`[${B(10)}] €`]],[6638,3000]));
kids.push(new Paragraph({spacing:{after:80},children:[]}));
[`Alta: [${B(4)}] % a la firma y [${B(4)}] % a la publicación.`,`Cuota mensual: por adelantado, el día [${B(4)}] de cada mes, mediante [${B()}] (transferencia / domiciliación).`,`Facturas pagaderas a [${B(4)}] días. Si una factura lleva impagada más de [${B(4)}] días, la Prestadora podrá suspender el asistente tras avisar por escrito con [${B(4)}] días de antelación.`,`☐ El precio de alta pactado es un precio especial condicionado a la cláusula 13 (caso de éxito). Si el Cliente no la cumple, la Prestadora podrá facturar la diferencia hasta [${B(10)}] €.`].forEach(t=>kids.push(bullet(t)));
T('6. Duración y terminación');
[`Duración inicial: [${B(4)}] meses desde [${B()}].`,`Se prorroga automáticamente por periodos de [${B(4)}] meses, salvo aviso por escrito con [${B(4)}] días de antelación.`,`Cualquiera de las partes puede resolver el contrato por incumplimiento grave de la otra, avisando por escrito y concediendo [${B(4)}] días para subsanarlo.`,`Al terminar: el asistente se desactiva; la web mejorada y los contenidos del Cliente quedan en poder del Cliente; la Prestadora entrega una copia de los casos recogidos en formato CSV en un plazo de [${B(4)}] días y después los suprime, salvo obligación legal de conservarlos.`].forEach(t=>kids.push(bullet(t)));
T('7. Obligaciones del Cliente');
['Facilitar a tiempo los accesos a la web, un calendario de Google compartido con la cuenta indicada y un correo para los avisos.','Entregar los textos y el material gráfico, y revisar que los contenidos y mensajes de la web y del asistente cumplen las normas de publicidad y deontología de la abogacía aplicables.','Informar a las personas que usan el asistente mediante un aviso de privacidad visible (la Prestadora facilita el texto base, que el Cliente debe revisar).','Comunicar a la Prestadora los cambios de horario, de calendario o de reglas de prioridad.','Atender las consultas recibidas y confirmar las citas.'].forEach(t=>kids.push(bullet(t)));
T('8. Obligaciones de la Prestadora');
['Prestar los servicios con la diligencia profesional debida y según lo acordado.',`Mantener el asistente en funcionamiento y atender las incidencias en un plazo de [${B(4)}] días hábiles.`,'Guardar confidencialidad sobre la información del Cliente y de las personas que consultan.','Avisar al Cliente de cualquier incidencia de seguridad que afecte a sus datos.'].forEach(t=>kids.push(bullet(t)));
T('9. Propiedad intelectual');
['Los textos, imágenes, logotipo y marca del Cliente siguen siendo del Cliente.','El diseño de la web mejorada realizado a medida para el Cliente pasa a ser del Cliente una vez pagada el alta.','El software del asistente, su configuración base y la marca AI Lead Machine son de la Prestadora. El Cliente recibe una licencia de uso no exclusiva e intransferible mientras el contrato esté vigente.','El asistente utiliza servicios de terceros (como OpenAI, Google y el proveedor de alojamiento) sujetos a sus propias condiciones.'].forEach(t=>kids.push(bullet(t)));
T('10. Protección de datos personales');
['Respecto de los datos de las personas que usan el asistente, el Cliente es el **responsable del tratamiento** y la Prestadora es la **encargada del tratamiento**, conforme al artículo 28 del Reglamento (UE) 2016/679 (RGPD) y a la Ley Orgánica 3/2018.','La Prestadora tratará los datos solo para prestar el servicio y siguiendo las instrucciones del Cliente. Las condiciones del encargo están en el **Anexo I**, que forma parte de este contrato.','El Cliente es responsable de informar a las personas usuarias y de contar con una base legal para tratar sus datos.','La Prestadora tratará sus propios datos de contacto y de facturación del Cliente para ejecutar el contrato.'].forEach(t=>kids.push(bullet(t)));
T('11. Secreto profesional y confidencialidad');
['El asistente está diseñado para recoger solo los datos mínimos para la primera consulta. El Cliente decidirá qué preguntas se incluyen y debe evitar pedir datos más allá de lo necesario.',`Ambas partes guardarán confidencialidad sobre la información recibida de la otra durante la vigencia del contrato y [${B(4)}] años después.`,'La Prestadora no podrá usar, ceder ni vender los datos de las personas que consultan, ni utilizarlos para entrenar modelos.'].forEach(t=>kids.push(bullet(t)));
T('12. Uso de inteligencia artificial y responsabilidad');
['El asistente utiliza inteligencia artificial para entender mensajes y recoger datos. Puede cometer errores de interpretación, por lo que el Cliente revisa cada caso antes de actuar.','El Cliente sigue siendo el único responsable del asesoramiento jurídico que presta y de sus decisiones profesionales.',`La responsabilidad de la Prestadora se limita al importe efectivamente pagado por el Cliente en los [${B(4)}] meses anteriores al hecho, salvo dolo o negligencia grave.`,'La Prestadora no responde de interrupciones ajenas a su control (por ejemplo, caídas de Google, OpenAI o del proveedor de alojamiento).'].forEach(t=>kids.push(bullet(t)));
T('13. Caso de éxito (opcional)');
kids.push(p(`☐ El Cliente autoriza a la Prestadora a mencionar su nombre y logotipo y, en su caso, un testimonio aprobado por escrito por el Cliente, como referencia comercial durante [${B(4)}] años. El Cliente puede retirar esta autorización con aviso por escrito.`));
T('14. Comunicaciones');
kids.push(p(`Las comunicaciones se harán por escrito a los correos [${B(26)}] (Prestadora) y [${B(26)}] (Cliente).`));
T('15. Ley aplicable y jurisdicción');
kids.push(p(`Este contrato se rige por la ley española. Para cualquier controversia, las partes se someten a los juzgados y tribunales de [${B()}], salvo que la ley imponga otro fuero.`));
T('Firmas');
kids.push(p('Y en prueba de conformidad, firman por duplicado, en el lugar y fecha indicados al inicio.'));
H.push('<div class="sigs"><div><div class="lab">POR LA PRESTADORA</div><div class="sl"><b>Viviana Andrea Acero Pulido</b></div><div>Prestadora · AI Lead Machine</div><div class="bl">Fecha: [..............]</div></div><div><div class="lab">POR EL CLIENTE</div><div class="sl"><b>Martínez-Matilla Abogados</b></div><div>Representante: <span class="bl">[....................]</span></div><div class="bl">Fecha: [..............]</div></div></div>');
const sig=(t,name,extra)=>new TableCell({width:{size:4819,type:WidthType.DXA},borders:{top:noB,left:noB,right:noB,bottom:noB},margins:{top:80,bottom:80,left:100,right:200},children:[
 new Paragraph({spacing:{after:480},children:[new TextRun({text:t.toUpperCase(),font:'Consolas',size:16,color:OROV,characterSpacing:40})]}),
 new Paragraph({border:{top:{style:BorderStyle.SINGLE,size:6,color:NOCHE,space:4}},spacing:{after:40},children:[new TextRun({text:name,font:SERIF,size:23,bold:true,color:NOCHE})]}),
 new Paragraph({spacing:{after:40},children:[r(extra,{size:19,color:GRAF})]}),
 new Paragraph({children:[r(`Fecha: [${B()}]`,{size:19,color:OROV})]})]});
kids.push(new Table({width:{size:W,type:WidthType.DXA},columnWidths:[4819,4819],rows:[new TableRow({cantSplit:true,children:[sig('Por la Prestadora','Viviana Andrea Acero Pulido','Prestadora · AI Lead Machine'),sig('Por el Cliente','Martínez-Matilla Abogados',`Representante: [${B(20)}]`)]})]}));
// Anexo
H.push('<div class="pb"></div><div class="lab">ANEXO I</div><h1 style="font-size:20pt">Encargo de tratamiento de datos (art. 28 RGPD)</h1>');
kids.push(new Paragraph({pageBreakBefore:true,children:[]}));
kids.push(new Paragraph({spacing:{after:40},children:[new TextRun({text:'ANEXO I',font:'Consolas',size:16,color:OROV,characterSpacing:40})]}));
kids.push(new Paragraph({spacing:{after:120},children:[new TextRun({text:'Encargo de tratamiento de datos (art. 28 RGPD)',font:SERIF,size:36,bold:true,color:NOCHE})]}));
const rows=[['Apartado','Contenido'],['Responsable','Martínez-Matilla Abogados'],['Encargada','Viviana Andrea Acero Pulido (AI Lead Machine)'],['Objeto','Alojar y operar el asistente virtual que recoge datos para reservar primeras consultas'],['Duración','La del contrato'],['Finalidad','Atender consultas, preparar y reservar primeras consultas, avisar al Cliente'],['Tipos de datos',`Identificación y contacto, tipo de caso, resumen, plazos, entidad financiera y documentación disponible [${B()}]`],['Interesados','Personas que consultan al despacho'],['Categorías especiales',`[${B()}] (el Cliente decide si se recogen; se recomienda evitarlas)`],['Subencargados',`OpenAI (procesamiento de texto), Google (calendario), proveedor de alojamiento [${B()}], proveedor de correo [${B()}]`],['Transferencias internacionales',`Con las garantías del RGPD (cláusulas contractuales tipo u otras equivalentes): [${B()}]`],['Medidas de seguridad',`Acceso con clave al panel, cifrado en tránsito, copias y acceso limitado: [${B()}]`],['Brechas de seguridad',`Aviso al Cliente sin dilación indebida y como máximo en [${B(4)}] horas`],['Derechos de las personas',`La Prestadora ayuda al Cliente a atender ejercicios de derechos en [${B(4)}] días`],['Fin del encargo',`Devolución de los datos en CSV y supresión en [${B(4)}] días, salvo obligación legal`]];
kids.push(table(rows,[3000,6638]));
const doc=new Document({creator:'AI Lead Machine',title:'Contrato de prestación de servicios · Martínez-Matilla Abogados',
 styles:{default:{document:{run:{font:SANS,size:21}}}},
 numbering:{config:[{reference:'b',levels:[{level:0,format:LevelFormat.BULLET,text:'–',alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:540,hanging:300}},run:{color:ORO,bold:true}}}]}]},
 sections:[{properties:{page:{size:{width:11906,height:16838},margin:{top:1700,bottom:1300,left:1134,right:1134,header:500,footer:500}}},headers:{default:header},footers:{default:footer},children:kids}]});
const css=`@page{size:A4;margin:22mm 20mm 20mm 20mm}*{box-sizing:border-box}body{font:10.5pt/1.55 Inter,Arial,sans-serif;color:#1F2937;margin:0}
h1{font:700 24pt/1.15 Inter,Arial,sans-serif;margin:6px 0 12px;color:#111827}h2{font:700 12.5pt Inter,Arial,sans-serif;margin:20px 0 6px;padding-bottom:4px;border-bottom:1px solid #9CA3AF;color:#111827;break-after:avoid}
p{margin:0 0 7px;text-align:justify}.lab{font:600 7.5pt Inter,Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#4B5563;margin:8px 0 3px;break-after:avoid}
.li{display:flex;gap:8px;margin:0 0 4px;padding-left:6px;text-align:justify}.li>span{color:#6B7280;font-weight:700}
.note{background:#F3F4F6;border-left:4px solid #9CA3AF;padding:8px 12px;font-style:italic;color:#4B5563;font-size:9.5pt;margin:6px 0 4px}
.bl{color:#374151;font-weight:600;white-space:nowrap}.cb{font-family:'Segoe UI Symbol','DejaVu Sans',sans-serif}
table{width:100%;border-collapse:collapse;margin:8px 0 10px;font-size:9.5pt;break-inside:avoid}th{background:#1F2937;color:#fff;text-align:left;padding:6px 9px}td{padding:6px 9px;border:1px solid #D1D5DB}tr:nth-child(even) td{background:#F3F4F6}
.sigs{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:20px;break-inside:avoid}.sl{margin-top:44px;border-top:1px solid #111827;padding-top:4px;font-size:11pt}.sigs div div{margin-bottom:3px}.pb{break-after:page}p:has(+.sigs){break-after:avoid}`;
fs.writeFileSync(NEUTRO?'contrato-neutro.html':'contrato-marca.html','<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Contrato de prestación de servicios · Martínez-Matilla Abogados</title><style>'+css+'</style></head><body>'+H.join('\n')+'</body></html>');
Packer.toBuffer(doc).then(b=>{fs.writeFileSync(NEUTRO?'Contrato-Martinez-Matilla-neutro.docx':'Contrato-Martinez-Matilla-AI-Lead-Machine.docx',b);console.log('ok',b.length)});
