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
          { 
            logger: m => console.log(m),
            workerPath: 'https://unpkg.com/tesseract.js@5.1.1/dist/worker.min.js',
            corePath: 'https://unpkg.com/tesseract.js-core@4.0.4/tesseract-core.wasm.js'
          }
        ).then(({ data: { text } }) => {
          console.log("Extracted Text:", text);
          const extractedData = extractData(text);
          if (extractedData) {
            console.log("Extracted Data:", extractedData);
            // Display extracted data in the UI
            ocrResult.textContent = `
              Trading Symbol: ${extractedData.tradingSymbol}
              Month: ${extractedData.month}
              Strike Price: ${extractedData.strikePrice}
              Strike Type: ${extractedData.strikeType}
            `;
          } else {
            console.log("No matching data found.");
            ocrResult.textContent = "No matching data found.";
          }
        }).catch(err => {
          console.error("Error during text extraction:", err);
          ocrResult.textContent = "Error during text extraction: " + err.message;
        });
      }
    });
  });
});

function extractData(extractedText) {
  const match = extractedText.match(/BANKNIFTY\s+(\w+)\s+(\d+)\s+(CE|PE)/);
  if (match) {
    return {
      tradingSymbol: "BANKNIFTY",
      month: match[1],
      strikePrice: match[2],
      strikeType: match[3],
    };
  } else {
    return null;
  }
}