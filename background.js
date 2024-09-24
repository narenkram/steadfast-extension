chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "captureImage") {
    console.log("Captured Image Data:", message.data);
    // Handle the captured image data (e.g., send to a server or process it)
  } else if (message.action === "readText") {
    console.log("Read Text Data:", message.data);
    // Handle the read text data (e.g., send to a server or process it)
    chrome.storage.local.set({ signalsData: message.data });
  }
});

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (changes.signalsData) {
    chrome.action.setPopup({ popup: "popup.html" });
    chrome.runtime.sendMessage({
      action: "updateSignals",
      data: changes.signalsData.newValue,
    });
  }
});
