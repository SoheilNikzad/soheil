document.addEventListener("DOMContentLoaded", function () {
  const inputText = document.getElementById("inputText");
  const createBtnAdd = document.getElementById("createBtnAdd");
  const storedDataElement = document.getElementById("storedData");

  let tags = {};

  // بارگذاری تگ‌ها از localStorage
  const savedTags = localStorage.getItem("tags");
  if (savedTags) {
    tags = JSON.parse(savedTags);
  }

  displayTags();

  createBtnAdd.addEventListener("click", function () {
    const tag = inputText.value.trim();

    if (tag !== "") {
      tags[tag] = [];
      localStorage.setItem("tags", JSON.stringify(tags));
      displayTags();
      inputText.value = "";
    }
  });

  function displayTags() {
    storedDataElement.innerHTML = "";
    for (let tag in tags) {
      if (tags.hasOwnProperty(tag)) {
        const tagElement = document.createElement("div");
        tagElement.textContent = tag;
        storedDataElement.appendChild(tagElement);
      }
    }
  }
});
