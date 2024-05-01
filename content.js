// Content script; runs in the active web page/tab

const statusDivId = "browser-ruler-status-div";

console.log("Content");
subscribe();

window.onresize = OnResize;

// show initially rather than wait for window to be resized
OnResize();


function subscribe() {
    console.log("Subscribing");

    chrome.runtime.onMessage.addListener( function(message, sender, response) { 
        console.log("(Content) Message '%s' (%s)", message.command, JSON.stringify(message));
    
        if (message.command === "applyRequest") {
           return OnApplyRequest(message.payload);
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
   
    // TODO extract settings for payload and update style(s)

    return false; // false means no response for this message
}

function OnResize(e) {
    console.log(`Onresize: innerWidth=${window.innerWidth}, innerHeight=${window.innerHeight}, clientWidth=${document.body.clientWidth}, clientHeight=${document.body.clientHeight}`);

    let myDiv = document.getElementById(statusDivId);

    if (myDiv === null) {
        console.log(`Element '${statusDivId}' not found, creating child element`);

        myDiv = CreateStatusElement();
    }

    myDiv.innerText = CreateStatusText(window.innerWidth, window.innerHeight);
}
    
function CreateStatusText(width, height) {
    return `${width} x ${height}`;
}

function CreateStatusElement() {
    const styles = document.createElement("style");
    styles.textContent = `.status-text { 
        position: fixed;
        z-index: 9999;
        #left: 24px;
        #bottom: 24px;
        border-radius: 10px;
        border-style: solid;
        border-width 2px;
        border-color: #bada55;
        background: #bada557F;
        color: navy;
        font-size: 16pt;
        font-weight: bold;
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
  
    const myDiv = document.createElement("div");
    myDiv.id = statusDivId;
    myDiv.classList.add("status-text");
    myDiv.classList.add("status-text-position-SW");
    
    document.head.appendChild(styles);
    document.body.insertBefore(myDiv, document.body.firstChild);

    return myDiv;
}

