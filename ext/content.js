(() => {
  let currentParam
  let currentChatList = []
  let tags = {}
  let currentParentDiv

  
  function displayTagsInModal(event) {
    // getting the data from the chrome storage
    chrome.storage.local.get("tags", function (data) {
      // Parse the stored tags data if available
      if (data.tags) tags = JSON.parse(data?.tags);
  
      const currentLink = event.target.id;
      // creating modal
      const modalContainer = document.createElement("div");
      modalContainer.className = "modal-container"; // CSS class for styling
      modalContainer.style.height = "200px"; // Setting the height of the modal
      modalContainer.style.width = "200px"; // Setting the width of the modal
      modalContainer.innerHTML = ""; // Clearing the inner content of the modal
  
      // top side of the modal and body side
      const modalTopDiv = document.createElement("div"); // Container for the top side of the modal
      const modalBodyDiv = document.createElement("div"); // Container for the body of the modal
      modalBodyDiv.className = "modal-body"; // CSS class for styling
  
      // button for closing
      const modalCloseBtn = document.createElement("button"); // Close button element
      modalCloseBtn.className = "modal-close-btn"; // CSS class for styling
      modalCloseBtn.innerText = "Close"; // Text content of the button
  
      modalTopDiv.appendChild(modalCloseBtn); // Appending close button to the top side of the modal
      modalContainer.appendChild(modalTopDiv); // Appending top side to the modal container
  
      for (let tag in tags) {
        // creating new divs for each tags
        if (tags.hasOwnProperty(tag)) {
          const tagElement = document.createElement("div"); // Div element for each tag
          tagElement.className = "modal-tag-element"; // CSS class for styling
          tagElement.textContent = tag; // Text content of the tag element
          modalBodyDiv.appendChild(tagElement); // Appending tag element to the modal body
  
          event.target.role = tag; // Assigning the tag as the role of the target element (plus button)
  
          // when you click the tags need to added to the user's tags list
          tagElement.addEventListener("click", () => {
            chrome.runtime.sendMessage({
              type: "ADDTOTAG", // Message type for adding a tag
              tag, // Tag name
              currentLink // Current URL
            });
  
            setTimeout(displayTag, 300); // Delayed function call (not shown in provided code)
            modalContainer.style.display = "none"; // Hiding the modal
          });
        }
      }
  
      modalContainer.appendChild(modalBodyDiv); // Appending body side to the modal container
      document.body.appendChild(modalContainer); // Appending modal container to the document body
  
      // onClose function to close the modal
      modalCloseBtn.addEventListener("click", function (event) {
        modalContainer.style.display = "none"; // Hiding the modal when the close button is clicked
      });
    });
  }
  

  // display tag
  const displayTag = () => {
    chrome.storage.local.get("tags", function (data) {
      if (data.tags) tags = JSON.parse(data?.tags)

      // parent div
      const parentDiv = document.querySelectorAll('div[role="gridcell"]')[0]

      if (parentDiv) {
        const mainParent = parentDiv.parentElement

        mainParent.className = "row"

        const previousSibling = parentDiv.querySelector("a")
        const currentLink = previousSibling.href

        for (let tag in tags) {
          if (tags.hasOwnProperty(tag)) {
            if (tags[tag].includes(currentLink)) {
              const tagElement = document.createElement("div")
              tagElement.className = "tagElement"
              tagElement.innerText = tag
              parentDiv.appendChild(tagElement)
            }
          }
        }
      } else {
        setTimeout(displayTag, 100)
      }
    })
  }

  

  const displayPlusButton = () => {
    const observeParentDivs = (mutationsList, observer) => {
      const parentDivs = document.querySelectorAll('div[role="gridcell"]');
  
      parentDivs.forEach(parentDiv => {
        if (!parentDiv.classList.contains("ext-gridcell")) {
          parentDiv.classList.add("ext-gridcell");
  
          const addButton = document.createElement("img");
          addButton.src = chrome.runtime.getURL("assets/bookmark.png");
          addButton.className = "ext-add-btn";
          addButton.title = "Click here to add tag to the Messenger extension";
  
          const previousSibling = parentDiv.querySelector("a");
          if (previousSibling) {
            const currentLink = previousSibling.href;
            addButton.id = currentLink;
  
            parentDiv.appendChild(addButton);
  
            addButton.addEventListener("click", displayTagsInModal);
          }
        }
      });
    };
  
    const url = window.location.href.includes("https://www.messenger.com/");
    if (url) {
      const observer = new MutationObserver(observeParentDivs);
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }
  };
  

  // Call the displayButton function to add the plus icon
  displayPlusButton();
  displayTag()

})()
