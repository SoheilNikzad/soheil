
document.addEventListener("DOMContentLoaded", function() {
  const inputText = document.getElementById("inputText");
  const createBtnAdd = document.getElementById("createBtnAdd");
  const storedDataElement = document.getElementById("storedData");

  
  let tags = {}

  // loading existing tags from storage or initailize an empty object

  chrome.storage.local.get("tags", function (data) {
    if (data.tags) tags = JSON.parse(data.tags);
    displayTags() //calling the tags
  })

  displayTags()

  createBtnAdd.addEventListener("click", function() {
    const tag = inputText.value.trim();

    if(tag !== ""){
      tags[tag] = [] // add new tag to the new object
      chrome.runtime.sendMessage(
        {
          type : "STORE",
          tags
        }
      )
      displayTags()
      inputText.value = ""
    }
  });

  // display the tags
  function displayTags() {
    storedDataElement.innerHTML = ""
    for (let tag in tags) {
      if (tags.hasOwnProperty(tag)) {
        const tagElement = document.createElement("div")
        tagElement.textContent = tag
        storedDataElement.appendChild(tagElement)
      }
    }
  }
});
