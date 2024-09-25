const SimpleOCR = {
  getImageData: function(img) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0, img.width, img.height);
    return ctx.getImageData(0, 0, img.width, img.height);
  },

  binarize: function(imgData, threshold) {
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      const value = avg > threshold ? 255 : 0;
      data[i] = data[i + 1] = data[i + 2] = value;
    }
    return imgData;
  },

  recognizeText: function(imgData) {
    const width = imgData.width;
    const height = imgData.height;
    const data = imgData.data;
    let text = '';

    // Improved character recognition
    const charMap = {
      '0000000001111110011000110110001101100011011000110110001101100011011111100000000': '0',
      '0000000000011000001110000001100000011000000110000001100000011000001111100000000': '1',
      '0000000001111110011000110000001100000110000011000001100000110000000111111100000': '2',
      '0000000001111110011000110000001100001110000000110000001101100011011111100000000': '3',
      '0000000000001100000111000011010001100100110001101111111100001100000011000000000': '4',
      '0000000011111110110000001100000011111110000000110000001101100011011111100000000': '5',
      '0000000000111100011000001100000011111110110000110110001101100011011111100000000': '6',
      '0000000011111110110001100000011000001100000110000011000001100000011000000000000': '7',
      '0000000001111110011000110110001101111110110000110110001101100011011111100000000': '8',
      '0000000001111110011000110110001101100011011111110000001100000110011111000000000': '9',
      '0000000001111110011000110110001101100011011111110110001101100011011000110000000': 'B',
      '0000000001111110011000110110000001100000011000000110000001100011011111100000000': 'C',
      '0000000011111100011000110110001101100011011000110110001101100011111111000000000': 'D',
      '0000000011111110110000001100000011111100110000001100000011000000111111100000000': 'E',
      '0000000011111110110000001100000011111100110000001100000011000000110000000000000': 'F',
    };

    const charWidth = 11;
    const charHeight = 12;

    for (let y = 0; y < height; y += charHeight) {
      for (let x = 0; x < width; x += charWidth) {
        let charSignature = '';
        for (let cy = 0; cy < charHeight; cy++) {
          for (let cx = 0; cx < charWidth; cx++) {
            const index = ((y + cy) * width + (x + cx)) * 4;
            charSignature += data[index] === 0 ? '1' : '0';
          }
        }
        text += charMap[charSignature] || ' ';
      }
      text += '\n';
    }
    return text;
  },

  process: function(imageUrl) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const imgData = this.getImageData(img);
        const binarizedData = this.binarize(imgData, 128);
        const text = this.recognizeText(binarizedData);
        resolve(text);
      };
      img.onerror = reject;
      img.src = imageUrl;
    });
  }
};
