// Content script; runs in the active web page/tab

const stylesId = "browser-ruler-styles-id";
const statusDivId = "browser-ruler-status-div";

let currentSettings = { 
    position: "SW",
    fontSize: "12", // point
    fontWeight: "bold",
    backgroundColour: "#bada557F",
    foregroundColour: "navy",
    borderColour: "#bada55"
 }

console.log("Content");
subscribe();

OnCreated();


function OnCreated() {
    subscribe();

    // add stylesheet and div to document
    updateDocument(currentSettings);

    // show initially rather than wait for window to be resized
    OnResize();
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
        myDiv.innerText = createStatusText(window.innerWidth, window.innerHeight);
    }
    else {
        console.log(`Element '${statusDivId}' not found`);
    }
}
    
function createStatusText(width, height) {
    return `${width} x ${height}`;
}

function createStyleElement(id, settings) {
    const myStyle = document.createElement("style");
    myStyle.id = id;
    myStyle.textContent =
    `.status-text { 
        position: fixed;
        z-index: 9999;
        #left: 24px;
        #bottom: 24px;
        border-radius: 10px;
        border-style: solid;
        border-width: medium;
        border-color: ${getBorderColour(settings)};
        background: ${getBackgroundColour(settings)};
        color: ${getForegroundColour(settings)};
        font-size: ${getFontSize(settings)};
        font-weight: ${getFontWeight(settings)};
        font-family: sans-serif;
        display: inline-block;
        padding: 10px;
     }
     .status-text-position-SW {
        left: 24px;
        bottom: 24px;
      }
      .status-text-position-NW {
        left: 24px;
        top: 24px;
      }  
      .status-text-position-NE {
        right: 24px;
        top: 24px;
      }  
      .status-text-position-SE {
        right: 24px;
        bottom: 24px;
      }          
      `;

      return myStyle;
}

function createStatusDivElement(id, settings) {
    const myDiv = document.createElement("div");
    myDiv.id = id;
    myDiv.classList.add("status-text");
    myDiv.classList.add(getPositionClassName(settings));
    
    return myDiv;
}

function removeElementById(id) {
    let e = document.getElementById(id);
    if (e) {
        console.log(`Removing element ${id}`);

        //e.disabled = true;
        e.parentNode.removeChild(e);
    }
}

function updateDocument(settings) {
    // add stylesheet and div to document; call when first initialised or when settings change
    // update style(s) based on the settings

    removeElementById(stylesId);
    const myStyle = createStyleElement(stylesId, settings);

    removeElementById(statusDivId);
    const myDiv = createStatusDivElement(statusDivId, settings);

    myDiv.classList.add(getPositionClassName(settings));  

    console.log("Adding stylesheet and div elements");
    document.head.appendChild(myStyle);
    document.body.insertBefore(myDiv, document.body.firstChild);

    return myDiv;
}

function getPositionClassName(settings) {
    const map = [ { key: "NW", value:"status-text-position-NW" },
                  { key: "NE", value:"status-text-position-NE" },
                  { key: "SE", value:"status-text-position-SE" },
                  { key: "SW", value:"status-text-position-SW" } ];

    if (settings && settings.position)
    {
        var match = map.find(x => x.key == settings.position)

        if (match) {
            return match.value;
        }
    }

    return "SW"; // default
}

function getFontSize(settings) {
    if (settings && settings.fontSize)
    {
        return settings.fontSize + "pt";
    }

    return "12pt"; // default
}

function getFontWeight(settings) {
    if (settings && settings.fontWeight)
    {
        return settings.fontWeight;
    }

    return "normal"; // default
}

function getBackgroundColour(settings) {
    if (settings && settings.backgroundColour)
    {
        return settings.backgroundColour;
    }

    return "#bada557F"; // default    
}

function getForegroundColour(settings) {
    if (settings && settings.foregroundColour)
    {
        return settings.foregroundColour;
    }

    return "navy"; // default    
}

function getBorderColour(settings) {
    if (settings && settings.borderColour)
    {
        return settings.borderColour;
    }

    return "#bada55"; // default    
}