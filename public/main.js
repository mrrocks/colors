import chroma from 'chroma-js';
import { APCAcontrast } from 'apca-w3';

const luminositySlider = document.getElementById('luminosityInput');
const luminosityDisplay = document.getElementById('luminosityValue');
const colorQuantitySlider = document.getElementById('colorCountInput');
const colorQuantityDisplay = document.getElementById('colorCountValue');
const distinctThresholdSlider = document.getElementById('thresholdInput');
const distinctThresholdDisplay = document.getElementById('thresholdValue');
const colorGridElement = document.getElementById('colorGrid');

function convertSRGBToLuminance(color) {
  const [r, g, b] = color.map((c) => c / 255);
  const R = r <= 0.04045 ? r / 12.92 : ((r + 0.055) / 1.055) ** 2.4;
  const G = g <= 0.04045 ? g / 12.92 : ((g + 0.055) / 1.055) ** 2.4;
  const B = b <= 0.04045 ? b / 12.92 : ((b + 0.055) / 1.055) ** 2.4;
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function determineTextColor(backgroundColor) {
  const backgroundLuminance = convertSRGBToLuminance(
    chroma(backgroundColor).rgb(),
  );
  const contrastWithWhite = APCAcontrast(
    convertSRGBToLuminance([255, 255, 255]),
    backgroundLuminance,
  );
  const contrastWithBlack = APCAcontrast(
    convertSRGBToLuminance([0, 0, 0]),
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

function refreshColorGrid() {
  const luminosity = parseFloat(luminositySlider.value);
  const colorQuantity = parseInt(colorQuantitySlider.value);
  const distinctThreshold = parseInt(distinctThresholdSlider.value);
  let colorPalette = chroma
    .scale(['gray', ...chroma.brewer.Spectral])
    .mode('lch')
    .colors(colorQuantity)
    .map((color) => chroma(color).luminance(luminosity));
  colorPalette = filterUniqueColors(colorPalette, distinctThreshold);
  colorGridElement.innerHTML = '';
  colorPalette.forEach((color) => {
    const colorBlock = document.createElement('div');
    colorBlock.style.backgroundColor = color;
    colorBlock.style.color = determineTextColor(color);
    colorBlock.innerText = chroma(color).hex();
    colorGridElement.appendChild(colorBlock);
  });
  const colorCountDisplay = document.getElementById('colorCountDisplay');
  colorCountDisplay.textContent = colorPalette.length;
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

refreshColorGrid();
