chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "captureTab") {
    chrome.tabs.captureVisibleTab(null, { format: "png" }, (dataUrl) => {
      sendResponse({ imageDataUrl: dataUrl });
    });
    return true; // Indicates that we will send a response asynchronously
  }
});
