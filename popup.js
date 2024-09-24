document.getElementById("capture").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      function: () => {
        // Function to capture an image of a specific element
        function captureElementImage(selector) {
          const element = document.querySelector(selector);
          if (element) {
            html2canvas(element).then((canvas) => {
              const imgData = canvas.toDataURL("image/png");
              chrome.runtime.sendMessage({
                action: "captureImage",
                data: imgData,
              });
            });
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
