document.addEventListener("DOMContentLoaded", () => {
  const previewImage = document.getElementById("previewImage");
  const captureButton = document.getElementById("captureButton");
  const uploadInput = document.getElementById("uploadInput");
  const ocrResult = document.getElementById("ocrResult");
  const filterCheckbox = document.getElementById("filterCheckbox");

  captureButton.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "captureTab" }, (response) => {
      if (response && response.imageDataUrl) {
        processImage(response.imageDataUrl);
      }
    });
  });

  uploadInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        processImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  });

  function processImage(imageDataUrl) {
    previewImage.src = imageDataUrl;
    previewImage.style.display = "block";
    ocrResult.textContent = "Processing...";

    Tesseract.recognize(imageDataUrl, "eng", {
      logger: (m) => console.log(m),
      workerPath: "https://unpkg.com/tesseract.js@5.1.1/dist/worker.min.js",
      corePath:
        "https://unpkg.com/tesseract.js-core@4.0.4/tesseract-core.wasm.js",
    })
      .then(({ data: { text } }) => {
        console.log("Extracted Text:", text);
        const extractedData = extractData(text);
        if (filterCheckbox.checked && extractedData) {
          console.log("Extracted Data:", extractedData);
          ocrResult.textContent = `
          Trading Symbol: ${extractedData.tradingSymbol}
          Month: ${extractedData.month}
          Strike Price: ${extractedData.strikePrice}
          Strike Type: ${extractedData.strikeType}
          SL: ${extractedData.strikeSL}
          TP: ${extractedData.strikeTP}
        `;
        } else {
          ocrResult.textContent = text; // Display all extracted text if checkbox is unchecked
        }
      })
      .catch((err) => {
        console.error("Error during text extraction:", err);
        ocrResult.textContent = "Error during text extraction: " + err.message;
      });
  }
});

function extractData(extractedText) {
  const match = extractedText.match(/BANKNIFTY\s+(\w+)\s+(\d+)\s+(CE|PE)/);
  const slMatch = extractedText.match(/SL:(\d+)/);
  const tpMatch = extractedText.match(/TP:(\d+)/);

  if (match) {
    return {
      tradingSymbol: "BANKNIFTY",
      month: match[1],
      strikePrice: match[2],
      strikeType: match[3],
      strikeSL: slMatch ? slMatch[1] : "N/A", // Extract SL or set to "N/A"
      strikeTP: tpMatch ? tpMatch[1] : "N/A", // Extract TP or set to "N/A"
    };
  } else {
    return null;
  }
}
