console.log("***Popup***");

let settings = {
    enabled: true, // enabled
    position: "SE",
    fontSize: 16, // points
    fontWeight: "normal",
    backgroundColour: "#bada557F",
    foregroundColour: "navy",
    borderColour: "#bada55",
    borderMargin: 25, // pixels
    fadeInterval: 5 // seconds
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

function createPicker(placeholderElementClassName, defaultColour) {

    var element = document.querySelector(placeholderElementClassName);
    
    if (!element){
        console.log(`Placeholder ${placeholderElementClassName} : not found`);
        return;
    }

    return new Pickr({
        el: placeholderElementClassName,
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

async function onClickApply()
{
    console.log("***Apply***");

    // update settings object from dropdown list controls; colour settings are updated when colour picker is closed
    settings.enabled = Shared.getSliderValue(document, 'enabledSlider');
    settings.position = Shared.getListValue(document, 'positionList');
    settings.fontSize = Shared.getListValue(document, 'fontSizeList');
    settings.fontWeight = Shared.getListValue(document, 'fontWeightList');
    settings.borderMargin = Shared.getListValue(document, 'borderMarginList');
    settings.fadeInterval = Shared.getListValue(document, 'fadeIntervalList');

    // save settings to chrome storage
    saveSettings(settings);

    // send message directly to the active tab/content script
    let message = { command: "applyRequest",
                    settings: settings };
    sendMessageToTab(message);

    window.close();
};

function getSelectedColour(color, instance) {
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

                                    // overwrite default settings if we have some data
                                    if (data.mySettings) {
                                        settings = data.mySettings;
                                    }

                                    // set slider
                                    Shared.setSliderValue(document, 'enabledSlider', settings.enabled);

                                    // select item in drop down lists
                                    Shared.selectListValue(document, "positionList", settings.position);
                                    Shared.selectListValue(document, "fontSizeList", settings.fontSize);
                                    Shared.selectListValue(document, "fontWeightList", settings.fontWeight);
                                    Shared.selectListValue(document, "borderMarginList", settings.borderMargin);
                                    Shared.selectListValue(document, "fadeIntervalList", settings.fadeInterval);

                                    // select colour pickers and associated labels
                                    Shared.setElementText(document, 'foreground-colour-label-id', settings.foregroundColour);
                                    Shared.setElementText(document, 'background-colour-label-id', settings.backgroundColour);
                                    Shared.setElementText(document, 'border-colour-label-id', settings.borderColour);

                                    // set example text settings based on settings just loaded
                                    onSettingChanged();

                                    const foregroundColourPicker = createPicker('.colour-picker-foreground', settings.foregroundColour);
                                    foregroundColourPicker.on('save', (color, instance) => {
                                        settings.foregroundColour = getSelectedColour(color, instance);
                                        Shared.setElementText(document, 'foreground-colour-label-id', settings.foregroundColour);
                                        onSettingChanged();
                                    }); 

                                    const backgroundColourPicker = createPicker('.colour-picker-background', settings.backgroundColour);
                                    backgroundColourPicker.on('save', (color, instance) => {
                                        settings.backgroundColour = getSelectedColour(color, instance);
                                        Shared.setElementText(document, 'background-colour-label-id', settings.backgroundColour);
                                        onSettingChanged();
                                    }); 

                                    const borderColourPicker = createPicker('.colour-picker-border', settings.borderColour);
                                    borderColourPicker.on('save', (color, instance) => {
                                        settings.borderColour = getSelectedColour(color, instance);
                                        Shared.setElementText(document, 'border-colour-label-id', settings.borderColour);
                                        onSettingChanged();
                                    }); 
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

    settings.enabled = Shared.getSliderValue(document, 'enabledSlider');
    settings.position = Shared.getListValue(document, 'positionList');
    settings.fontSize = Shared.getListValue(document, 'fontSizeList');
    settings.fontWeight = Shared.getListValue(document, 'fontWeightList');
    settings.borderMargin = Shared.getListValue(document, 'borderMarginList');
    settings.fadeInterval = Shared.getListValue(document, 'fadeIntervalList');

    console.log(`settings have changed: ${JSON.stringify(settings)}`);

    const root = document.querySelector(':root');

    root.style.setProperty('--fontSize', `${settings.fontSize}pt`);
    root.style.setProperty('--fontWeight', `${settings.fontWeight}`);
    root.style.setProperty('--backgroundColour', `${settings.backgroundColour}`);
    root.style.setProperty('--foregroundColour', `${settings.foregroundColour}`);
    root.style.setProperty('--borderColour', `${settings.borderColour}`);
    // fadeInterval, position and borderMargin are not used in the example text / stylesheet for popup
}

function onChanged(e) {
    console.log(`${e.srcElement.id} changed : ${e.srcElement.value}, ${Shared.getListValue(document, e.srcElement.id)}`);
    onSettingChanged();
}

function loadTranslationResources() {
    // HTML items with translation strings have a data-i18n attribute, for example data-i18n="position"
    // the attribute value (for example "position") is the key to lookup in the messages.json file

    const currentLocale = chrome.i18n.getMessage('@@ui_locale');

    console.log(`Current locale: '${currentLocale}'`);


    const elements = document.querySelectorAll('[data-i18n]');

    console.log(`Found ${elements.length} i18n key(s)`);

    for (i = 0; i < elements.length; i++) {
        if (elements[i].dataset && elements[i].dataset.i18n) {
            const key = elements[i].dataset.i18n;
            const message = chrome.i18n.getMessage(key);

            console.log(`Found i18n key '${key}' => '${message}'`);

            elements[i].innerHTML = message;
        }
    }
}

function onLoaded()
{
    console.log("***Loaded***");

    loadSettings();

    // add event handlers when controls have been loaded
    document.getElementById('applySettings').addEventListener('click', onClickApply);

    document.getElementById('positionList').onchange = onChanged;
    document.getElementById('fontSizeList').onchange = onChanged;
    document.getElementById('fontWeightList').onchange = onChanged;
    document.getElementById('borderMarginList').onchange = onChanged;
    document.getElementById('fadeIntervalList').onchange = onChanged;

    loadTranslationResources();
}

document.addEventListener("DOMContentLoaded", onLoaded);
