import {STORAGE_KEY,UI_KEY,validateProfile,calculateLife,convertCalendarDate} from './core.mjs';
const $=id=>document.getElementById(id);
const normalize=input=>String(input).replace(/[۰-۹]/g,c=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(c))).replace(/[٠-٩]/g,c=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(c))).trim();
const localeNames={en:'English',fa:'فارسی',ar:'العربية',fr:'Français',es:'Español',de:'Deutsch',pt:'Português',ru:'Русский',tr:'Türkçe',zh:'中文'};
const intlLocales={en:'en-US',fa:'fa-IR',ar:'ar',fr:'fr-FR',es:'es-ES',de:'de-DE',pt:'pt-BR',ru:'ru-RU',tr:'tr-TR',zh:'zh-CN'};
let translations={},lang='en',theme='dark',calendar='gregorian',profile=null,timer=null;
const t=key=>translations[lang]?.[key]??translations.en?.[key]??key;
const n=value=>new Intl.NumberFormat(intlLocales[lang],{useGrouping:true}).format(value);
const two=value=>String(value).padStart(2,'0');
function setFeedback(id,key){$(id).textContent=key?t(key):'';}
function showError(id,error){
 const msg=String(error?.message||error).toLowerCase();
 let key='invalidDate';
 if(msg.includes('name'))key='invalidName';else if(msg.includes('time zone'))key='invalidZone';else if(msg.includes('future'))key='futureBirth';else if(msg.includes('storage'))key='storageError';
 $(id).textContent=t(key);$(id).classList.remove('hidden');
}
function localeDate(p){
 const d=new Date(Date.UTC(p.gregorian.year,p.gregorian.month-1,p.gregorian.day,12));
 return new Intl.DateTimeFormat(intlLocales[lang],{calendar:p.calendar==='jalali'?'persian':'gregory',timeZone:'UTC',weekday:'long',year:'numeric',month:'long',day:'numeric'}).format(d);
}
function birthLabel(p){return `${localeDate(p)} · ${n(p.hour).padStart(2,lang==='fa'?'۰':'0')}:${n(p.minute).padStart(2,lang==='fa'?'۰':'0')}`;}
function refreshSummary(){
 if(!profile)return;
 $('profileSummary').textContent=`${profile.name} · ${birthLabel(profile)} · ${profile.timeZone}`;
 $('displayName').textContent=profile.name;
 $('birthLine').textContent=birthLabel(profile);
}
function applyLanguage(value){
 if(!translations[value])value='en';lang=value;
 document.documentElement.lang=value;document.documentElement.dir=(value==='fa'||value==='ar')?'rtl':'ltr';
 for(const el of document.querySelectorAll('[data-i18n]'))el.textContent=t(el.dataset.i18n);
 for(const el of document.querySelectorAll('[data-i18n-aria]'))el.setAttribute('aria-label',t(el.dataset.i18nAria));
 document.title=`${t('dashboardTitle')} | Life`;
 for(const selector of ['welcomeLanguage','settingsLanguage'])$(selector).value=value;
 $('year').placeholder=calendar==='jalali'?'1361':'1983';
 $('month').placeholder=calendar==='jalali'?'12':'03';
 $('day').placeholder=calendar==='jalali'?'17':'08';
 $('hourProgressTrack').setAttribute('aria-label',t('hourProgress'));
 refreshSummary();if(profile&&!$('dashboard').classList.contains('hidden'))tick();
 saveUI();
}
function applyTheme(value){
 theme=value==='light'?'light':'dark';document.documentElement.dataset.theme=theme;
 document.querySelector('meta[name=theme-color]').content=theme==='dark'?'#000000':'#FFFFFF';
 for(const btn of document.querySelectorAll('[data-theme-option]'))btn.setAttribute('aria-pressed',String(btn.dataset.themeOption===theme));
 saveUI();
}
function saveUI(){try{localStorage.setItem(UI_KEY,JSON.stringify({lang,theme}));}catch{/* UI preferences are optional. */}}
function stop(){if(timer!==null){clearInterval(timer);timer=null;}}
function start(){stop();timer=setInterval(tick,1000);}
function show(section){
 for(const id of ['welcome','dashboard','settings'])$(id).classList.toggle('hidden',id!==section);
 $('settingsBtn').classList.toggle('hidden',section!=='dashboard');
 if(section==='dashboard'){refreshSummary();tick();start();}else stop();
 window.scrollTo(0,0);
}
function tick(){
 if(!profile)return;
 try{
  const now=Date.now(),life=calculateLife(profile,now);
  for(const [field,value] of Object.entries({years:life.year,months:life.month,weeks:life.week,days:life.day,hours:life.hour}))$(field).textContent=n(value);
  const seconds=life.secondsIntoHour,mins=Math.floor(seconds/60),secs=seconds%60;
  $('hourProgress').style.width=`${seconds/3600*100}%`;
  $('hourProgressTrack').setAttribute('aria-valuenow',String(seconds));
  $('minutesDetail').textContent=`${two(mins)}:${two(secs)} / 60:00`;
  $('nowClock').textContent=new Intl.DateTimeFormat(intlLocales[lang],{hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).format(now);
 }catch(error){stop();console.error(error);}
}
function setCalendar(value,convert=false){
 if(value!=='jalali'&&value!=='gregorian')return;
 if(convert&&value!==calendar){
  const parts=['year','month','day'].map(id=>Number(normalize($(id).value)));
  if(parts.every(Number.isInteger)&&parts.every(x=>x>0)){
   try{
    const next=convertCalendarDate({year:parts[0],month:parts[1],day:parts[2]},calendar,value);
    for(const key of ['year','month','day'])$(key).value=next[key];
    $('formError').classList.add('hidden');
   }catch(error){for(const key of ['year','month','day'])$(key).value='';showError('formError',error);}
  }
 }
 calendar=value;
 for(const btn of document.querySelectorAll('[data-calendar]'))btn.setAttribute('aria-pressed',String(btn.dataset.calendar===calendar));
 $('year').placeholder=calendar==='jalali'?'1361':'1983';
 $('month').placeholder=calendar==='jalali'?'12':'03';
 $('day').placeholder=calendar==='jalali'?'17':'08';
}
function toggleCustomZone(){$('customZoneField').classList.toggle('hidden',$('timeZone').value!=='other');}
function readForm(){
 const zone=$('timeZone').value;
 const timeZone=zone==='local'?Intl.DateTimeFormat().resolvedOptions().timeZone:zone==='other'?$('customZone').value.trim():zone;
 return validateProfile({calendar,name:$('name').value,year:normalize($('year').value),month:normalize($('month').value),day:normalize($('day').value),hour:normalize($('hour').value),minute:normalize($('minute').value),timeZone});
}
function fillForm(p){
 setCalendar(p.calendar);
 for(const key of ['name','year','month','day'])$(key).value=p[key];
 $('hour').value=two(p.hour);$('minute').value=two(p.minute);
 const select=$('timeZone');
 select.value=[...select.options].some(o=>o.value===p.timeZone)?p.timeZone:'other';
  $('customZone').value=select.value==='other'?p.timeZone:'';toggleCustomZone();
}
function saveProfile(next){
 localStorage.setItem(STORAGE_KEY,JSON.stringify(next));profile=next;
}
// The message contains only birth input, never the changing counters. LIFE/1 and v1 JSON remain importable.
function birthRecord(p){return `LIFE/2 | ${p.year}/${two(p.month)}/${two(p.day)} | ${two(p.hour)}:${two(p.minute)} | ${p.timeZone} | ${p.name} | ${p.calendar}`;}
function parseRecord(source){
 const sourceText=String(source).trim();
 if(sourceText.startsWith('{')){
  const old=JSON.parse(sourceText);
  if(old.type!=='life-counter-backup'||old.version!==1)throw new Error('Bad record');
  return validateProfile(old.profile);
 }
 const chunks=sourceText.split('|').map(x=>x.trim()),v=chunks[0];
 if(!['LIFE/1','LIFE/2'].includes(v))throw new Error('Bad record');
 if(v==='LIFE/2'&&chunks.length<6||v==='LIFE/1'&&chunks.length<5)throw new Error('Bad record');
 const date=normalize(chunks[1]).match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
 const time=normalize(chunks[2]).match(/^(\d{1,2}):(\d{1,2})$/);
 if(!date||!time||!chunks[3])throw new Error('Bad record');
 const calendar=v==='LIFE/2'?chunks.at(-1):'jalali';
 if(!['gregorian','jalali'].includes(calendar))throw new Error('Bad record');
 const name=(v==='LIFE/2'?chunks.slice(4,-1):chunks.slice(4)).join('|').trim();
 if(!name)throw new Error('Bad record');
 return validateProfile({calendar,name,year:date[1],month:date[2],day:date[3],hour:time[1],minute:time[2],timeZone:chunks[3]});
}
function restore(text,messageId){
 try{
  const next=parseRecord(text);
  if(profile&&!confirm(t('replaceConfirm')))return;
  saveProfile(next);
  $('restoreText').value='';$('settingsRestoreText').value='';
  setFeedback(messageId,'restoreSuccess');show('dashboard');
 }catch(error){$(messageId).textContent=t('restoreError');}
}
function initControls(){
 for(const [code,name] of Object.entries(localeNames)){
  for(const id of ['welcomeLanguage','settingsLanguage']){
   const option=document.createElement('option');option.value=code;option.textContent=name;$(id).appendChild(option);
  }
 }
 for(const id of ['welcomeLanguage','settingsLanguage'])$(id).addEventListener('change',event=>applyLanguage(event.target.value));
 for(const btn of document.querySelectorAll('[data-theme-option]'))btn.addEventListener('click',()=>applyTheme(btn.dataset.themeOption));
 for(const btn of document.querySelectorAll('[data-calendar]'))btn.addEventListener('click',()=>setCalendar(btn.dataset.calendar,true));
 $('timeZone').addEventListener('change',toggleCustomZone);toggleCustomZone();
 $('birthForm').addEventListener('submit',event=>{
  event.preventDefault();$('formError').classList.add('hidden');
  try{const next=readForm();saveProfile(next);show('dashboard');}
  catch(error){showError('formError',error);}
 });
 $('settingsBtn').addEventListener('click',()=>{setFeedback('settingsMessage','');refreshSummary();show('settings');});
 $('backBtn').addEventListener('click',()=>show('dashboard'));
 $('editBtn').addEventListener('click',()=>{fillForm(profile);show('welcome');});
 for(const [toggleId,panelId,field] of [['restoreToggle','restorePanel','restoreText'],['settingsRestoreToggle','settingsRestorePanel','settingsRestoreText']]){
  $(toggleId).addEventListener('click',()=>{
   const expanded=$(toggleId).getAttribute('aria-expanded')==='true';
   $(toggleId).setAttribute('aria-expanded',String(!expanded));$(panelId).classList.toggle('hidden',expanded);
   if(!expanded)$(field).focus();
  });
 }
 $('restoreBtn').addEventListener('click',()=>restore($('restoreText').value,'restoreMessage'));
 $('settingsRestoreBtn').addEventListener('click',()=>restore($('settingsRestoreText').value,'settingsMessage'));
 $('copyBtn').addEventListener('click',async()=>{
  const text=birthRecord(profile);
  try{
   $('copyFallback')?.remove();
   if(!navigator.clipboard?.writeText)throw new Error('Clipboard unavailable');
   await navigator.clipboard.writeText(text);setFeedback('settingsMessage','copyOk');
  }catch{
   // Explicit, selectable text if clipboard permission is unavailable (e.g. file://).
   const box=document.createElement('textarea');box.id='copyFallback';box.readOnly=true;box.value=text;box.dir='auto';
   const previous=$('copyFallback');if(previous)previous.remove();
   $('settingsMessage').after(box);box.focus();box.select();setFeedback('settingsMessage','copySelect');
  }
 });
 $('resetBtn').addEventListener('click',()=>{
  if(!confirm(t('deleteConfirm'))||!confirm(t('deleteFinal')))return;
  try{localStorage.removeItem(STORAGE_KEY);profile=null;$('copyFallback')?.remove();$('birthForm').reset();$('restoreText').value='';toggleCustomZone();show('welcome');}
  catch{$('settingsMessage').textContent=t('deleteError');}
 });
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&profile&&!$('dashboard').classList.contains('hidden'))tick();});
 window.addEventListener('pageshow',()=>{if(profile&&!$('dashboard').classList.contains('hidden'))tick();});
}
async function initialize(){
 try{
  const inline=$('i18nData');
  translations=inline?JSON.parse(inline.textContent):await fetch('./i18n.json').then(r=>{if(!r.ok)throw new Error('Translations unavailable');return r.json();});
 }catch(error){console.error(error);$('welcome').classList.remove('hidden');$('welcomeTitle').textContent='Could not load language data. Reload the page.';return;}
 initControls();
 try{const saved=JSON.parse(localStorage.getItem(UI_KEY)||'{}');applyLanguage(saved.lang||'en');applyTheme(saved.theme||'dark');}
 catch{applyLanguage('en');applyTheme('dark');}
 try{
  const raw=localStorage.getItem(STORAGE_KEY);
  if(raw){profile=validateProfile(JSON.parse(raw));show('dashboard');}else show('welcome');
 }catch{show('welcome');$('formError').textContent=t('savedError');$('formError').classList.remove('hidden');}
 if('serviceWorker'in navigator&&(location.protocol==='https:'||location.hostname==='localhost'))window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(error=>console.warn('Service worker:',error)));
}
initialize();
