document.getElementById("capture").addEventListener("click", () => {
  console.log("Capture button clicked");
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      function: () => {
        console.log("Executing script in tab");
        // Function to capture an image of a specific element
        function captureElementImage(selector) {
          const element = document.querySelector(selector);
          if (element) {
            console.log("Element found, capturing image");
            html2canvas(element).then((canvas) => {
              const imgData = canvas.toDataURL("image/png");
              chrome.runtime.sendMessage({
                action: "captureImage",
                data: imgData,
              });
            });
          } else {
            console.log("Element not found");
          }
        }
        captureElementImage("#targetElement"); // Replace with the actual selector
      },
    });
  });
});

document.getElementById("read").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      function: () => {
        // Function to read text data from a specific element
        function readTextData(selector) {
          const element = document.querySelector(selector);
          if (element) {
            const textData = element.innerText;
            chrome.runtime.sendMessage({ action: "readText", data: textData });
          }
        }
        readTextData("#targetElement"); // Replace with the actual selector
      },
    });
  });
});

document
  .getElementById("automationToggle")
  .addEventListener("change", (event) => {
    const isChecked = event.target.checked;
    document.getElementById("toggleStatus").innerText = isChecked
      ? "ON"
      : "OFF";
    chrome.storage.local.set({ automationToggle: isChecked });
    if (isChecked) {
      startAutoCapture();
    } else {
      stopAutoCapture();
    }
  });

let autoCaptureInterval;

function startAutoCapture() {
  autoCaptureInterval = setInterval(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: () => {
          // Function to read text data from a specific element
          function readTextData(selector) {
            const element = document.querySelector(selector);
            if (element) {
              const textData = element.innerText;
              chrome.runtime.sendMessage({
                action: "readText",
                data: textData,
              });
            }
          }
          readTextData("#targetElement"); // Replace with the actual selector
        },
      });
    });
  }, 5000); // Adjust the interval as needed
}

function stopAutoCapture() {
  clearInterval(autoCaptureInterval);
}

// Retrieve the toggle state from local storage when the popup is loaded
document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get("automationToggle", (result) => {
    const isChecked = result.automationToggle || false;
    document.getElementById("automationToggle").checked = isChecked;
    document.getElementById("toggleStatus").innerText = isChecked
      ? "ON"
      : "OFF";
    if (isChecked) {
      startAutoCapture();
    }
  });
});
