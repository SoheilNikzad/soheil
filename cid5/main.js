document.addEventListener("DOMContentLoaded", function () {
  const input = document.getElementById("inputText");
  const btn = document.getElementById("createBtnAdd");
  const display = document.getElementById("storedData");

  const modal = document.getElementById("linkModal");
  const closeBtn = document.querySelector(".close");
  const modalTitle = document.getElementById("modalTagName");
  const linkList = document.getElementById("linkList");
  const newLinkInput = document.getElementById("newLinkInput");
  const addLinkBtn = document.getElementById("addLinkBtn");

  let tags = JSON.parse(localStorage.getItem("tags")) || {};

  function saveTags() {
    localStorage.setItem("tags", JSON.stringify(tags));
  }

  function renderTags() {
    display.innerHTML = "";
    for (let tag in tags) {
      const wrapper = document.createElement("div");
      wrapper.className = "tagElement";

      const name = document.createElement("span");
      name.textContent = tag;
      name.onclick = () => openModal(tag);

      const del = document.createElement("button");
      del.textContent = "🗑";
      del.onclick = () => {
        delete tags[tag];
        saveTags();
        renderTags();
      };

      wrapper.appendChild(name);
      wrapper.appendChild(del);
      display.appendChild(wrapper);
    }
  }

  btn.onclick = () => {
    const tag = input.value.trim();
    if (tag && !tags[tag]) {
      tags[tag] = [];
      saveTags();
      renderTags();
      input.value = "";
    }
  };

  function openModal(tag) {
    modalTitle.textContent = tag;
    renderLinks(tag);
    modal.style.display = "block";
    addLinkBtn.onclick = () => {
      const link = newLinkInput.value.trim();
      if (link) {
        tags[tag].push(link);
        saveTags();
        renderLinks(tag);
        newLinkInput.value = "";
      }
    };
  }

  function renderLinks(tag) {
    linkList.innerHTML = "";
    tags[tag].forEach((link, index) => {
      const li = document.createElement("li");
      li.textContent = link;
      li.onclick = () => window.open(link, "_blank");
      linkList.appendChild(li);
    });
  }

  closeBtn.onclick = () => modal.style.display = "none";
  window.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; };

  renderTags();
});
