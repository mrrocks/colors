import chroma from 'chroma-js';
import { APCAcontrast, sRGBtoY } from 'apca-w3';
import blinder from 'color-blind';
import Color from 'colorjs.io';

const lumSlider = document.getElementById('lumInput');
const diffSlider = document.getElementById('diffInput');
const chromaSlider = document.getElementById('chromaInput');
const resetButton = document.getElementById('resetButton');
const exportButton = document.getElementById('exportButton');
const grid = document.getElementById('colorGrid');

let palette = [];

const defaultValues = {
  lumInput: 74,
  chromaInput: 14,
  diffInput: 10,
  colorBlindMode: false,
  colorFormat: 'hex',
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

function colorPalette(lum, chromaVal) {
  let colors = [];
  const startHue = 0;
  const endHue = 360;
  const quantity = endHue - startHue;

  for (let i = 0; i < quantity; i++) {
    const hue = startHue + (i / quantity) * (endHue - startHue);
    let color = chroma.oklch(lum, chromaVal, hue);
    let colorjsColor = new Color(`oklch(${lum} ${chromaVal} ${hue})`);

    if (colorjsColor.inGamut('p3')) {
      colors.push(color);
    }
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

  const format = document.getElementById('colorFormat').value;
  let colorText;
  switch (format) {
    case 'hex':
      colorText = color.hex();
      break;
    case 'rgb':
      colorText = color.rgb().join(', ');
      break;
    case 'oklch':
      colorText = `${l}, ${c}, ${h}`;
      break;
    default:
      colorText = color.hex();
  }
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

  block.appendChild(document.createTextNode(colorText));
  block.appendChild(deltaSpan);

  return block;
}

function updateCount(length) {
  const display = document.getElementById('colorCount');
  display.textContent = length;
}

function refreshGrid() {
  requestAnimationFrame(() => {
    updatePalette();
    renderPalette();
    updateCount(palette.length);
    saveSettings();
    updateURLParameters();
  });
}

function updatePalette() {
  const lum = parseFloat(lumSlider.value) / 100;
  const chromaVal = parseFloat(chromaSlider.value) / 100;
  const diff = parseInt(diffSlider.value);

  const newPalette = colorPalette(lum, chromaVal);
  const uniqueNewPalette = uniqueColors(newPalette, diff);

  if (paletteChanged(palette, uniqueNewPalette)) {
    palette = uniqueNewPalette;
  }
}

function paletteChanged(oldPalette, newPalette) {
  return (
    oldPalette.length !== newPalette.length ||
    !oldPalette.every((val, index) => val.hex() === newPalette[index].hex())
  );
}

function renderPalette() {
  if (paletteChanged(palette, [])) {
    grid.innerHTML = '';
    const fragment = document.createDocumentFragment();
    palette.forEach((color, index) => {
      const nextColor = palette[index + 1] || palette[0];
      const block = colorBlock(color, nextColor);
      fragment.appendChild(block);
    });
    grid.appendChild(fragment);
  }
}

function saveSettings() {
  localStorage.setItem('lum', lumSlider.value);
  localStorage.setItem('chroma', chromaSlider.value);
  localStorage.setItem('diff', diffSlider.value);
  localStorage.setItem(
    'colorBlindMode',
    document.getElementById('colorBlindMode').checked,
  );
  localStorage.setItem(
    'colorFormat',
    document.getElementById('colorFormat').value,
  );
}

function updateURLParameters() {
  const queryParams = new URLSearchParams(window.location.search);
  queryParams.set('L', lumSlider.value);
  queryParams.set('C', chromaSlider.value);
  queryParams.set('D', diffSlider.value);
  queryParams.set(
    'CB',
    document.getElementById('colorBlindMode').checked ? 'ON' : 'OFF',
  );
  queryParams.set('F', document.getElementById('colorFormat').value);
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

function initSliderAndDisplay(slider, display, defaultValue) {
  const initialValue = localStorage.getItem(slider.id) || defaultValue;
  updateUI(slider, display, initialValue);

  slider.addEventListener('input', () => {
    localStorage.setItem(slider.id, slider.value);
    updateUI(slider, display, slider.value);
    refreshGrid();
  });

  display.addEventListener('input', () => {
    localStorage.setItem(slider.id, display.value);
    updateUI(slider, display, display.value);
    refreshGrid();
  });
}

function resetSlidersAndDisplays() {
  Object.entries(defaultValues).forEach(([id, defaultValue]) => {
    if (id === 'colorBlindMode' || id === 'colorFormat') {
      const element = document.getElementById(id);
      if (id === 'colorBlindMode') {
        element.checked = defaultValue;
      } else {
        element.value = defaultValue;
      }
      localStorage.setItem(id, defaultValue);
    } else {
      const slider = document.getElementById(id);
      const display = document.getElementById(id.replace('Input', 'Value'));
      slider.value = defaultValue;
      display.value = defaultValue;
      localStorage.setItem(id, defaultValue);
      updateSliderBackground(slider, defaultValue);
    }
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
  document
    .getElementById('colorBlindMode')
    .addEventListener('change', refreshGrid);

  document
    .getElementById('colorFormat')
    .addEventListener('change', refreshGrid);
}

function init() {
  setupEventListeners();
  Object.entries(defaultValues).forEach(([id, value]) => {
    const slider = document.getElementById(id);
    const display = document.getElementById(`${id.replace('Input', 'Value')}`);
    initSliderAndDisplay(slider, display, value.toString());
  });

  const colorBlindModeCheckbox = document.getElementById('colorBlindMode');
  const colorBlindMode = localStorage.getItem('colorBlindMode') === 'true';
  colorBlindModeCheckbox.checked = colorBlindMode;

  const colorFormatSelect = document.getElementById('colorFormat');
  const colorFormat = localStorage.getItem('colorFormat') || 'hex';
  colorFormatSelect.value = colorFormat;

  refreshGrid();
}

init();
