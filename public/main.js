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
  const startHue = 16;
  for (let i = 0; i < colorQuantity; i++) {
    const hue = startHue + (i / colorQuantity) * 344;
    const color = chroma.lch(luminosity, chromaValue, hue);
    colors.push(color);
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

distinctThresholdSlider.addEventListener('input', () => {
  distinctThresholdDisplay.textContent = distinctThresholdSlider.value;
  refreshColorGrid();
});

saturationSlider.addEventListener('input', () => {
  saturationDisplay.textContent = saturationSlider.value;
  refreshColorGrid();
});

refreshColorGrid();
