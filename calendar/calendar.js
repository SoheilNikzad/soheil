(() => {
  "use strict";

  const TZ = "Asia/Tehran";
  const SLOT_HOURS = [8, 10, 12, 14, 16, 18];
  const SLOT_MS = 2 * 60 * 60 * 1000;

  const POLICY = {
    publicDays: new Set([0, 1, 2, 3, 4, 6]),
    availableStart: 8,
    availableEnd: 18,
    preferred: [
      { days: new Set([0, 1, 2, 3, 4, 6]), start: 10, end: 14 }
    ]
  };

  const els = {
    grid: document.getElementById("weekGrid"),
    title: document.getElementById("weekTitle"),
    status: document.getElementById("status"),
    updated: document.getElementById("updatedAt"),
    prev: document.getElementById("prevWeek"),
    next: document.getElementById("nextWeek"),
    today: document.getElementById("todayButton"),
    theme: document.getElementById("themeToggle")
  };

  let weekOffset = 0;
  let busy = [];

  const faDate = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    timeZone: TZ, month: "long", day: "numeric"
  });

  const faDay = new Intl.DateTimeFormat("fa-IR", {
    timeZone: TZ, weekday: "short"
  });

  const faNumber = new Intl.NumberFormat("fa-IR", {
    useGrouping: false
  });

  const faUpdated = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    timeZone: TZ,
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  function partsInTehran(date) {
    const p = new Intl.DateTimeFormat("en-CA", {
      timeZone: TZ,
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).formatToParts(date);

    return Object.fromEntries(
      p.filter(x => x.type !== "literal")
       .map(x => [x.type, Number(x.value)])
    );
  }

  function tehranMidnight(date = new Date()) {
    const { year, month, day } = partsInTehran(date);

    return new Date(
      `${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}T00:00:00+03:30`
    );
  }

  function saturdayOf(date = new Date()) {
    const d = tehranMidnight(date);

    const { year, month, day } = partsInTehran(d);

    const noon = new Date(
      `${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}T12:00:00+03:30`
    );

    const localDow = noon.getUTCDay();
    const back = (localDow - 6 + 7) % 7;

    return new Date(d.getTime() - back * 86400000);
  }

  function dayAt(base, n) {
    return new Date(base.getTime() + n * 86400000);
  }

  function slotAt(day, hour) {
    const { year, month, day: dd } = partsInTehran(day);

    return new Date(
      `${year}-${String(month).padStart(2,"0")}-${String(dd).padStart(2,"0")}T${String(hour).padStart(2,"0")}:00:00+03:30`
    );
  }

  function jsDayInTehran(date) {
    const { year, month, day } = partsInTehran(date);

    return new Date(
      `${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}T12:00:00+03:30`
    ).getUTCDay();
  }

  function overlapsBusy(start, end) {
    return busy.some(b => b.start < end && b.end > start);
  }

  function isPreferred(dayNo, hour) {
    return POLICY.preferred.some(
      p => p.days.has(dayNo) && hour >= p.start && hour < p.end
    );
  }

  function stateFor(day, hour) {
    const dayNo = jsDayInTehran(day);
    const start = slotAt(day, hour);
    const end = new Date(start.getTime() + SLOT_MS);

    if (
      !POLICY.publicDays.has(dayNo) ||
      hour < POLICY.availableStart ||
      hour >= POLICY.availableEnd
    ) {
      return "unavailable";
    }

    if (overlapsBusy(start, end)) return "busy";
    if (isPreferred(dayNo, hour)) return "preferred";

    return "available";
  }

  function stateLabel(state) {
    return ({
      preferred: "ترجیحی",
      available: "آزاد",
      busy: "مشغول",
      unavailable: "خارج از دسترس"
    })[state];
  }

  function render() {
    const base = dayAt(saturdayOf(), weekOffset * 7);
    const last = dayAt(base, 6);

    els.title.textContent =
      `${faDate.format(base)} تا ${faDate.format(last)}`;

    els.grid.replaceChildren();

    const todayKey =
      JSON.stringify(partsInTehran(new Date()));

    for (let i = 0; i < 7; i++) {
      const day = dayAt(base, i);

      const col = document.createElement("div");
      col.className = "day-column";

      if (
        JSON.stringify(partsInTehran(day)) === todayKey
      ) {
        col.classList.add("today");
      }

      const head = document.createElement("div");
      head.className = "day-head";

      const wd = document.createElement("b");
      wd.textContent = faDay.format(day);

      const dn = document.createElement("span");

      dn.textContent = faNumber.format(
        Number(
          new Intl.DateTimeFormat(
            "en-US-u-ca-persian",
            {
              timeZone: TZ,
              day: "numeric"
            }
          ).format(day)
        )
      );

      head.append(wd, dn);
      col.append(head);

      for (const hour of SLOT_HOURS) {
        const state = stateFor(day, hour);

        const slot = document.createElement("div");
        slot.className = `slot ${state}`;
        slot.tabIndex = 0;

        const range =
          `${String(hour).padStart(2,"0")}:00–${String(hour + 2).padStart(2,"0")}:00`;

        slot.setAttribute(
          "aria-label",
          `${faDay.format(day)}، ${range}، ${stateLabel(state)}`
        );

        slot.title =
          `${range} — ${stateLabel(state)}`;

        const time =
          document.createElement("span");

        time.className = "slot-time";
        time.textContent = range;

        slot.append(time);
        col.append(slot);
      }

      els.grid.append(col);
    }
  }

  async function loadBusy() {
    try {
      const r = await fetch(
        `./busy.json?t=${Date.now()}`,
        { cache: "no-store" }
      );

      if (!r.ok) {
        throw new Error(`HTTP ${r.status}`);
      }

      const data = await r.json();

      if (!data || !Array.isArray(data.busy)) {
        throw new Error("invalid busy.json");
      }

      busy = data.busy
        .map(x => ({
          start: new Date(x.start),
          end: new Date(x.end)
        }))
        .filter(
          x =>
            Number.isFinite(x.start.getTime()) &&
            Number.isFinite(x.end.getTime()) &&
            x.end > x.start
        );

      els.status.textContent = "";
      els.status.classList.remove("error");

      els.updated.textContent = data.updated
        ? `به‌روزرسانی: ${faUpdated.format(new Date(data.updated))}`
        : "تقویم به‌روز است";

    } catch (err) {
      busy = [];

      els.status.textContent =
        "دادهٔ تقویم هنوز آماده نشده است.";

      els.status.classList.add("error");

      els.updated.textContent =
        "اتصال تقویم در انتظار داده";
    }

    render();
  }

  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;

    localStorage.setItem(
      "soheil-calendar-theme",
      theme
    );
  }

  els.prev.addEventListener(
    "click",
    () => {
      weekOffset--;
      render();
    }
  );

  els.next.addEventListener(
    "click",
    () => {
      weekOffset++;
      render();
    }
  );

  els.today.addEventListener(
    "click",
    () => {
      weekOffset = 0;
      render();
    }
  );

  els.theme.addEventListener(
    "click",
    () => {
      const current =
        document.documentElement.dataset.theme ||
        (
          matchMedia(
            "(prefers-color-scheme: dark)"
          ).matches
            ? "dark"
            : "light"
        );

      setTheme(
        current === "dark"
          ? "light"
          : "dark"
      );
    }
  );

  const savedTheme =
    localStorage.getItem(
      "soheil-calendar-theme"
    );

  if (
    savedTheme === "light" ||
    savedTheme === "dark"
  ) {
    document.documentElement.dataset.theme =
      savedTheme;
  }

  render();
  loadBusy();
})();