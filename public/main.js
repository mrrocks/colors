import { generatePalette } from './paletteGenerator.js';
import { renderPalette } from './colorGridRenderer.js';
import { exportColors } from './exportColors.js';
import { resetControls } from './resetControls.js';
import { updateURLParameters } from './urlParamsManager.js';
import { saveSettings } from './saveSettings.js';
import { updateSliderBackground } from './utils.js';

const colorCount = document.getElementById('colorCount');
const lumSlider = document.getElementById('lumInput');
const chromaSlider = document.getElementById('chromaInput');
const diffSlider = document.getElementById('diffInput');
const resetButton = document.getElementById('resetButton');
const exportButton = document.getElementById('exportButton');
const colorBlindModeCheckbox = document.getElementById('colorBlindMode');
const p3ModeCheckbox = document.getElementById('p3Mode');
const colorFormatSelect = document.getElementById('colorFormat');

let palette = [];

const defaultValues = {
  lumInput: 74,
  chromaInput: 14,
  diffInput: 10,
  colorBlindMode: false,
  colorFormat: 'hex',
  p3Mode: false,
};

function updateCount(length) {
  colorCount.textContent = length;
}

export function refreshGrid() {
  requestAnimationFrame(() => {
    const settings = {
      lum: parseFloat(lumSlider.value) / 100,
      chroma: parseFloat(chromaSlider.value) / 100,
      diff: parseInt(diffSlider.value),
      colorBlindMode: colorBlindModeCheckbox.checked,
      p3Mode: p3ModeCheckbox.checked,
      colorFormat: colorFormatSelect.value,
    };
    updatePalette(settings);
    updateCount(palette.length);
    renderPalette(palette);
    saveSettings(settings);
    updateURLParameters({
      L: lumSlider.value,
      C: chromaSlider.value,
      D: diffSlider.value,
      F: colorFormatSelect.value,
      CB: settings.colorBlindMode ? 'ON' : 'OFF',
      P3: settings.p3Mode ? 'ON' : 'OFF',
    });
  });
}

function updatePalette(settings) {
  const newPalette = generatePalette(
    settings.lum,
    settings.chroma,
    settings.diff,
    settings.colorBlindMode,
    settings.p3Mode,
  );
  palette = newPalette;
}

function syncSliderAndInput(slider, input, defaultValue) {
  const syncValues = (value) => {
    slider.value = input.value = value;
    updateSliderBackground(slider, value);
    localStorage.setItem(slider.id, value);
    refreshGrid();
  };

  const storedValue = localStorage.getItem(slider.id) || defaultValue;
  syncValues(storedValue);

  slider.oninput = () => syncValues(slider.value);
  input.oninput = () => syncValues(input.value);
}

function setupEventListeners() {
  resetButton.addEventListener('click', () => resetControls(defaultValues));
  exportButton.addEventListener('click', () =>
    exportColors(palette, colorFormatSelect.value),
  );
  colorBlindModeCheckbox.addEventListener('change', refreshGrid);
  colorFormatSelect.addEventListener('change', refreshGrid);
  p3ModeCheckbox.addEventListener('change', refreshGrid);
}

function init() {
  setupEventListeners();

  syncSliderAndInput(
    lumSlider,
    document.getElementById('lumValue'),
    defaultValues.lumInput.toString(),
  );
  syncSliderAndInput(
    chromaSlider,
    document.getElementById('chromaValue'),
    defaultValues.chromaInput.toString(),
  );
  syncSliderAndInput(
    diffSlider,
    document.getElementById('diffValue'),
    defaultValues.diffInput.toString(),
  );

  colorFormatSelect.value =
    localStorage.getItem('colorFormat') || defaultValues.colorFormat;
  colorBlindModeCheckbox.checked =
    localStorage.getItem('colorBlindMode') === 'true';
  p3ModeCheckbox.checked = localStorage.getItem('p3Mode') === 'true';

  refreshGrid();
}

init();
