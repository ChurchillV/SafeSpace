// background.js
chrome.runtime.onInstalled.addListener(() => {
    console.log('SafeSpace Extension Installed');
  });
  
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'GET_TEXT') {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0].id) {
          chrome.scripting.executeScript(
            {
              target: { tabId: tabs[0].id },
              func: getTextFromPage,
            },
            (results) => {
              if (results && results.length > 0 && results[0].result) {
                sendResponse({ text: results[0].result });
              }
            }
          );
        }
      });
      return true;  // Will respond asynchronously.
    }
  });
  
  function getTextFromPage() {
    return document.body.innerText;
  }
  