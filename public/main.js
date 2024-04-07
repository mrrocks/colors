import chroma from 'chroma-js';
import { APCAcontrast, sRGBtoY } from 'apca-w3';

const lumSlider = document.getElementById('lumInput');
const lumDisplay = document.getElementById('lumValue');
const diffSlider = document.getElementById('diffInput');
const diffDisplay = document.getElementById('diffValue');
const chromaSlider = document.getElementById('chromaInput');
const chromaDisplay = document.getElementById('chromaValue');
const grid = document.getElementById('colorGrid');

function textColor(bgColor) {
  const bgLum = sRGBtoY(chroma(bgColor).rgb());
  const whiteLum = sRGBtoY([255, 255, 255]);
  const blackLum = sRGBtoY([0, 0, 0]);
  const contrastWhite = APCAcontrast(whiteLum, bgLum);
  const contrastBlack = APCAcontrast(blackLum, bgLum);
  return Math.abs(contrastWhite) > Math.abs(contrastBlack)
    ? 'rgba(255, 255, 255, 0.92)'
    : 'rgba(0, 0, 0, 0.92)';
}

function uniqueColors(colors, minDist) {
  const unique = [];
  colors.forEach((color) => {
    const isUnique = unique.every(
      (uc) => chroma.distance(color, uc) >= minDist,
    );
    if (isUnique) unique.push(color);
  });
  return unique;
}

function colorPalette(lum, chromaVal) {
  let colors = [];
  const startHue = 16;
  const endHue = 360 - startHue;
  const quantity = endHue - startHue + 1;

  for (let i = 0; i < quantity; i++) {
    const hue = startHue + (i / (quantity - 1)) * (endHue - startHue);
    colors.push(chroma.oklch(lum, chromaVal, hue));
  }
  return colors;
}

function colorBlock(color) {
  const block = document.createElement('div');
  const [l, c, h] = color.oklch();
  block.style.backgroundColor = `oklch(${l} ${c} ${h})`;
  block.style.color = textColor(color.hex());
  block.innerText = color.hex();
  return block;
}

function updateCount(length) {
  const display = document.getElementById('colorCount');
  display.textContent = length;
}

function refreshGrid() {
  const lum = parseFloat(lumSlider.value) / 100;
  const chromaVal = parseFloat(chromaSlider.value) / 100;
  const diff = parseInt(diffSlider.value);

  let palette = colorPalette(lum, chromaVal);
  palette = uniqueColors(palette, diff);

  grid.innerHTML = '';
  palette.forEach((color) => {
    const block = colorBlock(color);
    grid.appendChild(block);
  });

  updateCount(palette.length);
}

// Range

const initSliderBackground = (slider) => {
  const min = slider.min;
  const max = slider.max;
  const currentVal = slider.value;
  slider.style.backgroundSize =
    ((currentVal - min) / (max - min)) * 100 + '% 100%';
};

[lumSlider, diffSlider, chromaSlider].forEach((slider) => {
  initSliderBackground(slider);

  slider.addEventListener('input', () => initSliderBackground(slider));
});

// Event Listeners

lumSlider.addEventListener('input', () => {
  lumDisplay.textContent = lumSlider.value;
  refreshGrid();
});

diffSlider.addEventListener('input', () => {
  diffDisplay.textContent = diffSlider.value;
  refreshGrid();
});

chromaSlider.addEventListener('input', () => {
  chromaDisplay.textContent = chromaSlider.value;
  refreshGrid();
});

refreshGrid();
