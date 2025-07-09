chrome.runtime.onMessage.addListener((obj, sender, response) => {

    const { type, value, chatid, tags, allMessageBoxes, currentLink, tag } = obj

    if (type === "SETDATA") {
        chrome.storage.sync.set({
            ["message"]: JSON.stringify(allMessageBoxes)
        })
        console.log('ko');
    } else if (type === "STORE") {
        chrome.storage.local.set({tags: JSON.stringify(tags)},
            function () {
                console.log("Data has been saved to localStorage");
            }
        )

    }else if(type === "ADDTOTAG"){
        chrome.storage.local.get("tags", function (data){
            let tags = JSON.parse(data.tags)
            console.log(data.tags,'tags in th addtotag');
            tags[tag].push(currentLink)
            chrome.storage.local.set({tags: JSON.stringify(tags)})
        })
    }
})
