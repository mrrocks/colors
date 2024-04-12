import { generatePalette } from './paletteGenerator.js';
import { renderPalette } from './colorGridRenderer.js';
import { exportColors } from './exportColors.js';
import { resetControls } from './resetControls.js';
import { updateURLParameters, getUrlParams } from './urlParamsManager.js';
import { saveSettings } from './saveSettings.js';
import { updateSliderBackground, debounce } from './utils.js';

const colorCount = document.getElementById('colorCount');
const lightnessSlider = document.getElementById('lightnessInput');
const chromaSlider = document.getElementById('chromaInput');
const distanceSlider = document.getElementById('distanceInput');
const lightnessValue = document.getElementById('lightnessValue');
const chromaValue = document.getElementById('chromaValue');
const distanceValue = document.getElementById('distanceValue');
const resetButton = document.getElementById('resetButton');
const exportButton = document.getElementById('exportButton');
const colorBlindModeCheckbox = document.getElementById('colorBlindMode');
const p3ModeCheckbox = document.getElementById('p3Mode');
const colorFormatSelect = document.getElementById('colorFormat');

let palette = [];

const defaultValues = {
  lightness: 78,
  chroma: 14,
  distance: 10,
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
      ? {
          lightness: defaultValues.lightness / 100,
          chroma: defaultValues.chroma / 100,
          distance: defaultValues.distance,
          colorBlindMode: defaultValues.colorBlindMode,
          p3Mode: defaultValues.p3Mode,
          colorFormat: defaultValues.colorFormat,
        }
      : {
          lightness: parseFloat(lightnessSlider.value) / 100,
          chroma: parseFloat(chromaSlider.value) / 100,
          distance: parseInt(distanceSlider.value),
          colorBlindMode: colorBlindModeCheckbox.checked,
          p3Mode: p3ModeCheckbox.checked,
          colorFormat: colorFormatSelect.value,
        };

    updatePalette(settings);
    updateCount(palette.length);
    renderPalette(palette);
    saveSettings({
      lightness: lightnessSlider.value,
      chroma: chromaSlider.value,
      distance: distanceSlider.value,
      colorBlindMode: colorBlindModeCheckbox.checked,
      colorFormat: colorFormatSelect.value,
      p3Mode: p3ModeCheckbox.checked,
    });
    updateURLParameters({
      lightness: lightnessSlider.value.padStart(2, '0'),
      chroma: chromaSlider.value.padStart(2, '0'),
      distance: distanceSlider.value.padStart(2, '0'),
      colorBlindMode: colorBlindModeCheckbox.checked,
      p3Mode: p3ModeCheckbox.checked,
      colorFormat: colorFormatSelect.value,
    });
  });
}

function updatePalette(settings) {
  const lightness = settings.lightness ?? defaultValues.lightness / 100;
  const chroma = settings.chroma ?? defaultValues.chroma / 100;
  const distance = settings.distance ?? defaultValues.distance;

  const newPalette = generatePalette({
    lightness: lightness,
    chroma: chroma,
    distance: distance,
    colorBlindMode: settings.colorBlindMode,
    p3Mode: settings.p3Mode,
  });
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

  const debouncedRefreshGrid = debounce(refreshGrid, 20);

  slider.oninput = () => {
    syncValues(slider, input, slider.value);
    debouncedRefreshGrid();
  };
  input.oninput = () => {
    syncValues(slider, input, input.value);
    debouncedRefreshGrid();
  };
}

function setupEventListeners() {
  resetButton.addEventListener('click', () =>
    resetControls(
      {
        lightnessSlider: lightnessSlider,
        chromaSlider: chromaSlider,
        distanceSlider: distanceSlider,
        colorBlindModeCheckbox: colorBlindModeCheckbox,
        colorFormatSelect: colorFormatSelect,
        p3ModeCheckbox: p3ModeCheckbox,
      },
      defaultValues,
    ),
  );
  exportButton.addEventListener('click', () => exportColors(palette, colorFormatSelect.value));
  colorBlindModeCheckbox.addEventListener('change', () => refreshGrid());
  p3ModeCheckbox.addEventListener('change', () => refreshGrid());
  colorFormatSelect.addEventListener('change', () => refreshGrid());
}

function initializeSettings() {
  const urlParams = getUrlParams();

  const settings = {
    lightness: urlParams.lightness || localStorage.getItem('lightness') || defaultValues.lightness,
    chroma: urlParams.chroma || localStorage.getItem('chroma') || defaultValues.chroma,
    distance: urlParams.distance || localStorage.getItem('distance') || defaultValues.distance,
    colorFormat:
      urlParams.colorFormat || localStorage.getItem('colorFormat') || defaultValues.colorFormat,
    colorBlindMode:
      urlParams.colorBlindMode !== null
        ? urlParams.colorBlindMode
        : localStorage.getItem('colorBlindMode') === 'true' || defaultValues.colorBlindMode,
    p3Mode:
      urlParams.p3Mode !== null
        ? urlParams.p3Mode
        : localStorage.getItem('p3Mode') === 'true' || defaultValues.p3Mode,
  };

  syncValues(lightnessSlider, document.getElementById('lightnessValue'), settings.lightness);
  syncValues(chromaSlider, document.getElementById('chromaValue'), settings.chroma);
  syncValues(distanceSlider, document.getElementById('distanceValue'), settings.distance);
  colorBlindModeCheckbox.checked = settings.colorBlindMode;
  p3ModeCheckbox.checked = settings.p3Mode;
  colorFormatSelect.value = settings.colorFormat;

  refreshGrid();
}

function init() {
  document.addEventListener('DOMContentLoaded', () => {
    initializeSettings();
    setupEventListeners();
    syncSliderAndInput(lightnessSlider, lightnessValue, defaultValues.lightness.toString());
    syncSliderAndInput(chromaSlider, chromaValue, defaultValues.chroma.toString());
    syncSliderAndInput(distanceSlider, distanceValue, defaultValues.distance.toString());

    colorFormatSelect.value = localStorage.getItem('colorFormat') || defaultValues.colorFormat;
    colorBlindModeCheckbox.checked = localStorage.getItem('colorBlindMode') === 'true';
    p3ModeCheckbox.checked = localStorage.getItem('p3Mode') === 'true';

    refreshGrid();
  });
}

init();
