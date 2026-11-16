export function setupExport({svg,code,ready,toast}){
 const $=id=>document.getElementById(id),fa=n=>Number(n).toLocaleString('fa-IR'),dialog=$('export-dialog');
 let aspect=18/14,generation=0,current=null,objectUrl=null;
 const clamp=n=>Math.max(256,Math.min(4096,Math.round(Number(n)||256)));
 const invalid=()=>{generation++;$('generate-file').disabled=false;dialog.removeAttribute('aria-busy');$('export-actions').hidden=true;$('export-status').textContent='برای اعمال تنظیمات جدید، «آماده‌کردن فایل» را بزن.';};
 function ratioChanged(which){if(!$('export-lock').checked){invalid();return;}let w=clamp($('export-width').value),h=clamp($('export-height').value);if(which==='w'){h=clamp(w/aspect);w=clamp(h*aspect);}else{w=clamp(h*aspect);h=clamp(w/aspect);}$('export-width').value=w;$('export-height').value=h;invalid();}
 function preset(long){if(aspect>=1){$('export-width').value=long;$('export-height').value=clamp(long/aspect);}else{$('export-height').value=long;$('export-width').value=clamp(long*aspect);}invalid();}
 function showFormat(){const fmt=$('export-format').value;$('jpeg-settings').hidden=fmt!=='jpeg';$('format-help').textContent=fmt==='svg'?'SVG برداری است؛ با بزرگ‌نمایی افت کیفیت ندارد. ابعاد، اندازهٔ اولیهٔ نمایش را تعیین می‌کنند.':'ابعاد تصویر را از ۲۵۶ تا ۴۰۹۶ پیکسل تنظیم کن.';}
 function readDataUrl(blob){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(Error('read'));r.readAsDataURL(blob);});}
 async function raster(source,w,h,mime,quality){
  const src=URL.createObjectURL(new Blob([source],{type:'image/svg+xml'}));
  try{const img=new Image();await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=src;});const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d');if(!ctx)throw Error('canvas');ctx.fillStyle='#ffffff';ctx.fillRect(0,0,w,h);ctx.drawImage(img,0,0,w,h);const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('empty')),mime,quality));canvas.width=canvas.height=1;return blob;}finally{URL.revokeObjectURL(src);}
 }
 async function generate(){
  if(!$('export-form').reportValidity())return;
  const revision=++generation,fmt=$('export-format').value,w=clamp($('export-width').value),h=clamp($('export-height').value);
  $('generate-file').disabled=true;$('export-actions').hidden=true;$('export-status').textContent='در حال آماده‌کردن فایل…';dialog.setAttribute('aria-busy','true');
  try{
   const source=svg(w,h),mime=fmt==='svg'?'image/svg+xml':fmt==='jpeg'?'image/jpeg':'image/png';
   const blob=fmt==='svg'?new Blob([source],{type:mime}):await raster(source,w,h,mime,Number($('jpeg-quality').value)/100);
   const preview=await readDataUrl(blob);if(revision!==generation)return;
   if(objectUrl){const old=objectUrl;setTimeout(()=>URL.revokeObjectURL(old),60000);}
   objectUrl=URL.createObjectURL(blob);const filename=`arjhang-${code()}-${w}x${h}.${fmt==='jpeg'?'jpg':fmt}`;
   current={blob,file:new File([blob],filename,{type:mime}),filename};
   $('export-image').src=preview;$('export-image').alt=`پیش‌نمایش ${fmt.toUpperCase()}، ${fa(w)} در ${fa(h)} پیکسل`;
   $('download-file').href=objectUrl;$('download-file').download=filename;$('download-file').textContent=`دانلود ${fmt.toUpperCase()}`;
   $('open-file').href=objectUrl;
   const size=blob.size>=1048576?`${fa(Math.round(blob.size/104857.6)/10)} مگابایت`:`${fa(Math.ceil(blob.size/1024))} کیلوبایت`;
   $('export-status').textContent=`آماده است · ${fa(w)} × ${fa(h)} پیکسل · ${size}`;
   let canShare=false;try{canShare=!!navigator.share&&!!navigator.canShare?.({files:[current.file]});}catch{}
   $('share-file').hidden=!canShare;$('export-actions').hidden=false;
  }catch(e){if(revision===generation){$('export-status').textContent='ساخت فایل انجام نشد. ابعاد کوچک‌تری انتخاب کن و دوباره تلاش کن.';console.error('Export failed',e);}}
  finally{if(revision===generation){$('generate-file').disabled=false;dialog.removeAttribute('aria-busy');}}
 }
 $('export').onclick=()=>{if(!ready())return;const bounds=$('stage').getBoundingClientRect();aspect=bounds.width/bounds.height;$('export-lock').checked=true;preset(2048);showFormat();dialog.showModal();generate();};
 $('close-export').onclick=()=>dialog.close();dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});
 $('export-form').onsubmit=e=>{e.preventDefault();generate();};
 $('export-format').onchange=()=>{showFormat();generate();};
 $('export-width').onchange=()=>ratioChanged('w');$('export-height').onchange=()=>ratioChanged('h');
 $('export-width').oninput=invalid;$('export-height').oninput=invalid;
 $('export-lock').onchange=()=>{aspect=clamp($('export-width').value)/clamp($('export-height').value);};
 $('jpeg-quality').oninput=()=>{$('jpeg-quality-out').textContent=fa($('jpeg-quality').value)+'٪';invalid();};
 document.querySelectorAll('[data-pixels]').forEach(b=>b.onclick=()=>{preset(Number(b.dataset.pixels));generate();});
 $('download-file').onclick=()=>{toast('درخواست دانلود ارسال شد؛ اگر فایل باز نشد، «باز کردن فایل» را بزن.');};
 $('share-file').onclick=async()=>{if(!current)return;try{await navigator.share({files:[current.file],title:'Arjhang'});}catch(e){if(e.name!=='AbortError'){$('export-status').textContent='اشتراک‌گذاری در این نمایشگر در دسترس نیست؛ «دانلود» یا «باز کردن فایل» را امتحان کن.';}}};
}
