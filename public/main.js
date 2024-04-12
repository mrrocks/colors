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

const defaultValues = {
  lightness: 78,
  chroma: 14,
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
    lightness: defaultValues.lightness / 100,
    chroma: defaultValues.chroma / 100,
    distance: defaultValues.distance,
    colorBlindMode: defaultValues.colorBlindMode,
    p3Mode: defaultValues.p3Mode,
    colorFormat: defaultValues.colorFormat,
  };
}

function getCurrentSettings() {
  return {
    lightness: parseFloat(elements.lightnessSlider.value) / 100,
    chroma: parseFloat(elements.chromaSlider.value) / 100,
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
  elements.resetButton.addEventListener('click', () => resetControls(elements, defaultValues));
  elements.exportButton.addEventListener('click', () => exportColors(palette, elements.colorFormatSelect.value));
  elements.colorBlindModeCheckbox.addEventListener('change', () => refreshGrid());
  elements.p3ModeCheckbox.addEventListener('change', () => refreshGrid());
  elements.colorFormatSelect.addEventListener('change', () => refreshGrid());
}

function initializeSettings() {
  const urlParams = getUrlParams();
  const settings = {
    ...defaultValues,
    ...urlParams,
    ...retrieveLocalStorageSettings(),
  };

  syncValues(elements.lightnessSlider, elements.lightnessValue, settings.lightness);
  syncValues(elements.chromaSlider, elements.chromaValue, settings.chroma * 100);
  syncValues(elements.distanceSlider, elements.distanceValue, settings.distance);
}

function retrieveLocalStorageSettings() {
  return {
    lightness: localStorage.getItem('lightness') || defaultValues.lightness,
    chroma: localStorage.getItem('chroma') || defaultValues.chroma,
    distance: localStorage.getItem('distance') || defaultValues.distance,
    colorBlindMode: localStorage.getItem('colorBlindMode') === 'true',
    p3Mode: localStorage.getItem('p3Mode') === 'true',
    colorFormat: localStorage.getItem('colorFormat') || defaultValues.colorFormat,
  };
}

function init() {
  syncSliderAndInput(elements.lightnessSlider, elements.lightnessValue, defaultValues.lightness);
  syncSliderAndInput(elements.chromaSlider, elements.chromaValue, defaultValues.chroma);
  syncSliderAndInput(elements.distanceSlider, elements.distanceValue, defaultValues.distance);
  setupEventListeners();
  refreshGrid(true);
}

init();
