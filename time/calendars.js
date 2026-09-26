/* Numeric conversion uses UTC calendar days, independent of device timezone/DST.
 * Hijri is explicitly civil/tabular (30-year cycle), never locale-default "islamic".
 * Intl provides forward conversion; bounded binary search inverts the same calendar
 * so validation and both directions use one consistent definition.
 */
(function (root) {
  'use strict';
  const DAY = 86400000;
  const MIN = Date.UTC(622, 6, 19) / DAY;
  const MAX = Date.UTC(3000, 11, 31) / DAY;
  const calendars = ['gregory', 'persian', 'islamic-civil'];
  const numeric = new Map();
  const textual = new Map();
  function formatter(calendar, locale = 'en', text = false) {
    if (!calendars.includes(calendar)) throw new RangeError('Unknown calendar');
    const cache = text ? textual : numeric;
    const key = calendar + '/' + locale;
    if (!cache.has(key)) {
      const format = new Intl.DateTimeFormat(locale, {
        calendar, timeZone: 'UTC', numberingSystem: locale === 'fa' ? 'arabext' : 'latn',
        year: 'numeric', month: text ? 'long' : 'numeric', day: 'numeric'
      });
      if (format.resolvedOptions().calendar !== calendar) throw new Error('Unsupported calendar');
      cache.set(key, format);
    }
    return cache.get(key);
  }
  function parts(ms, calendar) {
    const p = Object.fromEntries(formatter(calendar).formatToParts(ms).map(x => [x.type, x.value]));
    return {year: Number(p.year), month: Number(p.month), day: Number(p.day)};
  }
  function key(p) { return p.year * 10000 + p.month * 100 + p.day; }
  function toUTC(calendar, year, month, day) {
    if (![year, month, day].every(Number.isInteger) || year < 1 || month < 1 || month > 12 || day < 1 || day > 31) throw new RangeError('Invalid date');
    const target = key({year, month, day});
    let lo = MIN, hi = MAX;
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      const found = key(parts(mid * DAY, calendar));
      if (found === target) return mid * DAY;
      if (found < target) lo = mid + 1;
      else hi = mid - 1;
    }
    throw new RangeError('Invalid or out-of-range date');
  }
  function text(ms, calendar, locale) {
    return formatter(calendar, locale, true).format(ms);
  }
  function localDay(date = new Date()) {
    return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  }
  function parseNumber(value) {
    const digits = value.trim().replace(/[۰-۹]/g, x => String(x.charCodeAt(0) - 1776)).replace(/[٠-٩]/g, x => String(x.charCodeAt(0) - 1632));
    return /^\d+$/.test(digits) ? Number(digits) : NaN;
  }
  const api = {parts, toUTC, text, localDay, parseNumber, calendars, MIN: MIN * DAY, MAX: MAX * DAY};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.TimeCalendars = api;
})(globalThis);
