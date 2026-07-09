const tabs = document.querySelectorAll(".folder-tab");
const panels = document.querySelectorAll("[data-panel]");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.tab;

    tabs.forEach((item) => {
      const isActive = item === tab;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-selected", String(isActive));
    });

    panels.forEach((panel) => {
      const isActive = panel.dataset.panel === target;
      panel.classList.toggle("is-active", isActive);
      panel.hidden = !isActive;
    });
  });
});
