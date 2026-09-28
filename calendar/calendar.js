(() => {
"use strict";
const TZ="Asia/Tehran", DAY_MS=86400000;
const grid=document.getElementById("grid"),scale=document.getElementById("scale"),
      vp=document.getElementById("viewport"),daysEl=document.getElementById("days"),
      status=document.getElementById("status");
let busy=[],topHour=8,wheelLock=false,dragStart=null,dragBase=8;

const dayName=new Intl.DateTimeFormat("fa-IR",{timeZone:TZ,weekday:"long"});

function parts(date){
  return Object.fromEntries(new Intl.DateTimeFormat("en-CA",{
    timeZone:TZ,year:"numeric",month:"2-digit",day:"2-digit"
  }).formatToParts(date).filter(x=>x.type!=="literal").map(x=>[x.type,Number(x.value)]));
}
function localDate(date=new Date()){
  const p=parts(date);
  return new Date(`${p.year}-${String(p.month).padStart(2,"0")}-${String(p.day).padStart(2,"0")}T12:00:00+03:30`);
}
function saturdayOf(date=new Date()){
  const d=localDate(date), back=(d.getUTCDay()-6+7)%7;
  return new Date(d.getTime()-back*DAY_MS);
}
function dayAt(base,n){return new Date(base.getTime()+n*DAY_MS)}
function hourAt(day,h){
  const p=parts(day);
  return new Date(`${p.year}-${String(p.month).padStart(2,"0")}-${String(p.day).padStart(2,"0")}T${String(h).padStart(2,"0")}:00:00+03:30`);
}
function overlaps(start,end){return busy.some(b=>b.start<end&&b.end>start)}
function baseState(dayIndex,h){
  if(dayIndex===6) return "navy";                         // Friday
  if(dayIndex===5) return (h>=8&&h<12)?"yellow":"navy"; // Thursday
  if(h<6) return "navy";
  if(h<8||h>=18) return "yellow";
  return "blue";
}
function state(day,dayIndex,h){
  const start=hourAt(day,h),end=new Date(start.getTime()+3600000);
  if(overlaps(start,end)) return "red";
  return baseState(dayIndex,h);
}
function metrics(){
  const s=getComputedStyle(document.documentElement);
  return {cell:parseFloat(s.getPropertyValue("--cell")),gap:parseFloat(s.getPropertyValue("--gap"))};
}
function renderScale(){
  const {cell,gap}=metrics(),step=cell+gap;
  scale.replaceChildren();
  for(let i=0;i<=7;i++){
    const t=document.createElement("div");
    t.className="tick"; t.textContent=String(topHour+i).padStart(2,"0");
    t.style.top=`${i*step-(i===7?gap:0)}px`; scale.appendChild(t);
  }
}
function render(){
  const base=saturdayOf(), {cell,gap}=metrics(), step=cell+gap;
  grid.replaceChildren(); daysEl.replaceChildren();

  // Visual columns are left→right: Friday ... Saturday, preserving RTL week order on screen.
  for(let visual=0;visual<7;visual++){
    const dayIndex=6-visual, day=dayAt(base,dayIndex);
    const label=document.createElement("div");
    label.className="day"; label.textContent=dayName.format(day); daysEl.appendChild(label);
  }
  for(let h=0;h<24;h++) for(let visual=0;visual<7;visual++){
    const dayIndex=6-visual,day=dayAt(base,dayIndex);
    const c=document.createElement("div");
    c.className=`cell ${state(day,dayIndex,h)}`;
    c.setAttribute("aria-label",`${dayName.format(day)}، ${String(h).padStart(2,"0")} تا ${String(h+1).padStart(2,"0")}`);
    grid.appendChild(c);
  }
  grid.style.transform=`translateY(${-topHour*step}px)`;
  renderScale();
}
function stepBy(delta){
  const next=Math.max(0,Math.min(17,topHour+delta));
  if(next===topHour)return;
  topHour=next; render();
  if(navigator.vibrate) navigator.vibrate(8);
}
vp.addEventListener("wheel",e=>{
  e.preventDefault(); if(wheelLock)return;
  wheelLock=true; stepBy(e.deltaY>0?1:-1); setTimeout(()=>wheelLock=false,120);
},{passive:false});
vp.addEventListener("pointerdown",e=>{dragStart=e.clientY;dragBase=topHour;vp.setPointerCapture(e.pointerId)});
vp.addEventListener("pointermove",e=>{
  if(dragStart===null)return;
  const {cell,gap}=metrics(),n=Math.round((dragStart-e.clientY)/(cell+gap));
  topHour=Math.max(0,Math.min(17,dragBase+n));render();
});
vp.addEventListener("pointerup",()=>{dragStart=null;if(navigator.vibrate)navigator.vibrate(8)});
vp.addEventListener("pointercancel",()=>dragStart=null);
window.addEventListener("resize",render);

async function loadBusy(){
  try{
    const r=await fetch(`./busy.json?t=${Date.now()}`,{cache:"no-store"});
    if(!r.ok)throw new Error(`HTTP ${r.status}`);
    const data=await r.json();
    if(!data||!Array.isArray(data.busy))throw new Error("invalid busy.json");
    busy=data.busy.map(x=>({start:new Date(x.start),end:new Date(x.end)}))
      .filter(x=>Number.isFinite(x.start.getTime())&&Number.isFinite(x.end.getTime())&&x.end>x.start);
    status.textContent=""; status.classList.remove("error");
  }catch(e){
    busy=[];status.textContent="دادهٔ تقویم در دسترس نیست.";status.classList.add("error");
  }
  render();
}
render(); loadBusy();
})();