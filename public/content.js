// public/content.js
function getTextFromPage() {
    let bodyText = document.body.innerText;
    return bodyText;
  }
  
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getText") {
      let pageText = getTextFromPage();
      sendResponse({ text: pageText });
    }
  });
  