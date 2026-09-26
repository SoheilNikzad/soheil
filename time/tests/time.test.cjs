const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const cal = require('../calendars.js');
const directory = path.join(__dirname, '..');
const core = text => text.slice(text.indexOf('const COLORS='), text.indexOf('\nlet ')).trim();
const original = core(fs.readFileSync(path.join(directory, 'widget.js'), 'utf8'));
const current = core(fs.readFileSync(path.join(directory, 'timestamp.js'), 'utf8'));
const context = vm.createContext({});
vm.runInContext(current, context);

test('Timestamp algorithm, mapping and colors exactly match the approved widget', () => assert.equal(current, original));
test('Original 420 Timestamp round trips at all 105 UTC offsets', () => {
  let count = 0;
  for (const ms of [Date.UTC(2026,0,1),Date.UTC(2026,8,26,12,34,56),Date.UTC(2030,5,15,15,12,3),Date.UTC(3001,0,1)-1000]) {
    for (let off = -720; off <= 840; off += 15) {
      const result = vm.runInContext(`decodeDigits(encodeMs(${ms},${off}).digits)`, context);
      assert.equal(result.ms,ms); assert.equal(result.off,off); assert.equal(result.valid,true); count++;
    }
  }
  assert.equal(count,420);
});
test('Timestamp invalid range and quarter-hour offset rejection', () => {
  for (const [ms,off] of [[Date.UTC(2025,11,31),0],[Date.UTC(3001,0,1),0],[Date.UTC(2030,0,1),1]]) {
    assert.equal(vm.runInContext(`encodeMs(${ms},${off})`,context),null);
  }
});
test('Known Persian Nowruz and leap-year dates, both directions', () => {
  for (const [iso,year,month,day] of [
    ['2021-03-20',1399,12,30],['2021-03-21',1400,1,1],['2024-03-20',1403,1,1],
    ['2025-03-20',1403,12,30],['2025-03-21',1404,1,1],['2026-09-26',1405,7,4]
  ]) {
    const ms = Date.parse(iso+'T00:00:00Z');
    assert.deepEqual(cal.parts(ms,'persian'),{year,month,day});
    assert.equal(cal.toUTC('persian',year,month,day),ms);
  }
});
// Independent civil Hijri oracle: Julian-day formula, civil epoch 1948439.5.
function civilUTC(year,month,day) {
  const jd = day + Math.ceil(29.5*(month-1)) + (year-1)*354 + Math.floor((3+11*year)/30) + 1948439.5 - 1;
  return (jd-2440587.5)*86400000;
}
test('Civil Hijri epoch and a complete 30-year leap cycle: month boundaries', () => {
  assert.equal(cal.toUTC('islamic-civil',1,1,1),Date.UTC(622,6,19));
  for (let year=1440;year<1470;year++) for (let month=1;month<=12;month++) {
    const first = civilUTC(year,month,1);
    const next = month===12 ? civilUTC(year+1,1,1) : civilUTC(year,month+1,1);
    for (const ms of [first,next-86400000]) {
      const day = (ms-first)/86400000+1;
      assert.deepEqual(cal.parts(ms,'islamic-civil'),{year,month,day});
      assert.equal(cal.toUTC('islamic-civil',year,month,day),ms);
    }
    assert.throws(()=>cal.toUTC('islamic-civil',year,month,(next-first)/86400000+1),RangeError);
  }
});
test('Gregorian leap days, all-calendar round trips and supported limits', () => {
  for (const ms of [cal.MIN,cal.MAX,Date.UTC(1900,1,28),Date.UTC(2000,1,29),Date.UTC(2024,1,29),Date.UTC(2100,2,1)]) {
    for (const calendar of cal.calendars) {
      const {year,month,day}=cal.parts(ms,calendar);
      assert.equal(cal.toUTC(calendar,year,month,day),ms);
    }
  }
  for (const args of [['gregory',1900,2,29],['gregory',2100,2,29],['persian',1400,12,30],['persian',1405,7,31],['gregory',3001,1,1],['gregory',2026,0,1],['gregory',2026,1,0],['gregory',NaN,1,1]]) assert.throws(()=>cal.toUTC(...args),RangeError);
});
test('Persian and Arabic input digits; no partial or decimal dates', () => {
  assert.equal(cal.parseNumber('۱۴۰۵'),1405); assert.equal(cal.parseNumber('١٤٤٨'),1448);
  for (const value of ['', '14foo', '1.5','-1','1e3']) assert(Number.isNaN(cal.parseNumber(value)));
});
test('Timezone-local date uses local day rather than UTC day', () => {
  const date = new Date('2026-09-26T23:30:00Z');
  assert.equal(cal.localDay(date),Date.UTC(date.getFullYear(),date.getMonth(),date.getDate()));
});
test('Theme respects system preference, saved override, and unavailable storage', () => {
  const script = fs.readFileSync(path.join(directory,'theme.js'),'utf8');
  for (const [saved,systemDark,want] of [[null,true,'dark'],[null,false,'light'],['light',true,'light'],['dark',false,'dark'],['garbage',true,'dark']]) {
    const sandbox = {document:{documentElement:{dataset:{}}},localStorage:{getItem:()=>saved},matchMedia:()=>({matches:systemDark})};
    vm.runInNewContext(script,sandbox);
    assert.equal(sandbox.document.documentElement.dataset.theme,want);
  }
  const sandbox = {document:{documentElement:{dataset:{}}},localStorage:{getItem:()=>{throw new Error('blocked');}},matchMedia:()=>({matches:true})};
  vm.runInNewContext(script,sandbox);
  assert.equal(sandbox.document.documentElement.dataset.theme,'dark');
});
