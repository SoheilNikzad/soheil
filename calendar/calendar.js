(() => {
  'use strict';

  /*
   * Public input contract:
   * ./busy.json
   *
   * {
   *   "updated": "2026-09-28T02:00:00Z",
   *   "timezone": "Asia/Tehran",
   *   "busy": [
   *     {"start":"2026-09-28T09:00:00+03:30","end":"2026-09-28T10:30:00+03:30"}
   *   ]
   * }
   *
   * Never put event title, description, guests, location or private metadata
   * in busy.json. This page intentionally consumes start/end only.
   */

  const DATA_URL = './busy.json';
  const START_HOUR = 8;
  const END_HOUR = 22;
  const HOUR_HEIGHT = 52;

  const $ = id => document.getElementById(id);
  const preference = matchMedia('(prefers-color-scheme: dark)');
  let explicitTheme = false;

  try {
    explicitTheme = ['light','dark'].includes(localStorage.getItem('soheil-calendar-theme'));
  } catch {}

  function themeLabel() {
    const dark = document.documentElement.dataset.theme === 'dark';
    $('themeToggle').textContent = dark ? '☀ روز' : '☾ شب';
    $('themeToggle').setAttribute('aria-pressed', String(dark));
    $('themeToggle').setAttribute(
      'aria-label',
      dark ? 'فعال‌کردن حالت روشن' : 'فعال‌کردن حالت تاریک'
    );
  }

  $('themeToggle').addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    explicitTheme = true;
    try { localStorage.setItem('soheil-calendar-theme', next); } catch {}
    themeLabel();
  });

  preference.addEventListener('change', event => {
    if (!explicitTheme) {
      document.documentElement.dataset.theme = event.matches ? 'dark' : 'light';
      themeLabel();
    }
  });

  themeLabel();

  const faDay = new Intl.DateTimeFormat('fa-IR', {weekday:'short'});
  const faDate = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {month:'short',day:'numeric'});
  const faRange = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
    year:'numeric',month:'long',day:'numeric'
  });

  let anchor = startOfWeek(new Date());
  let payload = {busy:[]};

  function startOfDay(d) {
    const x = new Date(d);
    x.setHours(0,0,0,0);
    return x;
  }

  // Week starts Saturday, matching common Iranian calendar layout.
  function startOfWeek(d) {
    const x = startOfDay(d);
    const delta = (x.getDay() + 1) % 7;
    x.setDate(x.getDate() - delta);
    return x;
  }

  function addDays(d,n) {
    const x = new Date(d);
    x.setDate(x.getDate() + n);
    return x;
  }

  function sameDay(a,b) {
    return a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();
  }

  function minutesFromDayStart(d) {
    return d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60;
  }

  function safeBusy(raw) {
    if (!raw || typeof raw !== 'object' || !Array.isArray(raw.busy)) return [];
    return raw.busy
      .map(item => ({
        start: new Date(item && item.start),
        end: new Date(item && item.end)
      }))
      .filter(item =>
        Number.isFinite(item.start.getTime()) &&
        Number.isFinite(item.end.getTime()) &&
        item.end > item.start
      );
  }

  function setStatus(text='',error=false) {
    $('status').textContent = text;
    $('status').classList.toggle('error',error);
  }

  function make(tag,className,text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text != null) el.textContent = text;
    return el;
  }

  function render() {
    const grid = $('calendarGrid');
    grid.replaceChildren();

    const now = new Date();
    const weekEnd = addDays(anchor,6);
    $('weekRange').textContent = `${faRange.format(anchor)} — ${faRange.format(weekEnd)}`;

    const corner = make('div','corner');
    grid.append(corner);

    for (let i=0;i<7;i++) {
      const day = addDays(anchor,i);
      const head = make('div','day-head');
      if (sameDay(day,now)) head.classList.add('today-head');
      head.style.gridColumn = String(i + 2);
      head.append(
        make('b','',faDay.format(day)),
        make('span','',faDate.format(day))
      );
      grid.append(head);
    }

    const axis = make('div','time-axis');
    for (let hour=START_HOUR;hour<=END_HOUR;hour++) {
      const label = make('div','time-label',`${String(hour).padStart(2,'0')}:00`);
      label.style.top = `${(hour - START_HOUR) * HOUR_HEIGHT}px`;
      axis.append(label);
    }
    grid.append(axis);

    const busy = safeBusy(payload);
    const visibleStart = START_HOUR * 60;
    const visibleEnd = END_HOUR * 60;

    for (let i=0;i<7;i++) {
      const day = addDays(anchor,i);
      const nextDay = addDays(day,1);
      const column = make('div','day-column');
      column.style.gridColumn = String(i + 2);
      if (sameDay(day,now)) column.classList.add('today-column');

      for (const event of busy) {
        if (event.end <= day || event.start >= nextDay) continue;

        const clippedStart = event.start < day ? day : event.start;
        const clippedEnd = event.end > nextDay ? nextDay : event.end;

        const startMin = Math.max(visibleStart, minutesFromDayStart(clippedStart));
        const endMin = Math.min(visibleEnd, minutesFromDayStart(clippedEnd));

        if (endMin <= startMin) continue;

        const block = make('div','busy');
        block.setAttribute('aria-label','مشغول');
        block.style.top = `${((startMin - visibleStart) / 60) * HOUR_HEIGHT}px`;
        block.style.height = `${((endMin - startMin) / 60) * HOUR_HEIGHT}px`;
        column.append(block);
      }

      if (sameDay(day,now)) {
        const minute = minutesFromDayStart(now);
        if (minute >= visibleStart && minute <= visibleEnd) {
          const line = make('div','now-line');
          line.style.top = `${((minute - visibleStart) / 60) * HOUR_HEIGHT}px`;
          column.append(line);
        }
      }

      grid.append(column);
    }
  }

  async function load() {
    setStatus('در حال دریافت تقویم…');
    try {
      const response = await fetch(`${DATA_URL}?v=${Date.now()}`, {cache:'no-store'});
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      payload = {busy:safeBusy(data)};

      let status = '';
      if (data.updated) {
        const updated = new Date(data.updated);
        if (Number.isFinite(updated.getTime())) {
          status = `آخرین به‌روزرسانی: ${new Intl.DateTimeFormat('fa-IR',{
            dateStyle:'short',timeStyle:'short'
          }).format(updated)}`;
        }
      }
      setStatus(status);
    } catch (error) {
      payload = {busy:[]};
      setStatus('دادهٔ تقویم هنوز آماده نشده است.',true);
    }
    render();
  }

  $('prevWeek').addEventListener('click', () => {
    anchor = addDays(anchor,-7);
    render();
  });

  $('nextWeek').addEventListener('click', () => {
    anchor = addDays(anchor,7);
    render();
  });

  $('today').addEventListener('click', () => {
    anchor = startOfWeek(new Date());
    render();
  });

  render();
  load();
  setInterval(render,60_000);
})();
