import chroma from 'chroma-js';
import { APCAcontrast, sRGBtoY } from 'apca-w3';

const lumSlider = document.getElementById('lumInput');
const lumDisplay = document.getElementById('lumValue');
const diffSlider = document.getElementById('diffInput');
const diffDisplay = document.getElementById('diffValue');
const chromaSlider = document.getElementById('chromaInput');
const chromaDisplay = document.getElementById('chromaValue');
const resetButton = document.getElementById('resetButton');
const exportButton = document.getElementById('exportButton');
const grid = document.getElementById('colorGrid');

let palette = [];

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
  const startHue = 12;
  const endHue = 360;
  const quantity = endHue - startHue;

  for (let i = 0; i < quantity; i++) {
    const hue = startHue + (i / quantity) * (endHue - startHue);
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

  palette = colorPalette(lum, chromaVal); // Update the global palette variable
  palette = uniqueColors(palette, diff);

  grid.innerHTML = '';
  palette.forEach((color) => {
    const block = colorBlock(color);
    grid.appendChild(block);
  });

  updateCount(palette.length);

  localStorage.setItem('lum', lumSlider.value);
  localStorage.setItem('chroma', chromaSlider.value);
  localStorage.setItem('diff', diffSlider.value);
}

function initSliderAndDisplay(slider, display, defaultValue) {
  const updateUI = (value) => {
    slider.value = value;
    display.value = value;
    slider.style.backgroundSize =
      ((value - slider.min) / (slider.max - slider.min)) * 100 + '% 100%';
    refreshGrid();
  };

  const storedValue = localStorage.getItem(slider.id) || defaultValue;
  updateUI(storedValue);

  slider.addEventListener('input', () => {
    localStorage.setItem(slider.id, slider.value);
    updateUI(slider.value);
  });

  display.addEventListener('input', () => {
    const value = display.value;
    localStorage.setItem(slider.id, value);
    updateUI(value);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initSliderAndDisplay(lumSlider, lumDisplay, 74);
  initSliderAndDisplay(chromaSlider, chromaDisplay, 14);
  initSliderAndDisplay(diffSlider, diffDisplay, 10);
  refreshGrid();
});

resetButton.addEventListener('click', () => {
  const defaultValues = {
    lumInput: 74,
    chromaInput: 14,
    diffInput: 10,
  };

  Object.entries(defaultValues).forEach(([id, defaultValue]) => {
    const slider = document.getElementById(id);
    const display = document.getElementById(id.replace('Input', 'Value'));

    slider.value = defaultValue;
    display.value = defaultValue;
    localStorage.setItem(id, defaultValue);

    slider.style.backgroundSize =
      ((defaultValue - slider.min) / (slider.max - slider.min)) * 100 +
      '% 100%';
  });

  refreshGrid();
});

exportButton.addEventListener('click', () => {
  const format = document.getElementById('colorFormat').value;
  let colorText = palette
    .map((color) => {
      switch (format) {
        case 'hex':
          return color.hex();
        case 'rgb':
          return `rgb(${color.rgb().join(', ')})`;
        case 'oklch': {
          const [l, c, h] = color.oklch();
          return `oklch(${l} ${c} ${h})`;
        }
        default:
          return '';
      }
    })
    .join('\n');

  const blob = new Blob([colorText], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'colors.txt';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

refreshGrid();
