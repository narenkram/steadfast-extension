document.addEventListener("DOMContentLoaded", () => {
  const previewImage = document.getElementById("previewImage");
  const captureButton = document.getElementById("captureButton");
  const ocrResult = document.getElementById("ocrResult");

  captureButton.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "captureTab" }, (response) => {
      if (response && response.imageDataUrl) {
        previewImage.src = response.imageDataUrl;
        previewImage.style.display = "block";
        ocrResult.textContent = "Processing...";

        Tesseract.recognize(
          response.imageDataUrl,
          'eng',
          { logger: m => console.log(m) }
        ).then(({ data: { text } }) => {
          console.log("Extracted Text:", text);
          ocrResult.textContent = "Extracted Text: " + text;
        }).catch(err => {
          console.error("Error during text extraction:", err);
          ocrResult.textContent = "Error during text extraction: " + err.message;
        });
      }
    });
  });
});
