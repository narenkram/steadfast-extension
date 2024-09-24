document.addEventListener("DOMContentLoaded", () => {
  // Function to capture an image of a specific element
  function captureElementImage(selector) {
    const element = document.querySelector(selector);
    if (element) {
      html2canvas(element).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        chrome.runtime.sendMessage({ action: "captureImage", data: imgData });
      });
    }
  }

  // Function to read text data from a specific element
  function readTextData(selector) {
    const element = document.querySelector(selector);
    if (element) {
      const textData = element.innerText;
      chrome.runtime.sendMessage({ action: "readText", data: textData });
    }
  }

  // Example usage
  captureElementImage("#targetElement"); // Replace with the actual selector
  readTextData("#targetElement"); // Replace with the actual selector
});
