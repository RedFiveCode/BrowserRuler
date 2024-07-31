// Content script; runs in the active web page/tab

const stylesId = "browser-ruler-styles-id";
const statusDivId = "browser-ruler-status-div";

let currentSettings = { 
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

console.log("Content");

OnCreated();


async function OnCreated() {
    console.log("OnCreated");

    const pageUrl = chrome.runtime.getURL("content.html");
    await fetch(pageUrl).then(r => r.text())
                        .then(html => document.body.insertAdjacentHTML('beforebegin', html));

    subscribe();
}

function subscribe() {
    console.log("Subscribing");

    // subscribe to size changes
    window.onresize = OnResize;

    // subscribe to messages from popup
    chrome.runtime.onMessage.addListener( function(message, sender, response) { 
        console.log("(Content) Message '%s' (%s)", message.command, JSON.stringify(message));
    
        if (message.command === "applyRequest") {
           return OnApplyRequest(message.settings);
        } 
        else {
            console.log("Unsupported message");

            return false; // false means no response for this message
        }       
    });

    // load settings from chrome storage
    chrome.storage.local.get('mySettings')
                        .then( (data) => {
                                        console.log("settings loaded");
                                        if (data) {
                                            console.log(`settings loaded: ${JSON.stringify(data)}`);

                                            // overwrite default settings if we have some data
                                            if (data.mySettings) {
                                                currentSettings = data.mySettings;
                                            }

                                            updateDocument(currentSettings);
                                            OnResize();
                                        }
                        });
}

function OnApplyRequest(payload)
{
    console.log("OnApplyRequest");
   
    // extract settings for payload and update style(s)
    currentSettings = payload;

    updateDocument(currentSettings);

    OnResize();

    return false; // false means no response for this message
}

function OnResize(e) {
    console.log(`Onresize: innerWidth=${window.innerWidth}, innerHeight=${window.innerHeight}, clientWidth=${document.body.clientWidth}, clientHeight=${document.body.clientHeight}`);

    let myDiv = document.getElementById(statusDivId);

    if (myDiv !== null) {

        addOrRemoveAnimation(myDiv);

        myDiv.innerText = getFormattedWidthText(window.innerWidth, window.innerHeight);
    }
    else {
        console.log(`Element '${statusDivId}' not found`);
    }
}
    
function getFormattedWidthText(width, height) {
    return chrome.i18n.getMessage("widthHeight", [width, height]);
}

function addOrRemoveAnimation(element) {
    console.log(`addOrRemoveAnimation: fadeInterval=${currentSettings.fadeInterval}`);

    if (currentSettings.fadeInterval === "0") {
        // remove animation, reset opacity
        element.classList.remove('animate-fading');
        element.classList.add('reset-opacity');
    }
    else {
        element.classList.remove('reset-opacity');
        element.classList.add('animate-fading');
        restartAnimations(element);
    }
}

function restartAnimations(element) {
    // from https://www.bram.us/2022/07/20/javascript-restart-all-animations-of-an-element/
    // and https://stackoverflow.com/questions/6268508

    element.getAnimations().forEach(anim => {
        anim.cancel();
        anim.play();
    });
}

async function updateDocument(settings) {
    
    console.log("Adding stylesheet and div elements");

    // update CSS variables
    const root = document.querySelector(':root');
    root.style.setProperty('--fontSize', `${settings.fontSize}pt`); // convert to points
    root.style.setProperty('--fontWeight', `${settings.fontWeight}`);
    root.style.setProperty('--backgroundColour', `${settings.backgroundColour}`);
    root.style.setProperty('--foregroundColour', `${settings.foregroundColour}`);
    root.style.setProperty('--borderColour', `${settings.borderColour}`);
    root.style.setProperty('--borderMargin', `${settings.borderMargin}px`); // convert to pixels
    root.style.setProperty('--displayMode', settings.enabled ? 'inline-block' : 'none');
    root.style.setProperty('--fadeInterval', `${settings.fadeInterval}s`); // convert to seconds

    let myDiv = document.getElementById(statusDivId);
  
    if (myDiv) {
        // remove status-text-position-SW etc class, keep status-text class
        myDiv.classList = 'status-text';
        myDiv.classList.add(getPositionClassName(settings));

        addOrRemoveAnimation(myDiv);
    }
}

function getPositionClassName(settings) {
    const map = [ { key: "NW", value:"status-text-position-NW" },
                  { key: "NE", value:"status-text-position-NE" },
                  { key: "SE", value:"status-text-position-SE" },
                  { key: "SW", value:"status-text-position-SW" },
                  { key: "Centre", value:"status-text-position-Centre" } ];

    if (settings && settings.position)
    {
        var match = map.find(x => x.key == settings.position)

        if (match) {
            return match.value;
        }
    }

    return "SW"; // default
}
