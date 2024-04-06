import chroma from 'chroma-js';
import { APCAcontrast, sRGBtoY } from 'apca-w3';
import Color from 'colorjs.io';

const luminositySlider = document.getElementById('luminosityInput');
const luminosityDisplay = document.getElementById('luminosityValue');
// const colorQuantitySlider = document.getElementById('colorCountInput');
// const colorQuantityDisplay = document.getElementById('colorCountValue');
const distinctThresholdSlider = document.getElementById('thresholdInput');
const distinctThresholdDisplay = document.getElementById('thresholdValue');
const saturationSlider = document.getElementById('saturationInput');
const saturationDisplay = document.getElementById('saturationValue');
const colorGridElement = document.getElementById('colorGrid');

function determineTextColor(backgroundColor) {
  const backgroundLuminance = sRGBtoY(chroma(backgroundColor).rgb());
  const colorsWithOpacity = {
    white: [255, 255, 255, 0.92],
    black: [0, 0, 0, 0.92],
  };
  const contrastWithWhite = APCAcontrast(
    sRGBtoY(chroma(colorsWithOpacity.white).rgb()),
    backgroundLuminance,
  );
  const contrastWithBlack = APCAcontrast(
    sRGBtoY(chroma(colorsWithOpacity.black).rgb()),
    backgroundLuminance,
  );

  return Math.abs(contrastWithWhite) > Math.abs(contrastWithBlack)
    ? `rgba(${colorsWithOpacity.white.join(',')})`
    : `rgba(${colorsWithOpacity.black.join(',')})`;
}

function filterUniqueColors(colors, minimumDistance) {
  const uniqueColors = [];
  colors.forEach((color) => {
    const isUnique = uniqueColors.every(
      (uniqueColor) => chroma.distance(color, uniqueColor) >= minimumDistance,
    );
    if (isUnique) {
      uniqueColors.push(color);
    }
  });
  return uniqueColors;
}

function generateColorPalette(colorQuantity, luminosity, chromaValue) {
  let colors = [];
  const startHue = 60; // Starting hue at 60 degrees
  for (let i = 0; i < colorQuantity; i++) {
    const hue = startHue + (i / colorQuantity) * 300; // Adjust hue range to start at 60
    const color = chroma.lch(luminosity, chromaValue, hue); // Use LCH color space with dynamic luminosity and chroma
    colors.push(color.hex()); // Convert to hex and add to the array
  }
  return colors;
}

function createColorBlock(color) {
  const colorBlock = document.createElement('div');
  colorBlock.style.backgroundColor = color;
  colorBlock.style.color = determineTextColor(color);
  colorBlock.innerText = chroma(color).hex();
  return colorBlock;
}

function updateColorCountDisplay(colorPaletteLength) {
  const colorCountDisplay = document.getElementById('colorCountDisplay');
  colorCountDisplay.textContent = colorPaletteLength;
}

function refreshColorGrid() {
  const colorQuantity = 200;
  const luminosity = parseFloat(luminositySlider.value);
  const distinctThreshold = parseInt(distinctThresholdSlider.value);
  const chromaValue = parseFloat(saturationSlider.value);

  let colorPalette = generateColorPalette(
    colorQuantity,
    luminosity,
    chromaValue,
  );
  colorPalette = filterUniqueColors(colorPalette, distinctThreshold);

  colorGridElement.innerHTML = '';
  colorPalette.forEach((color) => {
    const colorBlock = createColorBlock(color);
    colorGridElement.appendChild(colorBlock);
  });

  updateColorCountDisplay(colorPalette.length);
}

luminositySlider.addEventListener('input', () => {
  luminosityDisplay.textContent = luminositySlider.value;
  refreshColorGrid();
});

// colorQuantitySlider.addEventListener('input', () => {
//   colorQuantityDisplay.textContent = colorQuantitySlider.value;
//   refreshColorGrid();
// });

distinctThresholdSlider.addEventListener('input', () => {
  distinctThresholdDisplay.textContent = distinctThresholdSlider.value;
  refreshColorGrid();
});

saturationSlider.addEventListener('input', () => {
  saturationDisplay.textContent = saturationSlider.value;
  refreshColorGrid();
});

refreshColorGrid();

// color js
