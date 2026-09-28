(() => {
  "use strict";

  const TZ = "Asia/Tehran";
  const HOUR_MS = 60 * 60 * 1000;
  const DAY_MS = 24 * HOUR_MS;
  const DAY_NAMES_VISUAL = [
    "جمعه",
    "پنجشنبه",
    "چهارشنبه",
    "سه‌شنبه",
    "دوشنبه",
    "یکشنبه",
    "شنبه"
  ];

  // Visual order is left-to-right. Logical day index remains Saturday=0 ... Friday=6.
  const VISUAL_TO_DAY_INDEX = [6, 5, 4, 3, 2, 1, 0];

  const els = {
    headings: document.getElementById("dayHeadings"),
    stack: document.getElementById("hourStack"),
    viewport: document.getElementById("matrixViewport"),
    timeTrack: document.getElementById("timeTrack"),
    weekRange: document.getElementById("weekRange"),
    visibleHours: document.getElementById("visibleHours"),
    status: document.getElementById("dataStatus"),
    older: document.getElementById("olderWeek"),
    newer: document.getElementById("newerWeek"),
    current: document.getElementById("currentWeek")
  };

  const model = {
    busy: [],
    weekOffset: 0,
    topHour: 8,
    updatedAt: null,
    coverageStart: null,
    coverageEnd: null,
    dataReady: false,
    wheelLocked: false,
    pointer: null
  };

  const persianDate = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    timeZone: TZ,
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const persianUpdated = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    timeZone: TZ,
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  function tehranParts(date = new Date()) {
    return Object.fromEntries(
      new Intl.DateTimeFormat("en-CA", {
        timeZone: TZ,
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      })
        .formatToParts(date)
        .filter(part => part.type !== "literal")
        .map(part => [part.type, Number(part.value)])
    );
  }

  function dateKey(parts) {
    return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
  }

  function calendarDay(date = new Date()) {
    const p = tehranParts(date);
    return new Date(Date.UTC(p.year, p.month - 1, p.day, 12));
  }

  function saturdayOf(date = new Date()) {
    const day = calendarDay(date);
    const back = (day.getUTCDay() - 6 + 7) % 7;
    return new Date(day.getTime() - back * DAY_MS);
  }

  function dayAt(base, offset) {
    return new Date(base.getTime() + offset * DAY_MS);
  }

  function tehranInstant(day, hour) {
    const year = day.getUTCFullYear();
    const month = String(day.getUTCMonth() + 1).padStart(2, "0");
    const date = String(day.getUTCDate()).padStart(2, "0");
    const hh = String(hour).padStart(2, "0");
    return new Date(`${year}-${month}-${date}T${hh}:00:00+03:30`);
  }

  function metrics() {
    const firstRow = els.stack.querySelector(".hour-row");
    if (!firstRow) return { step: 1 };
    const row = firstRow.getBoundingClientRect();
    const style = getComputedStyle(document.documentElement);
    const gap = Number.parseFloat(style.getPropertyValue("--gap")) || 0;
    return { step: row.height + gap };
  }

  function baseState(dayIndex, hour) {
    if (dayIndex === 6) return "navy";
    if (dayIndex === 5) return hour >= 8 && hour < 12 ? "yellow" : "navy";
    if (hour < 6) return "navy";
    if (hour < 8 || hour >= 18) return "yellow";
    return "blue";
  }

  function overlapsBusy(start, end) {
    return model.busy.some(interval => interval.start < end && interval.end > start);
  }

  function insideCoverage(start, end) {
    return Boolean(
      model.coverageStart &&
      model.coverageEnd &&
      start >= model.coverageStart &&
      end <= model.coverageEnd
    );
  }

  function cellState(day, dayIndex, hour) {
    const start = tehranInstant(day, hour);
    const end = new Date(start.getTime() + HOUR_MS);
    const known = insideCoverage(start, end);
    const state = known && overlapsBusy(start, end) ? "red" : baseState(dayIndex, hour);
    return { state, start, end, known };
  }

  function stateLabel(state) {
    return {
      blue: "زمان پیشنهادی",
      yellow: "قابل هماهنگی",
      red: "مشغول",
      navy: "خارج از دسترس"
    }[state];
  }

  function isPast(end) {
    return end <= new Date();
  }

  function currentWeekBase() {
    return dayAt(saturdayOf(), model.weekOffset * 7);
  }

  function renderHeadings() {
    els.headings.replaceChildren(
      ...DAY_NAMES_VISUAL.map(name => {
        const heading = document.createElement("div");
        heading.className = "day-heading";
        heading.textContent = name;
        return heading;
      })
    );
  }

  function renderTimeTrack() {
    els.timeTrack.replaceChildren(
      ...Array.from({ length: 24 }, (_, hour) => {
        const label = document.createElement("span");
        label.className = "time-label";
        label.textContent = String(hour).padStart(2, "0");
        return label;
      })
    );
  }

  function renderWeek() {
    const base = currentWeekBase();
    const last = dayAt(base, 6);
    els.weekRange.textContent = `${persianDate.format(base)} — ${persianDate.format(last)}`;
    els.stack.replaceChildren();

    for (let hour = 0; hour < 24; hour += 1) {
      const row = document.createElement("div");
      row.className = "hour-row";
      row.dataset.hour = String(hour);

      for (const dayIndex of VISUAL_TO_DAY_INDEX) {
        const day = dayAt(base, dayIndex);
        const result = cellState(day, dayIndex, hour);
        const cell = document.createElement("div");
        const past = isPast(result.end);
        cell.className = `hour-cell state-${result.state}`;
        cell.dataset.dayIndex = String(dayIndex);
        cell.dataset.hour = String(hour);
        cell.dataset.state = result.state;
        if (past) cell.classList.add("is-past");
        if (!result.known) cell.classList.add("is-unknown");

        const range = `${String(hour).padStart(2, "0")}:00 تا ${String(hour + 1).padStart(2, "0")}:00`;
        const knownText = result.known ? stateLabel(result.state) : "وضعیت تقویم نامشخص";
        cell.setAttribute(
          "aria-label",
          `${DAY_NAMES_VISUAL[6 - dayIndex]}، ${range}، ${knownText}${past ? "، گذشته" : ""}`
        );
        row.appendChild(cell);
      }

      els.stack.appendChild(row);
    }

    requestAnimationFrame(() => setTopHour(model.topHour));
    updateWeekButtons();
  }

  function updateVisibleHourText() {
    els.visibleHours.textContent = `${String(model.topHour).padStart(2, "0")}:00 — ${String(model.topHour + 7).padStart(2, "0")}:00`;
  }

  function setTopHour(nextHour) {
    const hour = Math.max(0, Math.min(17, Math.round(nextHour)));
    const changed = hour !== model.topHour;
    model.topHour = hour;
    const { step } = metrics();
    els.viewport.scrollTop = step * hour;
    els.timeTrack.style.transform = `translateY(${-step * hour}px)`;
    updateVisibleHourText();
    if (changed) hapticTick();
  }

  function hapticTick() {
    if (typeof navigator.vibrate === "function") navigator.vibrate(6);
  }

  function setWeekOffset(nextOffset) {
    const constrained = constrainWeekOffset(nextOffset);
    if (constrained === model.weekOffset) return;
    model.weekOffset = constrained;
    renderWeek();
    hapticTick();
  }

  function coverageOffsets() {
    if (!model.coverageStart || !model.coverageEnd) return { min: -2600, max: 2600 };
    const current = saturdayOf();
    const min = Math.floor((saturdayOf(model.coverageStart) - current) / (7 * DAY_MS));
    const max = Math.floor((saturdayOf(new Date(model.coverageEnd.getTime() - 1)) - current) / (7 * DAY_MS));
    return { min, max };
  }

  function constrainWeekOffset(offset) {
    const limits = coverageOffsets();
    return Math.max(limits.min, Math.min(limits.max, offset));
  }

  function updateWeekButtons() {
    const limits = coverageOffsets();
    els.older.disabled = model.weekOffset <= limits.min;
    els.newer.disabled = model.weekOffset >= limits.max;
  }

  function changeWeekBy(delta) {
    setWeekOffset(model.weekOffset + delta);
  }

  function handleWheel(event) {
    event.preventDefault();
    if (model.wheelLocked) return;
    const vertical = Math.abs(event.deltaY) >= Math.abs(event.deltaX);
    model.wheelLocked = true;
    if (vertical) setTopHour(model.topHour + (event.deltaY > 0 ? 1 : -1));
    else changeWeekBy(event.deltaX > 0 ? 1 : -1);
    window.setTimeout(() => { model.wheelLocked = false; }, 115);
  }

  function handlePointerDown(event) {
    model.pointer = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY
    };
    els.viewport.setPointerCapture(event.pointerId);
  }

  function handlePointerUp(event) {
    if (!model.pointer || model.pointer.id !== event.pointerId) return;
    const dx = event.clientX - model.pointer.x;
    const dy = event.clientY - model.pointer.y;
    model.pointer = null;
    const threshold = 22;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < threshold) return;
    if (Math.abs(dx) > Math.abs(dy)) changeWeekBy(dx < 0 ? 1 : -1);
    else setTopHour(model.topHour + (dy < 0 ? 1 : -1));
  }

  function handleKey(event) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setTopHour(model.topHour + 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setTopHour(model.topHour - 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      changeWeekBy(1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      changeWeekBy(-1);
    }
  }

  function applyCoverageFromCurrentWorkflow(data) {
    if (!data.updated) return;
    const updated = new Date(data.updated);
    if (!Number.isFinite(updated.getTime())) return;
    model.updatedAt = updated;
    // This mirrors the currently published workflow and is provisional, not a final coverage decision.
    model.coverageStart = new Date(updated.getTime() - 14 * DAY_MS);
    model.coverageEnd = new Date(updated.getTime() + 120 * DAY_MS);
  }

  async function loadBusy() {
    try {
      const response = await fetch("./busy.json", { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (!data || data.timezone !== TZ || !Array.isArray(data.busy)) {
        throw new Error("invalid busy.json");
      }
      model.busy = data.busy
        .map(interval => ({ start: new Date(interval.start), end: new Date(interval.end) }))
        .filter(interval =>
          Number.isFinite(interval.start.getTime()) &&
          Number.isFinite(interval.end.getTime()) &&
          interval.end > interval.start
        );
      applyCoverageFromCurrentWorkflow(data);
      model.dataReady = true;
      els.viewport.classList.remove("data-unavailable");
      els.status.classList.remove("is-error");
      els.status.textContent = model.updatedAt
        ? `آخرین به‌روزرسانی داده: ${persianUpdated.format(model.updatedAt)}`
        : "دادهٔ واقعیِ پیش‌نمایش بارگذاری شد؛ محدودهٔ پوشش اعلام نشده است.";
    } catch (error) {
      model.busy = [];
      model.dataReady = false;
      model.coverageStart = null;
      model.coverageEnd = null;
      els.viewport.classList.add("data-unavailable");
      els.status.classList.add("is-error");
      els.status.textContent = "دادهٔ تقویم در دسترس نیست؛ خانه‌ها آزاد قطعی تلقی نمی‌شوند.";
    }
    model.weekOffset = constrainWeekOffset(model.weekOffset);
    renderWeek();
  }

  els.viewport.addEventListener("wheel", handleWheel, { passive: false });
  els.viewport.addEventListener("pointerdown", handlePointerDown);
  els.viewport.addEventListener("pointerup", handlePointerUp);
  els.viewport.addEventListener("pointercancel", () => { model.pointer = null; });
  els.viewport.addEventListener("keydown", handleKey);
  els.viewport.addEventListener("scroll", () => {
    const { step } = metrics();
    const nearest = Math.max(0, Math.min(17, Math.round(els.viewport.scrollTop / step)));
    if (nearest !== model.topHour) {
      model.topHour = nearest;
      els.timeTrack.style.transform = `translateY(${-step * nearest}px)`;
      updateVisibleHourText();
    }
  }, { passive: true });

  els.older.addEventListener("click", () => changeWeekBy(-1));
  els.newer.addEventListener("click", () => changeWeekBy(1));
  els.current.addEventListener("click", () => setWeekOffset(0));
  window.addEventListener("resize", () => setTopHour(model.topHour));

  renderHeadings();
  renderTimeTrack();
  renderWeek();
  loadBusy();
})();
