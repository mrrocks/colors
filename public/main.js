import chroma from 'chroma-js';
import { APCAcontrast, sRGBtoY } from 'apca-w3';

const luminositySlider = document.getElementById('luminosityInput');
const luminosityDisplay = document.getElementById('luminosityValue');
const colorQuantitySlider = document.getElementById('colorCountInput');
const colorQuantityDisplay = document.getElementById('colorCountValue');
const distinctThresholdSlider = document.getElementById('thresholdInput');
const distinctThresholdDisplay = document.getElementById('thresholdValue');
const saturationSlider = document.getElementById('saturationInput');
const saturationDisplay = document.getElementById('saturationValue');
const colorGridElement = document.getElementById('colorGrid');

function determineTextColor(backgroundColor) {
  const backgroundLuminance = sRGBtoY(chroma(backgroundColor).rgb());
  const contrastWithWhite = APCAcontrast(
    sRGBtoY([255, 255, 255]),
    backgroundLuminance,
  );
  const contrastWithBlack = APCAcontrast(
    sRGBtoY([0, 0, 0]),
    backgroundLuminance,
  );
  return Math.abs(contrastWithWhite) > Math.abs(contrastWithBlack)
    ? 'white'
    : 'black';
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

function generateColorPalette(colorQuantity, luminosity, saturation) {
  let colors = chroma
    .scale(['gray', ...chroma.brewer.Spectral])
    .mode('lch')
    .colors(colorQuantity)
    .map((color) => chroma(color).luminance(luminosity));

  if (saturation !== 1) {
    colors = colors.map((color) => chroma(color).saturate(saturation - 1));
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
  const luminosity = parseFloat(luminositySlider.value);
  const colorQuantity = parseInt(colorQuantitySlider.value);
  const distinctThreshold = parseInt(distinctThresholdSlider.value);
  const saturation = parseFloat(saturationSlider.value);

  let colorPalette = generateColorPalette(
    colorQuantity,
    luminosity,
    saturation,
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

colorQuantitySlider.addEventListener('input', () => {
  colorQuantityDisplay.textContent = colorQuantitySlider.value;
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
