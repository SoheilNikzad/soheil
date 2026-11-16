import {points,nearby,inside,nearestVertex,patternMarkup,tileFromId} from './geometry.js';
import {setupExport} from './export.js';
const $=id=>document.getElementById(id),NS='http://www.w3.org/2000/svg';
const fa=x=>Number(x).toLocaleString('fa-IR');
const labels={3:'مثلث',4:'مربع',6:'شش‌ضلعی',8:'هشت‌ضلعی',12:'دوازده‌ضلعی'};
const meta=[
 ['4.8.8','مربع و هشت‌ضلعی','یک مربع و دو هشت‌ضلعی، بدون فاصله، یک دور کامل را می‌پوشانند.'],
 ['3.3.3.4.4','ردیف‌های مثلث و مربع','سه مثلث و دو مربع؛ دو مربع در کنار هم قرار گرفته‌اند.'],
 ['3.3.4.3.4','مربع‌های چرخیده','سه مثلث و دو مربع؛ ترتیب متفاوت، شبکه‌ای متفاوت می‌سازد.'],
 ['3.6.3.6','مثلث و شش‌ضلعی','مثلث و شش‌ضلعی، به‌تناوب، دور این رأس قرار می‌گیرند.'],
 ['3.3.3.3.6','شش‌ضلعی در دریای مثلث','چهار مثلث و یک شش‌ضلعی؛ این شبکه دو صورت آینه‌ای دارد.'],
 ['3.4.6.4','مثلث، مربع، شش‌ضلعی','یک مثلث، دو مربع و یک شش‌ضلعی؛ ترتیبشان را دور نقطه دنبال کن.'],
 ['3.12.12','مثلث و دوازده‌ضلعی','یک مثلث و دو دوازده‌ضلعی، دقیقاً ۳۶۰ درجه را می‌پوشانند.'],
 ['4.6.12','سه شکل، یک قاعده','یک مربع، یک شش‌ضلعی و یک دوازده‌ضلعی در هر رأس به هم می‌رسند.']
];
const palettes=[
 {name:'مانی‌لب',swatches:['#000000','#1155cc','#cc0000','#ffb600'],colors:['#ffb600','#1155cc','#cc0000','#cc0000','#000000'],bg:'#ffffff',line:'#000000'},
 {name:'خاک و زیتون',colors:['#d5af6a','#a7b496','#526d60','#d4b899','#809b93'],bg:'#ece6d9',line:'#576350'},
 {name:'کاشی آبی',colors:['#e5bd65','#429899','#4c75aa','#a5c7c2','#5b8b80'],bg:'#f3ecd9',line:'#3d6669'},
 {name:'انار و خاک',colors:['#dcae87','#ac594a','#e9c9a5','#c18560','#754d54'],bg:'#f2e7db',line:'#765248'},
 {name:'مرکب',colors:['#f4f0e7','#e3dfd5','#b2b9af','#cbd0c5','#8d9b93'],bg:'#f7f3eb',line:'#404d47'}
];
const fresh=()=>({version:2,pattern:0,palette:0,size:100,rotation:0,stroke:1.2,colors:{},paint:{},pan:[0,0]});
let state=fresh(),legacyPaint=null;
try{const hash=location.hash.slice(1),raw=hash||localStorage.getItem('arjhang-v2')||localStorage.getItem('arjhang-v1');if(raw){const old=JSON.parse(decodeURIComponent(raw));if(old.version!==2){legacyPaint=old.paint;old.paint={};old.palette=old.palette===0&&!hash?0:(Number(old.palette)||0)+1;old.version=2;}Object.assign(state,old);}}catch{}
state.pattern=Number.isInteger(state.pattern)&&state.pattern>=0&&state.pattern<8?state.pattern:0;
state.palette=Number.isInteger(state.palette)&&state.palette>=0&&state.palette<palettes.length?state.palette:0;
state.size=Math.max(20,Math.min(400,Number(state.size)||100));state.rotation=Math.max(0,Math.min(180,Number(state.rotation)||0));state.stroke=Math.max(0,Math.min(3,Number(state.stroke)||0));
for(const k of ['colors','paint'])if(!state[k]||typeof state[k]!=='object')state[k]={};
let data=[],selected=null,mode='explore',pan=Array.isArray(state.pan)&&state.pan.length===2?state.pan.map(n=>Math.max(-2.5,Math.min(2.5,Number(n)||0))):[0,0],toastTimer;
const validColor=c=>/^#[0-9a-f]{6}$/i.test(c||'');
const sequence=()=>meta[state.pattern][0].split('.').map(Number);
const color=n=>validColor(state.colors[n])?state.colors[n]:palettes[state.palette].colors[[3,4,6,8,12].indexOf(n)];
const paintKey=id=>`${state.pattern}|${id}`;
function save(){state.pan=pan;try{localStorage.setItem('arjhang-v2',encodeURIComponent(JSON.stringify(state)))}catch{}}
function toast(t){$('toast').textContent=t;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),3400);}
function regular(n,r=10){return Array.from({length:n},(_,i)=>[12+r*Math.cos(-Math.PI/2+i*2*Math.PI/n),12+r*Math.sin(-Math.PI/2+i*2*Math.PI/n)]);}
function gallery(){
 $('patterns').innerHTML=data.map((d,i)=>`<button class="pattern ${i===state.pattern?'active':''}" data-pattern="${i}" aria-pressed="${i===state.pattern}" aria-label="${meta[i][1]}، ${meta[i][0]}"><svg viewBox="-3.4 -1.9 6.8 3.8" aria-hidden="true"><defs>${patternMarkup(d,'thumb-'+i,color,palettes[state.palette].line,.025)}</defs><rect x="-8" y="-8" width="16" height="16" fill="url(#thumb-${i})"/></svg><span>${d.code}</span></button>`).join('');
 $('patterns').querySelectorAll('button').forEach(b=>b.onclick=()=>{state.pattern=Number(b.dataset.pattern);pan=[0,0];build();save();});
}
function controls(){
 $('palettes').innerHTML=palettes.map((p,i)=>`<button class="palette ${i===state.palette?'active':''}" data-palette="${i}" aria-label="${p.name}" aria-pressed="${i===state.palette}" title="${p.name}">${(p.swatches||p.colors.slice(0,4)).map(c=>`<i style="background:${c}"></i>`).join('')}</button>`).join('');
 $('palettes').querySelectorAll('button').forEach(b=>b.onclick=()=>{state.palette=Number(b.dataset.palette);state.colors={};state.paint={};gallery();controls();render();save();});
 $('custom-colors').innerHTML=[...new Set(sequence())].sort((a,b)=>a-b).map(n=>`<label class="color-field"><input type="color" value="${color(n)}" data-n="${n}" aria-label="رنگ ${labels[n]}"><span>${labels[n]}</span></label>`).join('');
 $('custom-colors').querySelectorAll('input').forEach(input=>input.oninput=()=>{state.colors[input.dataset.n]=input.value;render();gallery();save();});
 ['size','rotation','stroke'].forEach(id=>{$(id).value=state[id];});updateOutputs();
}
function updateOutputs(){$('size-out').textContent=fa(state.size)+'٪';$('zoom-label').textContent=fa(state.size)+'٪';$('rotation-out').textContent=fa(state.rotation)+'°';$('stroke-out').textContent=fa(state.stroke);}
function build(){selected=nearestVertex(data[state.pattern],[0,0]);gallery();controls();render();$('canvas').setAttribute('aria-label',`شبکهٔ ${meta[state.pattern][1]}؛ یک رأس را لمس کنید`);document.querySelector('.edition-num').textContent=`${String(state.pattern+1).padStart(2,'0')} / 08`;}
function transform(){const z=state.size/100;$('world').setAttribute('transform',`translate(${pan[0]} ${pan[1]}) rotate(${state.rotation}) scale(${z})`);updateOutputs();}
function render(){
 const pal=palettes[state.palette],d=data[state.pattern];$('bg').setAttribute('fill',pal.bg);
 $('tiles').innerHTML=`<defs>${patternMarkup(d,'grid-pattern',color,pal.line,state.stroke*.018)}</defs><rect x="-10000" y="-10000" width="20000" height="20000" fill="url(#grid-pattern)"/><g id="painted"></g>`;
 const overlays=[];for(const [k,c] of Object.entries(state.paint)){if(!k.startsWith(`${state.pattern}|`)||!validColor(c))continue;const t=tileFromId(d,k.split('|')[1]);if(t)overlays.push(`<polygon data-tile="${t.id}" points="${points(t.polygon)}" fill="${c}" stroke="${pal.line}" stroke-width="${state.stroke*.018}"/>`);}
 $('painted').innerHTML=overlays.join('');transform();inspect();
}
function inspect(){
 const seq=sequence(),s=selected;$('pattern-code').textContent=meta[state.pattern][0];$('pattern-name').textContent=meta[state.pattern][1];$('vertex-description').textContent=meta[state.pattern][2];
 $('vertex-chips').innerHTML=seq.map((n,i)=>`${i?'<span class="chip-dot">·</span>':''}<span class="vertex-chip"><svg viewBox="0 0 24 24" aria-hidden="true"><polygon points="${points(regular(n))}" fill="${color(n)}" stroke="${palettes[state.palette].line}" stroke-width=".7"/></svg>${n}</span>`).join('');$('equation').textContent=seq.map(n=>(180-360/n)+'°').join(' + ');
 if(mode==='explore'&&s){const r=.21*Math.max(1,60/state.size);$('selection').innerHTML=s.tiles.map(t=>`<polygon points="${points(t.polygon)}" fill="#fff8e4" fill-opacity=".25" stroke="#a44e35" stroke-width=".055"/>`).join('')+`<circle cx="${s.point[0]}" cy="${s.point[1]}" r="${r}" fill="#fff8e4" fill-opacity=".8" stroke="#a44e35" stroke-width=".025"/><circle cx="${s.point[0]}" cy="${s.point[1]}" r="${r*.31}" fill="#a44e35"/>`;}else $('selection').innerHTML='';
}
function setMode(m){mode=m;$('explore').classList.toggle('active',m==='explore');$('paint').classList.toggle('active',m==='paint');$('explore').setAttribute('aria-pressed',m==='explore');$('paint').setAttribute('aria-pressed',m==='paint');$('canvas-note').textContent=m==='explore'?'یک رأس را لمس کن؛ قاعده‌اش را ببین.':'یک قطعه را لمس کن تا رنگش عوض شود.';inspect();}
function svgPoint(e){return new DOMPoint(e.clientX,e.clientY).matrixTransform($('canvas').getScreenCTM().inverse());}
function worldPoint(e){return new DOMPoint(e.clientX,e.clientY).matrixTransform($('world').getScreenCTM().inverse());}
const pointers=new Map();let gesture=null;
$('canvas').addEventListener('pointerdown',e=>{if(!data.length)return;pointers.set(e.pointerId,[e.clientX,e.clientY]);$('canvas').setPointerCapture(e.pointerId);if(pointers.size===1)gesture={x:e.clientX,y:e.clientY,p:svgPoint(e),pan:[...pan],moved:false};else{const a=[...pointers.values()];gesture={pinch:true,d:Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]),size:state.size,moved:true};}});
$('canvas').addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId)||!gesture)return;pointers.set(e.pointerId,[e.clientX,e.clientY]);if(gesture.pinch){if(pointers.size<2||!gesture.d)return;const a=[...pointers.values()],d=Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]);state.size=Math.round(Math.max(20,Math.min(400,gesture.size*d/gesture.d)));$('size').value=state.size;transform();}else if(Math.hypot(e.clientX-gesture.x,e.clientY-gesture.y)>5){gesture.moved=true;const p=svgPoint(e);pan=[Math.max(-2.5,Math.min(2.5,gesture.pan[0]+p.x-gesture.p.x)),Math.max(-2.5,Math.min(2.5,gesture.pan[1]+p.y-gesture.p.y))];transform();}});
$('canvas').addEventListener('pointerup',e=>{if(!gesture)return;const wasMoved=gesture.moved;pointers.delete(e.pointerId);if(!wasMoved){const p=worldPoint(e),pos=[p.x,p.y];if(mode==='explore'){selected=nearestVertex(data[state.pattern],pos);inspect();}else{const t=nearby(data[state.pattern],pos).find(t=>inside(pos,t.polygon));if(t){const colors=palettes[state.palette].swatches||palettes[state.palette].colors,current=state.paint[paintKey(t.id)]||color(t.polygon.length);state.paint[paintKey(t.id)]=colors[(colors.indexOf(current)+1)%colors.length];render();save();}}}if(pointers.size===0){gesture=null;save();}else gesture={pinch:true,moved:true};});
$('canvas').addEventListener('pointercancel',()=>{pointers.clear();gesture=null;});
['size','rotation','stroke'].forEach(id=>$(id).oninput=()=>{state[id]=Number($(id).value);if(id==='stroke')render();else{transform();inspect();}save();});
$('explore').onclick=()=>setMode('explore');$('paint').onclick=()=>setMode('paint');$('center').onclick=()=>{pan=[0,0];transform();save();};
$('next-vertex').onclick=()=>{const p=selected?.point||[0,0];selected=nearestVertex(data[state.pattern],[p[0]+1,p[1]+.3]);const r=state.rotation*Math.PI/180,z=state.size/100,pt=selected.point;if(Math.abs((pt[0]*Math.cos(r)-pt[1]*Math.sin(r))*z)>3||Math.abs((pt[0]*Math.sin(r)+pt[1]*Math.cos(r))*z)>4)selected=nearestVertex(data[state.pattern],[0,0]);setMode('explore');};
function zoom(d){state.size=Math.max(20,Math.min(400,state.size+d));$('size').value=state.size;transform();inspect();save();}
$('zoom-in').onclick=()=>zoom(10);$('zoom-out').onclick=()=>zoom(-10);
$('reset').onclick=()=>{const pattern=state.pattern;state={...fresh(),pattern};pan=[0,0];build();save();toast('تنظیمات نقش بازنشانی شد.');};
function exportSvg(w,h){
 const copy=$('canvas').cloneNode(true);copy.querySelector('#selection').remove();copy.setAttribute('xmlns',NS);copy.setAttribute('width',w);copy.setAttribute('height',h);copy.removeAttribute('id');copy.removeAttribute('role');copy.removeAttribute('aria-label');copy.querySelectorAll('[data-tile]').forEach(e=>e.removeAttribute('data-tile'));
 const ratio=w/h,view=ratio>18/14?[-9,-9/ratio,18,18/ratio]:[-7*ratio,-7,14*ratio,14];copy.setAttribute('viewBox',view.join(' '));copy.setAttribute('preserveAspectRatio','xMidYMid meet');const title=document.createElementNS(NS,'title');title.textContent='Arjhang — '+meta[state.pattern][0];copy.prepend(title);return new XMLSerializer().serializeToString(copy);
}
setupExport({svg:exportSvg,code:()=>meta[state.pattern][0],ready:()=>data.length>0,toast});
$('share').onclick=async()=>{save();const url=location.origin+location.pathname+'#'+encodeURIComponent(JSON.stringify(state));try{await navigator.clipboard.writeText(url);toast('لینک کپی شد؛ با باز کردنش همین طرح و رنگ‌ها برمی‌گردد.');}catch{window.prompt('این لینک، همین طرح و رنگ‌ها را دوباره باز می‌کند:',url);}};
window.addEventListener('hashchange',()=>location.reload());
try{
 const res=await fetch('./periodic.json');if(!res.ok)throw Error('data');data=await res.json();
 if(legacyPaint&&Object.keys(legacyPaint).length){try{const old=await(await fetch('./tilings.json')).json();for(const [k,c]of Object.entries(legacyPaint)){const [pi,ti]=k.split(':').map(Number),p=old[pi]?.polygons?.[ti];if(!p||!validColor(c))continue;const pos=[0,1].map(j=>p.reduce((s,v)=>s+v[j],0)/p.length),t=nearby(data[pi],pos).find(t=>inside(pos,t.polygon));if(t)state.paint[`${pi}|${t.id}`]=c;}}catch{}}
 build();save();$('loading').remove();
}catch(e){$('loading').textContent='دریافت الگوها انجام نشد. صفحه را دوباره باز کن.';console.error(e);}
