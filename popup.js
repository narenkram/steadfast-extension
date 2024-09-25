document.addEventListener("DOMContentLoaded", () => {
  const previewImage = document.getElementById("previewImage");
  const captureButton = document.getElementById("captureButton");

  captureButton.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "captureTab" }, (response) => {
      if (response && response.imageDataUrl) {
        previewImage.src = response.imageDataUrl;
        previewImage.style.display = "block";

        // Configure Tesseract.js to use the local worker script
        Tesseract.recognize(
          response.imageDataUrl,
          'eng',
          {
            logger: (info) => console.log(info), // Log progress if needed
            corePath: 'libs/tesseract.min.js', // Path to tesseract core
            workerPath: 'libs/worker.min.js'   // Path to worker script
          }
        ).then(({ data: { text } }) => {
          console.log("Extracted Text:", text);
          alert("Extracted Text: " + text);
        }).catch(err => {
          console.error("Error during text extraction:", err);
        });
      }
    });
  });
});
