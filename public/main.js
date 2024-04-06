import chroma from 'chroma-js';
import { APCAcontrast, sRGBtoY } from 'apca-w3';

const luminositySlider = document.getElementById('luminosityInput');
const luminosityDisplay = document.getElementById('luminosityValue');
const distinctThresholdSlider = document.getElementById('thresholdInput');
const distinctThresholdDisplay = document.getElementById('thresholdValue');
const saturationSlider = document.getElementById('saturationInput');
const saturationDisplay = document.getElementById('saturationValue');
const colorGridElement = document.getElementById('colorGrid');

function determineTextColor(backgroundColor) {
  const backgroundLuminance = sRGBtoY(chroma(backgroundColor).rgb());

  const whiteLuminance = sRGBtoY([255, 255, 255]);
  const blackLuminance = sRGBtoY([0, 0, 0]);

  const contrastWithWhite = APCAcontrast(whiteLuminance, backgroundLuminance);
  const contrastWithBlack = APCAcontrast(blackLuminance, backgroundLuminance);

  return Math.abs(contrastWithWhite) > Math.abs(contrastWithBlack)
    ? 'rgba(255, 255, 255, 0.92)'
    : 'rgba(0, 0, 0, 0.92)';
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
  const startHue = 16;
  for (let i = 0; i < colorQuantity; i++) {
    const hue = startHue + (i / colorQuantity) * 344;
    const color = chroma.oklch(luminosity, chromaValue, hue);
    colors.push(color);
  }
  return colors;
}

function createColorBlock(color) {
  const colorBlock = document.createElement('div');
  const [l, c, h] = color.oklch();
  colorBlock.style.backgroundColor = `oklch(${l} ${c} ${h})`;
  colorBlock.style.color = determineTextColor(color.hex());
  colorBlock.innerText = color.hex();
  return colorBlock;
}

function updateColorCountDisplay(colorPaletteLength) {
  const colorCountDisplay = document.getElementById('colorCountDisplay');
  colorCountDisplay.textContent = colorPaletteLength;
}

function refreshColorGrid() {
  const colorQuantity = 200;
  const luminosity = parseFloat(luminositySlider.value) / 100;
  const chromaValue = parseFloat(saturationSlider.value) / 100;
  const distinctThreshold = parseInt(distinctThresholdSlider.value);

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

distinctThresholdSlider.addEventListener('input', () => {
  distinctThresholdDisplay.textContent = distinctThresholdSlider.value;
  refreshColorGrid();
});

saturationSlider.addEventListener('input', () => {
  saturationDisplay.textContent = saturationSlider.value;
  refreshColorGrid();
});

refreshColorGrid();
