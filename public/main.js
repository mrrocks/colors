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
  lumInput: 78,
  chromaInput: 14,
  diffInput: 10,
  colorBlindMode: false,
  colorFormat: 'hex',
  p3Mode: false,
};

function updateCount(length) {
  colorCount.textContent = length;
}

export function refreshGrid(isReset = false) {
  requestAnimationFrame(() => {
    const settings = isReset
      ? defaultValues
      : {
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
    saveSettings({
      lumInput: lumSlider.value,
      chromaInput: chromaSlider.value,
      diffInput: diffSlider.value,
      colorBlindMode: colorBlindModeCheckbox.checked,
      colorFormat: colorFormatSelect.value,
      p3Mode: p3ModeCheckbox.checked,
    });
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
  const lum = settings.lum ?? defaultValues.lumInput / 100;
  const chroma = settings.chroma ?? defaultValues.chromaInput / 100;
  const diff = settings.diff ?? defaultValues.diffInput;

  const newPalette = generatePalette(
    lum,
    chroma,
    diff,
    settings.colorBlindMode,
    settings.p3Mode,
  );
  palette = newPalette;
}

export function syncValues(slider, input, value) {
  slider.value = value;
  input.value = value;
  updateSliderBackground(slider, value);
}

function syncSliderAndInput(slider, input, defaultValue) {
  const storedValue = localStorage.getItem(slider.id) || defaultValue;
  syncValues(slider, input, storedValue);

  slider.oninput = () => {
    syncValues(slider, input, slider.value);
    refreshGrid();
  };
  input.oninput = () => {
    syncValues(slider, input, input.value);
    refreshGrid();
  };
}

function setupEventListeners() {
  resetButton.addEventListener('click', () =>
    resetControls(
      {
        lumSlider: lumSlider,
        chromaSlider: chromaSlider,
        diffSlider: diffSlider,
        colorBlindModeCheckbox: colorBlindModeCheckbox,
        colorFormatSelect: colorFormatSelect,
        p3ModeCheckbox: p3ModeCheckbox,
      },
      defaultValues,
    ),
  );
  exportButton.addEventListener('click', () =>
    exportColors(palette, colorFormatSelect.value),
  );
  colorBlindModeCheckbox.addEventListener('change', () => refreshGrid());
  p3ModeCheckbox.addEventListener('change', () => refreshGrid());
  colorFormatSelect.addEventListener('change', () => refreshGrid());
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
