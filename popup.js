console.log("***Popup***");

let settings = {
    position: "SE",
    fontSize: 16,
    fontWeight: "normal",
    backgroundColour: "magenta",
    foregroundColour: "white",
    borderColour: "red"
 };

 
async function sendMessageToTab(message)
{
    var tabId = await getCurrentTabId();

    if (tabId > 0) {

        chrome.tabs.sendMessage(tabId, message);
    }
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

function getListValue(id) {
    var element = document.getElementById(id);
    if (element) {
        console.log(`Id ${id} : value=${element.value}, index=${element.selectedIndex}, id=${element[element.selectedIndex].id}`);

        return element[element.selectedIndex].id;
    }

    console.log(`Id ${id} : not found`);
    return null;
 }

async function onClickApply()
{
    console.log("***Apply***");

    settings.position = getListValue('positionList');
    settings.fontSize = getListValue('fontSizeList');
    settings.fontWeight = getListValue('fontWeightList');
   
    // send message directly to the active tab/content script
    let message = { command: "applyRequest",
                    settings: settings };
    sendMessageToTab(message);
};

function onLoaded()
{
    console.log("***Loaded***");

    // add event handlers when controls have been loaded
    document.getElementById('applySettings').addEventListener('click', onClickApply);

}

document.addEventListener("DOMContentLoaded", onLoaded);
