console.log("***Popup***");

let settings = {
    position: "SE",
    fontSize: 16,
    fontWeight: "normal",
    backgroundColour: "magenta",
    foregroundColour: "white",
    borderColour: "red"
 };

async function onClickApply()
{
    console.log("***Apply***");
   
    // send message directly to the active tab/content script
    let message = { command: "applyRequest",
                    settings: settings };
    sendMessageToTab(message);
};

async function sendMessageToTab(message)
{
    var tabId = await getCurrentTabId();

    if (tabId > 0) {

        chrome.tabs.sendMessage(tabId, message);
    }
}

function onLoaded()
{
    console.log("***Loaded***");

    // add event handlers when controls have been loaded
    document.getElementById('applySettings').addEventListener('click', onClickApply);

}

async function getCurrentTabId()
{
    // The chrome.tabs API is only available in background and popup scripts.
    // Can send a message from the content script to the background, which will use the tabs API, then send the result back to the content script.
    // https://stackoverflow.com/questions/62461559

    //let query = { active: true, lastFocusedWindow: true };
    let query = { active: true, currentWindow: true };

    // `tabs` will either be a `Tab` instance or `undefined`.
    const tabs = await chrome.tabs.query(query);

    if (tabs && tabs.length)
    {
        console.log("getCurrentTabId: Tab id %d (%s)", tabs[0].id, tabs[0].url);

        return tabs[0].id;
    }
    else
    {
        console.log("getCurrentTabId: no tab");

        return -1;
    }
}

document.addEventListener("DOMContentLoaded", onLoaded);