(() => {

const COLORS=["#020260","#48B7FF","#CC0000","#FFB600"];
const EPOCH=Date.UTC(2026,0,1,0,0,0);
const MAX_SPEC=Date.UTC(3001,0,1,0,0,0)-1000;
const LAYOUT=[
 [3,11,17,21,1,null,"f"],
 [6,null,null,null,null,null,null],
 [7,null,"f","f","f",null,2],
 [8,null,null,"f",null,null,18],
 [9,null,null,"f",null,null,19],
 [10,null,null,null,null,null,20],
 [4,12,13,14,15,16,5]
];
function pad(n){return String(n).padStart(2,"0")}
function offText(m){let s=m<0?"−":"+";m=Math.abs(m);return s+pad(Math.floor(m/60))+":"+pad(m%60)}
function sysOff(){let m=-new Date().getTimezoneOffset();return Math.max(-720,Math.min(840,Math.round(m/15)*15))}
function localText(ms,off){let d=new Date(ms+off*60000);return d.getUTCFullYear()+"/"+pad(d.getUTCMonth()+1)+"/"+pad(d.getUTCDate())+" "+pad(d.getUTCHours())+":"+pad(d.getUTCMinutes())+":"+pad(d.getUTCSeconds())}
function localInput(ms,off){return localText(ms,off).replaceAll("/","-").replace(" ","T")}
function parseLocal(s,off){if(!s||!s.includes("T"))return NaN;let [a,b]=s.split("T"),d=a.split("-").map(Number),t=b.split(":").map(Number);return Date.UTC(d[0],d[1]-1,d[2],t[0]||0,t[1]||0,t[2]||0)-off*60000}
function digitsFromCode(code){let a=Array(21).fill(0);for(let i=20;i>=0;i--){a[i]=code%4;code=Math.floor(code/4)}return a}
function codeFromDigits(a){let n=0;for(let d of a)n=n*4+d;return n}
function encodeMs(ms,off){let sec=Math.floor((ms-EPOCH)/1000);if(sec<0||ms>MAX_SPEC)return null;let oc=(off+720)/15;if(!Number.isInteger(oc)||oc<0||oc>104)return null;let code=sec*105+oc;return {ms,off,sec,code,digits:digitsFromCode(code)}}
function decodeDigits(a){let code=codeFromDigits(a),oc=code%105,sec=Math.floor(code/105),off=oc*15-720,ms=EPOCH+sec*1000;return {ms,off,sec,code,valid:ms>=EPOCH&&ms<=MAX_SPEC}}

let root=document.getElementById("m");
function draw(a){root.innerHTML="";for(let row of LAYOUT)for(let x of row){let q=document.createElement("div");q.className="c";if(x==="f")q.className+=" f";else if(typeof x==="number")q.style.background=COLORS[a[x-1]];root.appendChild(q)}}
function tick(){let o=encodeMs(Date.now(),sysOff());if(o)draw(o.digits)}tick();setInterval(tick,1000);

})();
