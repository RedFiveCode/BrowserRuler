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

function createPicker(element, defaultColour) {
    return new Pickr({
        el: element,
        default: defaultColour,
        theme: 'classic', // or 'monolith', or 'nano'
        //useAsButton: true,
  
        swatches: [
            'rgba(244, 67, 54, 1)',
            'rgba(233, 30, 99, 0.95)',
            'rgba(156, 39, 176, 0.9)',
            'rgba(103, 58, 183, 0.85)',
            'rgba(63, 81, 181, 0.8)',
            'rgba(33, 150, 243, 0.75)',
            'rgba(3, 169, 244, 0.7)',
            'rgba(0, 188, 212, 0.7)',
            'rgba(0, 150, 136, 0.75)',
            'rgba(76, 175, 80, 0.8)',
            'rgba(139, 195, 74, 0.85)',
            'rgba(205, 220, 57, 0.9)',
            'rgba(255, 235, 59, 0.95)',
            'rgba(255, 193, 7, 1)'
        ],
    
        components: {
            preview: true,
            opacity: true,
            hue: true,
    
            interaction: {
                hex: true,
                rgba: true,
                input: true,
                save: true
            }
        }
    });
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

function setElementColour(classNameOrId, colour) {
    const e = document.querySelector(classNameOrId);
  
    if (e) {
        console.log(`Updating ${classNameOrId} to ${colour}`); 
  
        e.innerText = colour;
        e.style.color = colour;
    }
}

function saveColor(color, instance, id) {
    if (color) {
        const hexColour = color.toHEXA().toString(0);

        setElementColour(id, hexColour);

        instance.hide();
        return hexColour;
    }

    return null;
}

function onLoaded()
{
    console.log("***Loaded***");

    // add event handlers when controls have been loaded
    document.getElementById('applySettings').addEventListener('click', onClickApply);

    // add colour picker
    var el = document.querySelector('.colour-picker-background');
    if (el) {
      const cp1 = createPicker('.colour-picker-background', 'cyan');
    
      cp1.on('save', (color, instance) => {
          settings.backgroundColour = saveColor(color, instance, '.background-colour-label');
      }); 
    }

    el = document.querySelector('.colour-picker-foreground');
    if (el) {
      const cp2 = createPicker('.colour-picker-foreground', 'green');
    
      cp2.on('save', (color, instance) => {
          settings.foregroundColour = saveColor(color, instance, '.foreground-colour-label');
      }); 
    } 
    
    el = document.querySelector('.colour-picker-border');
    if (el) {
      const cp3 = createPicker('.colour-picker-border', '#bada55');
    
      cp3.on('save', (color, instance) => {
          settings.borderColour = saveColor(color, instance, '.border-colour-label');
      }); 
    }
}

document.addEventListener("DOMContentLoaded", onLoaded);
