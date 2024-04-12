import { generatePalette } from './paletteGenerator.js';
import { renderPalette } from './colorGridRenderer.js';
import { exportColors } from './exportColors.js';
import { resetControls } from './resetControls.js';
import { updateURLParameters, getUrlParams } from './urlParamsManager.js';
import { saveSettings } from './saveSettings.js';
import { updateSliderBackground, debounce } from './utils.js';

const elements = {
  colorCount: document.getElementById('colorCount'),
  lightnessSlider: document.getElementById('lightnessInput'),
  chromaSlider: document.getElementById('chromaInput'),
  distanceSlider: document.getElementById('distanceInput'),
  lightnessValue: document.getElementById('lightnessValue'),
  chromaValue: document.getElementById('chromaValue'),
  distanceValue: document.getElementById('distanceValue'),
  resetButton: document.getElementById('resetButton'),
  exportButton: document.getElementById('exportButton'),
  colorBlindModeCheckbox: document.getElementById('colorBlindMode'),
  p3ModeCheckbox: document.getElementById('p3Mode'),
  colorFormatSelect: document.getElementById('colorFormat'),
};

let palette = [];

const defaults = {
  lightness: 0.78,
  chroma: 0.14,
  distance: 10,
  colorBlindMode: false,
  colorFormat: 'hex',
  p3Mode: false,
};

function updateCount(length) {
  elements.colorCount.textContent = length;
}

export function refreshGrid(isReset = false) {
  requestAnimationFrame(() => {
    const settings = isReset ? getDefaultSettings() : getCurrentSettings();
    updatePalette(settings);
    updateCount(palette.length);
    renderPalette(palette);
    saveSettings(getCurrentSettings());
    updateURLParameters(getFormattedSettings());
  });
}

function getDefaultSettings() {
  return {
    lightness: defaults.lightness,
    chroma: defaults.chroma,
    distance: defaults.distance,
    colorBlindMode: defaults.colorBlindMode,
    p3Mode: defaults.p3Mode,
    colorFormat: defaults.colorFormat,
  };
}

function getCurrentSettings() {
  return {
    lightness: parseFloat(elements.lightnessSlider.value),
    chroma: parseFloat(elements.chromaSlider.value),
    distance: parseInt(elements.distanceSlider.value),
    colorBlindMode: elements.colorBlindModeCheckbox.checked,
    p3Mode: elements.p3ModeCheckbox.checked,
    colorFormat: elements.colorFormatSelect.value,
  };
}

function getFormattedSettings() {
  return {
    lightness: elements.lightnessSlider.value.padStart(2, '0'),
    chroma: elements.chromaSlider.value.padStart(2, '0'),
    distance: elements.distanceSlider.value.padStart(2, '0'),
    colorBlindMode: elements.colorBlindModeCheckbox.checked,
    p3Mode: elements.p3ModeCheckbox.checked,
    colorFormat: elements.colorFormatSelect.value,
  };
}

function updatePalette(settings) {
  palette = generatePalette(settings);
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
  elements.resetButton.addEventListener('click', () => resetControls(elements, defaults));
  elements.exportButton.addEventListener('click', () => exportColors(palette, elements.colorFormatSelect.value));
  elements.colorBlindModeCheckbox.addEventListener('change', () => refreshGrid());
  elements.p3ModeCheckbox.addEventListener('change', () => refreshGrid());
  elements.colorFormatSelect.addEventListener('change', () => refreshGrid());
}

function initializeSettings() {
  const urlParams = getUrlParams();
  const settings = {
    ...defaults,
    ...urlParams,
    ...retrieveLocalStorageSettings(),
  };

  syncValues(elements.lightnessSlider, elements.lightnessValue, settings.lightness);
  syncValues(elements.chromaSlider, elements.chromaValue, settings.chroma);
  syncValues(elements.distanceSlider, elements.distanceValue, settings.distance);
}

function retrieveLocalStorageSettings() {
  return {
    lightness: localStorage.getItem('lightness') || defaults.lightness,
    chroma: localStorage.getItem('chroma') || defaults.chroma,
    distance: localStorage.getItem('distance') || defaults.distance,
    colorBlindMode: localStorage.getItem('colorBlindMode') === 'true',
    p3Mode: localStorage.getItem('p3Mode') === 'true',
    colorFormat: localStorage.getItem('colorFormat') || defaults.colorFormat,
  };
}

function init() {
  syncSliderAndInput(elements.lightnessSlider, elements.lightnessValue, defaults.lightness);
  syncSliderAndInput(elements.chromaSlider, elements.chromaValue, defaults.chroma);
  syncSliderAndInput(elements.distanceSlider, elements.distanceValue, defaults.distance);
  setupEventListeners();
  refreshGrid();
}

init();
