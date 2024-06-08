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

function selectListValue(id, key) {
    var element = document.getElementById(id);
    if (element) {
        Array.from(element.options).forEach(function (option, index) {
            if (option.id === key) {
                console.log(`Id ${id} : index=${index}, key=${key}, value=${option.value}`);
                element.selectedIndex = index;
                return;
            }
        });
    }
    else {
        console.log(`Id ${id} : not found`);
    }
}

async function onClickApply()
{
    console.log("***Apply***");

    // update settings object from dropdown list controls; colour settings are updated when colour picker is closed
    settings.position = getListValue('positionList');
    settings.fontSize = getListValue('fontSizeList');
    settings.fontWeight = getListValue('fontWeightList');

    // save settings to chrome storage
    saveSettings(settings);

    // send message directly to the active tab/content script
    let message = { command: "applyRequest",
                    settings: settings };
    sendMessageToTab(message);

    window.close();
};

function setElementColour(classNameOrId, colour) {
    const e = document.querySelector(classNameOrId);
  
    if (e) {
        console.log(`Updating ${classNameOrId} to ${colour}`); 
  
        e.innerText = colour;
        e.style.color = colour;
    }
    else {
        console.log(`Element ${classNameOrId} not found`); 
    }
}


function saveColour(color, instance) {
    if (color) {
        const hexColour = color.toHEXA().toString(0);

        instance.hide();
        return hexColour;
    }

    return null;
}


function loadSettings() {
    chrome.storage.local.get('mySettings')
                        .then( (data) =>
                        {
                                console.log("settings loaded");
                                if (data) {
                                    console.log(`settings loaded: ${JSON.stringify(data)}`);
                                    settings = data.mySettings;

                                    // select item in drop down lists
                                    selectListValue("positionList", settings.position);
                                    selectListValue("fontSizeList", settings.fontSize);
                                    selectListValue("fontWeightList", settings.fontWeight);

                                    // Tselect color pickers and associated labels
                                    var el = document.querySelector('.colour-picker-background');
                                    if (el) {
                                        const cp1 = createPicker('.colour-picker-background', settings.backgroundColour);
                                    
                                        cp1.on('save', (color, instance) => {
                                            settings.backgroundColour = saveColour(color, instance);
                                            setElementColour('#background-colour-label-id', settings.backgroundColour);
                                            onSettingChanged();
                                        }); 
                                    }
                                    setElementColour('#background-colour-label-id', settings.backgroundColour);
                                
                                    el = document.querySelector('.colour-picker-foreground');
                                    if (el) {
                                        const cp2 = createPicker('.colour-picker-foreground', settings.foregroundColour);
                                    
                                        cp2.on('save', (color, instance) => {
                                            settings.foregroundColour = saveColour(color, instance);
                                            setElementColour('#foreground-colour-label-id', settings.foregroundColour);
                                            onSettingChanged();
                                        }); 
                                    }
                                    setElementColour('#foreground-colour-label-id', settings.foregroundColour);
                                    
                                    el = document.querySelector('.colour-picker-border');
                                    if (el) {
                                        const cp3 = createPicker('.colour-picker-border', settings.borderColour);
                                    
                                        cp3.on('save', (color, instance) => {
                                            settings.borderColour = saveColour(color, instance);
                                            setElementColour('#border-colour-label-id', settings.borderColour);
                                            onSettingChanged();
                                        }); 
                                    }
                                    setElementColour('#border-colour-label-id', settings.borderColour);                                           
                                }
                            });
}

function saveSettings(s) {
    console.log(`saving settings: ${JSON.stringify(s)}`);

    chrome.storage.local.set({ mySettings: s })
                        .then(() => { console.log("settings saved"); } );
}

function onSettingChanged() {
    console.log('settings have changed');

    // var fontSizeClass = 
    // `example-text-FontSize { 
    //     font-size: ${settings.fontSize} + "pt";
    //  }`;

    settings.fontSize = getListValue('fontSizeList');
    settings.fontWeight = getListValue('fontWeightList');

    console.log(`settings have changed: ${JSON.stringify(settings)}`);

    const root = document.querySelector(':root');

    root.style.setProperty('--fontSize', `${settings.fontSize}pt`);
    root.style.setProperty('--fontWeight', `${settings.fontWeight}`);
    root.style.setProperty('--backgroundColour', `${settings.backgroundColour}`);
    root.style.setProperty('--foregroundColour', `${settings.foregroundColour}`);
    root.style.setProperty('--borderColour', `${settings.borderColour}`);

    var rs = getComputedStyle(root);
  
    console.log(`fontSize = ${rs.getPropertyValue('--fontSize')}`);
    console.log(`fontWeight = ${rs.getPropertyValue('--fontWeight')}`);
}

function onLoaded()
{
    console.log("***Loaded***");

    loadSettings();

    // add event handlers when controls have been loaded
    document.getElementById('applySettings').addEventListener('click', onClickApply);
}

document.addEventListener("DOMContentLoaded", onLoaded);
