/* Life 1.2 — pure calendar/time logic; no networking or tracking. */
export const STORAGE_KEY = 'life-counter.profile.v1'; // Keep earlier users' local profiles.
export const UI_KEY = 'life-counter.ui.v1';
export const MS_HOUR = 3_600_000;
export const MS_DAY = 86_400_000;
const persianFormatter = new Intl.DateTimeFormat('en-US-u-ca-persian-nu-latn', {
  year:'numeric',month:'numeric',day:'numeric',timeZone:'UTC'
});
const zoneFormatterCache = new Map();

export function persianParts(timestamp) {
  const parts=persianFormatter.formatToParts(new Date(timestamp));
  const field=type=>Number(parts.find(part=>part.type===type)?.value);
  return {year:field('year'),month:field('month'),day:field('day')};
}
function compareDate(a,b){return(a.year-b.year)||(a.month-b.month)||(a.day-b.day);}
export function jalaliToGregorian(year,month,day){
  if(![year,month,day].every(Number.isInteger)||year<1200||year>1600||month<1||month>12||day<1||day>31)
    throw new Error('Invalid Persian date.');
  let low=Math.floor(Date.UTC(year+621,2,15)/MS_DAY);
  let high=Math.floor(Date.UTC(year+622,2,27)/MS_DAY);
  const target={year,month,day};
  while(low<=high){
    const mid=Math.floor((low+high)/2), comparison=compareDate(persianParts(mid*MS_DAY),target);
    if(comparison===0){const d=new Date(mid*MS_DAY);return {year:d.getUTCFullYear(),month:d.getUTCMonth()+1,day:d.getUTCDate()};}
    if(comparison<0)low=mid+1;else high=mid-1;
  }
  throw new Error('Invalid Persian date.');
}
export function validateGregorian(year,month,day){
  if(![year,month,day].every(Number.isInteger)||year<1600||year>2200||month<1||month>12||day<1||day>31)throw new Error('Invalid Gregorian date.');
  const d=new Date(Date.UTC(year,month-1,day));
  if(d.getUTCFullYear()!==year||d.getUTCMonth()+1!==month||d.getUTCDate()!==day)throw new Error('Invalid Gregorian date.');
  return {year,month,day};
}
export function gregorianToJalali(year,month,day){
  validateGregorian(year,month,day);
  return persianParts(Date.UTC(year,month-1,day,12));
}
export function convertCalendarDate({year,month,day},from,to){
  if(from===to)return {year,month,day};
  if(from==='jalali'&&to==='gregorian')return jalaliToGregorian(year,month,day);
  if(from==='gregorian'&&to==='jalali')return gregorianToJalali(year,month,day);
  throw new Error('Invalid calendar.');
}
function getZoneFormatter(timeZone){
  if(!zoneFormatterCache.has(timeZone))zoneFormatterCache.set(timeZone,new Intl.DateTimeFormat('en-US-u-ca-gregory-nu-latn',{
    timeZone,hourCycle:'h23',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'
  }));
  return zoneFormatterCache.get(timeZone);
}
export function zonedParts(timestamp,timeZone){
  const parts=getZoneFormatter(timeZone).formatToParts(new Date(timestamp));
  const n=name=>Number(parts.find(part=>part.type===name)?.value);
  return {year:n('year'),month:n('month'),day:n('day'),hour:n('hour'),minute:n('minute'),second:n('second')};
}
function civilMinutes(p){return Date.UTC(p.year,p.month-1,p.day,p.hour,p.minute)/60000;}
export function wallTimeToInstant(civil,timeZone){
  const naive=Date.UTC(civil.year,civil.month-1,civil.day,civil.hour,civil.minute);
  if(!Number.isFinite(naive))throw new Error('Invalid time.');
  const matches=[];
  for(let offset=-14*60;offset<=14*60;offset+=15){
    const instant=naive-offset*60000,p=zonedParts(instant,timeZone);
    if(civilMinutes(p)===civilMinutes(civil))matches.push(instant);
  }
  if(!matches.length)throw new Error('This local time is invalid in the chosen time zone.');
  return Math.min(...matches); // Earlier occurrence at an ambiguous daylight-saving transition.
}
export function daysInPersianMonth(year,month){
  if(month<1||month>12)throw new Error('Invalid Persian month.');
  if(month<=6)return 31;
  if(month<=11)return 30;
  try{jalaliToGregorian(year,12,30);return 30;}catch{return 29;}
}
function daysInGregorianMonth(year,month){return new Date(Date.UTC(year,month,0)).getUTCDate();}
export function validateProfile(value,now=Date.now()){
  if(!value||typeof value!=='object')throw new Error('Incomplete birth details.');
  const name=String(value.name??'').trim().slice(0,50);
  if(!name)throw new Error('A name is required.');
  const calendar=value.calendar==='gregorian'?'gregorian':'jalali'; // old saved records were Persian
  const year=Number(value.year),month=Number(value.month),day=Number(value.day);
  const hour=Number(value.hour),minute=Number(value.minute),timeZone=String(value.timeZone??'Asia/Tehran');
  if(![year,month,day,hour,minute].every(Number.isInteger)||hour<0||hour>23||minute<0||minute>59)throw new Error('Invalid birth date or time.');
  try{new Intl.DateTimeFormat('en',{timeZone});}catch{throw new Error('Invalid time zone.');}
  const g=calendar==='gregorian'?validateGregorian(year,month,day):jalaliToGregorian(year,month,day);
  const j=calendar==='jalali'?{year,month,day}:gregorianToJalali(year,month,day);
  const birthMs=wallTimeToInstant({...g,hour,minute},timeZone);
  if(birthMs>now)throw new Error('Birth cannot be in the future.');
  return {version:2,name,year,month,day,persian:j,gregorian:g,hour,minute,timeZone,calendar,birthMs};
}
function anniversaryPassed(current,month,day,hour,minute){
  if(current.month!==month)return current.month>month;
  if(current.day!==day)return current.day>day;
  if(current.hour!==hour)return current.hour>hour;
  return current.minute>=minute;
}
export function calculateLife(profile,nowMs=Date.now()){
  if(!Number.isFinite(nowMs)||nowMs<profile.birthMs)throw new Error('Current time is before birth.');
  const elapsed=nowMs-profile.birthMs,inZone=zonedParts(nowMs,profile.timeZone);
  const current=profile.calendar==='gregorian'?inZone:persianParts(Date.UTC(inZone.year,inZone.month-1,inZone.day,12));
  const birth=profile.calendar==='gregorian'?profile.gregorian:profile.persian;
  const daysInMonth=profile.calendar==='gregorian'?daysInGregorianMonth:daysInPersianMonth;
  const birthdayDay=Math.min(birth.day,daysInMonth(current.year,birth.month));
  let completedYears=current.year-birth.year;
  if(!anniversaryPassed({...current,hour:inZone.hour,minute:inZone.minute},birth.month,birthdayDay,profile.hour,profile.minute))completedYears--;
  const monthDay=Math.min(birth.day,daysInMonth(current.year,current.month));
  let completedMonths=(current.year-birth.year)*12+current.month-birth.month;
  if(current.day<monthDay||(current.day===monthDay&&(inZone.hour<profile.hour||(inZone.hour===profile.hour&&inZone.minute<profile.minute))))completedMonths--;
  const completedHours=Math.floor(elapsed/MS_HOUR),completedDays=Math.floor(elapsed/MS_DAY),completedWeeks=Math.floor(elapsed/(7*MS_DAY));
  return {year:completedYears+1,month:completedMonths+1,week:completedWeeks+1,day:completedDays+1,hour:completedHours+1,
    completedYears,completedMonths,completedWeeks,completedDays,completedHours,secondsIntoHour:Math.floor((elapsed%MS_HOUR)/1000),nowParts:inZone};
}
