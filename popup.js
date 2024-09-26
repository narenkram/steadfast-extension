document.addEventListener("DOMContentLoaded", () => {
  const previewImage = document.getElementById("previewImage");
  const captureButton = document.getElementById("captureButton");
  const uploadInput = document.getElementById("uploadInput");
  const ocrResult = document.getElementById("ocrResult");
  const filterCheckbox = document.getElementById("filterCheckbox");

  // Load filterCheckbox state from localStorage
  if (localStorage.getItem("filterCheckboxState") === "true") {
    filterCheckbox.checked = true;
  }

  captureButton.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "captureTab" }, (response) => {
      if (response && response.imageDataUrl) {
        preprocessImage(response.imageDataUrl);
      }
    });
  });

  uploadInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        preprocessImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  });

  filterCheckbox.addEventListener("change", () => {
    // Store filterCheckbox state in localStorage
    localStorage.setItem("filterCheckboxState", filterCheckbox.checked);
  });

  function preprocessImage(imageDataUrl) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      // Zoom in by scaling the canvas
      const zoomFactor = 2; // Adjust this value for more or less zoom
      canvas.width = img.width * zoomFactor;
      canvas.height = img.height * zoomFactor;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Convert to grayscale
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = avg; // Red
        data[i + 1] = avg; // Green
        data[i + 2] = avg; // Blue
      }

      // Apply sharpening filter
      sharpenImage(data, canvas.width, canvas.height);

      ctx.putImageData(imageData, 0, 0);
      const processedImageDataUrl = canvas.toDataURL();

      // Now use processedImageDataUrl with Tesseract
      processImage(processedImageDataUrl);
    };

    img.src = imageDataUrl;
  }

  function sharpenImage(data, width, height) {
    const kernel = [
      [0, -1, 0],
      [-1, 5, -1],
      [0, -1, 0],
    ];

    const output = new Uint8ClampedArray(data);

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let r = 0,
          g = 0,
          b = 0;

        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4;
            r += data[idx] * kernel[ky + 1][kx + 1];
            g += data[idx + 1] * kernel[ky + 1][kx + 1];
            b += data[idx + 2] * kernel[ky + 1][kx + 1];
          }
        }

        const idx = (y * width + x) * 4;
        output[idx] = Math.min(Math.max(r, 0), 255);
        output[idx + 1] = Math.min(Math.max(g, 0), 255);
        output[idx + 2] = Math.min(Math.max(b, 0), 255);
        output[idx + 3] = 255; // Alpha
      }
    }

    for (let i = 0; i < data.length; i++) {
      data[i] = output[i];
    }
  }

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
  const slMatch = extractedText.match(/SL\s*([\d.]+)/); // Capture SL with decimals
  const tpMatch = extractedText.match(/TP\s*([\d.]+)/); // Capture TP with decimals

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
