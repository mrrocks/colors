import { generatePalette } from './paletteGenerator.js';
import { renderPalette } from './colorGridRenderer.js';
import { exportColors } from './exportColors.js';
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

const defaults = {
  lightness: 0.78,
  chroma: 0.14,
  distance: 10,
  colorBlindMode: false,
  colorFormat: 'hex',
  p3Mode: false,
};

const updateCount = (length) => {
  elements.colorCount.textContent = length;
};

const refreshGrid = (settings) => {
  requestAnimationFrame(() => {
    const palette = generatePalette(settings);
    updateCount(palette.length);
    renderPalette(palette);
    saveSettings(settings);
    updateURLParameters(settings);
  });
};

const getCurrentSettings = () => ({
  lightness: parseFloat(elements.lightnessSlider.value),
  chroma: parseFloat(elements.chromaSlider.value),
  distance: parseInt(elements.distanceSlider.value),
  colorBlindMode: elements.colorBlindModeCheckbox.checked,
  p3Mode: elements.p3ModeCheckbox.checked,
  colorFormat: elements.colorFormatSelect.value,
});

const syncValues = (slider, input, value) => {
  slider.value = value;
  input.value = value;
  updateSliderBackground(slider, value);
};

const syncSliderAndInput = (slider, input) => {
  const debouncedRefreshGrid = debounce(() => refreshGrid(getCurrentSettings()), 20);

  slider.oninput = () => {
    syncValues(slider, input, slider.value);
    debouncedRefreshGrid();
  };
  input.oninput = () => {
    syncValues(slider, input, input.value);
    debouncedRefreshGrid();
  };
};

const syncAllSliders = (settings) => {
  syncValues(elements.lightnessSlider, elements.lightnessValue, settings.lightness);
  syncValues(elements.chromaSlider, elements.chromaValue, settings.chroma);
  syncValues(elements.distanceSlider, elements.distanceValue, settings.distance);
};

const setupEventListeners = () => {
  elements.colorBlindModeCheckbox.addEventListener('change', () => refreshGrid(getCurrentSettings()));
  elements.p3ModeCheckbox.addEventListener('change', () => refreshGrid(getCurrentSettings()));
  elements.colorFormatSelect.addEventListener('change', () => refreshGrid(getCurrentSettings()));
  elements.exportButton.addEventListener('click', () =>
    exportColors(generatePalette(getCurrentSettings()), elements.colorFormatSelect.value),
  );
  elements.resetButton.addEventListener('click', () => {
    syncAllSliders(defaults);
    refreshGrid(defaults);
  });

  syncSliderAndInput(elements.lightnessSlider, elements.lightnessValue);
  syncSliderAndInput(elements.chromaSlider, elements.chromaValue);
  syncSliderAndInput(elements.distanceSlider, elements.distanceValue);
};

const retrieveLocalStorageSettings = () => ({
  lightness: parseFloat(localStorage.getItem('lightness')),
  chroma: parseFloat(localStorage.getItem('chroma')),
  distance: parseInt(localStorage.getItem('distance')),
  colorFormat: localStorage.getItem('colorFormat'),
  colorBlindMode: localStorage.getItem('colorBlindMode') === 'true',
  p3Mode: localStorage.getItem('p3Mode') === 'true',
});

const initializeSettings = () => {
  const urlParams = getUrlParams();
  const localStorageSettings = retrieveLocalStorageSettings();
  const settings = { ...defaults, ...localStorageSettings, ...urlParams };
  syncAllSliders(settings);
  refreshGrid(settings);
};

const init = () => {
  initializeSettings();
  setupEventListeners();
};

document.addEventListener('DOMContentLoaded', function () {
  init();
});
