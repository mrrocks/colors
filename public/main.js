import chroma from 'chroma-js';
import { APCAcontrast, sRGBtoY } from 'apca-w3';
import blinder from 'color-blind';

const lumSlider = document.getElementById('lumInput');
const diffSlider = document.getElementById('diffInput');
const chromaSlider = document.getElementById('chromaInput');
const resetButton = document.getElementById('resetButton');
const exportButton = document.getElementById('exportButton');
const grid = document.getElementById('colorGrid');

document
  .getElementById('colorBlindMode')
  .addEventListener('change', refreshGrid);

let palette = [];

const defaultValues = {
  lumInput: 74,
  chromaInput: 14,
  diffInput: 10,
};

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

document
  .getElementById('colorBlindMode')
  .addEventListener('change', refreshGrid);

function colorPalette(lum, chromaVal) {
  let colors = [];
  const startHue = 12;
  const endHue = 360;
  const quantity = endHue - startHue;

  for (let i = 0; i < quantity; i++) {
    const hue = startHue + (i / quantity) * (endHue - startHue);
    let color = chroma.oklch(lum, chromaVal, hue).hex();
    colors.push(chroma(color));
  }
  return colors;
}

function uniqueColors(colors, minDist) {
  const unique = [];
  const isColorBlindMode = document.getElementById('colorBlindMode').checked;

  colors.forEach((color) => {
    const isUnique = unique.every((uc) => {
      let distance = chroma.deltaE(color.hex(), uc.hex());

      if (isColorBlindMode) {
        const colorDeuteranomaly = chroma(
          blinder.deuteranomaly(color.hex()),
        ).hex();
        const ucDeuteranomaly = chroma(blinder.deuteranomaly(uc.hex())).hex();
        const distanceDeuteranomaly = chroma.deltaE(
          colorDeuteranomaly,
          ucDeuteranomaly,
        );
        distance = Math.min(distance, distanceDeuteranomaly);
      }

      return distance >= minDist;
    });

    if (isUnique) unique.push(color);
  });

  return unique;
}

function colorBlock(color, nextColor, firstColor) {
  const block = document.createElement('div');
  const [l, c, h] = color.oklch();
  block.style.backgroundColor = `oklch(${l} ${c} ${h})`;
  block.style.color = textColor(color.hex());

  const formatDelta = (delta) =>
    `${(Math.round(delta * 10) / 10).toFixed(1)}% ▸`;

  const deltaNext = formatDelta(
    nextColor
      ? chroma.deltaE(color, nextColor)
      : chroma.deltaE(color, firstColor),
  );

  const deltaSpan = document.createElement('span');
  deltaSpan.className = 'deltas';
  deltaSpan.innerHTML = deltaNext;
  deltaSpan.title = 'Relative color difference against next color';

  block.appendChild(document.createTextNode(color.hex()));
  block.appendChild(deltaSpan);

  return block;
}

function updateCount(length) {
  const display = document.getElementById('colorCount');
  display.textContent = length;
}

function refreshGrid() {
  requestAnimationFrame(() => {
    const lum = parseFloat(lumSlider.value) / 100;
    const chromaVal = parseFloat(chromaSlider.value) / 100;
    const diff = parseInt(diffSlider.value);

    const newPalette = colorPalette(lum, chromaVal);
    const uniqueNewPalette = uniqueColors(newPalette, diff);

    if (
      palette.length !== uniqueNewPalette.length ||
      !palette.every(
        (val, index) => val.hex() === uniqueNewPalette[index].hex(),
      )
    ) {
      palette = uniqueNewPalette;
      grid.innerHTML = '';
      palette.forEach((color, index) => {
        const nextColor = palette[index + 1] || palette[0];
        const block = colorBlock(color, nextColor);
        grid.appendChild(block);
      });
    }

    updateCount(palette.length);
    localStorage.setItem('lum', lumSlider.value);
    localStorage.setItem('chroma', chromaSlider.value);
    localStorage.setItem('diff', diffSlider.value);

    updateURLParameters();
  });
}

function updateURLParameters() {
  const queryParams = new URLSearchParams(window.location.search);
  queryParams.set('L', lumSlider.value);
  queryParams.set('C', chromaSlider.value);
  queryParams.set('D', diffSlider.value);
  history.replaceState(null, null, '?' + queryParams.toString());
}

function updateSliderBackground(slider, value) {
  slider.style.backgroundSize = `${((value - slider.min) / (slider.max - slider.min)) * 100}% 100%`;
}

function updateUI(slider, display, value) {
  slider.value = value;
  display.value = value;
  updateSliderBackground(slider, value);
  refreshGrid();
  updateURLParameters();
}

function saveToLocalStorage(key, value) {
  localStorage.setItem(key, value);
}

function getFromLocalStorage(key, defaultValue) {
  return localStorage.getItem(key) || defaultValue;
}

function initSliderAndDisplay(slider, display, defaultValue) {
  const initialValue = getInitialValue(slider, defaultValue);
  updateUI(slider, display, initialValue);

  slider.addEventListener('input', () => {
    saveToLocalStorage(slider.id, slider.value);
    updateUI(slider, display, slider.value);
    refreshGrid();
  });

  display.addEventListener('input', () => {
    saveToLocalStorage(slider.id, display.value);
    updateUI(slider, display, display.value);
    refreshGrid();
  });
}

function getInitialValue(slider, defaultValue) {
  const queryParams = new URLSearchParams(window.location.search);
  const urlValue = queryParams.get(slider.id);
  return urlValue || getFromLocalStorage(slider.id, defaultValue);
}

function resetSlidersAndDisplays() {
  Object.entries(defaultValues).forEach(([id, defaultValue]) => {
    const slider = document.getElementById(id);
    const display = document.getElementById(id.replace('Input', 'Value'));

    slider.value = defaultValue;
    display.value = defaultValue;
    saveToLocalStorage(id, defaultValue);
    updateSliderBackground(slider, defaultValue);
  });

  refreshGrid();
}

function exportColors() {
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
}

function setupEventListeners() {
  resetButton.addEventListener('click', resetSlidersAndDisplays);
  exportButton.addEventListener('click', exportColors);
}

function init() {
  setupEventListeners();
  Object.entries(defaultValues).forEach(([id, value]) => {
    const slider = document.getElementById(id);
    const display = document.getElementById(`${id.replace('Input', 'Value')}`);
    initSliderAndDisplay(slider, display, value.toString());
  });
}

init();
