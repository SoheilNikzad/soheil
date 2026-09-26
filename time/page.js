(() => {
  'use strict';
  const el = id => document.getElementById(id);
  const cal = TimeCalendars;
  const preference = matchMedia('(prefers-color-scheme: dark)');
  let explicitTheme = false;
  try { explicitTheme = ['light','dark'].includes(localStorage.getItem('soheil-time-theme')); } catch {}
  function themeLabel() {
    const dark = document.documentElement.dataset.theme === 'dark';
    el('themeToggle').textContent = dark ? '☀ روز' : '☾ شب';
    el('themeToggle').setAttribute('aria-pressed', String(dark));
    el('themeToggle').setAttribute('aria-label', dark ? 'فعال‌کردن حالت روشن' : 'فعال‌کردن حالت تاریک');
  }
  el('themeToggle').addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    explicitTheme = true;
    try { localStorage.setItem('soheil-time-theme', next); } catch {}
    themeLabel();
  });
  preference.addEventListener('change', event => {
    if (!explicitTheme) {
      document.documentElement.dataset.theme = event.matches ? 'dark' : 'light';
      themeLabel();
    }
  });
  themeLabel();

  const ns = 'http://www.w3.org/2000/svg';
  for (let i = 0; i < 12; i++) {
    const tick = document.createElementNS(ns, 'line');
    for (const [key, value] of Object.entries({x1:100, y1:15, x2:100, y2:i % 3 === 0 ? 24 : 20, transform:`rotate(${i * 30} 100 100)`, class:'clock-tick'})) tick.setAttribute(key, value);
    el('clockTicks').appendChild(tick);
  }
  const faWeek = new Intl.DateTimeFormat('fa', {weekday:'long', timeZone:'UTC'});
  const enWeek = new Intl.DateTimeFormat('en', {weekday:'long', timeZone:'UTC'});
  const timeFormat = new Intl.DateTimeFormat('en-GB', {hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
  let lastDay;
  function tick() {
    const now = new Date();
    const h = now.getHours(), m = now.getMinutes(), s = now.getSeconds();
    el('hourHand').setAttribute('transform', `rotate(${(h % 12) * 30 + m / 2 + s / 120} 100 100)`);
    el('minuteHand').setAttribute('transform', `rotate(${m * 6 + s / 10} 100 100)`);
    el('secondHand').setAttribute('transform', `rotate(${s * 6} 100 100)`);
    const time = timeFormat.format(now);
    el('deviceTime').textContent = time;
    el('analogClock').setAttribute('aria-label', 'ساعت دستگاه ' + time);
    el('deviceZone').textContent = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const day = cal.localDay(now);
    if (lastDay !== day) {
      lastDay = day;
      try {
        el('todayFa').textContent = `${faWeek.format(day)} — ${cal.text(day,'persian','fa')} — ${cal.text(day,'islamic-civil','fa')}`;
        el('todayEn').textContent = `${enWeek.format(day)} — ${cal.text(day,'persian','en')} — ${cal.text(day,'islamic-civil','en')}`;
      } catch {
        el('todayFa').textContent = 'این مرورگر از تقویم‌های لازم پشتیبانی نمی‌کند.';
        el('todayEn').textContent = 'Calendar support is unavailable in this browser.';
      }
    }
  }
  tick();
  setInterval(tick, 1000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });

  const names = {gregory:'میلادی',persian:'هجری شمسی','islamic-civil':'قمری حسابی'};
  const months = {
    gregory:['ژانویه','فوریه','مارس','آوریل','مه','ژوئن','ژوئیه','اوت','سپتامبر','اکتبر','نوامبر','دسامبر'],
    persian:['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'],
    'islamic-civil':['محرم','صفر','ربیع‌الاول','ربیع‌الثانی','جمادی‌الاول','جمادی‌الثانی','رجب','شعبان','رمضان','شوال','ذی‌القعده','ذی‌الحجه']
  };
  let selectedDay = cal.localDay();
  function fillDate(ms) {
    const source = el('sourceCalendar').value;
    const p = cal.parts(ms, source);
    el('calendarMonth').replaceChildren(...months[source].map((name, i) => {
      const option = document.createElement('option');
      option.value = i + 1; option.textContent = `${i + 1} · ${name}`; return option;
    }));
    el('calendarYear').value = p.year;
    el('calendarMonth').value = p.month;
    el('calendarDay').value = p.day;
  }
  function convert() {
    el('calendarResults').replaceChildren();
    try {
      const source = el('sourceCalendar').value;
      const ms = cal.toUTC(source, cal.parseNumber(el('calendarYear').value), Number(el('calendarMonth').value), cal.parseNumber(el('calendarDay').value));
      selectedDay = ms;
      el('calendarError').textContent = '';
      for (const calendar of cal.calendars.filter(x => x !== source)) {
        const card = document.createElement('div'); card.className = 'result';
        const title = document.createElement('h3'); title.textContent = names[calendar];
        const fa = document.createElement('p'); fa.textContent = cal.text(ms,calendar,'fa');
        const en = document.createElement('p'); en.lang = 'en'; en.dir = 'ltr'; en.textContent = cal.text(ms,calendar,'en');
        card.append(title,fa,en); el('calendarResults').appendChild(card);
      }
    } catch (error) {
      el('calendarError').textContent = error instanceof RangeError ? 'تاریخ معتبر نیست یا خارج از بازهٔ پشتیبانی است.' : 'مرورگر از این تقویم پشتیبانی نمی‌کند.';
    }
  }
  el('sourceCalendar').addEventListener('change', () => { try { fillDate(selectedDay); convert(); } catch { el('calendarError').textContent = 'مرورگر از این تقویم پشتیبانی نمی‌کند.'; } });
  for (const id of ['calendarYear','calendarMonth','calendarDay']) el(id).addEventListener('input', convert);
  el('calendarToday').addEventListener('click', () => { selectedDay = cal.localDay(); fillDate(selectedDay); convert(); });
  try { fillDate(selectedDay); convert(); } catch { el('calendarError').textContent = 'مرورگر از این تقویم پشتیبانی نمی‌کند.'; }
})();
