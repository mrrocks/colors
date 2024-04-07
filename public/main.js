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

function colorPalette(quantity, lum, chromaVal) {
  let colors = [];
  const startHue = 16;
  for (let i = 0; i < quantity; i++) {
    const hue = startHue + (i / quantity) * 344;
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
  const quantity = 200;
  const lum = parseFloat(lumSlider.value) / 100;
  const chromaVal = parseFloat(chromaSlider.value) / 100;
  const diff = parseInt(diffSlider.value);

  let palette = colorPalette(quantity, lum, chromaVal);
  palette = uniqueColors(palette, diff);

  grid.innerHTML = '';
  palette.forEach((color) => {
    const block = colorBlock(color);
    grid.appendChild(block);
  });

  updateCount(palette.length);
}

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
