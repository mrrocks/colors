import { generatePalette } from './paletteGenerator.js';
import { renderPalette } from './colorGridRenderer.js';
import { exportColors } from './exportColors.js';
import { updateURLParameters, getUrlParams } from './urlParamsManager.js';
import { updateSliderBackground, debounce } from './utils.js';
import { initializeSettings, saveSettings } from './settingsManager.js';

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
    renderPalette(palette);
    syncAllSliders(settings);
    setCheckboxStates(settings);
    saveSettings(settings);
    updateURLParameters(settings);
    updateCount(palette.length);
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

let lastSettings = {};

const settingsHaveChanged = (newSettings) => {
  return Object.keys(newSettings).some((key) => newSettings[key] !== lastSettings[key]);
};

const refreshGridIfNeeded = (settings) => {
  if (settingsHaveChanged(settings)) {
    refreshGrid(settings);
    lastSettings = { ...settings };
  }
};

const debounceRefreshGridIfNeeded = debounce(() => {
  refreshGridIfNeeded(getCurrentSettings());
}, 10);

const syncValues = (slider, input, value) => {
  if (slider.value !== value) slider.value = value;
  if (input.value !== value) input.value = value;
  updateSliderBackground(slider, value);
};

const setupSliderSync = (slider, input) => {
  const handleInput = (event) => {
    const value = event.target.value;
    syncValues(slider, input, value);
    debounceRefreshGridIfNeeded();
  };

  slider.addEventListener('input', handleInput);
  input.addEventListener('input', handleInput);
  slider.addEventListener('change', handleInput);
  input.addEventListener('change', handleInput);
};

const syncAllSliders = (settings) => {
  syncValues(elements.lightnessSlider, elements.lightnessValue, settings.lightness);
  syncValues(elements.chromaSlider, elements.chromaValue, settings.chroma);
  syncValues(elements.distanceSlider, elements.distanceValue, settings.distance);
};

const setCheckboxStates = (settings) => {
  if (elements.colorBlindModeCheckbox.checked !== settings.colorBlindMode) {
    elements.colorBlindModeCheckbox.checked = settings.colorBlindMode;
  }
  if (elements.p3ModeCheckbox.checked !== settings.p3Mode) {
    elements.p3ModeCheckbox.checked = settings.p3Mode;
  }
};

const setupEventListeners = () => {
  elements.colorBlindModeCheckbox.addEventListener('change', debounceRefreshGridIfNeeded);
  elements.p3ModeCheckbox.addEventListener('change', debounceRefreshGridIfNeeded);
  elements.colorFormatSelect.addEventListener('change', debounceRefreshGridIfNeeded);
  elements.exportButton.addEventListener('click', () =>
    exportColors(generatePalette(getCurrentSettings()), elements.colorFormatSelect.value),
  );
  elements.resetButton.addEventListener('click', () => {
    refreshGrid(defaults);
  });

  setupSliderSync(elements.lightnessSlider, elements.lightnessValue);
  setupSliderSync(elements.chromaSlider, elements.chromaValue);
  setupSliderSync(elements.distanceSlider, elements.distanceValue);
};

const init = () => {
  setupEventListeners();
  const settings = initializeSettings(defaults);
  refreshGrid(settings);
};

document.addEventListener('DOMContentLoaded', init);
